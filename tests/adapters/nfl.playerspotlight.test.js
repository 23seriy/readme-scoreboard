const axios = require("axios");
const adapter = require("../../src/adapters/nfl");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("NFL adapter — fetchTeamRoster", () => {
  it("flattens position groups into id/fullName/position entries", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        athletes: [
          {
            position: "offense",
            items: [
              { id: "3139477", fullName: "Patrick Mahomes", position: { abbreviation: "QB" } },
            ],
          },
          {
            position: "defense",
            items: [
              { id: "4047646", fullName: "Chris Jones", position: { abbreviation: "DT" } },
            ],
          },
        ],
      },
    });

    const roster = await adapter.fetchTeamRoster("KC");
    expect(roster).toEqual([
      { id: "3139477", fullName: "Patrick Mahomes", position: "QB" },
      { id: "4047646", fullName: "Chris Jones", position: "DT" },
    ]);
  });

  it("returns an empty array when the request fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("network error"));
    await expect(adapter.fetchTeamRoster("KC")).resolves.toEqual([]);
  });
});

describe("NFL adapter — findPlayerOnRoster", () => {
  const roster = [
    { id: "3139477", fullName: "Patrick Mahomes", position: "QB" },
    { id: "3059760", fullName: "Travis Kelce", position: "TE" },
  ];

  it("matches a player by exact full name", () => {
    expect(adapter.findPlayerOnRoster(roster, "Patrick Mahomes")).toEqual(roster[0]);
  });

  it("matches case-insensitively and ignores surrounding whitespace", () => {
    expect(adapter.findPlayerOnRoster(roster, "  patrick mahomes  ")).toEqual(roster[0]);
  });

  it("returns null when no player matches", () => {
    expect(adapter.findPlayerOnRoster(roster, "Josh Allen")).toBeNull();
  });
});

describe("NFL adapter — fetchPlayerSpotlight", () => {
  function mockRosterAndStats() {
    axios.get
      // roster
      .mockResolvedValueOnce({
        data: {
          athletes: [
            { items: [{ id: "3139477", fullName: "Patrick Mahomes", position: { abbreviation: "QB" } }] },
          ],
        },
      })
      // season stats
      .mockResolvedValueOnce({
        data: {
          splits: {
            categories: [
              { names: ["passingYards", "passingTouchdowns"], values: [["4183", "31"]] },
            ],
          },
        },
      })
      // game log
      .mockResolvedValueOnce({
        data: {
          events: { "401671756": { gameDate: "2026-01-04T18:00Z", opponent: { abbreviation: "DEN" } } },
          seasonTypes: [
            { categories: [{ names: ["passingYards", "passingTouchdowns"], events: [{ eventId: "401671756", stats: ["280", "2"] }] }] },
          ],
        },
      });
  }

  it("resolves the player and returns season + last-game stats", async () => {
    mockRosterAndStats();
    const spotlight = await adapter.fetchPlayerSpotlight("KC", "Patrick Mahomes");

    expect(spotlight.name).toBe("Patrick Mahomes");
    expect(spotlight.position).toBe("QB");
    expect(spotlight.season.passingYards).toBe(4183);
    expect(spotlight.season.passingTouchdowns).toBe(31);
    expect(spotlight.lastGame.opponent).toBe("DEN");
    expect(spotlight.lastGame.passingYards).toBe(280);
  });

  it("throws a helpful error listing roster names for an unknown player", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        athletes: [
          { items: [{ id: "1", fullName: "Patrick Mahomes", position: { abbreviation: "QB" } }] },
        ],
      },
    });

    await expect(adapter.fetchPlayerSpotlight("KC", "Nobody Here")).rejects.toThrow(
      /Unknown player "Nobody Here" on KC\. Try one of: Patrick Mahomes/,
    );
  });

  it("still returns the player when the stats endpoints fail", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          athletes: [
            { items: [{ id: "3139477", fullName: "Patrick Mahomes", position: { abbreviation: "QB" } }] },
          ],
        },
      })
      .mockRejectedValueOnce(new Error("stats down"))
      .mockRejectedValueOnce(new Error("gamelog down"));

    const spotlight = await adapter.fetchPlayerSpotlight("KC", "Patrick Mahomes");
    expect(spotlight.name).toBe("Patrick Mahomes");
    expect(spotlight.season).toEqual({});
    expect(spotlight.lastGame).toBeNull();
  });
});

describe("NFL adapter — demo spotlight", () => {
  it("returns a spotlight for a named demo player", () => {
    const data = adapter.getDemoData("KC", "Patrick Mahomes");
    expect(data.spotlight.name).toBe("Patrick Mahomes");
    expect(data.spotlight.position).toBe("QB");
    expect(data.spotlight.season.passingYards).toBeGreaterThan(0);
    expect(data.spotlight.lastGame.opponent).toBeDefined();
  });

  it("omits the spotlight when no player name is given", () => {
    expect(adapter.getDemoData("KC").spotlight).toBeNull();
  });

  it("produces identical output across calls so examples are reproducible", () => {
    const first = adapter.getDemoData("KC", "Travis Kelce").spotlight;
    const second = adapter.getDemoData("KC", "Travis Kelce").spotlight;
    expect(first).toEqual(second);
  });

  it("returns null spotlight for a name that is not on the demo roster", () => {
    const data = adapter.getDemoData("KC", "Not A Player");
    expect(data.spotlight).toBeNull();
  });

  it("gives a receiver receptions rather than passing yards", () => {
    const data = adapter.getDemoData("KC", "Travis Kelce");
    expect(data.spotlight.season.receptions).toBeGreaterThan(0);
    expect(data.spotlight.season.passingYards).toBe(0);
  });
});
