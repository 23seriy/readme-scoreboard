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
