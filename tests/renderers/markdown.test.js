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

describe("Soccer renderer — EPL", () => {
  const demoData = (overrides = {}) => ({
    team: { abbreviation: "LIV", full_name: "Liverpool", conference: "English Premier League" },
    record: { wins: 17, losses: 12, draws: 9, season: 2025 },
    recentGames: [],
    emoji: "🔴",
    logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/364.png",
    ...overrides,
  });

  it("renders the club name and logo", () => {
    const out = render("epl", demoData());
    expect(out).toContain("Liverpool (LIV)");
    expect(out).toContain("teamlogos/soccer/500/364.png");
  });

  it("shows the league name as-is, without appending 'Conference'", () => {
    const out = render("epl", demoData());
    expect(out).toContain("English Premier League");
    expect(out).not.toContain("English Premier League Conference");
  });

  it("falls back to 'Premier League' when the group is missing", () => {
    const out = render("epl", demoData({ team: { abbreviation: "LIV", full_name: "Liverpool", conference: "" } }));
    expect(out).toContain("Premier League");
  });

  it("renders W/L/D with points (W×3 + D)", () => {
    const out = render("epl", demoData());
    expect(out).toContain("17W - 12L - 9D");
    expect(out).toContain("(60 pts)");
  });

  it("marks a draw with the draw icon", () => {
    const out = render("epl", demoData({
      recentGames: [{ date: "2026-05-24T14:00:00Z", teamScore: 1, oppScore: 1, oppAbbr: "BRE", isHome: true, won: false, drew: true }],
    }));
    expect(out).toContain("🟡");
  });

  it("still appends 'Conference' for MLS's Eastern/Western groups", () => {
    const out = render("mls", demoData({
      team: { abbreviation: "MIA", full_name: "Inter Miami CF", conference: "Eastern" },
    }));
    expect(out).toContain("Eastern Conference");
  });

  it("does not double up when MLS already says 'Conference'", () => {
    const out = render("mls", demoData({
      team: { abbreviation: "MIA", full_name: "Inter Miami CF", conference: "Eastern Conference" },
    }));
    expect(out).toContain("Eastern Conference");
    expect(out).not.toContain("Eastern Conference Conference");
  });
});

describe("Season status — next-season year", () => {
  afterEach(() => jest.useRealTimers());

  const line = (sport, y, mIdx, d) => {
    jest.useFakeTimers().setSystemTime(new Date(y, mIdx, d));
    return render(sport, {
      team: { abbreviation: "LIV", full_name: "Liverpool", conference: "English Premier League" },
      record: { wins: 0, losses: 0, draws: 0, season: y },
      recentGames: [], emoji: "🔴", logoUrl: "x",
    });
  };

  it("names the current year when the start date is still ahead", () => {
    // Aug 8 with a season starting Aug 10 — starts in 2 days, not next year
    expect(line("epl", 2026, 7, 8)).toContain("August 2026");
  });

  it("names next year once this year's start date has passed", () => {
    // Jun 1 is after May's end and after no Aug start yet this year
    expect(line("epl", 2026, 5, 1)).toContain("August 2026");
  });

  it("reports the season as active once it has kicked off", () => {
    // Sep 20 sits inside the Aug–May window
    expect(line("epl", 2026, 8, 20)).toContain("🟢 Season in progress");
  });

  it("names the upcoming August throughout the summer gap", () => {
    // Jun and Jul sit between May's end and August's start, so the next
    // kickoff is still this year — never next year.
    expect(line("epl", 2026, 5, 1)).toContain("August 2026");
    expect(line("epl", 2026, 6, 15)).toContain("August 2026");
  });

  it("regression: does not skip a year on the eve of kickoff", () => {
    // The bug: month >= startMonth ignored the day, so Aug 8 (start Aug 10)
    // reported August 2027 — a full year late.
    expect(line("epl", 2026, 7, 8)).not.toContain("2027");
  });
});

describe("Team logo sizing", () => {
  const cases = [
    ["nba", { ...BASE_NBA_DATA, recentGames: [] }],
    ["mlb", { ...BASE_MLB_DATA, recentGames: [] }],
    ["mls", { ...BASE_MLS_DATA, recentGames: [] }],
  ];

  cases.forEach(([sport, data]) => {
    it(`${sport} renders the team logo at 72px, right-aligned`, () => {
      const out = render(sport, data);
      expect(out).toContain('width="72" align="right"');
      expect(out).not.toContain('width="60"');
    });
  });

  it("does not render a league badge in the generated block", () => {
    // The league logo lives in the profile README's section headings;
    // duplicating it here made it too small to read.
    cases.forEach(([sport, data]) => {
      expect(render(sport, data)).not.toContain("<picture>");
    });
  });
});

describe("Soccer renderer — La Liga", () => {
  const data = (overrides = {}) => ({
    team: { abbreviation: "RMA", full_name: "Real Madrid", conference: "LALIGA" },
    record: { wins: 27, losses: 6, draws: 5, season: 2025 },
    recentGames: [],
    emoji: "👑",
    logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/86.png",
    ...overrides,
  });

  it("renders the club name and logo", () => {
    const out = render("laliga", data());
    expect(out).toContain("Real Madrid (RMA)");
    expect(out).toContain("teamlogos/soccer/500/86.png");
  });

  it("shows the league name as-is, without appending 'Conference'", () => {
    const out = render("laliga", data());
    expect(out).toContain("LALIGA");
    expect(out).not.toContain("LALIGA Conference");
  });

  it("falls back to 'La Liga' when the group is missing", () => {
    const out = render("laliga", data({ team: { abbreviation: "RMA", full_name: "Real Madrid", conference: "" } }));
    expect(out).toContain("La Liga");
  });

  it("renders W/L/D with points (W×3 + D)", () => {
    const out = render("laliga", data());
    expect(out).toContain("27W - 6L - 5D");
    expect(out).toContain("(86 pts)");
  });

  it("marks a draw with the draw icon", () => {
    const out = render("laliga", data({
      recentGames: [{ date: "2026-05-23T19:00:00Z", teamScore: 2, oppScore: 2, oppAbbr: "BAR", isHome: true, won: false, drew: true }],
    }));
    expect(out).toContain("🟡");
  });

  it("renders the team logo at 72px like every other sport", () => {
    expect(render("laliga", data())).toContain('width="72" align="right"');
  });
});

describe("Soccer renderer — Bundesliga", () => {
  const data = (overrides = {}) => ({
    team: { abbreviation: "MUN", full_name: "Bayern Munich", conference: "German Bundesliga" },
    record: { wins: 28, losses: 1, draws: 5, season: 2025 },
    recentGames: [],
    emoji: "🔴",
    logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/132.png",
    ...overrides,
  });

  it("renders the club name and logo", () => {
    const out = render("bundesliga", data());
    expect(out).toContain("Bayern Munich (MUN)");
    expect(out).toContain("teamlogos/soccer/500/132.png");
  });

  it("shows the league name as-is, without appending 'Conference'", () => {
    const out = render("bundesliga", data());
    expect(out).toContain("German Bundesliga");
    expect(out).not.toContain("Bundesliga Conference");
  });

  it("falls back to 'Bundesliga' when the group is missing", () => {
    const out = render("bundesliga", data({ team: { abbreviation: "MUN", full_name: "Bayern Munich", conference: "" } }));
    expect(out).toContain("Bundesliga");
  });

  it("renders W/L/D with points (W×3 + D)", () => {
    const out = render("bundesliga", data());
    expect(out).toContain("28W - 1L - 5D");
    expect(out).toContain("(89 pts)");
  });

  it("marks a draw with the draw icon", () => {
    const out = render("bundesliga", data({
      recentGames: [{ date: "2026-05-02T13:30:00Z", teamScore: 3, oppScore: 3, oppAbbr: "HDH", isHome: true, won: false, drew: true }],
    }));
    expect(out).toContain("🟡");
  });
});

describe("Soccer renderer — Serie A", () => {
  const data = (overrides = {}) => ({
    team: { abbreviation: "INT", full_name: "Internazionale", conference: "Italian Serie A" },
    record: { wins: 27, losses: 5, draws: 6, season: 2025 },
    recentGames: [],
    emoji: "🐍",
    logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/110.png",
    ...overrides,
  });

  it("renders the club name and logo", () => {
    const out = render("seriea", data());
    expect(out).toContain("Internazionale (INT)");
    expect(out).toContain("teamlogos/soccer/500/110.png");
  });

  it("shows the league name as-is, without appending 'Conference'", () => {
    const out = render("seriea", data());
    expect(out).toContain("Italian Serie A");
    expect(out).not.toContain("Serie A Conference");
  });

  it("falls back to 'Serie A' when the group is missing", () => {
    const out = render("seriea", data({ team: { abbreviation: "INT", full_name: "Internazionale", conference: "" } }));
    expect(out).toContain("Serie A");
  });

  it("renders W/L/D with points (W×3 + D)", () => {
    const out = render("seriea", data());
    expect(out).toContain("27W - 5L - 6D");
    expect(out).toContain("(87 pts)");
  });

  it("marks a 0-0 draw with the draw icon", () => {
    const out = render("seriea", data({
      recentGames: [{ date: "2026-04-26T18:45:00Z", teamScore: 0, oppScore: 0, oppAbbr: "JUV", isHome: false, won: false, drew: true }],
    }));
    expect(out).toContain("🟡");
    expect(out).toContain("0-0");
  });
});

describe("Soccer renderer — Ligue 1", () => {
  const data = (overrides = {}) => ({
    team: { abbreviation: "PSG", full_name: "Paris Saint-Germain", conference: "French Ligue 1" },
    record: { wins: 24, losses: 6, draws: 4, season: 2025 },
    recentGames: [],
    emoji: "🗼",
    logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/160.png",
    ...overrides,
  });

  it("renders the club name and logo", () => {
    const out = render("ligue1", data());
    expect(out).toContain("Paris Saint-Germain (PSG)");
    expect(out).toContain("teamlogos/soccer/500/160.png");
  });

  it("shows the league name as-is, without appending 'Conference'", () => {
    const out = render("ligue1", data());
    expect(out).toContain("French Ligue 1");
    expect(out).not.toContain("Ligue 1 Conference");
  });

  it("falls back to 'Ligue 1' when the group is missing", () => {
    const out = render("ligue1", data({ team: { abbreviation: "PSG", full_name: "Paris Saint-Germain", conference: "" } }));
    expect(out).toContain("Ligue 1");
  });

  it("renders W/L/D with points (W×3 + D)", () => {
    const out = render("ligue1", data());
    expect(out).toContain("24W - 6L - 4D");
    expect(out).toContain("(76 pts)");
  });

  it("marks a draw with the draw icon", () => {
    const out = render("ligue1", data({
      recentGames: [{ date: "2026-05-02T19:00:00Z", teamScore: 2, oppScore: 2, oppAbbr: "LOR", isHome: true, won: false, drew: true }],
    }));
    expect(out).toContain("🟡");
  });
});
