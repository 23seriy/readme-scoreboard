const saudipro = require("../../src/adapters/saudipro");

describe("Saudi Pro League adapter", () => {
  it("uses ESPN's Saudi Pro League slug", () => {
    expect(saudipro.LEAGUE_SLUG).toBe("ksa.1");
    expect(saudipro.baseUrl).toContain("/soccer/ksa.1");
    expect(saudipro.baseUrlV2).toContain("/soccer/ksa.1");
  });

  it("contains all 18 current clubs with unique IDs and emojis", () => {
    const abbreviations = Object.keys(saudipro.TEAM_IDS);
    expect(abbreviations).toHaveLength(18);
    expect(new Set(Object.values(saudipro.TEAM_IDS)).size).toBe(18);
    abbreviations.forEach((abbr) => expect(saudipro.TEAM_EMOJI[abbr]).toBeDefined());
  });

  it("uses authoritative IDs for prominent and new clubs", () => {
    expect(saudipro.TEAM_IDS.HIL).toBe(929);
    expect(saudipro.TEAM_IDS.NSR).toBe(817);
    expect(saudipro.TEAM_IDS.AHL).toBe(8346);
    expect(saudipro.TEAM_IDS.NEOM).toBe(130899);
  });

  it("treats the season as spanning August through May", () => {
    expect(saudipro.SEASON_SPANS_YEARS).toBe(true);
    jest.useFakeTimers().setSystemTime(new Date(2027, 0, 15));
    expect(saudipro.getSeasonYear()).toBe(2026);
    jest.useRealTimers();
  });

  it("generates a real logo URL for every club", () => {
    Object.keys(saudipro.TEAM_IDS).forEach((abbr) => {
      expect(saudipro.getLogoUrl(abbr)).toMatch(/^https:\/\//);
    });
  });
});
