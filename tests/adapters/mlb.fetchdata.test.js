const axios = require("axios");
const adapter = require("../../src/adapters/mlb");

jest.mock("axios");

const TOR_TEAM = { id: 141, abbreviation: "TOR", name: "Blue Jays", full_name: "Toronto Blue Jays", league: "American League", division: "AL East" };

function makeScheduleResponse(games) {
  return {
    data: {
      dates: games.map((g) => ({
        games: [g],
      })),
    },
  };
}

function makeGame({ homeId, awayId, homeScore, awayScore, state, gameType, date = "2026-04-10T20:00:00Z" }) {
  return {
    gameDateTime: date,
    gameType,
    teams: {
      home: { team: { id: homeId, abbreviation: adapter.abbrById(homeId) || "HHH" }, score: homeScore },
      away: { team: { id: awayId, abbreviation: adapter.abbrById(awayId) || "AAA" }, score: awayScore },
    },
    status: { abstractGameState: state },
  };
}

function makeStandingsResponse(wins, losses, teamId = 141) {
  return {
    data: {
      records: [{
        teamRecords: [{
          team: { id: teamId },
          wins,
          losses,
        }],
      }],
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(adapter, "fetchTeamByAbbr").mockResolvedValue(TOR_TEAM);
});

describe("MlbAdapter — gameType passthrough", () => {
  it("includes gameType in parsed game", () => {
    const response = {
      dates: [{
        games: [makeGame({ homeId: 141, awayId: 147, homeScore: 5, awayScore: 2, state: "Final", gameType: "R" })],
      }],
    };
    const games = adapter.parseGameResponse(response);
    expect(games[0].gameType).toBe("R");
  });

  it("includes gameType for playoff games", () => {
    const response = {
      dates: [{
        games: [makeGame({ homeId: 141, awayId: 147, homeScore: 4, awayScore: 3, state: "Final", gameType: "D" })],
      }],
    };
    const games = adapter.parseGameResponse(response);
    expect(games[0].gameType).toBe("D");
  });
});

describe("MlbAdapter — fetchSeasonRecord", () => {
  it("returns wins and losses from standings API", async () => {
    axios.get.mockResolvedValue(makeStandingsResponse(52, 59));
    const record = await adapter.fetchSeasonRecord(141);
    expect(record.wins).toBe(52);
    expect(record.losses).toBe(59);
    expect(record.season).toBe(new Date().getFullYear());
  });

  it("returns zeros when team not found in standings", async () => {
    axios.get.mockResolvedValue({ data: { records: [{ teamRecords: [] }] } });
    const record = await adapter.fetchSeasonRecord(141);
    expect(record.wins).toBe(0);
    expect(record.losses).toBe(0);
  });

  it("returns zeros on API error", async () => {
    axios.get.mockRejectedValue(new Error("network error"));
    const record = await adapter.fetchSeasonRecord(141);
    expect(record.wins).toBe(0);
    expect(record.losses).toBe(0);
  });
});

describe("MlbAdapter — fetchData", () => {
  it("uses standings API for record, not game counting", async () => {
    // Promise.all fires schedule first, then fetchSeasonRecord (which calls standings)
    axios.get
      .mockResolvedValueOnce(makeScheduleResponse([          // schedule (first in Promise.all)
        makeGame({ homeId: 141, awayId: 147, homeScore: 5, awayScore: 2, state: "Final", gameType: "R" }),
        makeGame({ homeId: 141, awayId: 112, homeScore: 3, awayScore: 1, state: "Final", gameType: "R" }),
      ]))
      .mockResolvedValueOnce(makeStandingsResponse(52, 59)); // standings (second)

    const result = await adapter.fetchData("TOR");
    expect(result.record.wins).toBe(52);
    expect(result.record.losses).toBe(59);
  });

  it("excludes spring training games (gameType=S) from recent games", async () => {
    axios.get
      .mockResolvedValueOnce(makeScheduleResponse([
        makeGame({ homeId: 141, awayId: 147, homeScore: 5, awayScore: 2, state: "Final", gameType: "R", date: "2026-04-10T20:00:00Z" }),
        makeGame({ homeId: 141, awayId: 111, homeScore: 3, awayScore: 1, state: "Final", gameType: "S", date: "2026-03-10T20:00:00Z" }),
      ]))
      .mockResolvedValueOnce(makeStandingsResponse(10, 5));

    const result = await adapter.fetchData("TOR");
    expect(result.recentGames.length).toBe(1);
    expect(result.recentGames[0].gameType).toBe("R");
  });

  it("includes playoff games in recent games", async () => {
    axios.get
      .mockResolvedValueOnce(makeScheduleResponse([
        makeGame({ homeId: 141, awayId: 147, homeScore: 4, awayScore: 3, state: "Final", gameType: "D", date: "2026-10-15T20:00:00Z" }),
        makeGame({ homeId: 141, awayId: 112, homeScore: 5, awayScore: 2, state: "Final", gameType: "R", date: "2026-09-28T20:00:00Z" }),
      ]))
      .mockResolvedValueOnce(makeStandingsResponse(95, 67));

    const result = await adapter.fetchData("TOR");
    expect(result.recentGames.length).toBe(2);
    // Most recent first — playoff game Oct 15 before Sep 28
    expect(result.recentGames[0].gameType).toBe("D");
  });

  it("returns most recent 5 games sorted by date descending", async () => {
    const dates = ["2026-04-01", "2026-04-02", "2026-04-03", "2026-04-04", "2026-04-05", "2026-04-06"];
    axios.get
      .mockResolvedValueOnce(makeScheduleResponse(
        dates.map((d) => makeGame({ homeId: 141, awayId: 147, homeScore: 3, awayScore: 2, state: "Final", gameType: "R", date: `${d}T20:00:00Z` }))
      ))
      .mockResolvedValueOnce(makeStandingsResponse(4, 2));

    const result = await adapter.fetchData("TOR");
    expect(result.recentGames.length).toBe(5);
    expect(result.recentGames[0].date).toContain("2026-04-06");
    expect(result.recentGames[4].date).toContain("2026-04-02");
  });

  it("returns null when team not found", async () => {
    jest.spyOn(adapter, "fetchTeamByAbbr").mockResolvedValue(null);
    const result = await adapter.fetchData("ZZZ");
    expect(result).toBeNull();
  });
});
