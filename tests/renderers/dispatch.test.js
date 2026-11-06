const { LEAGUES } = require("../../src/config/leagues");
const { render } = require("../../src/renderers/markdown");

describe("render dispatch", () => {
  it("recognizes every league in the registry without a per-league switch", () => {
    // Dispatch is data-driven off the registry, so any key the registry knows
    // must reach a renderer. A TypeError from a missing field is fine — only an
    // "Unsupported sport" rejection would prove the dispatch dropped the league.
    for (const { key } of LEAGUES) {
      expect(() => render(key, {})).not.toThrow(/Unsupported sport/);
    }
  });

  it("rejects unknown sports and names every supported league", () => {
    let message = "";
    try {
      render("curling", {});
    } catch (error) {
      message = error.message;
    }
    expect(message).toMatch(/Unsupported sport: "curling"/);
    for (const { key } of LEAGUES) {
      expect(message).toContain(key);
    }
  });

  it("uses the registry name as the soccer fallback label", () => {
    const soccerLeague = (key) => {
      const league = LEAGUES.find((entry) => entry.key === key);
      const data = {
        team: { full_name: "Club", abbreviation: "XXX", conference: "" },
        record: { wins: 0, losses: 0, draws: 0, season: "2026" },
        recentGames: [],
        emoji: "⚽",
        logoUrl: "https://example.test/logo.png",
      };
      return { output: render(key, data), name: league.name };
    };

    // These five leagues were the drift cases: the hand-written switch passed a
    // shortened label, while the registry carries the full display name.
    for (const key of ["greek", "austria", "denmark", "norway", "sweden"]) {
      const { output, name } = soccerLeague(key);
      expect(output).toContain(name);
    }
  });
});
