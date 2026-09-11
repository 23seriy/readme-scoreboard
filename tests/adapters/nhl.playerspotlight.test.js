const axios = require("axios");
const adapter = require("../../src/adapters/nhl");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("NHL adapter — fetchTeamRoster", () => {
  it("flattens forwards, defensemen, and goalies into one roster", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        forwards: [{ id: 8478402, firstName: { default: "Artemi" }, lastName: { default: "Panarin" }, positionCode: "LW" }],
        defensemen: [{ id: 8480078, firstName: { default: "Adam" }, lastName: { default: "Fox" }, positionCode: "D" }],
        goalies: [{ id: 8478550, firstName: { default: "Igor" }, lastName: { default: "Shesterkin" }, positionCode: "G" }],
      },
    });

    const roster = await adapter.fetchTeamRoster("NYR");
    expect(roster).toEqual([
      { id: "8478402", fullName: "Artemi Panarin", position: "LW" },
      { id: "8480078", fullName: "Adam Fox", position: "D" },
      { id: "8478550", fullName: "Igor Shesterkin", position: "G" },
    ]);
  });

  it("uses the NHL logo abbreviation for teams whose code differs", async () => {
    axios.get.mockResolvedValueOnce({
      data: { forwards: [{ id: 1, firstName: { default: "A" }, lastName: { default: "B" }, positionCode: "C" }] },
    });

    await adapter.fetchTeamRoster("NJ");
    expect(axios.get.mock.calls[0][0]).toContain("/roster/njd/");
  });

  it("returns an empty array when every season request fails", async () => {
    axios.get.mockRejectedValue(new Error("network error"));
    await expect(adapter.fetchTeamRoster("NYR")).resolves.toEqual([]);
  });
});

describe("NHL adapter — findPlayerOnRoster", () => {
  const roster = [
    { id: "8478402", fullName: "Artemi Panarin", position: "LW" },
    { id: "8478550", fullName: "Igor Shesterkin", position: "G" },
  ];

  it("matches a player by exact full name", () => {
    expect(adapter.findPlayerOnRoster(roster, "Artemi Panarin")).toEqual(roster[0]);
  });

  it("matches case-insensitively", () => {
    expect(adapter.findPlayerOnRoster(roster, "igor shesterkin")).toEqual(roster[1]);
  });

  it("returns null when no player matches", () => {
    expect(adapter.findPlayerOnRoster(roster, "Connor McDavid")).toBeNull();
  });
});

describe("NHL adapter — fetchPlayerSpotlight", () => {
  it("returns skater stats from the landing endpoint", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: { forwards: [{ id: 8478402, firstName: { default: "Artemi" }, lastName: { default: "Panarin" }, positionCode: "LW" }] },
      })
      .mockResolvedValueOnce({
        data: {
          position: "LW",
          featuredStats: { regularSeason: { subSeason: { gamesPlayed: 82, goals: 49, assists: 71, points: 120 } } },
        },
      })
      .mockResolvedValueOnce({
        data: { gameLog: [{ gameDate: "2026-04-10", opponentAbbrev: "BOS", goals: 2, assists: 1, points: 3 }] },
      });

    const spotlight = await adapter.fetchPlayerSpotlight("NYR", "Artemi Panarin");
    expect(spotlight.name).toBe("Artemi Panarin");
    expect(spotlight.season.goals).toBe(49);
    expect(spotlight.season.points).toBe(120);
    expect(spotlight.season.isGoalie).toBe(false);
    expect(spotlight.lastGame.opponent).toBe("BOS");
  });

  it("returns goalie stats when the player is a goaltender", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: { goalies: [{ id: 8478550, firstName: { default: "Igor" }, lastName: { default: "Shesterkin" }, positionCode: "G" }] },
      })
      .mockResolvedValueOnce({
        data: {
          position: "G",
          featuredStats: { regularSeason: { subSeason: { gamesPlayed: 55, wins: 36, goalsAgainstAverage: 2.35, savePercentage: 0.919 } } },
        },
      })
      .mockResolvedValueOnce({
        data: { gameLog: [{ gameDate: "2026-04-10", opponentAbbrev: "BOS", saves: 32, shotsAgainst: 34 }] },
      });

    const spotlight = await adapter.fetchPlayerSpotlight("NYR", "Igor Shesterkin");
    expect(spotlight.season.isGoalie).toBe(true);
    expect(spotlight.season.wins).toBe(36);
    expect(spotlight.lastGame.saves).toBe(32);
  });

  it("throws a helpful error listing roster names for an unknown player", async () => {
    axios.get.mockResolvedValueOnce({
      data: { forwards: [{ id: 1, firstName: { default: "Artemi" }, lastName: { default: "Panarin" }, positionCode: "LW" }] },
    });

    await expect(adapter.fetchPlayerSpotlight("NYR", "Nobody Here")).rejects.toThrow(
      /Unknown player "Nobody Here" on NYR\. Try one of: Artemi Panarin/,
    );
  });

  it("still returns the player when the stats endpoints fail", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: { forwards: [{ id: 8478402, firstName: { default: "Artemi" }, lastName: { default: "Panarin" }, positionCode: "LW" }] },
      })
      .mockRejectedValueOnce(new Error("stats down"))
      .mockRejectedValueOnce(new Error("gamelog down"));

    const spotlight = await adapter.fetchPlayerSpotlight("NYR", "Artemi Panarin");
    expect(spotlight.name).toBe("Artemi Panarin");
    expect(spotlight.season).toEqual({});
    expect(spotlight.lastGame).toBeNull();
  });
});

describe("NHL adapter — demo spotlight", () => {
  it("returns a skater spotlight for a named demo player", () => {
    const data = adapter.getDemoData("NYR", "Artemi Panarin");
    expect(data.spotlight.name).toBe("Artemi Panarin");
    expect(data.spotlight.season.isGoalie).toBe(false);
    expect(data.spotlight.season.goals).toBeGreaterThan(0);
  });

  it("returns goalie stats for a demo goalie", () => {
    const data = adapter.getDemoData("NYR", "Igor Shesterkin");
    expect(data.spotlight.season.isGoalie).toBe(true);
    expect(data.spotlight.season.wins).toBeGreaterThan(0);
    expect(data.spotlight.lastGame.saves).toBeGreaterThan(0);
  });

  it("preserves the base demo board fields and omits the spotlight without a player", () => {
    const data = adapter.getDemoData("NYR");
    expect(data.team.abbreviation).toBe("NYR");
    expect(data.record).toBeDefined();
    expect(data.recentGames.length).toBeGreaterThan(0);
    expect(data.spotlight).toBeNull();
  });

  it("is deterministic across calls", () => {
    const first = adapter.getDemoData("TOR", "Auston Matthews").spotlight;
    const second = adapter.getDemoData("TOR", "Auston Matthews").spotlight;
    expect(first).toEqual(second);
  });

  it("returns null spotlight for a name not on the demo roster", () => {
    expect(adapter.getDemoData("NYR", "Not A Player").spotlight).toBeNull();
  });
});
