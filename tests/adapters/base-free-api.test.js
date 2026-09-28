const axios = require("axios");
const BaseFreeApiAdapter = require("../../src/adapters/base-free-api");
const { checkDemoConsistency } = require("../../src/demo");

jest.mock("axios");

describe("BaseFreeApiAdapter", () => {
  it("should throw when instantiated directly", () => {
    expect(() => new BaseFreeApiAdapter()).toThrow(
      "BaseFreeApiAdapter is abstract and cannot be instantiated directly"
    );
  });

  it("derives the season year from the current month", () => {
    // Calls the adapter rather than restating its arithmetic: the previous
    // version recomputed the expression inline, so it would have passed even
    // if getSeasonYear changed.
    const adapter = createMockAdapter();

    jest.useFakeTimers().setSystemTime(new Date(2026, 4, 15)); // May
    expect(adapter.getSeasonYear()).toBe(2025);

    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 15)); // October
    expect(adapter.getSeasonYear()).toBe(2026);

    jest.useRealTimers();
  });

  it("should return demo data for valid team", () => {
    const mockAdapter = createMockAdapter();
    const demoData = mockAdapter.getDemoData("TEST");

    expect(demoData).toHaveProperty("team");
    expect(demoData).toHaveProperty("record");
    expect(demoData).toHaveProperty("recentGames");
    expect(demoData.recentGames.length).toBeGreaterThan(0);
    expect(checkDemoConsistency(demoData)).toEqual([]);
  });

  it("should return null for unknown demo team", () => {
    const mockAdapter = createMockAdapter();
    const demoData = mockAdapter.getDemoData("UNKNOWN");
    expect(demoData).toBeNull();
  });
});

describe("BaseFreeApiAdapter — fetchTeamByAbbr", () => {
  it("returns the team it resolves", async () => {
    const adapter = createMockAdapter();

    await expect(adapter.fetchTeamByAbbr("TEST")).resolves.toMatchObject({ id: 1, abbreviation: "TEST" });
  });

  it("returns null and names the abbreviation it could not find", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const adapter = createMockAdapter();

    await expect(adapter.fetchTeamByAbbr("NOPE")).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith("Team NOPE not found");

    errorSpy.mockRestore();
  });

  it("returns null instead of throwing when the lookup fails", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const adapter = createMockAdapter();
    adapter.fetchTeam = async () => { throw new Error("socket hang up"); };

    await expect(adapter.fetchTeamByAbbr("TEST")).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("socket hang up"));

    errorSpy.mockRestore();
  });
});

describe("BaseFreeApiAdapter — fetchSeasonRecord", () => {
  beforeEach(() => jest.clearAllMocks());

  function adapterReturning(games) {
    const adapter = createMockAdapter();
    adapter.parseGameResponse = () => games;
    return adapter;
  }

  it("counts wins and losses across home and away finals and ignores the rest", async () => {
    axios.get.mockResolvedValue({ data: {} });
    const adapter = adapterReturning([
      { status: "Final", home_team: { id: 1 }, home_team_score: 100, visitor_team_score: 90 },
      { status: "Final", home_team: { id: 2 }, home_team_score: 110, visitor_team_score: 95 },
      { status: "In Progress", home_team: { id: 1 }, home_team_score: 50, visitor_team_score: 60 },
    ]);

    await expect(adapter.fetchSeasonRecord(1)).resolves.toMatchObject({ wins: 1, losses: 1 });
  });

  it("returns an empty record when the feed has no games", async () => {
    axios.get.mockResolvedValue({ data: {} });
    const adapter = adapterReturning([]);

    await expect(adapter.fetchSeasonRecord(1)).resolves.toMatchObject({ wins: 0, losses: 0 });
  });

  it("returns an empty record instead of throwing when the request fails", async () => {
    axios.get.mockRejectedValue(Object.assign(new Error("404 Not Found"), { response: { status: 404 } }));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const adapter = createMockAdapter();

    await expect(adapter.fetchSeasonRecord(1)).resolves.toMatchObject({ wins: 0, losses: 0 });
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to fetch season record"));

    errorSpy.mockRestore();
  });
});

function createMockAdapter() {
  class MockAdapter extends BaseFreeApiAdapter {
    TEAM_EMOJI = { TEST: "🏒" };
    TEAM_IDS = { TEST: 1 };
    DEMO_TEAMS = {
      TEST: {
        id: 1,
        abbreviation: "TEST",
        name: "Test Team",
        full_name: "Test Team Full",
        division: "Test Division",
        conference: "Test Conference",
      },
    };

    async fetchTeam(abbr) {
      return this.DEMO_TEAMS[abbr.toUpperCase()] || null;
    }

    getGamesUrl(_teamId, _fromDate, _toDate) {
      return `https://api.example.com/games`;
    }

    parseGameResponse(_data) {
      return [];
    }

    parseTeamResponse(_data) {
      return null;
    }
  }

  return new MockAdapter();
}
