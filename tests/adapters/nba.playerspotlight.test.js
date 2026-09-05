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
