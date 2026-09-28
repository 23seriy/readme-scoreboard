const adapter = require("../../src/adapters/worldcup");
const { LEAGUE_BY_KEY } = require("../../src/config/leagues");

// The World Cup is the first competition in the registry whose entrants are
// nations rather than clubs, which drives three things the other soccer
// adapters never exercised: a full 48-team roster, flag emoji instead of club
// colours, and demo fixtures played against countries.

const NATIONS = Object.keys(adapter.TEAM_IDS);

describe("FIFA World Cup adapter", () => {
  it("covers every team with both an ESPN id and artwork", () => {
    expect(NATIONS).toHaveLength(48);
    expect(Object.keys(adapter.TEAM_EMOJI).sort()).toEqual([...NATIONS].sort());
    Object.entries(adapter.TEAM_IDS).forEach(([abbr, id]) => {
      expect(Number.isInteger(id)).toBe(true);
      expect(adapter.TEAM_EMOJI[abbr]).toBeTruthy();
    });
  });

  it("gives every team a real flag", () => {
    // A regional-indicator pair (most nations) or a subdivision tag sequence
    // (England, Scotland). Anything else — a stray club colour, a half-typed
    // pair — fails here rather than rendering an odd glyph on someone's README.
    Object.entries(adapter.TEAM_EMOJI).forEach(([abbr, flag]) => {
      const points = [...flag].map((char) => char.codePointAt(0));
      const includes = (point) => points.includes(point);
      const isNation = points.length === 2 && points.every((point) => point >= 0x1f1e6 && point <= 0x1f1ff);
      const isSubdivision = points[0] === 0x1f3f4 && includes(0xe007f);
      expect(`${abbr}:${isNation || isSubdivision}`).toBe(`${abbr}:true`);
    });
  });

  it("plays its demo fixtures against nations, not clubs", () => {
    const demo = adapter.getDemoData("ARG");
    const opponents = demo.recentGames.map((game) => game.oppAbbr);
    expect(opponents.length).toBeGreaterThan(0);
    opponents.forEach((abbr) => expect(NATIONS).toContain(abbr));
    expect(NATIONS).toContain(demo.nextGame.opponent);
  });

  it("resolves every nation without a live lookup", () => {
    NATIONS.forEach((abbr) => {
      expect(adapter.getLogoUrl(abbr)).toMatch(/^https:\/\/a\.espncdn\.com\/i\/teamlogos\/soccer\/500\/\d+\.png$/);
    });
  });

  it("is registered as a quadrennial June–July event", () => {
    const league = LEAGUE_BY_KEY.worldcup;
    expect(league.seasonWindow.start[0]).toBe(6);
    expect(league.seasonWindow.end[0]).toBe(7);
    // The status line appends a year; a quadrennial event supplies its own.
    expect(league.seasonWindow.nextStartYear).toBe(2030);
    expect(adapter.LEAGUE_SLUG).toBe("fifa.world");
  });
});
