const leagues = [
  ["greek", "gre.1", "Super League", true],
  ["austria", "aut.1", "Bundesliga", true],
  ["denmark", "den.1", "Superliga", true],
  ["norway", "nor.1", "Eliteserien", false],
  ["sweden", "swe.1", "Allsvenskan", false],
];

describe.each(leagues)("%s adapter", (sport, slug, name, spansYears) => {
  const adapter = require(`../../src/adapters/${sport}`);

  it("uses the ESPN competition slug and season span", () => {
    expect(adapter.LEAGUE_SLUG).toBe(slug);
    expect(adapter.LEAGUE_NAME).toBe(name);
    expect(adapter.SEASON_SPANS_YEARS).toBe(spansYears);
    expect(adapter.baseUrl).toContain(`/soccer/${slug}`);
  });

  it("gives every club an emoji", () => {
    Object.keys(adapter.TEAM_IDS).forEach((abbr) => {
      expect(adapter.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("assigns every club a distinct ESPN id", () => {
    const ids = Object.values(adapter.TEAM_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers every club in both the id and emoji tables", () => {
    // A club present in one table but not the other means a roster lookup or a
    // board heading would silently render blank.
    const idKeys = Object.keys(adapter.TEAM_IDS).sort();
    const emojiKeys = Object.keys(adapter.TEAM_EMOJI).sort();
    expect(emojiKeys).toEqual(idKeys);
  });

  it("provides a usable demo team", () => {
    const team = Object.keys(adapter.DEMO_TEAMS)[0];
    const demo = adapter.getDemoData(team);
    expect(demo.team.abbreviation).toBe(team);
    expect(Array.isArray(demo.recentGames)).toBe(true);
    expect(demo.standing).toBeTruthy();
  });

  it("builds a logo URL for every demo team from its ESPN id", () => {
    for (const abbr of Object.keys(adapter.DEMO_TEAMS)) {
      expect(adapter.getLogoUrl(abbr)).toBe(
        `https://a.espncdn.com/i/teamlogos/soccer/500/${adapter.TEAM_IDS[abbr]}.png`
      );
    }
  });

  it("only exposes ASCII team keys, so they can be typed as a team input", () => {
    Object.keys(adapter.TEAM_IDS).forEach((abbr) => {
      expect(abbr).toMatch(/^[A-Z0-9]+$/);
    });
  });
});

describe("Austrian Bundesliga — duplicate Vienna abbreviation", () => {
  const adapter = require("../../src/adapters/austria");

  it("gives the two Vienna clubs distinct keys and ids", () => {
    // ESPN labels both Austria Vienna and Rapid Vienna "VIE"; using its raw
    // abbreviation would collapse them into one team table entry.
    expect(adapter.TEAM_IDS.AUS).toBe(1382);
    expect(adapter.TEAM_IDS.RAP).toBe(519);
    expect(adapter.TEAM_IDS.VIE).toBeUndefined();
  });
});

describe("Swedish Allsvenskan — ASCII keys for accented clubs", () => {
  const adapter = require("../../src/adapters/sweden");

  it("uses an ASCII key for Örgryte, which is otherwise untypeable", () => {
    expect(adapter.TEAM_IDS.ORG).toBe(131552);
    expect(adapter.TEAM_IDS["ÖRG"]).toBeUndefined();
  });
});
