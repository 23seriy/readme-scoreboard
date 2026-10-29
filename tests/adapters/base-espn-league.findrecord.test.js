const adapter = require("../../src/adapters/ncaab");

// College football's conference standings are the awkward case: one entry's
// `stats` array is every category concatenated — overall first, then Home, Road,
// vs Division, vs Conference, vs AP Top 25 and so on. `wins` therefore appears
// once per category, and the old `Object.fromEntries` kept only the LAST, so
// Alabama's 5-0 overall season was reported as its 1-0 record against ranked
// teams. These tests pin the overall figures and the wins-only shape.

// Build an entry whose stats repeat `wins` across categories, as ESPN does.
function entry(abbr, categories) {
  const stats = [];
  for (const { wins, losses, gamesPlayed } of categories) {
    if (wins !== undefined) stats.push({ name: "wins", value: wins });
    if (losses !== undefined) stats.push({ name: "losses", value: losses });
    if (gamesPlayed !== undefined) stats.push({ name: "gamesPlayed", value: gamesPlayed });
  }
  return { team: { abbreviation: abbr }, stats };
}

function standings(entries, groupName = "Southeastern Conference") {
  return { children: [{ name: groupName, standings: { entries } }] };
}

describe("BaseEspnLeagueAdapter — findRecord", () => {
  it("takes the FIRST win count, which is the overall record", () => {
    // Overall 5-0, then a ranked-opponents category of 1-0.
    const data = standings([entry("ALA", [{ wins: 5, losses: 0 }, { wins: 1, losses: 0 }])]);

    const record = adapter.findRecord(data, "ALA", 2026);

    expect(record.wins).toBe(5);
  });

  it("reports losses as null when the feed omits them, rather than zero", () => {
    // College football publishes no overall `losses` at all. Reporting 0 made
    // every team look undefeated.
    const data = standings([entry("ALA", [{ wins: 5 }, { wins: 1 }])]);

    const record = adapter.findRecord(data, "ALA", 2026);

    expect(record.losses).toBeNull();
  });

  it("uses a real losses figure when the feed provides one", () => {
    const data = standings([entry("UGA", [{ wins: 4, losses: 1 }, { wins: 2, losses: 0 }])]);

    const record = adapter.findRecord(data, "UGA", 2026);

    expect(record.wins).toBe(4);
    expect(record.losses).toBe(1);
  });

  it("does not let a later category overwrite the overall win count", () => {
    // The exact Alabama case: 5, 3, 2, 0, 3, 1, 1 -> the last is 1.
    const data = standings([
      entry("ALA", [
        { wins: 5 },
        { wins: 3 },
        { wins: 2 },
        { wins: 0 },
        { wins: 3 },
        { wins: 1 },
        { wins: 1 },
      ]),
    ]);

    const record = adapter.findRecord(data, "ALA", 2026);

    expect(record.wins).toBe(5);
    expect(record.wins).not.toBe(1);
  });

  it("returns an empty record for a team that is not listed", () => {
    const data = standings([entry("ALA", [{ wins: 5 }])]);

    const record = adapter.findRecord(data, "ZZZ", 2026);

    expect(record).toEqual({ wins: 0, losses: 0, season: 2026, conference: "", position: null });
  });
});

// The conference position had the same defect as the NBA: `index + 1` into a
// list that is `group.standings.entries` CONCATENATED with every
// `group.children[].standings.entries`. ESPN returns those entries
// ALPHABETICAL by team name, so the number was an alphabetical slot, not a
// rank. Live example (SEC, 2026): the flattened order starts UK, UGA, ALA, LSU,
// TENN… while ESPN seeds it UGA, UK, ALA/LSU/MISS, TENN. Texas printed
// "Southeastern Conference · 9" and Oklahoma "· 10" when their seeds are 10 and
// 9 — inverted.
describe("BaseEspnLeagueAdapter — findRecord conference position", () => {
  // Alphabetical within the conference, exactly as ESPN serves it, with the
  // seed each team is actually ranked at.
  function seededEntry(abbr, wins, playoffSeed) {
    return { team: { abbreviation: abbr }, stats: [{ name: "wins", value: wins }, { name: "playoffSeed", value: playoffSeed }] };
  }

  const secTable = [
    seededEntry("ALA", 6, 3),
    seededEntry("ARK", 2, 15),
    seededEntry("AUB", 3, 12),
    seededEntry("FLA", 3, 9),
    seededEntry("UGA", 6, 1),
    seededEntry("TEX", 5, 10),
  ];

  it("reports ESPN's playoffSeed, not the alphabetical slot", () => {
    const data = standings(secTable);

    // TEX is 6th alphabetically but seeded 10th.
    expect(adapter.findRecord(data, "TEX", 2026).position).toBe(10);
    // ARK is 2nd alphabetically but seeded last of these six.
    expect(adapter.findRecord(data, "ARK", 2026).position).toBe(15);
    // ALA is 1st alphabetically; its seed happens to be 3.
    expect(adapter.findRecord(data, "ALA", 2026).position).toBe(3);
  });

  it("does not simply follow array order when divisions are nested", () => {
    // Entry #1 alphabetically sits at seed 3; the flat index would say 1.
    const data = {
      children: [
        {
          name: "Southeastern Conference",
          standings: { entries: secTable.slice(0, 2) },
          children: [
            { name: "West Division", standings: { entries: secTable.slice(2) } },
          ],
        },
      ],
    };

    const record = adapter.findRecord(data, "TEX", 2026);

    // 6th in the flattened list, seeded 10th.
    expect(record.position).toBe(10);
  });

  it("omits the position when ESPN publishes no playoffSeed", () => {
    const data = standings([
      { team: { abbreviation: "ALA" }, stats: [{ name: "wins", value: 6 }] },
    ]);

    expect(adapter.findRecord(data, "ALA", 2026).position).toBeNull();
  });

  it("takes the FIRST playoffSeed, which belongs to the overall category", () => {
    // `stats` repeats every category (overall, Home, Road, vs. Conf., ...), so
    // `playoffSeed` appears several times with DIFFERENT values — live UGA is
    // overall 2, Home 1, Road 1, vs. Conf. 2. The overall figure is the
    // conference rank, so the first occurrence must win. Reading the last one
    // is how `wins` was previously misreported, and it would silently report a
    // category seed here instead.
    const withCategories = {
      children: [
        {
          name: "Southeastern Conference",
          standings: {
            entries: [
              {
                team: { abbreviation: "UGA" },
                stats: [
                  { name: "wins", value: 6 },
                  { name: "playoffSeed", value: 2 },
                  { name: "overall", value: undefined },
                  { name: "wins", value: 4 },
                  { name: "playoffSeed", value: 1 },
                  { name: "Home", value: undefined },
                ],
              },
            ],
          },
        },
      ],
    };

    expect(adapter.findRecord(withCategories, "UGA", 2026).position).toBe(2);
  });
});
