const adapter = require("../../src/adapters/nhl");

describe("NHLAdapter", () => {

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

    it("should not have duplicate emojis", () => {
      const emojis = Object.values(adapter.TEAM_EMOJI);
      const unique = new Set(emojis);
      expect(unique.size).toBe(emojis.length);
    });

    it("OTT should not use the bone emoji", () => {
      expect(adapter.TEAM_EMOJI.OTT).not.toBe("🦴");
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
    it("should generate correct NHLv2 club-schedule URL for NYR (id=3)", () => {
      const url = adapter.getGamesUrl(3);
      expect(url).toBe("https://api-web.nhle.com/v1/club-schedule-season/nyr/now");
    });

    it("should use lowercase abbreviation in URL for TOR (id=10)", () => {
      const url = adapter.getGamesUrl(10);
      expect(url).toContain("tor");
    });

    it("should throw for unknown team ID", () => {
      expect(() => adapter.getGamesUrl(99999)).toThrow("Unknown NHL team ID");
    });
  });

  describe("parseGameResponse", () => {
    it("should return empty array for missing games", () => {
      expect(adapter.parseGameResponse({})).toEqual([]);
      expect(adapter.parseGameResponse({ games: [] })).toEqual([]);
    });

    it("should parse NHLv2 game data correctly", () => {
      const response = {
        games: [
          {
            startTimeUTC: "2024-10-10T20:00:00Z",
            homeTeam: { id: 3, abbrev: "NYR", score: 4 },
            awayTeam: { id: 6, abbrev: "BOS", score: 2 },
            gameState: "OFF",
          },
        ],
      };

      const games = adapter.parseGameResponse(response);
      expect(games.length).toBe(1);
      expect(games[0].home_team.abbreviation).toBe("NYR");
      expect(games[0].visitor_team.abbreviation).toBe("BOS");
      expect(games[0].home_team_score).toBe(4);
      expect(games[0].visitor_team_score).toBe(2);
      expect(games[0].status).toBe("Final");
    });

    it("should handle missing scores gracefully", () => {
      const response = {
        games: [
          {
            startTimeUTC: "2024-10-10T20:00:00Z",
            homeTeam: { id: 3, abbrev: "NYR" },
            awayTeam: { id: 6, abbrev: "BOS" },
            gameState: "LIVE",
          },
        ],
      };

      const games = adapter.parseGameResponse(response);
      expect(games.length).toBe(1);
      expect(games[0].home_team_score).toBe(0);
      expect(games[0].visitor_team_score).toBe(0);
      expect(games[0].status).toBe("InProgress");
    });

    it("should map OFF and FINAL gameState to Final", () => {
      const response = {
        games: [
          {
            startTimeUTC: "2024-10-10T20:00:00Z",
            homeTeam: { id: 3, abbrev: "NYR", score: 4 },
            awayTeam: { id: 6, abbrev: "BOS", score: 2 },
            gameState: "FINAL",
          },
          {
            startTimeUTC: "2024-10-11T20:00:00Z",
            homeTeam: { id: 10, abbrev: "TOR", score: 3 },
            awayTeam: { id: 17, abbrev: "DET", score: 1 },
            gameState: "LIVE",
          },
        ],
      };

      const games = adapter.parseGameResponse(response);
      expect(games[0].status).toBe("Final");
      expect(games[1].status).toBe("InProgress");
    });

    it("should handle multiple games", () => {
      const response = {
        games: [
          {
            startTimeUTC: "2024-10-10T20:00:00Z",
            homeTeam: { id: 3, abbrev: "NYR", score: 4 },
            awayTeam: { id: 6, abbrev: "BOS", score: 2 },
            gameState: "OFF",
          },
          {
            startTimeUTC: "2024-10-11T20:00:00Z",
            homeTeam: { id: 10, abbrev: "TOR", score: 3 },
            awayTeam: { id: 17, abbrev: "DET", score: 1 },
            gameState: "OFF",
          },
        ],
      };

      const games = adapter.parseGameResponse(response);
      expect(games.length).toBe(2);
    });
  });

  describe("parseTeamResponse (standings shape)", () => {
    it("should return null for empty standings", () => {
      expect(adapter.parseTeamResponse({ standings: [] })).toBeNull();
      expect(adapter.parseTeamResponse({})).toBeNull();
    });

    it("should parse NHLv2 standings entry correctly", () => {
      const response = {
        standings: [
          {
            teamId: 3,
            teamAbbrev: { default: "NYR" },
            teamCommonName: { default: "Rangers" },
            teamName: { default: "New York Rangers" },
            conferenceName: "Eastern",
            divisionName: "Metropolitan",
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

  describe("getSeasonCode", () => {
    it("should format season as concatenated years", () => {
      expect(adapter.getSeasonCode(2024)).toBe("20242025");
      expect(adapter.getSeasonCode(2023)).toBe("20232024");
    });
  });

  describe("getGamesUrl with season override", () => {
    it("should use 'now' by default", () => {
      const url = adapter.getGamesUrl(10);
      expect(url).toContain("/now");
    });

    it("should accept an explicit season code", () => {
      const url = adapter.getGamesUrl(10, null, null, "20242025");
      expect(url).toContain("/20242025");
      expect(url).not.toContain("/now");
    });
  });

  describe("parseGameResponse — status filtering", () => {
    it("should mark OFF games as Final", () => {
      const response = {
        games: [{ startTimeUTC: "2025-04-10T00:00:00Z", homeTeam: { id: 10, abbrev: "TOR", score: 4 }, awayTeam: { id: 6, abbrev: "BOS", score: 2 }, gameState: "OFF" }],
      };
      expect(adapter.parseGameResponse(response)[0].status).toBe("Final");
    });

    it("should mark FINAL games as Final", () => {
      const response = {
        games: [{ startTimeUTC: "2025-04-10T00:00:00Z", homeTeam: { id: 10, abbrev: "TOR", score: 4 }, awayTeam: { id: 6, abbrev: "BOS", score: 2 }, gameState: "FINAL" }],
      };
      expect(adapter.parseGameResponse(response)[0].status).toBe("Final");
    });

    it("should mark LIVE and PRE games as InProgress", () => {
      const response = {
        games: [
          { startTimeUTC: "2025-04-10T00:00:00Z", homeTeam: { id: 10, abbrev: "TOR" }, awayTeam: { id: 6, abbrev: "BOS" }, gameState: "LIVE" },
          { startTimeUTC: "2025-04-11T00:00:00Z", homeTeam: { id: 10, abbrev: "TOR" }, awayTeam: { id: 6, abbrev: "BOS" }, gameState: "PRE" },
        ],
      };
      const games = adapter.parseGameResponse(response);
      expect(games[0].status).toBe("InProgress");
      expect(games[1].status).toBe("InProgress");
    });
  });

  describe("getSeasonYear", () => {
    it("should return previous year for months 1-9", () => {
      const RealDate = Date;
      jest.spyOn(global, "Date").mockImplementation(() => new RealDate("2025-05-15"));
      expect(adapter.getSeasonYear()).toBe(2024);
      jest.restoreAllMocks();
    });

    it("should return current year for months 10-12", () => {
      const RealDate = Date;
      jest.spyOn(global, "Date").mockImplementation(() => new RealDate("2025-10-15"));
      expect(adapter.getSeasonYear()).toBe(2025);
      jest.restoreAllMocks();
    });
  });
});
