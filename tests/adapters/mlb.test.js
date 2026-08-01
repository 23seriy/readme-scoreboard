const adapter = require("../../src/adapters/mlb");

function makeGame({ homeId, awayId, homeAbbr, awayAbbr, homeScore, awayScore, state, date = "2025-04-10T20:00:00Z" }) {
  return {
    gameDateTime: date,
    teams: {
      home: { team: { id: homeId, abbreviation: homeAbbr }, score: homeScore },
      away: { team: { id: awayId, abbreviation: awayAbbr }, score: awayScore },
    },
    status: { abstractGameState: state },
  };
}

describe("MlbAdapter", () => {
  describe("parseGameResponse", () => {
    it("should return empty array for missing dates", () => {
      expect(adapter.parseGameResponse({})).toEqual([]);
      expect(adapter.parseGameResponse({ dates: [] })).toEqual([]);
    });

    it("should parse a Final game correctly", () => {
      const response = {
        dates: [{
          games: [makeGame({ homeId: 141, awayId: 147, homeAbbr: "TOR", awayAbbr: "NYY", homeScore: 5, awayScore: 2, state: "Final" })],
        }],
      };
      const games = adapter.parseGameResponse(response);
      expect(games.length).toBe(1);
      expect(games[0].status).toBe("Final");
      expect(games[0].home_team.abbreviation).toBe("TOR");
      expect(games[0].visitor_team.abbreviation).toBe("NYY");
      expect(games[0].home_team_score).toBe(5);
      expect(games[0].visitor_team_score).toBe(2);
    });

    it("should mark postponed/cancelled games (Final, 0-0) as Other", () => {
      const response = {
        dates: [{
          games: [makeGame({ homeId: 141, awayId: 112, homeAbbr: "TOR", awayAbbr: "CHC", homeScore: 0, awayScore: 0, state: "Final" })],
        }],
      };
      const games = adapter.parseGameResponse(response);
      expect(games.length).toBe(1);
      expect(games[0].status).toBe("Other");
    });

    it("should mark non-Final games as Other (not Final)", () => {
      const response = {
        dates: [{
          games: [
            makeGame({ homeId: 141, awayId: 112, homeAbbr: "TOR", awayAbbr: "CHC", homeScore: 0, awayScore: 0, state: "Scheduled" }),
            makeGame({ homeId: 141, awayId: 112, homeAbbr: "TOR", awayAbbr: "CHC", homeScore: 2, awayScore: 1, state: "InProgress" }),
          ],
        }],
      };
      const games = adapter.parseGameResponse(response);
      expect(games.length).toBe(2);
      expect(games[0].status).toBe("Other");
      expect(games[1].status).toBe("Other");
    });

    it("should skip games with missing team data", () => {
      const response = {
        dates: [{
          games: [
            { gameDateTime: "2025-04-10T20:00:00Z", teams: { home: { team: {} }, away: { team: { id: 147, abbreviation: "NYY" } } }, status: { abstractGameState: "Final" } },
            makeGame({ homeId: 141, awayId: 147, homeAbbr: "TOR", awayAbbr: "NYY", homeScore: 3, awayScore: 1, state: "Final" }),
          ],
        }],
      };
      const games = adapter.parseGameResponse(response);
      expect(games.length).toBe(1);
      expect(games[0].home_team.abbreviation).toBe("TOR");
    });

    it("should fall back to abbrById when abbreviation is missing from API", () => {
      const response = {
        dates: [{
          games: [{
            gameDateTime: "2025-04-10T20:00:00Z",
            teams: {
              home: { team: { id: 141 }, score: 3 },
              away: { team: { id: 147 }, score: 1 },
            },
            status: { abstractGameState: "Final" },
          }],
        }],
      };
      const games = adapter.parseGameResponse(response);
      expect(games.length).toBe(1);
      expect(games[0].home_team.abbreviation).toBe("TOR");
      expect(games[0].visitor_team.abbreviation).toBe("NYY");
    });

    it("should handle multiple date entries", () => {
      const response = {
        dates: [
          { games: [makeGame({ homeId: 141, awayId: 147, homeAbbr: "TOR", awayAbbr: "NYY", homeScore: 5, awayScore: 2, state: "Final" })] },
          { games: [makeGame({ homeId: 111, awayId: 141, homeAbbr: "BOS", awayAbbr: "TOR", homeScore: 3, awayScore: 4, state: "Final" })] },
        ],
      };
      const games = adapter.parseGameResponse(response);
      expect(games.length).toBe(2);
    });
  });

  describe("abbrById", () => {
    it("should return abbreviation for known team ID", () => {
      expect(adapter.abbrById(141)).toBe("TOR");
      expect(adapter.abbrById(147)).toBe("NYY");
      expect(adapter.abbrById(119)).toBe("LAD");
    });

    it("should return ??? for unknown team ID", () => {
      expect(adapter.abbrById(99999)).toBe("???");
    });
  });

  describe("TEAM_IDS", () => {
    it("should have 29 MLB teams", () => {
      expect(Object.keys(adapter.TEAM_IDS).length).toBe(29);
    });

    it("should have correct ID for TOR", () => {
      expect(adapter.TEAM_IDS.TOR).toBe(141);
    });
  });

  describe("getSeasonYear", () => {
    it("should always return the current calendar year", () => {
      const RealDate = Date;
      jest.spyOn(global, "Date").mockImplementation(() => new RealDate("2025-07-15"));
      expect(adapter.getSeasonYear()).toBe(2025);
      jest.restoreAllMocks();
    });

    it("should return current year even in off-season months", () => {
      const RealDate = Date;
      jest.spyOn(global, "Date").mockImplementation(() => new RealDate("2025-01-15"));
      expect(adapter.getSeasonYear()).toBe(2025);
      jest.restoreAllMocks();
    });
  });
});
