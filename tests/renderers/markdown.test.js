const { render } = require("../../src/renderers/markdown");

function makeGame({ homeId, awayId, homeScore, awayScore, date = "2026-07-15T20:00:00Z" }) {
  return {
    date,
    home_team: { id: homeId, abbreviation: "HOM" },
    visitor_team: { id: awayId, abbreviation: "AWY" },
    home_team_score: homeScore,
    visitor_team_score: awayScore,
    status: "Final",
  };
}

const BASE_MLB_DATA = {
  team: {
    id: 141,
    abbreviation: "TOR",
    name: "Blue Jays",
    full_name: "Toronto Blue Jays",
    league: "American League",
    division: "AL East",
  },
  record: { wins: 51, losses: 59, season: 2026 },
  emoji: "🐦",
  logoUrl: "https://www.mlbstatic.com/team-logos/141.svg",
};

describe("renderMlb / formatMlbGameResult", () => {
  it("renders W when home team wins", () => {
    const data = {
      ...BASE_MLB_DATA,
      recentGames: [makeGame({ homeId: 141, awayId: 999, homeScore: 5, awayScore: 2 })],
    };
    const output = render("mlb", data);
    expect(output).toContain("✅");
    expect(output).toContain("W");
    expect(output).toContain("vs");
  });

  it("renders L when away team loses", () => {
    const data = {
      ...BASE_MLB_DATA,
      recentGames: [makeGame({ homeId: 999, awayId: 141, homeScore: 6, awayScore: 1 })],
    };
    const output = render("mlb", data);
    expect(output).toContain("❌");
    expect(output).toContain("L");
    expect(output).toContain("@");
  });

  it("renders W when away team wins", () => {
    const data = {
      ...BASE_MLB_DATA,
      recentGames: [makeGame({ homeId: 999, awayId: 141, homeScore: 2, awayScore: 7 })],
    };
    const output = render("mlb", data);
    expect(output).toContain("✅");
    expect(output).toContain("W");
  });

  it("includes the date in output", () => {
    const data = {
      ...BASE_MLB_DATA,
      recentGames: [makeGame({ homeId: 141, awayId: 999, homeScore: 3, awayScore: 1, date: "2026-07-15T20:00:00Z" })],
    };
    const output = render("mlb", data);
    expect(output).toMatch(/Jul\s+\d+/);
  });

  it("renders fallback when no recent games", () => {
    const data = { ...BASE_MLB_DATA, recentGames: [] };
    const output = render("mlb", data);
    expect(output).toContain("No recent games found");
  });

  it("renders season record with win percentage", () => {
    const data = { ...BASE_MLB_DATA, recentGames: [] };
    const output = render("mlb", data);
    expect(output).toContain("51W - 59L");
    expect(output).toContain("46.4%");
  });

  it("renders multiple games in order", () => {
    const data = {
      ...BASE_MLB_DATA,
      recentGames: [
        makeGame({ homeId: 141, awayId: 999, homeScore: 5, awayScore: 2, date: "2026-07-15T00:00:00Z" }),
        makeGame({ homeId: 999, awayId: 141, homeScore: 6, awayScore: 1, date: "2026-07-14T00:00:00Z" }),
      ],
    };
    const output = render("mlb", data);
    const winIdx = output.indexOf("✅");
    const lossIdx = output.indexOf("❌");
    expect(winIdx).toBeLessThan(lossIdx);
  });
});

describe("renderNba / formatGameResult", () => {
  it("renders NBA output with team info", () => {
    const data = {
      team: { id: 1610612747, abbreviation: "LAL", name: "Lakers", full_name: "Los Angeles Lakers", conference: "West", division: "Pacific" },
      record: { wins: 57, losses: 25, season: 2025 },
      emoji: "👑",
      logoUrl: "https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg",
      recentGames: [makeGame({ homeId: 1610612747, awayId: 2, homeScore: 110, awayScore: 98 })],
    };
    const output = render("nba", data);
    expect(output).toContain("Los Angeles Lakers");
    expect(output).toContain("✅");
  });
});

describe("render dispatch", () => {
  it("throws for unsupported sport", () => {
    expect(() => render("cricket", {})).toThrow("Unsupported sport");
  });
});
