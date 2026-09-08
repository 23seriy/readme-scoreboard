const axios = require("axios");
const adapter = require("../../src/adapters/mlb");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

function makeRosterResponse(players) {
  return { data: { roster: players.map((p) => ({ person: p })) } };
}

describe("MlbAdapter — fetchTeamRoster", () => {
  it("returns the team's roster as id/fullName pairs", async () => {
    axios.get.mockResolvedValueOnce(makeRosterResponse([
      { id: "665489", fullName: "Vladimir Guerrero Jr." },
      { id: "543037", fullName: "Bo Bichette" },
    ]));

    const roster = await adapter.fetchTeamRoster("TOR");
    expect(roster).toEqual([
      { id: "665489", fullName: "Vladimir Guerrero Jr." },
      { id: "543037", fullName: "Bo Bichette" },
    ]);
  });

  it("returns an empty array when the request fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("network error"));
    const roster = await adapter.fetchTeamRoster("TOR");
    expect(roster).toEqual([]);
  });

  it("returns an empty array for an unknown team abbreviation", async () => {
    const roster = await adapter.fetchTeamRoster("ZZZ");
    expect(roster).toEqual([]);
    expect(axios.get).not.toHaveBeenCalled();
  });
});

describe("MlbAdapter — findPlayerOnRoster", () => {
  const roster = [
    { id: "665489", fullName: "Vladimir Guerrero Jr." },
    { id: "543037", fullName: "Bo Bichette" },
  ];

  it("matches a player by exact full name", () => {
    expect(adapter.findPlayerOnRoster(roster, "Vladimir Guerrero Jr.")).toEqual(roster[0]);
  });

  it("matches case-insensitively", () => {
    expect(adapter.findPlayerOnRoster(roster, "vladimir guerrero jr.")).toEqual(roster[0]);
  });

  it("returns null when no player matches", () => {
    expect(adapter.findPlayerOnRoster(roster, "Mike Trout")).toBeNull();
  });
});

function makeSeasonResponse(stat) {
  return {
    data: {
      stats: [{
        splits: [{
          season: "2026",
          stat,
        }],
      }],
    },
  };
}

function makeGameLogResponse(games) {
  return {
    data: {
      stats: [{
        splits: games,
      }],
    },
  };
}

describe("MlbAdapter — fetchPlayerSeasonStats", () => {
  it("parses batting average, home runs, RBI, hits, at-bats, games, and OPS", async () => {
    axios.get.mockResolvedValueOnce(makeSeasonResponse({
      avg: ".259", homeRuns: 8, rbi: 54, hits: 126, atBats: 487, gamesPlayed: 130, ops: ".682",
    }));

    const result = await adapter.fetchPlayerSeasonStats("665489", 2026);
    expect(result).toEqual({ avg: 0.259, homeRuns: 8, rbi: 54, hits: 126, atBats: 487, games: 130, ops: 0.682 });
  });

  it("returns null when no stats are present", async () => {
    axios.get.mockResolvedValueOnce({ data: { stats: [] } });
    const result = await adapter.fetchPlayerSeasonStats("665489", 2026);
    expect(result).toBeNull();
  });

  it("returns null when the request fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("network error"));
    const result = await adapter.fetchPlayerSeasonStats("665489", 2026);
    expect(result).toBeNull();
  });
});

describe("MlbAdapter — fetchPlayerLastGame", () => {
  it("parses the most recent game's date, opponent, and line", async () => {
    axios.get.mockResolvedValueOnce(makeGameLogResponse([{
      date: "2026-03-27",
      opponent: { id: 133, name: "Athletics", link: "/api/v1/teams/133" },
      stat: { hits: 1, homeRuns: 0, rbi: 0, avg: ".333" },
    }]));

    const result = await adapter.fetchPlayerLastGame("665489", 2026);
    expect(result).toEqual({ date: "2026-03-27", opponent: "Athletics", hits: 1, homeRuns: 0, rbi: 0, avg: 0.333 });
  });

  it("returns null when there are no logged games", async () => {
    axios.get.mockResolvedValueOnce({ data: { stats: [{ splits: [] }] } });
    const result = await adapter.fetchPlayerLastGame("665489", 2026);
    expect(result).toBeNull();
  });

  it("returns null when the request fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("network error"));
    const result = await adapter.fetchPlayerLastGame("665489", 2026);
    expect(result).toBeNull();
  });
});

describe("MlbAdapter — fetchPlayerSpotlight", () => {
  it("returns the player's name, season stats, and last game", async () => {
    axios.get
      .mockResolvedValueOnce(makeRosterResponse([{ id: "665489", fullName: "Vladimir Guerrero Jr." }]))
      .mockResolvedValueOnce(makeSeasonResponse({
        avg: ".259", homeRuns: 8, rbi: 54, hits: 126, atBats: 487, gamesPlayed: 130, ops: ".682",
      }))
      .mockResolvedValueOnce(makeGameLogResponse([{
        date: "2026-03-27",
        opponent: { id: 133, name: "Athletics" },
        stat: { hits: 1, homeRuns: 0, rbi: 0, avg: ".333" },
      }]));

    const result = await adapter.fetchPlayerSpotlight("TOR", "Vladimir Guerrero Jr.");
    expect(result.name).toBe("Vladimir Guerrero Jr.");
    expect(result.season).toEqual({ avg: 0.259, homeRuns: 8, rbi: 54, hits: 126, atBats: 487, games: 130, ops: 0.682 });
    expect(result.lastGame).toEqual({ date: "2026-03-27", opponent: "Athletics", hits: 1, homeRuns: 0, rbi: 0, avg: 0.333 });
  });

  it("falls back to zeroed season stats when the season fetch fails, without affecting lastGame", async () => {
    axios.get
      .mockResolvedValueOnce(makeRosterResponse([{ id: "665489", fullName: "Vladimir Guerrero Jr." }]))
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce(makeGameLogResponse([{
        date: "2026-03-27",
        opponent: { id: 133, name: "Athletics" },
        stat: { hits: 1, homeRuns: 0, rbi: 0, avg: ".333" },
      }]));

    const result = await adapter.fetchPlayerSpotlight("TOR", "Vladimir Guerrero Jr.");
    expect(result.season).toEqual({ avg: 0, homeRuns: 0, rbi: 0, hits: 0, atBats: 0, games: 0, ops: 0 });
    expect(result.lastGame).toEqual({ date: "2026-03-27", opponent: "Athletics", hits: 1, homeRuns: 0, rbi: 0, avg: 0.333 });
  });

  it("throws a descriptive error when the player isn't on the roster", async () => {
    axios.get.mockResolvedValueOnce(makeRosterResponse([
      { id: "543037", fullName: "Bo Bichette" },
      { id: "666971", fullName: "Daulton Varsho" },
    ]));

    await expect(adapter.fetchPlayerSpotlight("TOR", "Nonexistent Player"))
      .rejects.toThrow(/Unknown player "Nonexistent Player" on TOR/);
  });
});

describe("MlbAdapter — getDemoData with a player", () => {
  it("includes a spotlight for the demo player on TOR", () => {
    const demo = adapter.getDemoData("TOR", "Vladimir Guerrero Jr.");
    expect(demo.spotlight).toBeTruthy();
    expect(demo.spotlight.name).toBe("Vladimir Guerrero Jr.");
    expect(demo.spotlight.season.homeRuns).toBeGreaterThan(0);
    expect(demo.spotlight.lastGame.opponent).toBeTruthy();
  });

  it("omits spotlight when no player is given", () => {
    const demo = adapter.getDemoData("TOR");
    expect(demo.spotlight).toBeUndefined();
  });

  it("omits spotlight for a player name that isn't the demo player", () => {
    const demo = adapter.getDemoData("TOR", "Someone Else");
    expect(demo.spotlight).toBeUndefined();
  });
});
