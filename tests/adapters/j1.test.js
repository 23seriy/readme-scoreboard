const j1 = require("../../src/adapters/j1");

describe("J1 League adapter", () => {
  it("uses ESPN's J1 League slug", () => {
    expect(j1.LEAGUE_SLUG).toBe("jpn.1");
    expect(j1.baseUrl).toContain("/soccer/jpn.1");
    expect(j1.baseUrlV2).toContain("/soccer/jpn.1");
  });

  it("contains all 20 current clubs with unique IDs and emojis", () => {
    const abbreviations = Object.keys(j1.TEAM_IDS);
    expect(abbreviations).toHaveLength(20);
    expect(new Set(Object.values(j1.TEAM_IDS)).size).toBe(20);
    abbreviations.forEach((abbr) => expect(j1.TEAM_EMOJI[abbr]).toBeDefined());
  });

  it("uses authoritative IDs for representative clubs", () => {
    expect(j1.TEAM_IDS.KAW).toBe(7112);
    expect(j1.TEAM_IDS.URA).toBe(3385);
    expect(j1.TEAM_IDS.VIS).toBe(7477);
    expect(j1.TEAM_IDS.YOK).toBe(7116);
  });

  it("treats the 2026/27 season as spanning August through May", () => {
    expect(j1.SEASON_SPANS_YEARS).toBe(true);
    jest.useFakeTimers().setSystemTime(new Date(2027, 0, 15));
    expect(j1.getSeasonYear()).toBe(2026);
    jest.useRealTimers();
  });

  it("generates a real logo URL for every club", () => {
    Object.keys(j1.TEAM_IDS).forEach((abbr) => {
      expect(j1.getLogoUrl(abbr)).toMatch(/^https:\/\//);
    });
  });
});
