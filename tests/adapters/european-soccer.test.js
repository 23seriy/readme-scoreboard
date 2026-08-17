const leagues = [
  ["scottish", "sco.1", "Scottish Premiership"],
  ["belgian", "bel.1", "Belgian Pro League"],
  ["ucl", "uefa.champions", "UEFA Champions League"],
  ["uel", "uefa.europa", "UEFA Europa League"],
];

describe.each(leagues)("%s adapter", (sport, slug, name) => {
  const adapter = require(`../../src/adapters/${sport}`);

  it("uses the ESPN competition slug and a cross-year season", () => {
    expect(adapter.LEAGUE_SLUG).toBe(slug);
    expect(adapter.LEAGUE_NAME).toBe(name);
    expect(adapter.SEASON_SPANS_YEARS).toBe(true);
    expect(adapter.baseUrl).toContain(`/soccer/${slug}`);
  });

  it("provides a usable demo team", () => {
    const team = Object.keys(adapter.DEMO_TEAMS)[0];
    const demo = adapter.getDemoData(team);
    expect(demo.team.abbreviation).toBe(team);
    expect(demo.recentGames).toHaveLength(3);
  });
});
