const leagues = [
  ["ncaab", "basketball", "mens-college-basketball", "NCAA Men's Basketball"],
  ["ncaaw", "basketball", "womens-college-basketball", "NCAA Women's Basketball"],
  ["ncaaf", "football", "college-football", "NCAA - Football"],
  ["ncaa_hockey", "hockey", "mens-college-hockey", "NCAA Men's Ice Hockey"],
];

describe.each(leagues)("%s adapter", (sport, espnSport, slug, name) => {
  const adapter = require(`../../src/adapters/${sport}`);

  it("uses the ESPN league configuration", () => {
    expect(adapter.SPORT).toBe(espnSport);
    expect(adapter.LEAGUE_SLUG).toBe(slug);
    expect(adapter.LEAGUE_NAME).toBe(name);
    expect(adapter.baseUrl).toContain(`/sports/${espnSport}/${slug}`);
  });

  it("provides a demo team and a stable logo URL", () => {
    const abbr = Object.keys(adapter.DEMO_TEAMS)[0];
    const demo = adapter.getDemoData(abbr);
    expect(demo.team.abbreviation).toBe(abbr);
    expect(demo.recentGames.length).toBeGreaterThan(0);
    expect(adapter.getLogoUrl(abbr)).toMatch(/^https:\/\//);
  });
});
