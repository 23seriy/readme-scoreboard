const axios = require("axios");
const adapter = require("../../src/adapters/nhl");

jest.mock("axios");

function makeGame({ homeAbbr, awayAbbr, homeId, awayId, homeScore, awayScore, gameState, gameType, date = "2026-04-10T20:00:00Z" }) {
  return {
    startTimeUTC: date,
    gameType,
    gameState,
    homeTeam: { id: homeId, abbrev: homeAbbr, score: homeScore, commonName: { default: homeAbbr }, placeName: { default: "City" } },
    awayTeam: { id: awayId, abbrev: awayAbbr, score: awayScore },
  };
}

const TOR_TEAM = { id: 10, abbreviation: "TOR", name: "TOR", full_name: "TOR", conference: "", division: "" };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("NHLAdapter — parseGameResponse gameType passthrough", () => {
  it("passes gameType through for regular season games", () => {
    const response = {
      games: [makeGame({ homeAbbr: "TOR", awayAbbr: "BOS", homeId: 10, awayId: 6, homeScore: 3, awayScore: 2, gameState: "OFF", gameType: 2 })],
    };
    const games = adapter.parseGameResponse(response);
    expect(games[0].gameType).toBe(2);
    expect(games[0].status).toBe("Final");
  });

  it("passes gameType through for playoff games", () => {
    const response = {
      games: [makeGame({ homeAbbr: "TOR", awayAbbr: "FLA", homeId: 10, awayId: 13, homeScore: 2, awayScore: 4, gameState: "OFF", gameType: 3 })],
    };
    const games = adapter.parseGameResponse(response);
    expect(games[0].gameType).toBe(3);
  });

  it("passes gameType through for pre-season games", () => {
    const response = {
      games: [makeGame({ homeAbbr: "TOR", awayAbbr: "BUF", homeId: 10, awayId: 7, homeScore: 2, awayScore: 1, gameState: "OFF", gameType: 1 })],
    };
    const games = adapter.parseGameResponse(response);
    expect(games[0].gameType).toBe(1);
  });
});

describe("NHLAdapter — fetchData record filtering", () => {
  beforeEach(() => {
    // fetchTeamByAbbr stub
    jest.spyOn(adapter, "fetchTeamByAbbr").mockResolvedValue(TOR_TEAM);
    jest.spyOn(adapter, "fetchConferenceDivision").mockResolvedValue({ conference: "Eastern", division: "Atlantic" });
  });

  it("counts only regular-season games (gameType=2) in the record", async () => {
    axios.get.mockResolvedValue({
      data: {
        games: [
          // 2 regular wins
          makeGame({ homeAbbr: "TOR", awayAbbr: "BOS", homeId: 10, awayId: 6, homeScore: 4, awayScore: 2, gameState: "OFF", gameType: 2 }),
          makeGame({ homeAbbr: "TOR", awayAbbr: "OTT", homeId: 10, awayId: 9, homeScore: 3, awayScore: 1, gameState: "OFF", gameType: 2 }),
          // 1 playoff win — should NOT count in record
          makeGame({ homeAbbr: "TOR", awayAbbr: "FLA", homeId: 10, awayId: 13, homeScore: 2, awayScore: 1, gameState: "OFF", gameType: 3 }),
          // 1 pre-season win — should NOT count
          makeGame({ homeAbbr: "TOR", awayAbbr: "BUF", homeId: 10, awayId: 7, homeScore: 5, awayScore: 0, gameState: "OFF", gameType: 1 }),
        ],
      },
    });
    const result = await adapter.fetchData("TOR");
    expect(result.record.wins).toBe(2);
    expect(result.record.losses).toBe(0);
  });

  it("excludes pre-season games (gameType=1) from recent games", async () => {
    axios.get.mockResolvedValue({
      data: {
        games: [
          makeGame({ homeAbbr: "TOR", awayAbbr: "BOS", homeId: 10, awayId: 6, homeScore: 3, awayScore: 2, gameState: "OFF", gameType: 2, date: "2026-04-10T20:00:00Z" }),
          makeGame({ homeAbbr: "TOR", awayAbbr: "BUF", homeId: 10, awayId: 7, homeScore: 5, awayScore: 0, gameState: "OFF", gameType: 1, date: "2026-09-20T20:00:00Z" }),
        ],
      },
    });
    const result = await adapter.fetchData("TOR");
    expect(result.recentGames.length).toBe(1);
    expect(result.recentGames[0].gameType).toBe(2);
  });

  it("includes playoff games (gameType=3) in recent games", async () => {
    axios.get.mockResolvedValue({
      data: {
        games: [
          makeGame({ homeAbbr: "TOR", awayAbbr: "FLA", homeId: 10, awayId: 13, homeScore: 1, awayScore: 4, gameState: "OFF", gameType: 3, date: "2026-05-10T20:00:00Z" }),
          makeGame({ homeAbbr: "TOR", awayAbbr: "BOS", homeId: 10, awayId: 6, homeScore: 3, awayScore: 2, gameState: "OFF", gameType: 2, date: "2026-04-10T20:00:00Z" }),
        ],
      },
    });
    const result = await adapter.fetchData("TOR");
    expect(result.recentGames.length).toBe(2);
    // Most recent first — playoff game on May 10 comes before Apr 10
    expect(result.recentGames[0].gameType).toBe(3);
  });

  it("falls back to previous-season code when 'now' has no Final games", async () => {
    const RealDate = Date;
    jest.spyOn(global, "Date").mockImplementation((...args) =>
      args.length ? new RealDate(...args) : new RealDate("2026-08-01")
    );

    // First call (now) returns empty; second call (20252026) returns games
    axios.get
      .mockResolvedValueOnce({ data: { games: [] } }) // now — empty
      .mockResolvedValueOnce({                          // 20252026
        data: {
          games: [
            makeGame({ homeAbbr: "TOR", awayAbbr: "BOS", homeId: 10, awayId: 6, homeScore: 3, awayScore: 2, gameState: "OFF", gameType: 2 }),
          ],
        },
      });

    const result = await adapter.fetchData("TOR");
    expect(result.record.season).toBe(2025); // first 4 digits of "20252026"
    jest.restoreAllMocks();
  });

  it("sets season label from season code, not getSeasonYear()", async () => {
    const RealDate = Date;
    jest.spyOn(global, "Date").mockImplementation((...args) =>
      args.length ? new RealDate(...args) : new RealDate("2026-08-01")
    );

    axios.get
      .mockResolvedValueOnce({ data: { games: [] } })   // now
      .mockResolvedValueOnce({                            // 20252026 — games found here
        data: {
          games: [
            makeGame({ homeAbbr: "TOR", awayAbbr: "OTT", homeId: 10, awayId: 9, homeScore: 4, awayScore: 3, gameState: "OFF", gameType: 2 }),
          ],
        },
      });

    const result = await adapter.fetchData("TOR");
    // Season label should be 2025 (start year of 20252026), not 2025 from getSeasonYear
    expect(result.record.season).toBe(2025);
    jest.restoreAllMocks();
  });

  it("populates conference and division from fetchConferenceDivision", async () => {
    axios.get.mockResolvedValue({
      data: {
        games: [makeGame({ homeAbbr: "TOR", awayAbbr: "BOS", homeId: 10, awayId: 6, homeScore: 3, awayScore: 2, gameState: "OFF", gameType: 2 })],
      },
    });
    const result = await adapter.fetchData("TOR");
    expect(result.team.conference).toBe("Eastern");
    expect(result.team.division).toBe("Atlantic");
  });
});
