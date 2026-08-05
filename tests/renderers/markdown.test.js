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

const BASE_NBA_DATA = {
  team: { id: 1610612747, abbreviation: "LAL", name: "Lakers", full_name: "Los Angeles Lakers", conference: "West", division: "Pacific" },
  record: { wins: 57, losses: 25, season: 2025 },
  emoji: "👑",
  logoUrl: "https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg",
};

describe("renderNba / formatGameResult", () => {
  it("renders NBA output with team info", () => {
    const data = { ...BASE_NBA_DATA, recentGames: [makeGame({ homeId: 1610612747, awayId: 2, homeScore: 110, awayScore: 98 })] };
    const output = render("nba", data);
    expect(output).toContain("Los Angeles Lakers");
    expect(output).toContain("✅");
  });

  it("shows season as start-end using ESPN end-year convention (season=2025 → 2024-2025)", () => {
    const output = render("nba", { ...BASE_NBA_DATA, recentGames: [] });
    expect(output).toContain("2024-2025");
    expect(output).not.toContain("2025-2026");
  });

  it("renders season record with win percentage", () => {
    const output = render("nba", { ...BASE_NBA_DATA, recentGames: [] });
    expect(output).toContain("57W - 25L");
    expect(output).toContain("69.5%");
  });

  it("renders W when home team wins", () => {
    const data = { ...BASE_NBA_DATA, recentGames: [makeGame({ homeId: 1610612747, awayId: 2, homeScore: 110, awayScore: 98 })] };
    expect(render("nba", data)).toContain("W");
  });

  it("renders L when away team loses", () => {
    const data = { ...BASE_NBA_DATA, recentGames: [makeGame({ homeId: 2, awayId: 1610612747, homeScore: 110, awayScore: 98 })] };
    expect(render("nba", data)).toContain("L");
  });

  it("renders [Playoffs] tag for postseason games", () => {
    const game = { ...makeGame({ homeId: 1610612747, awayId: 2, homeScore: 110, awayScore: 98 }), postseason: true };
    const output = render("nba", { ...BASE_NBA_DATA, recentGames: [game] });
    expect(output).toContain("[Playoffs]");
  });

  it("does not render [Playoffs] tag for regular season games", () => {
    const game = { ...makeGame({ homeId: 1610612747, awayId: 2, homeScore: 110, awayScore: 98 }), postseason: false };
    const output = render("nba", { ...BASE_NBA_DATA, recentGames: [game] });
    expect(output).not.toContain("[Playoffs]");
  });

  it("renders fallback when no recent games", () => {
    expect(render("nba", { ...BASE_NBA_DATA, recentGames: [] })).toContain("No recent games found");
  });
});

const BASE_MLS_DATA = {
  team: {
    id: 20232,
    abbreviation: "MIA",
    name: "Inter Miami CF",
    full_name: "Inter Miami CF",
    conference: "Eastern Conference",
    division: "",
  },
  record: { wins: 11, losses: 2, draws: 5, season: 2026 },
  emoji: "🦩",
  logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/20232.png",
};

function makeMlsGame({ teamId = 20232, oppId = 999, oppAbbr = "CLB", teamScore, oppScore, isHome = true, date = "2026-07-15T02:00:00Z" }) {
  const won = teamScore > oppScore;
  const drew = teamScore === oppScore;
  return {
    date,
    gameType: "R",
    home_team: { id: isHome ? teamId : oppId, abbreviation: isHome ? "MIA" : oppAbbr },
    visitor_team: { id: isHome ? oppId : teamId, abbreviation: isHome ? oppAbbr : "MIA" },
    home_team_score: isHome ? teamScore : oppScore,
    visitor_team_score: isHome ? oppScore : teamScore,
    status: "Final",
    isHome,
    teamScore,
    oppScore,
    oppAbbr,
    won,
    drew,
  };
}

describe("renderMls", () => {
  it("renders team name and abbreviation", () => {
    const output = render("mls", { ...BASE_MLS_DATA, recentGames: [] });
    expect(output).toContain("Inter Miami CF");
    expect(output).toContain("(MIA)");
  });

  it("does not duplicate the word Conference in the label", () => {
    const output = render("mls", { ...BASE_MLS_DATA, recentGames: [] });
    expect(output).not.toContain("Conference Conference");
    expect(output).toContain("Eastern Conference");
  });

  it("appends Conference when API value does not already include it", () => {
    const data = { ...BASE_MLS_DATA, team: { ...BASE_MLS_DATA.team, conference: "Western" }, recentGames: [] };
    const output = render("mls", data);
    expect(output).toContain("Western Conference");
    expect(output).not.toContain("Conference Conference");
  });

  it("renders W/L/D record with points", () => {
    const output = render("mls", { ...BASE_MLS_DATA, recentGames: [] });
    expect(output).toContain("11W - 2L - 5D");
    // Points = 11*3 + 5 = 38
    expect(output).toContain("38 pts");
  });

  it("renders win as ✅ W", () => {
    const output = render("mls", { ...BASE_MLS_DATA, recentGames: [makeMlsGame({ teamScore: 3, oppScore: 1 })] });
    expect(output).toContain("✅");
    expect(output).toContain("W 3-1");
  });

  it("renders draw as 🟡 D", () => {
    const output = render("mls", { ...BASE_MLS_DATA, recentGames: [makeMlsGame({ teamScore: 2, oppScore: 2 })] });
    expect(output).toContain("🟡");
    expect(output).toContain("D 2-2");
  });

  it("renders loss as ❌ L", () => {
    const output = render("mls", { ...BASE_MLS_DATA, recentGames: [makeMlsGame({ teamScore: 0, oppScore: 2 })] });
    expect(output).toContain("❌");
    expect(output).toContain("L 0-2");
  });

  it("shows vs for home games and @ for away games", () => {
    const homeOutput = render("mls", { ...BASE_MLS_DATA, recentGames: [makeMlsGame({ teamScore: 1, oppScore: 0, isHome: true })] });
    expect(homeOutput).toContain("vs");
    const awayOutput = render("mls", { ...BASE_MLS_DATA, recentGames: [makeMlsGame({ teamScore: 1, oppScore: 0, isHome: false })] });
    expect(awayOutput).toContain("@");
  });

  it("renders fallback when no recent games", () => {
    const output = render("mls", { ...BASE_MLS_DATA, recentGames: [] });
    expect(output).toContain("No recent games found");
  });

  it("includes the season status line", () => {
    const output = render("mls", { ...BASE_MLS_DATA, recentGames: [] });
    expect(output).toMatch(/🟢 Season in progress|🔴 Off-season/);
  });
});

describe("render dispatch", () => {
  it("throws for unsupported sport", () => {
    expect(() => render("cricket", {})).toThrow("Unsupported sport");
  });
});
