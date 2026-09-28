const adapter = require("../../src/adapters/ufc");
const { LEAGUE_BY_KEY } = require("../../src/config/leagues");
const { validateInputs } = require("../../src/validation");
const { COUNTRY_ISO, ESPN_IDS, flagFor, normalizeName, parseRecord, surnameCode } = adapter.helpers;

// UFC is the first league whose upstream feed publishes no athlete id, so its
// roster, name matching and flag derivation all carry more weight than usual.

// A card shaped exactly like ESPN's scoreboard response: prelims first, main
// event last, with results on the completed bouts.
function card({ date, shortName, fights }) {
  return {
    date,
    shortName,
    name: shortName,
    competitions: fights.map((fight) => ({
      type: { abbreviation: fight.weight || "Lightweight" },
      venue: { fullName: "Test Arena" },
      status: { type: { completed: fight.completed !== false }, period: fight.round || 3 },
      competitors: fight.athletes.map((athlete) => ({
        winner: athlete.winner === true,
        athlete: { fullName: athlete.name, flag: { href: `https://a.espncdn.com/i/teamlogos/countries/500/${athlete.cc || "usa"}.png` } },
        records: [{ name: "overall", summary: athlete.record || "10-1-0" }],
      })),
    })),
  };
}

describe("UFC fighter roster", () => {
  it("exposes a roster with a flag and a division for every fighter", () => {
    const codes = Object.keys(adapter.TEAM_IDS);
    expect(codes.length).toBeGreaterThan(20);
    expect(Object.keys(adapter.TEAM_EMOJI).sort()).toEqual([...codes].sort());
    codes.forEach((code) => {
      expect(adapter.FIGHTERS[code].name).toBeTruthy();
      expect(adapter.FIGHTERS[code].weight).toBeTruthy();
      expect(adapter.TEAM_EMOJI[code].length).toBeGreaterThan(0);
    });
  });

  it("holds a verified ESPN id for every fighter", () => {
    // The board matches fights by name, but the player directory needs an id, so
    // the two lists must cover exactly the same fighters.
    expect(Object.keys(ESPN_IDS).sort()).toEqual(Object.keys(adapter.FIGHTERS).sort());
    Object.entries(adapter.PLAYER_IDS).forEach(([code, entry]) => {
      expect(Number.isInteger(entry.id)).toBe(true);
      expect(entry.name).toBe(adapter.FIGHTERS[code].name);
    });
  });

  it("exposes TEAM_IDS for the live validation path", () => {
    // validateInputs reads TEAM_IDS to resolve a code, so a player league still
    // has to expose it — the racing adapters alias it for the same reason. The
    // value carries the name, so an unknown code can be answered with real
    // fighters rather than codes.
    expect(Object.keys(adapter.TEAM_IDS).sort()).toEqual(Object.keys(adapter.FIGHTERS).sort());
    expect(adapter.TEAM_IDS.STR.name).toBe("Sean Strickland");
  });

  it("publishes no headshot and falls back to the promotion's mark", () => {
    expect(adapter.getPlayerHeadshotUrl(3093653)).toBeNull();
    expect(adapter.getLogoUrl("STR"))
      .toBe("https://a.espncdn.com/i/teamlogos/leagues/500/ufc.png");
  });

  it("derives a real flag for every mapped country", () => {
    // Two shapes are valid: a regional-indicator pair, or a subdivision tag
    // sequence (England, Scotland, Wales). Anything else is a broken glyph.
    Object.entries(COUNTRY_ISO).forEach(([code, iso]) => {
      const flag = flagFor(code);
      const points = [...flag].map((char) => char.codePointAt(0));
      const isSubdivision = points[0] === 0x1f3f4 && points[points.length - 1] === 0xe007f;
      if (isSubdivision) return;
      const decoded = points
        .map((point) => String.fromCharCode(point - 0x1f1e6 + 65))
        .join("");
      expect(`${code}:${decoded}`).toBe(`${code}:${iso}`);
    });
  });

  it("never maps a country to an obsolete ISO code", () => {
    // Inverting ICU's region names picks up retired codes, because DD answers to
    // "Germany" alongside DE, CS to "Serbia" alongside RS, and RH to "Zimbabwe"
    // alongside ZW. They sort first, so without this the board would fly the
    // flag of a country that no longer exists.
    const obsolete = ["AN", "BU", "CS", "DD", "DY", "FQ", "FX", "HV", "JT", "MI",
      "NH", "NQ", "NT", "PC", "PZ", "RH", "SU", "TP", "VD", "WK", "YD", "YU", "ZR"];
    const used = new Set(Object.values(COUNTRY_ISO));
    obsolete.forEach((code) => expect(used.has(code)).toBe(false));
    expect(COUNTRY_ISO.ger).toBe("DE");
    expect(COUNTRY_ISO.ser).toBe("RS");
    expect(COUNTRY_ISO.zim).toBe("ZW");
  });

  it("renders no flag for a country ESPN leaves blank", () => {
    // ESPN genuinely has no country for some fighters; a placeholder glyph would
    // be inventing one.
    expect(flagFor("blank")).toBe("");
    expect(flagFor(undefined)).toBe("");
  });
});

describe("UFC name matching", () => {
  it("normalises case, punctuation and diacritics", () => {
    expect(normalizeName("Jiří Procházka")).toBe(normalizeName("Jiri Prochazka"));
    expect(normalizeName("Sean  Strickland")).toBe("sean strickland");
    expect(normalizeName("Lone'er Kavanagh")).toBe("lone er kavanagh");
  });

  it("matches every roster fighter to their own feed spelling", () => {
    Object.values(adapter.FIGHTERS).forEach((fighter) => {
      expect(normalizeName(fighter.name)).toBe(normalizeName(fighter.name));
    });
  });

  it("derives a surname code for opponents with no roster entry", () => {
    expect(surnameCode("Alexander Volkanovski")).toBe("VOL");
    expect(surnameCode("Dricus Du Plessis")).toBe("PLE");
    expect(surnameCode("Dan Hooker")).toBe("HOO");
  });

  it("parses the career record ESPN publishes", () => {
    expect(parseRecord("31-7-0")).toEqual({ wins: 31, losses: 7, draws: 0 });
    expect(parseRecord("20-5-1")).toEqual({ wins: 20, losses: 5, draws: 1 });
    expect(parseRecord(null)).toBeNull();
    expect(parseRecord("unknown")).toBeNull();
  });
});

describe("UFC bouts", () => {
  const CARDS = [
    card({
      date: "2026-03-21T21:00Z",
      shortName: "UFC Fight Night",
      fights: [
        { athletes: [{ name: "Alex Pereira", winner: false, record: "12-3-0" }, { name: "Movsar Evloev", winner: true, round: 5, record: "20-0-0" }], weight: "Featherweight", round: 5 },
      ],
    }),
    card({
      date: "2026-10-24T21:00Z",
      shortName: "UFC 333",
      fights: [
        { athletes: [{ name: "Movsar Evloev", record: "20-0-0" }, { name: "Alexander Volkanovski", record: "28-4-0" }], weight: "Featherweight", completed: false },
      ],
    }),
  ];

  it("finds a fighter's bouts wherever they sit on a card", () => {
    const bouts = adapter.collectBouts(CARDS, "Movsar Evloev");
    expect(bouts).toHaveLength(2);
    expect(bouts[0].completed).toBe(true);
    expect(bouts[1].completed).toBe(false);
  });

  it("reads the result, opponent and round from the fighter's own corner", () => {
    const [done, upcoming] = adapter.collectBouts(CARDS, "Movsar Evloev");
    expect(done.won).toBe(true);
    expect(done.opponentName).toBe("Alex Pereira");
    expect(done.round).toBe(5);
    expect(done.weight).toBe("Featherweight");
    expect(upcoming.opponentName).toBe("Alexander Volkanovski");
  });

  it("does not match the wrong fighter", () => {
    expect(adapter.collectBouts(CARDS, "Conor McGregor")).toEqual([]);
  });

  it("matches a fighter whose name arrives accented", () => {
    const accents = [card({
      date: "2026-01-01T21:00Z",
      shortName: "UFC 300",
      fights: [{ athletes: [{ name: "Jiří Procházka", winner: true }, { name: "Someone Else" }] }],
    })];
    expect(adapter.collectBouts(accents, "Jiri Prochazka")).toHaveLength(1);
  });
});

describe("UFC fetchData", () => {
  function withCards(cards) {
    const clone = Object.create(adapter);
    clone.fetchCards = async () => cards;
    return clone;
  }

  const CARDS = [
    card({
      date: "2026-03-21T21:00Z",
      shortName: "UFC Fight Night",
      fights: [
        { athletes: [{ name: "Movsar Evloev", winner: true, record: "20-0-0" }, { name: "Lerone Murphy", cc: "eng", record: "17-1-1" }], weight: "Featherweight", round: 5 },
      ],
    }),
    card({
      date: "2026-10-24T21:00Z",
      shortName: "UFC 333",
      fights: [
        { athletes: [{ name: "Movsar Evloev", record: "20-0-0" }, { name: "Alexander Volkanovski", cc: "aus", record: "28-4-0" }], weight: "Featherweight", completed: false },
      ],
    }),
  ];

  it("returns the record, the next fight and the recent fights", async () => {
    const data = await withCards(CARDS).fetchData("EVL");
    expect(data.team.full_name).toBe("Movsar Evloev");
    expect(data.team.conference).toBe("Featherweight");
    expect(data.record).toMatchObject({ wins: 20, losses: 0, draws: 0 });
    expect(data.nextGame).toMatchObject({ opponent: "VOL", opponentName: "Alexander Volkanovski" });
    expect(data.recentGames).toHaveLength(1);
    expect(data.form).toEqual(["W"]);
  });

  it("carries the opponent's flag through to the board", async () => {
    const data = await withCards(CARDS).fetchData("EVL");
    expect(data.nextGame.opponentFlag).toBe("🇦🇺");
    expect(data.recentGames[0].opponentFlag).toBe("🏴󠁧󠁢󠁥󠁮󠁧󠁿");
  });

  it("reports no next fight rather than inventing one", async () => {
    const data = await withCards([CARDS[0]]).fetchData("EVL");
    expect(data.nextGame).toBeNull();
    expect(data.recentGames).toHaveLength(1);
  });

  it("returns null when the feed holds no bout for the fighter", async () => {
    // A fighter with nothing in the window is a null board, not a hollow one.
    expect(await withCards([]).fetchData("EVL")).toBeNull();
  });

  it("returns null for a code that is not in the roster", async () => {
    expect(await withCards(CARDS).fetchData("XXX")).toBeNull();
  });

  it("stops walking back through seasons once it has five fights", async () => {
    const calls = [];
    const clone = Object.create(adapter);
    clone.fetchCards = async (year) => { calls.push(year); return CARDS; };
    await clone.fetchData("EVL");
    // The current season supplies fewer than five, so exactly one earlier
    // season is requested — never more than the bound.
    expect(calls.length).toBeLessThanOrEqual(3);
  });

  it("never lists the same bout twice when seasons overlap", async () => {
    // Every query returns the same card here, which is what two adjacent season
    // queries do for a card near the boundary. Without de-duplication the board
    // showed the same fight three times.
    const data = await withCards(CARDS).fetchData("EVL");
    const keys = data.recentGames.map((fight) => `${fight.date}|${fight.opponent}`);
    expect(data.recentGames).toHaveLength(1);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("UFC bout de-duplication", () => {
  // A bout is identified by its date and card, not by the opponent's name —
  // rematches are real.
  const bout = (date, opponent, event) => ({ date, opponentName: opponent, event });

  it("collapses a repeated bout", () => {
    const once = bout("2026-03-21T21:00Z", "Lerone Murphy", "UFC Fight Night");
    expect(adapter.dedupeBouts([once, { ...once }])).toHaveLength(1);
  });

  it("keeps a rematch against the same opponent on a different card", () => {
    expect(adapter.dedupeBouts([
      bout("2024-01-20T21:00Z", "Dricus Du Plessis", "UFC 297"),
      bout("2025-02-08T21:00Z", "Dricus Du Plessis", "UFC 312"),
    ])).toHaveLength(2);
  });

  it("leaves a list with no repeats untouched", () => {
    const bouts = [
      bout("2026-03-21T21:00Z", "Lerone Murphy", "UFC Fight Night"),
      bout("2026-10-24T21:00Z", "Alexander Volkanovski", "UFC 333"),
    ];
    expect(adapter.dedupeBouts(bouts)).toEqual(bouts);
  });
});

describe("UFC registry entry", () => {
  it("names the entity a Fighter without reshaping other leagues", () => {
    expect(LEAGUE_BY_KEY.ufc.entityLabel).toBe("Fighter");
    // The field is only set where it is needed, so every other league keeps the
    // registry shape it had.
    expect(LEAGUE_BY_KEY.epl.entityLabel).toBeUndefined();
    expect(LEAGUE_BY_KEY.worldcup.entityLabel).toBeUndefined();
  });

  it("is a player league with no standings and no ranking feed", () => {
    expect(LEAGUE_BY_KEY.ufc.entity).toBe("player");
    expect(LEAGUE_BY_KEY.ufc.category).toBe("MMA");
    expect(adapter.fetchRankings).toBeUndefined();
  });

  it("points its heading at the MMA scoreboard rather than a teams endpoint", () => {
    // MMA has no /teams, so the default heading link would be dead.
    expect(LEAGUE_BY_KEY.ufc.endpointOverride).toContain("mma/ufc/scoreboard");
  });

  it("accepts a roster code and rejects an unknown one through validation", () => {
    const base = { sport: "ufc", entity: "player", adapter, supportedSports: ["ufc"] };
    expect(() => validateInputs({ ...base, team: "STR" })).not.toThrow();
    expect(() => validateInputs({ ...base, team: "XXX" }))
      .toThrow(/Unknown ufc player abbreviation "XXX"\. Try one of: ABU \(Loai Abushaar\)/);
  });

  it("refuses player: with a reason, since the board already is a player board", () => {
    const base = { sport: "ufc", entity: "player", adapter, supportedSports: ["ufc"], team: "STR" };
    expect(() => validateInputs({ ...base, player: "Someone" }))
      .toThrow(/player: is not yet supported for sport "ufc"/);
  });
});
