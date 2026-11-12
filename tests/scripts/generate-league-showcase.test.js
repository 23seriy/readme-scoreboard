const { LEAGUES } = require("../../src/config/leagues");
const { pickDemoTeam } = require("../../scripts/generate-league-showcase");

describe("pickDemoTeam", () => {
  it("picks a team with demo data for every league", () => {
    // Guards the live-fetch fallback in buildLeagueShowcase: when the league
    // API is unreachable, getDemoData(picked) must never come up empty.
    const failures = [];
    for (const league of LEAGUES) {
      const adapter = require(`../../src/adapters/${league.key}`);
      const abbr = pickDemoTeam(league);
      const data = adapter.getDemoData(abbr);
      if (!data || !data.team) failures.push(`${league.key}/${abbr}`);
    }
    expect(failures).toEqual([]);
  });

  it("prefers a directory team covered by demo data (wnba/ATL regression)", () => {
    // team-directory.json lists ATL first for wnba, but only
    // MIN/NY/LV/DAL have demo data; picking ATL made the showcase throw
    // "No data available for wnba/ATL" when ESPN returned 403.
    expect(pickDemoTeam({ key: "wnba" })).toBe("DAL");
  });
});
