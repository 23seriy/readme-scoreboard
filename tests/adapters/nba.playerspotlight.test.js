const axios = require("axios");
const adapter = require("../../src/adapters/nba");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

function makeRosterResponse(athletes) {
  return { data: { athletes } };
}

describe("NbaAdapter — fetchTeamRoster", () => {
  it("returns the team's roster as id/fullName pairs", async () => {
    axios.get.mockResolvedValueOnce(makeRosterResponse([
      { id: "3945274", fullName: "Luka Dončić" },
      { id: "4066648", fullName: "Austin Reaves" },
    ]));

    const roster = await adapter.fetchTeamRoster("LAL");
    expect(roster).toEqual([
      { id: "3945274", fullName: "Luka Dončić" },
      { id: "4066648", fullName: "Austin Reaves" },
    ]);
  });

  it("returns an empty array when the request fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("network error"));
    const roster = await adapter.fetchTeamRoster("LAL");
    expect(roster).toEqual([]);
  });

  it("returns an empty array for an unknown team abbreviation", async () => {
    const roster = await adapter.fetchTeamRoster("ZZZ");
    expect(roster).toEqual([]);
    expect(axios.get).not.toHaveBeenCalled();
  });
});

describe("NbaAdapter — findPlayerOnRoster", () => {
  const roster = [
    { id: "3945274", fullName: "Luka Dončić" },
    { id: "4066648", fullName: "Austin Reaves" },
  ];

  it("matches a player by exact full name", () => {
    expect(adapter.findPlayerOnRoster(roster, "Luka Dončić")).toEqual(roster[0]);
  });

  it("matches case-insensitively", () => {
    expect(adapter.findPlayerOnRoster(roster, "luka dončić")).toEqual(roster[0]);
  });

  it("returns null when no player matches", () => {
    expect(adapter.findPlayerOnRoster(roster, "LeBron James")).toBeNull();
  });
});

function makeSplitsResponse(names, statValues) {
  return {
    data: {
      names,
      splitCategories: [{
        splits: [{ displayName: "All Splits", stats: statValues }],
      }],
    },
  };
}

function makeGamelogResponse(names, eventStats) {
  return {
    data: {
      seasonTypes: [{
        categories: [{
          events: eventStats ? [{ eventId: "1", stats: eventStats }] : [],
        }],
      }],
      names,
    },
  };
}

describe("NbaAdapter — fetchPlayerSeasonAverages", () => {
  it("parses points, rebounds, and assists averages by name lookup", async () => {
    const names = ["gamesPlayed", "avgMinutes", "avgFieldGoalsMade-avgFieldGoalsAttempted",
      "fieldGoalPct", "avgThreePointFieldGoalsMade-avgThreePointFieldGoalsAttempted",
      "threePointFieldGoalPct", "Free Throws Made-Attempted Per Game", "freeThrowPct",
      "avgOffensiveRebounds", "avgDefensiveRebounds", "avgRebounds", "avgAssists",
      "avgBlocks", "avgSteals", "avgFouls", "avgTurnovers", "avgPoints"];
    const stats = ["64", "35.8", "10.8-22.8", "47.6", "4.0-10.8", "36.6", "7.9-10.1",
      "78.0", "0.6", "7.1", "7.7", "8.3", "0.5", "1.6", "2.4", "4.0", "33.5"];
    axios.get.mockResolvedValueOnce(makeSplitsResponse(names, stats));

    const result = await adapter.fetchPlayerSeasonAverages("3945274");
    expect(result).toEqual({ points: 33.5, rebounds: 7.7, assists: 8.3 });
  });

  it("returns null when the request fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("network error"));
    const result = await adapter.fetchPlayerSeasonAverages("3945274");
    expect(result).toBeNull();
  });
});

describe("NbaAdapter — fetchPlayerLastGame", () => {
  const names = ["minutes", "fieldGoalsMade-fieldGoalsAttempted", "fieldGoalPct",
    "threePointFieldGoalsMade-threePointFieldGoalsAttempted", "threePointPct",
    "freeThrowsMade-freeThrowsAttempted", "freeThrowPct", "totalRebounds",
    "assists", "blocks", "steals", "fouls", "turnovers", "points"];

  it("parses the most recent game's points, rebounds, assists, minutes", async () => {
    const stats = ["26", "3-10", "30.0", "1-7", "14.3", "5-6", "83.3", "4", "7", "0", "1", "0", "6", "12"];
    axios.get.mockResolvedValueOnce(makeGamelogResponse(names, stats));

    const result = await adapter.fetchPlayerLastGame("3945274");
    expect(result).toEqual({ points: 12, rebounds: 4, assists: 7, minutes: 26 });
  });

  it("returns null when there are no logged games", async () => {
    axios.get.mockResolvedValueOnce(makeGamelogResponse(names, null));
    const result = await adapter.fetchPlayerLastGame("3945274");
    expect(result).toBeNull();
  });

  it("returns null when the request fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("network error"));
    const result = await adapter.fetchPlayerLastGame("3945274");
    expect(result).toBeNull();
  });
});
