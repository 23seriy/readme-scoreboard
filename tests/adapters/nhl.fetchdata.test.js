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

  // Late September: the upcoming season has already played PRE-SEASON games,
  // which are Final with gameType 1. Treating those as proof that the season had
  // started stopped the walk-back to the completed season, so the board showed
  // "No recent games found" and a 0-0 record in the middle of the off-season.
  // The existing fallback test only covered "now" returning NO games at all,
  // which is the one shape this bug does not take.
  describe("off-season walk-back", () => {
    const NOW_SEASON = "20262027";
    const COMPLETED_SEASON = "20252026";

    function stubApi() {
      axios.get.mockImplementation((url) => {
        const u = String(url);
        if (u.includes(`club-schedule-season/tor/${NOW_SEASON}`) || u.includes("club-schedule-season/tor/now")) {
          return Promise.resolve({
            data: {
              games: [
                // Pre-season: Final, but gameType 1.
                makeGame({ homeAbbr: "TOR", awayAbbr: "MTL", homeId: 10, awayId: 8, homeScore: 3, awayScore: 2, gameState: "OFF", gameType: 1, date: "2026-09-19T23:00:00Z" }),
                // The season opener, not played yet.
                makeGame({ homeAbbr: "TOR", awayAbbr: "MTL", homeId: 10, awayId: 8, homeScore: 0, awayScore: 0, gameState: "FUT", gameType: 2, date: "2026-09-29T23:00:00Z" }),
              ],
            },
          });
        }
        if (u.includes(`club-schedule-season/tor/${COMPLETED_SEASON}`)) {
          return Promise.resolve({
            data: {
              games: [
                makeGame({ homeAbbr: "TOR", awayAbbr: "OTT", homeId: 10, awayId: 9, homeScore: 5, awayScore: 1, gameState: "OFF", gameType: 2, date: "2026-04-15T23:00:00Z" }),
                makeGame({ homeAbbr: "BOS", awayAbbr: "TOR", homeId: 6, awayId: 10, homeScore: 2, awayScore: 4, gameState: "OFF", gameType: 2, date: "2026-04-13T23:00:00Z" }),
              ],
            },
          });
        }
        if (u.includes("standings-season")) {
          return Promise.resolve({ data: { seasons: [{ id: Number(COMPLETED_SEASON), standingsEnd: "2026-04-17" }] } });
        }
        if (u.includes("/standings/")) {
          return Promise.resolve({
            data: {
              standings: [
                { teamAbbrev: { default: "TOR" }, conferenceName: "Eastern", divisionName: "Atlantic", divisionSequence: 8 },
              ],
            },
          });
        }
        return Promise.resolve({ data: {} });
      });
    }

    beforeEach(() => {
      stubApi();
    });

    it("uses the completed season for the record and recent games", async () => {
      const result = await adapter.fetchData("TOR");
      expect(result.record).toEqual({ wins: 2, losses: 0, season: 2025 });
      expect(result.recentGames).toHaveLength(2);
      expect(result.recentGames[0].date).toContain("2026-04-15");
      // Pre-season is never a "recent game".
      expect(result.recentGames.every((g) => g.gameType !== 1)).toBe(true);
    });

    it("still reports the next fixture from the upcoming season", async () => {
      const result = await adapter.fetchData("TOR");
      expect(result.nextGame.opponent).toBe("MTL");
      expect(result.nextGame.date).toContain("2026-09-29");
      expect(result.nextGame.isHome).toBe(true);
    });

    it("names the season its standing came from", async () => {
      // The season label is a mapping question, so stub the standings lookup
      // rather than the endpoint payload: fetchData's other requests are
      // already exercised above and would only add noise here.
      jest.spyOn(adapter, "fetchConferenceDivision").mockResolvedValue({
        conference: "Eastern",
        division: "Atlantic",
        position: 8,
        season: "2025-26",
      });

      const result = await adapter.fetchData("TOR");
      expect(result.standing).toEqual({
        position: 8,
        label: "Atlantic",
        season: "2025-26",
      });

      // "20252026" -> "2025-26"; anything else is not a season id.
      expect(adapter.formatSeasonId("20252026")).toBe("2025-26");
      expect(adapter.formatSeasonId("2025")).toBeNull();
      expect(adapter.formatSeasonId(null)).toBeNull();
      expect(adapter.formatSeasonId(undefined)).toBeNull();
    });
  });
});
