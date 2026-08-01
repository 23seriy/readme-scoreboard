const NHLAdapter = require("../../src/adapters/nhl");

describe("NHLAdapter", () => {
  let adapter;

  beforeEach(() => {
    adapter = new NHLAdapter();
  });

  describe("TEAM_EMOJI", () => {
    it("should have emojis for all 32 NHL teams", () => {
      expect(Object.keys(adapter.TEAM_EMOJI).length).toBe(32);
    });

    it("should have emojis for all expected teams", () => {
      const expectedTeams = [
        "ANA", "ARI", "BOS", "BUF", "CAR", "CBJ", "CGY", "CHI",
        "COL", "DAL", "DET", "EDM", "FLA", "LAK", "MIN", "MTL",
        "NJ", "NSH", "NYI", "NYR", "OTT", "PHI", "PIT", "SJ",
        "SEA", "STL", "TB", "TOR", "VAN", "VGK", "WPG", "WSH",
      ];
      for (const team of expectedTeams) {
        expect(adapter.TEAM_EMOJI[team]).toBeDefined();
        expect(typeof adapter.TEAM_EMOJI[team]).toBe("string");
      }
    });
  });

  describe("TEAM_IDS", () => {
    it("should have team IDs for all 32 NHL teams", () => {
      expect(Object.keys(adapter.TEAM_IDS).length).toBe(32);
    });

    it("should have correct team IDs for all expected teams", () => {
      const expectedTeams = {
        ANA: 24, ARI: 53, BOS: 6, BUF: 7, CAR: 12, CBJ: 29, CGY: 20,
        CHI: 16, COL: 21, DAL: 25, DET: 17, EDM: 22, FLA: 13, LAK: 26,
        MIN: 30, MTL: 8, NJ: 1, NSH: 18, NYI: 2, NYR: 3, OTT: 9, PHI: 4,
        PIT: 5, SJ: 28, SEA: 55, STL: 19, TB: 14, TOR: 10, VAN: 23,
        VGK: 54, WPG: 52, WSH: 15,
      };
      for (const [abbr, id] of Object.entries(expectedTeams)) {
        expect(adapter.TEAM_IDS[abbr]).toBe(id);
      }
    });

    it("should have matching TEAM_EMOJI and TEAM_IDS keys", () => {
      const emojiKeys = Object.keys(adapter.TEAM_EMOJI).sort();
      const idKeys = Object.keys(adapter.TEAM_IDS).sort();
      expect(emojiKeys).toEqual(idKeys);
    });
  });

  describe("DEMO_TEAMS", () => {
    it("should have exactly 6 demo teams", () => {
      expect(Object.keys(adapter.DEMO_TEAMS).length).toBe(6);
    });

    it("should include expected demo teams", () => {
      const expectedDemos = ["NYR", "LAK", "TOR", "DET", "BOS", "EDM"];
      for (const team of expectedDemos) {
        expect(adapter.DEMO_TEAMS[team]).toBeDefined();
      }
    });

    it("should have correct structure for demo teams", () => {
      const team = adapter.DEMO_TEAMS.NYR;
      expect(team).toHaveProperty("id");
      expect(team).toHaveProperty("abbreviation");
      expect(team).toHaveProperty("name");
      expect(team).toHaveProperty("full_name");
      expect(team).toHaveProperty("conference");
      expect(team).toHaveProperty("division");
    });
  });

  describe("getDemoData", () => {
    it("should return demo data for valid team", () => {
      const demoData = adapter.getDemoData("NYR");
      expect(demoData).toHaveProperty("team");
      expect(demoData).toHaveProperty("record");
      expect(demoData).toHaveProperty("recentGames");
      expect(demoData.recentGames.length).toBe(2);
    });

    it("should return null for unknown team", () => {
      const demoData = adapter.getDemoData("UNKNOWN");
      expect(demoData).toBeNull();
    });

    it("should return correct demo team info", () => {
      const demoData = adapter.getDemoData("LAK");
      expect(demoData.team.abbreviation).toBe("LAK");
      expect(demoData.team.id).toBe(26);
    });
  });

  describe("getGamesUrl", () => {
    it("should generate correct NHL schedule URL", () => {
      const fromDate = new Date("2024-10-01");
      const toDate = new Date("2024-10-31");
      const url = adapter.getGamesUrl(3, fromDate, toDate);

      expect(url).toContain("https://statsapi.web.nhl.com/api/v1/schedule");
      expect(url).toContain("teamId=3");
      expect(url).toContain("startDate=2024-10-01");
      expect(url).toContain("endDate=2024-10-31");
    });

    it("should handle date formatting correctly", () => {
      const fromDate = new Date("2024-01-05");
      const toDate = new Date("2024-01-15");
      const url = adapter.getGamesUrl(10, fromDate, toDate);

      expect(url).toContain("startDate=2024-01-05");
      expect(url).toContain("endDate=2024-01-15");
    });
  });

  describe("parseGameResponse", () => {
    it("should return empty array for missing dates", () => {
      const response = { dates: undefined };
      expect(adapter.parseGameResponse(response)).toEqual([]);
    });

    it("should parse game data correctly", () => {
      const response = {
        dates: [
          {
            games: [
              {
                gameDateTime: "2024-10-10T20:00:00Z",
                teams: {
                  home: {
                    team: { id: 3, abbreviation: "NYR" },
                    score: 4,
                  },
                  away: {
                    team: { id: 6, abbreviation: "BOS" },
                    score: 2,
                  },
                },
                status: {
                  abstractGameState: "Final",
                },
              },
            ],
          },
        ],
      };

      const games = adapter.parseGameResponse(response);
      expect(games.length).toBe(1);
      expect(games[0].home_team.abbreviation).toBe("NYR");
      expect(games[0].visitor_team.abbreviation).toBe("BOS");
      expect(games[0].home_team_score).toBe(4);
      expect(games[0].visitor_team_score).toBe(2);
    });

    it("should handle missing scores gracefully", () => {
      const response = {
        dates: [
          {
            games: [
              {
                gameDateTime: "2024-10-10T20:00:00Z",
                teams: {
                  home: {
                    team: { id: 3, abbreviation: "NYR" },
                  },
                  away: {
                    team: { id: 6, abbreviation: "BOS" },
                  },
                },
                status: {
                  abstractGameState: "InProgress",
                },
              },
            ],
          },
        ],
      };

      const games = adapter.parseGameResponse(response);
      expect(games.length).toBe(1);
      expect(games[0].home_team_score).toBe(0);
      expect(games[0].visitor_team_score).toBe(0);
    });

    it("should correctly filter game status", () => {
      const response = {
        dates: [
          {
            games: [
              {
                gameDateTime: "2024-10-10T20:00:00Z",
                teams: {
                  home: { team: { id: 3, abbreviation: "NYR" }, score: 4 },
                  away: { team: { id: 6, abbreviation: "BOS" }, score: 2 },
                },
                status: { abstractGameState: "Final" },
              },
              {
                gameDateTime: "2024-10-11T20:00:00Z",
                teams: {
                  home: { team: { id: 10, abbreviation: "TOR" }, score: 3 },
                  away: { team: { id: 17, abbreviation: "DET" }, score: 1 },
                },
                status: { abstractGameState: "InProgress" },
              },
            ],
          },
        ],
      };

      const games = adapter.parseGameResponse(response);
      expect(games[0].status).toBe("Final");
      expect(games[1].status).toBe("InProgress");
    });

    it("should handle multiple date entries", () => {
      const response = {
        dates: [
          {
            games: [
              {
                gameDateTime: "2024-10-10T20:00:00Z",
                teams: {
                  home: { team: { id: 3, abbreviation: "NYR" }, score: 4 },
                  away: { team: { id: 6, abbreviation: "BOS" }, score: 2 },
                },
                status: { abstractGameState: "Final" },
              },
            ],
          },
          {
            games: [
              {
                gameDateTime: "2024-10-11T20:00:00Z",
                teams: {
                  home: { team: { id: 10, abbreviation: "TOR" }, score: 3 },
                  away: { team: { id: 17, abbreviation: "DET" }, score: 1 },
                },
                status: { abstractGameState: "Final" },
              },
            ],
          },
        ],
      };

      const games = adapter.parseGameResponse(response);
      expect(games.length).toBe(2);
    });
  });

  describe("parseTeamResponse", () => {
    it("should return null for empty teams array", () => {
      const response = { teams: [] };
      expect(adapter.parseTeamResponse(response)).toBeNull();
    });

    it("should parse team data correctly", () => {
      const response = {
        teams: [
          {
            id: 3,
            abbreviation: "NYR",
            teamName: "Rangers",
            name: "New York Rangers",
            conference: { name: "Eastern" },
            division: { name: "Metropolitan" },
          },
        ],
      };

      const team = adapter.parseTeamResponse(response);
      expect(team).toHaveProperty("id", 3);
      expect(team).toHaveProperty("abbreviation", "NYR");
      expect(team).toHaveProperty("name", "Rangers");
      expect(team).toHaveProperty("full_name", "New York Rangers");
      expect(team).toHaveProperty("conference", "Eastern");
      expect(team).toHaveProperty("division", "Metropolitan");
    });
  });

  describe("getSeasonYear", () => {
    it("should return previous year for months 1-9", () => {
      const mockAdapter = createMockAdapter();
      const originalDate = global.Date;
      const mockDate = new Date("2025-05-15");

      global.Date = class extends originalDate {
        constructor(...args) {
          if (args.length === 0) return mockDate;
          return super(...args);
        }
        static now() {
          return mockDate.getTime();
        }
      };
      global.Date.prototype = originalDate.prototype;

      expect(mockAdapter.getSeasonYear()).toBe(2024);
      global.Date = originalDate;
    });

    it("should return current year for months 10-12", () => {
      const mockAdapter = createMockAdapter();
      const originalDate = global.Date;
      const mockDate = new Date("2025-10-15");

      global.Date = class extends originalDate {
        constructor(...args) {
          if (args.length === 0) return mockDate;
          return super(...args);
        }
        static now() {
          return mockDate.getTime();
        }
      };
      global.Date.prototype = originalDate.prototype;

      expect(mockAdapter.getSeasonYear()).toBe(2025);
      global.Date = originalDate;
    });
  });
});

function createMockAdapter() {
  return new NHLAdapter();
}
