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
  it("links the league heading to its live team endpoint", () => {
    const output = render("mlb", { ...BASE_MLB_DATA, recentGames: [] });
    expect(output).toContain("[<picture>");
    expect(output).toContain("https://statsapi.mlb.com/api/v1/teams?sportId=1");
  });

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

  it("uses a custom title when provided", () => {
    const output = render("mlb", { ...BASE_MLB_DATA, recentGames: [] }, { title: "Toronto Baseball" });
    expect(output).toContain("Toronto Baseball");
    expect(output).not.toContain("My Favourite MLB Team");
  });

  it("defaults to the league title when no custom title is provided", () => {
    const output = render("mlb", { ...BASE_MLB_DATA, recentGames: [] });
    expect(output).toContain("My Favourite MLB Team");
  });

  it("renders standing and next game when the adapter provides them", () => {
    const data = {
      ...BASE_MLB_DATA,
      recentGames: [],
      standing: { position: 2, label: "American League" },
      nextGame: { date: "2026-07-20T20:00:00Z", opponent: "NYY", isHome: false },
      form: ["W", "L", "W", "W", "D"],
    };
    const output = render("mlb", data);
    expect(output).toContain("🏅 Standing: American League · 2");
    expect(output).toContain("📅 Next: @ NYY");
    // The last-five form is intentionally not rendered: the Recent Games list
    // already shows the W/L/D sequence, so a separate 🔥 Form line is redundant.
    expect(output).not.toContain("🔥 Form:");
    // Standing and next game sit on their own separated row (a blank line
    // precedes them) so they read clearly instead of wrapping into the
    // conference/season paragraph.
    expect(output).toMatch(/🟢 Season in progress\n\n🏅 Standing: American League · 2/);
  });

  it("omits rich-stat lines when the adapter does not provide them", () => {
    const output = render("mlb", { ...BASE_MLB_DATA, recentGames: [] });
    expect(output).not.toContain("🏅 Standing:");
    expect(output).not.toContain("📅 Next:");
    expect(output).not.toContain("🔥 Form:");
  });

  it("renders a Formula 1 constructor board with championship position and points", () => {
    const data = {
      team: { abbreviation: "LP", name: "Mercedes", full_name: "Mercedes", conference: "Formula 1", division: "" },
      record: { wins: 0, losses: 0, points: 425, season: 2026 },
      recentGames: [],
      standing: { position: 1, label: "Constructor Championship" },
      emoji: "⚫",
      logoUrl: "https://a.espncdn.com/i/teamlogos/leagues/500/f1.png",
    };
    const output = render("f1", data);
    expect(output).toContain("Mercedes");
    expect(output).toContain("Championship position: 1");
    expect(output).toContain("Points: 425");
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

describe("Soccer renderer — Saudi Pro League and J1 League", () => {
  const data = (team, overrides = {}) => ({
    team: { abbreviation: team.abbreviation, full_name: team.full_name, conference: team.league },
    record: { wins: 10, losses: 2, draws: 3, season: 2026 },
    recentGames: [],
    emoji: "⚽",
    logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/929.png",
    ...overrides,
  });

  it("renders Saudi Pro League output", () => {
    const out = render("saudipro", data({ abbreviation: "HIL", full_name: "Al Hilal", league: "Saudi Pro League" }));
    expect(out).toContain("My Favourite Saudi Pro League Team");
    expect(out).toContain("Al Hilal (HIL)");
  });

  it("renders J1 League output", () => {
    const out = render("j1", data({ abbreviation: "KAW", full_name: "Kawasaki Frontale", league: "J1 League" }));
    expect(out).toContain("My Favourite J1 League Team");
    expect(out).toContain("Kawasaki Frontale (KAW)");
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

    it(`${sport} gives the team logo descriptive alt text`, () => {
      const out = render(sport, data);
      expect(out).toContain(`alt="${data.team.full_name} logo"`);
    });
  });

  it("renders the league logo in the section heading, not beside the team", () => {
    // The heading now lives inside the markers so it survives every run. The
    // logo belongs there at 28px — an earlier attempt put a 16px badge on the
    // conference line instead, which was too small to read.
    cases.forEach(([sport, data]) => {
      const out = render(sport, data);
      expect(out).toContain('height="28"');
      expect(out).not.toContain('height="16"');
    });
  });
});

describe("Section heading", () => {
  const SPORTS = [
    ["nba", "NBA"], ["mlb", "MLB"], ["nfl", "NFL"], ["nhl", "NHL"],
    ["mls", "MLS"], ["epl", "Premier League"], ["laliga", "La Liga"],
    ["bundesliga", "Bundesliga"], ["seriea", "Serie A"], ["ligue1", "Ligue 1"],
    ["primeiraliga", "Primeira Liga"],
  ];

  const dataFor = (sport) => {
    if (sport === "mlb") return { ...BASE_MLB_DATA, recentGames: [] };
    if (sport === "nba") return { ...BASE_NBA_DATA, recentGames: [] };
    return {
      team: { abbreviation: "XYZ", full_name: "Test Club", conference: "Test", division: "Test" },
      record: { wins: 1, losses: 1, draws: 1, season: 2026 },
      recentGames: [], emoji: "⚽", logoUrl: "https://example.com/x.png",
    };
  };

  SPORTS.forEach(([sport, label]) => {
    it(`${sport} renders "My Favourite ${label} Team" as an h2`, () => {
      const out = render(sport, dataFor(sport));
      expect(out).toContain(`My Favourite ${label} Team`);
      expect(out.split("\n")[0]).toMatch(/^## /);
    });
  });

  it("puts the heading first so it lands inside the markers", () => {
    // A heading above the start marker would be outside the tool's reach.
    const out = render("nba", dataFor("nba"));
    const lines = out.split("\n");
    expect(lines[0]).toContain("My Favourite NBA Team");
    expect(lines[1]).toBe("");
    expect(lines[2]).toContain("<img src=");
  });

  it("gives the heading logo both theme variants", () => {
    const out = render("nba", dataFor("nba"));
    expect(out).toContain("prefers-color-scheme: dark");
    expect(out).toContain("leagues/500/nba.png");
    expect(out).toContain("leagues/500-dark/nba.png");
  });

  it("renders exactly one heading per block", () => {
    const out = render("nba", dataFor("nba"));
    expect(out.split("\n").filter((l) => l.startsWith("## ")).length).toBe(1);
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

describe("Soccer renderer — Primeira Liga", () => {
  const data = (overrides = {}) => ({
    team: { abbreviation: "SLB", full_name: "Benfica", conference: "Portuguese Liga" },
    record: { wins: 24, losses: 4, draws: 6, season: 2025 },
    recentGames: [],
    emoji: "🦅",
    logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/1929.png",
    ...overrides,
  });

  it("renders the club name and logo", () => {
    const out = render("primeiraliga", data());
    expect(out).toContain("Benfica (SLB)");
    expect(out).toContain("teamlogos/soccer/500/1929.png");
  });

  it("shows the league name as-is, without appending 'Conference'", () => {
    const out = render("primeiraliga", data());
    expect(out).toContain("Portuguese Liga");
    expect(out).not.toContain("Portuguese Liga Conference");
  });

  it("falls back to 'Primeira Liga' when the group is missing", () => {
    const out = render("primeiraliga", data({ team: { abbreviation: "SLB", full_name: "Benfica", conference: "" } }));
    expect(out).toContain("Primeira Liga");
  });

  it("renders W/L/D with points (W×3 + D)", () => {
    const out = render("primeiraliga", data());
    expect(out).toContain("24W - 4L - 6D");
    expect(out).toContain("(78 pts)");
  });

  it("handles a single-match season without dividing by zero", () => {
    const out = render("primeiraliga", data({ record: { wins: 0, losses: 0, draws: 1, season: 2026 } }));
    expect(out).toContain("0W - 0L - 1D");
    expect(out).toContain("(1 pts)");
  });

  it("marks a draw with the draw icon", () => {
    const out = render("primeiraliga", data({
      recentGames: [{ date: "2026-08-09T19:00:00Z", teamScore: 2, oppScore: 2, oppAbbr: "ACV", isHome: true, won: false, drew: true }],
    }));
    expect(out).toContain("🟡");
  });
});

describe("Soccer renderer — Eredivisie", () => {
  const data = (overrides = {}) => ({
    team: { abbreviation: "AJA", full_name: "Ajax Amsterdam", conference: "Dutch Eredivisie" },
    record: { wins: 25, losses: 4, draws: 5, season: 2025 },
    recentGames: [],
    emoji: "🔴",
    logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/139.png",
    ...overrides,
  });

  it("renders the club name and logo", () => {
    const out = render("eredivisie", data());
    expect(out).toContain("Ajax Amsterdam (AJA)");
    expect(out).toContain("teamlogos/soccer/500/139.png");
  });

  it("renders its own section heading", () => {
    expect(render("eredivisie", data())).toContain("My Favourite Eredivisie Team");
  });

  it("uses the Eredivisie league logo in the heading", () => {
    const out = render("eredivisie", data());
    expect(out).toContain("leaguelogos/soccer/500/11.png");
    expect(out).toContain("leaguelogos/soccer/500-dark/11.png");
  });

  it("shows the league name as-is, without appending 'Conference'", () => {
    const out = render("eredivisie", data());
    expect(out).toContain("Dutch Eredivisie");
    expect(out).not.toContain("Eredivisie Conference");
  });

  it("renders W/L/D with points (W×3 + D)", () => {
    const out = render("eredivisie", data());
    expect(out).toContain("25W - 4L - 5D");
    expect(out).toContain("(80 pts)");
  });

  it("marks a draw with the draw icon", () => {
    const out = render("eredivisie", data({
      recentGames: [{ date: "2026-08-08T13:30:00Z", teamScore: 2, oppScore: 2, oppAbbr: "PSV", isHome: true, won: false, drew: true }],
    }));
    expect(out).toContain("🟡");
  });
});

describe("renderNba — WNBA variant", () => {
  const data = (overrides = {}) => ({
    team: { id: 8, abbreviation: "MIN", full_name: "Minnesota Lynx", conference: "Western", division: "" },
    record: { wins: 28, losses: 7, season: 2026 },
    recentGames: [],
    emoji: "🐆",
    logoUrl: "https://a.espncdn.com/i/teamlogos/wnba/500/min.png",
    ...overrides,
  });

  it("renders the club name and logo", () => {
    const out = render("wnba", data());
    expect(out).toContain("Minnesota Lynx (MIN)");
    expect(out).toContain("teamlogos/wnba/500/min.png");
  });

  it("renders its own section heading", () => {
    expect(render("wnba", data())).toContain("My Favourite WNBA Team");
  });

  it("uses the WNBA league logo, not the NBA one", () => {
    const out = render("wnba", data());
    expect(out).toContain("leagues/500/wnba.png");
    expect(out).not.toContain("leagues/500/nba.png");
  });

  it("shows the season as a single year, not a span", () => {
    const out = render("wnba", data());
    expect(out).toContain("2026 Record");
    expect(out).not.toContain("2025-2026");
  });

  it("omits the division half when there is no division", () => {
    const out = render("wnba", data());
    expect(out).toContain("Western Conference");
    expect(out).not.toContain("Division");
    expect(out).not.toContain("· ");
  });

  it("still renders the division for the NBA, which has them", () => {
    const out = render("nba", { ...BASE_NBA_DATA, recentGames: [] });
    expect(out).toContain("Conference · ");
    expect(out).toContain("Division");
  });

  it("tags playoff games", () => {
    const out = render("wnba", data({
      recentGames: [{ date: "2026-09-29T02:00:00Z", postseason: true, status: "Final",
        home_team: { id: 0, abbreviation: "PHX" }, visitor_team: { id: 8, abbreviation: "MIN" },
        home_team_score: 86, visitor_team_score: 81 }],
    }));
    expect(out).toContain("[Playoffs]");
  });
});

describe("Soccer renderer — Liga MX", () => {
  const data = (overrides = {}) => ({
    team: { abbreviation: "AME", full_name: "América", conference: "2026 Torneo Apertura" },
    record: { wins: 2, losses: 0, draws: 1, season: 2026 },
    recentGames: [],
    emoji: "🦅",
    logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/227.png",
    ...overrides,
  });

  it("renders the club name and logo", () => {
    const out = render("ligamx", data());
    expect(out).toContain("América (AME)");
    expect(out).toContain("teamlogos/soccer/500/227.png");
  });

  it("renders its own section heading", () => {
    expect(render("ligamx", data())).toContain("My Favourite Liga MX Team");
  });

  it("uses the Liga MX league logo in the heading", () => {
    const out = render("ligamx", data());
    expect(out).toContain("leaguelogos/soccer/500/22.png");
    expect(out).toContain("leaguelogos/soccer/500-dark/22.png");
  });

  it("shows the tournament name as-is, without appending 'Conference'", () => {
    const out = render("ligamx", data());
    expect(out).toContain("2026 Torneo Apertura");
    expect(out).not.toContain("Torneo Apertura Conference");
  });

  it("falls back to 'Liga MX' when the tournament is missing", () => {
    const out = render("ligamx", data({ team: { abbreviation: "AME", full_name: "América", conference: "" } }));
    expect(out).toContain("Liga MX");
  });

  it("renders W/L/D with points (W×3 + D)", () => {
    const out = render("ligamx", data());
    expect(out).toContain("2W - 0L - 1D");
    expect(out).toContain("(7 pts)");
  });

  it("marks a draw with the draw icon", () => {
    const out = render("ligamx", data({
      recentGames: [{ date: "2026-07-24T02:00:00Z", teamScore: 1, oppScore: 1, oppAbbr: "ATL", isHome: false, won: false, drew: true }],
    }));
    expect(out).toContain("🟡");
  });
});

describe("Soccer renderer — Brasileirão", () => {
  const data = (overrides = {}) => ({
    team: { abbreviation: "PAL", full_name: "Palmeiras", conference: "" },
    record: { wins: 14, losses: 2, draws: 6, season: 2026 },
    recentGames: [],
    emoji: "🟩",
    logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/2029.png",
    ...overrides,
  });

  it("renders the club name and logo", () => {
    const out = render("brasileirao", data());
    expect(out).toContain("Palmeiras (PAL)");
    expect(out).toContain("teamlogos/soccer/500/2029.png");
  });

  it("renders its own section heading", () => {
    expect(render("brasileirao", data())).toContain("My Favourite Brasileirão Team");
  });

  it("uses the Brasileirão league logo in the heading", () => {
    const out = render("brasileirao", data());
    expect(out).toContain("leaguelogos/soccer/500/85.png");
    expect(out).toContain("leaguelogos/soccer/500-dark/85.png");
  });

  it("falls back to 'Série A' rather than showing a bare year", () => {
    const out = render("brasileirao", data());
    expect(out).toContain("Série A");
    expect(out).not.toMatch(/\n2026\n/);
  });

  it("renders W/L/D with points (W×3 + D)", () => {
    const out = render("brasileirao", data());
    expect(out).toContain("14W - 2L - 6D");
    expect(out).toContain("(48 pts)");
  });

  it("marks a draw with the draw icon", () => {
    const out = render("brasileirao", data({
      recentGames: [{ date: "2026-08-09T20:00:00Z", teamScore: 0, oppScore: 0, oppAbbr: "INT", isHome: true, won: false, drew: true }],
    }));
    expect(out).toContain("🟡");
  });
});

describe("Soccer renderer — NWSL", () => {
  const data = (overrides = {}) => ({
    team: { abbreviation: "GFC", full_name: "Gotham FC", conference: "NWSL Regular Season" },
    record: { wins: 12, losses: 3, draws: 4, season: 2026 },
    recentGames: [],
    emoji: "🦇",
    logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/15364.png",
    ...overrides,
  });

  it("renders the club name and logo", () => {
    const out = render("nwsl", data());
    expect(out).toContain("Gotham FC (GFC)");
    expect(out).toContain("teamlogos/soccer/500/15364.png");
  });

  it("renders its own section heading", () => {
    expect(render("nwsl", data())).toContain("My Favourite NWSL Team");
  });

  it("uses the NWSL league logo, not the MLS one", () => {
    const out = render("nwsl", data());
    expect(out).toContain("leaguelogos/soccer/500/2323.png");
    expect(out).not.toContain("leaguelogos/soccer/500/19.png");
  });

  it("renders W/L/D with points (W×3 + D)", () => {
    const out = render("nwsl", data());
    expect(out).toContain("12W - 3L - 4D");
    expect(out).toContain("(40 pts)");
  });

  it("marks a draw with the draw icon", () => {
    const out = render("nwsl", data({
      recentGames: [{ date: "2026-07-24T23:00:00Z", teamScore: 2, oppScore: 2, oppAbbr: "POR", isHome: false, won: false, drew: true }],
    }));
    expect(out).toContain("🟡");
  });
});

describe("renderNba — G League variant", () => {
  const data = (overrides = {}) => ({
    team: { id: 11, abbreviation: "OSC", full_name: "Osceola Magic", conference: "Eastern", division: "" },
    record: { wins: 26, losses: 10, season: 2026 },
    recentGames: [],
    emoji: "✨",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nba-development/500/osc.png",
    ...overrides,
  });

  it("renders the team name and logo", () => {
    const out = render("gleague", data());
    expect(out).toContain("Osceola Magic (OSC)");
    expect(out).toContain("nba-development/500/osc.png");
  });

  it("renders its own section heading", () => {
    expect(render("gleague", data())).toContain("My Favourite NBA G League Team");
  });

  it("uses the G League logo, not the NBA one", () => {
    const out = render("gleague", data());
    expect(out).toContain("leagues/500/nba_gleague.png");
    expect(out).not.toContain("leagues/500/nba.png");
  });

  it("shows the season as a span, since it crosses the new year", () => {
    // Unlike the WNBA, whose season sits inside one calendar year.
    const out = render("gleague", data());
    expect(out).toContain("2025-2026 Record");
  });

  it("omits the division half, since the G League has none", () => {
    const out = render("gleague", data());
    expect(out).toContain("Eastern Conference");
    expect(out).not.toContain("Division");
  });

  it("tags playoff games", () => {
    const out = render("gleague", data({
      recentGames: [{ date: "2026-04-05T00:00:00Z", postseason: true, status: "Final",
        home_team: { id: 11, abbreviation: "OSC" }, visitor_team: { id: 0, abbreviation: "GBO" },
        home_team_score: 121, visitor_team_score: 134 }],
    }));
    expect(out).toContain("[Playoffs]");
  });
});

describe("renderAtp", () => {
  const BASE_ATP_DATA = {
    team: { id: "296", abbreviation: "DJO", full_name: "Novak Djokovic", conference: "ATP", division: "" },
    emoji: "🇷🇸",
    logoUrl: "https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-tennis.png",
    standing: { position: 5, label: "ATP" },
    rankPoints: 3770,
    previousRank: 5,
    trend: "-",
    lastMatch: {
      opponent: "Mariano Navone",
      won: false,
      date: "2026-08-30T15:05:00Z",
      sets: [[7, 5, 4, 6, 6], [6, 7, 6, 2, 1]],
    },
  };

  it("renders the player heading with the Player entity label", () => {
    const output = render("atp", BASE_ATP_DATA);
    expect(output).toContain("My Favourite ATP Tennis Player");
    expect(output).toContain("Novak Djokovic (DJO)");
  });

  it("groups ranking, points, and movement onto one meta line", () => {
    const output = render("atp", BASE_ATP_DATA);
    expect(output).toContain("🏆 World No. 5");
    expect(output).toContain("📍 3,770 ranking points");
    expect(output).toContain("📈 Movement");
    // All three share a single line (joined by ·), not three separate lines.
    expect(output).toMatch(/🏆 World No\. 5 · 📍 3,770 ranking points · 📈 Movement/);
  });

  it("renders the last match on its own labeled fenced block", () => {
    const output = render("atp", BASE_ATP_DATA);
    expect(output).toContain("**📅 Last Match:**");
    expect(output).toContain("❌ L vs Mariano Navone");
    expect(output).toContain("7-6, 5-7, 4-6, 6-2, 6-1");
    // The match sits in its own fenced code block, like team boards' Recent Games.
    expect(output).toMatch(/\*\*📅 Last Match:\*\*\n```\n❌ L vs Mariano Navone .*```/s);
  });

  it("renders a win with the W icon", () => {
    const output = render("atp", { ...BASE_ATP_DATA, lastMatch: { ...BASE_ATP_DATA.lastMatch, won: true } });
    expect(output).toContain("✅ W vs");
  });

  it("omits the last-match block when there is no match", () => {
    const output = render("atp", { ...BASE_ATP_DATA, lastMatch: null });
    expect(output).not.toContain("Last Match");
  });

  it("omits ranking meta when no standing is present", () => {
    const output = render("atp", { ...BASE_ATP_DATA, standing: null, rankPoints: undefined, previousRank: undefined });
    expect(output).not.toContain("🏆");
    expect(output).not.toContain("ranking points");
    expect(output).not.toContain("Movement");
  });
});

describe("renderNfl", () => {
  const BASE_NFL_DATA = {
    team: { abbreviation: "KC", full_name: "Kansas City Chiefs", conference: "AFC", division: "AFC West" },
    record: { wins: 9, losses: 3, season: 2026 },
    recentGames: [],
    emoji: "👑",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
    standing: { position: 2, label: "AFC" },
    nextGame: { date: "2026-09-15T00:00:00Z", opponent: "DEN", isHome: false },
  };

  it("renders the standing and next game on their own row", () => {
    const output = render("nfl", BASE_NFL_DATA);
    expect(output).toContain("🏅 Standing: AFC · 2");
    expect(output).toContain("📅 Next: @ DEN");
    // Separated from the conference/season paragraph by a blank line.
    expect(output).toMatch(/🟢 Season in progress\n\n🏅 Standing: AFC · 2/);
  });

  it("renders a home next game with 'vs'", () => {
    const output = render("nfl", { ...BASE_NFL_DATA, nextGame: { date: "2026-09-15T00:00:00Z", opponent: "LAC", isHome: true } });
    expect(output).toContain("📅 Next: vs LAC");
  });

  it("omits the standing row when no standing is present", () => {
    const output = render("nfl", { ...BASE_NFL_DATA, standing: null, nextGame: null });
    expect(output).not.toContain("🏅 Standing:");
    expect(output).not.toContain("📅 Next:");
  });

  it("renders the record with win percentage", () => {
    const output = render("nfl", BASE_NFL_DATA);
    expect(output).toContain("📊 2026 Season: 9W - 3L (75.0%)");
  });
});
