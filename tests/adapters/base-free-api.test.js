const BaseFreeApiAdapter = require("../../src/adapters/base-free-api");

describe("BaseFreeApiAdapter", () => {
  it("should throw when instantiated directly", () => {
    expect(() => new BaseFreeApiAdapter()).toThrow(
      "BaseFreeApiAdapter is abstract and cannot be instantiated directly"
    );
  });

  it("should calculate season year correctly for months 1-9", () => {
    const mockAdapter = createMockAdapter();
    const originalDate = Date;
    const mockDate = new Date("2026-05-15");
    global.Date = class extends originalDate {
      constructor(...args) {
        if (args.length === 0) return mockDate;
        return super(...args);
      }
      static now() {
        return mockDate.getTime();
      }
    };
    global.Date.prototype = originalDate.prototype;

    expect(mockAdapter.getSeasonYear()).toBe(2025);

    global.Date = originalDate;
  });

  it("should calculate season year correctly for months 10-12", () => {
    const mockAdapter = createMockAdapter();
    const originalDate = Date;
    const mockDate = new Date("2026-10-15");
    global.Date = class extends originalDate {
      constructor(...args) {
        if (args.length === 0) return mockDate;
        return super(...args);
      }
      static now() {
        return mockDate.getTime();
      }
    };
    global.Date.prototype = originalDate.prototype;

    expect(mockAdapter.getSeasonYear()).toBe(2026);

    global.Date = originalDate;
  });

  it("should return demo data for valid team", () => {
    const mockAdapter = createMockAdapter();
    const demoData = mockAdapter.getDemoData("TEST");

    expect(demoData).toHaveProperty("team");
    expect(demoData).toHaveProperty("record");
    expect(demoData).toHaveProperty("recentGames");
    expect(demoData.recentGames.length).toBe(2);
  });

  it("should return null for unknown demo team", () => {
    const mockAdapter = createMockAdapter();
    const demoData = mockAdapter.getDemoData("UNKNOWN");
    expect(demoData).toBeNull();
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

    getGamesUrl(teamId, fromDate, toDate) {
      return `https://api.example.com/games`;
    }

    parseGameResponse(data) {
      return [];
    }

    parseTeamResponse(data) {
      return null;
    }
  }

  return new MockAdapter();
}
