const nhlAdapter = require("../../src/adapters/nhl");

describe("NHL Adapter", () => {
  it("should have all 32 NHL teams in TEAM_EMOJI", () => {
    const teams = Object.keys(nhlAdapter.TEAM_EMOJI);
    expect(teams.length).toBe(32);
    expect(teams).toContain("NYR");
    expect(teams).toContain("LAK");
    expect(teams).toContain("TOR");
  });

  it("should have all 32 NHL teams in TEAM_IDS", () => {
    const teams = Object.keys(nhlAdapter.TEAM_IDS);
    expect(teams.length).toBe(32);
    expect(nhlAdapter.TEAM_IDS.NYR).toBe(3);
    expect(nhlAdapter.TEAM_IDS.LAK).toBe(26);
  });

  it("should have matching abbreviations between TEAM_EMOJI and TEAM_IDS", () => {
    const emojiTeams = Object.keys(nhlAdapter.TEAM_EMOJI).sort();
    const idTeams = Object.keys(nhlAdapter.TEAM_IDS).sort();
    expect(emojiTeams).toEqual(idTeams);
  });

  it("should return demo data for valid NHL team", () => {
    const demoData = nhlAdapter.getDemoData("NYR");
    expect(demoData.team.abbreviation).toBe("NYR");
    expect(demoData.team.full_name).toBe("New York Rangers");
    expect(demoData.record.wins).toBe(42);
    expect(demoData.record.losses).toBe(28);
    expect(demoData.recentGames.length).toBe(2);
  });

  it("should parse game response correctly", () => {
    const mockData = {
      games: [
        {
          gameDateTime: "2026-01-15T20:00:00Z",
          status: "Final",
          teams: {
            home: {
              team: { id: 3, abbreviation: "NYR" },
              score: 3,
            },
            away: {
              team: { id: 26, abbreviation: "LAK" },
              score: 2,
            },
          },
        },
      ],
    };

    const games = nhlAdapter.parseGameResponse(mockData);
    expect(games.length).toBe(1);
    expect(games[0].home_team.abbreviation).toBe("NYR");
    expect(games[0].visitor_team.abbreviation).toBe("LAK");
    expect(games[0].home_team_score).toBe(3);
    expect(games[0].visitor_team_score).toBe(2);
  });

  it("should build correct games URL", () => {
    const from = new Date("2026-01-01");
    const to = new Date("2026-01-31");
    const url = nhlAdapter.getGamesUrl(3, from, to);

    expect(url).toContain("teams/3/schedule");
    expect(url).toContain("startDate=2026-01-01");
    expect(url).toContain("endDate=2026-01-31");
  });

  it("should return null for unknown team abbreviation in demo mode", () => {
    const demoData = nhlAdapter.getDemoData("UNKNOWN");
    expect(demoData).toBeNull();
  });
});
