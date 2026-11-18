const leagues = [
  ["aleague", "aus.1", "A-League Men", true],
  ["isl", "ind.1", "Indian Super League", true],
  ["csl", "chn.1", "Chinese Super League", false],
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

  it("provides a usable demo team", () => {
    const team = Object.keys(adapter.DEMO_TEAMS)[0];
    const demo = adapter.getDemoData(team);
    expect(demo.team.abbreviation).toBe(team);
    expect(Array.isArray(demo.recentGames)).toBe(true);
    expect(demo.standing).toBeTruthy();
  });

  it("returns null for an unknown club", () => {
    expect(adapter.getDemoData("ZZZ")).toBeNull();
  });
});

describe("aleague adapter — ESPN abbreviations", () => {
  const adapter = require("../../src/adapters/aleague");

  // ESPN renamed five clubs (ADE -> ADL, AFC -> AUC, BRR -> BRI, MCY -> MBC,
  // MVC -> MBV). Standings match on the live abbreviation, so stale keys left
  // the board with no record and a null logo.
  it("uses the abbreviations ESPN publishes", () => {
    expect(Object.keys(adapter.TEAM_IDS).sort()).toEqual([
      "ADL", "AUC", "BRI", "CCM", "MAC", "MBC", "MBV", "NEW", "PER", "SYD", "WEL", "WSW",
    ]);
    expect(adapter.getLogoUrl("MBC")).toBe("https://a.espncdn.com/i/teamlogos/soccer/500/11143.png");
    expect(adapter.getLogoUrl("MBV")).toBe("https://a.espncdn.com/i/teamlogos/soccer/500/5328.png");
  });

  it("keys every demo team by its own abbreviation", () => {
    Object.entries(adapter.DEMO_TEAMS).forEach(([abbr, team]) => {
      expect(team.abbreviation).toBe(abbr);
    });
  });
});
