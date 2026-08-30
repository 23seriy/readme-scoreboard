const argentina = require("../../src/adapters/argentina");
const epl = require("../../src/adapters/epl");

beforeEach(() => jest.clearAllMocks());

describe("ArgentinianAdapter — league config", () => {
  it("points at ESPN's Argentine Primera slug", () => {
    expect(argentina.LEAGUE_SLUG).toBe("arg.1");
    expect(argentina.baseUrl).toContain("/soccer/arg.1");
    expect(argentina.baseUrlV2).toContain("/soccer/arg.1");
  });

  it("uses a distinct slug from the other soccer leagues", () => {
    expect(argentina.LEAGUE_SLUG).not.toBe(epl.LEAGUE_SLUG);
  });

  it("carries the league roster", () => {
    expect(Object.keys(argentina.TEAM_IDS).length).toBeGreaterThanOrEqual(29);
    expect(argentina.TEAM_IDS.RIV).toBe(16);
    expect(argentina.TEAM_IDS.CABJ).toBe(5);
  });

  it("gives every club an emoji", () => {
    Object.keys(argentina.TEAM_IDS).forEach((abbr) => {
      expect(argentina.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("runs Feb–Dec within a single calendar year", () => {
    expect(argentina.SEASON_SPANS_YEARS).toBe(false);
  });
});

describe("ArgentinianAdapter — demo data", () => {
  it("includes the fields the renderer needs", () => {
    const demo = argentina.getDemoData("RIV");
    expect(demo).not.toBeNull();
    expect(demo.team.full_name).toBe("River Plate");
    expect(demo.record.wins).toBeGreaterThan(0);
    expect(Array.isArray(demo.recentGames)).toBe(true);
    expect(demo.standing).toBeTruthy();
  });

  it("returns null for an unknown club", () => {
    expect(argentina.getDemoData("ZZZ")).toBeNull();
  });
});
