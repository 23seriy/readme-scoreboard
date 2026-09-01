const { resolveName, playerLeagues } = require("../../scripts/generate-player-directory");

describe("generate-player-directory", () => {
  describe("playerLeagues", () => {
    it("selects only leagues whose entity is player", () => {
      const leagues = playerLeagues();
      expect(leagues.length).toBeGreaterThan(0);
      leagues.forEach((league) => expect(league.entity).toBe("player"));
      // Only genuinely player-entity leagues (with an athlete roster) are listed.
      expect(leagues.map(({ key }) => key)).toContain("atp");
    });

    it("does not treat team-based leagues as player leagues", () => {
      const keys = playerLeagues().map(({ key }) => key);
      // Team-based leagues (e.g. NBA) must never appear in the player directory.
      expect(keys).not.toContain("nba");
      expect(keys).not.toContain("mlb");
    });
  });

  describe("resolveName", () => {
    const adapter = {
      DEMO_TEAMS: {
        SIN: { full_name: "Jannik Sinner", name: "Sinner" },
        ZVE: { name: "Zverev" },
      },
    };

    it("falls back to an object value's full_name", () => {
      expect(resolveName(adapter, "SIN", { full_name: "Jannik Sinner" })).toBe("Jannik Sinner");
    });

    it("falls back to an object value's name", () => {
      expect(resolveName(adapter, "SIN", { name: "Sinner" })).toBe("Sinner");
    });

    it("falls back to the demo player full_name", () => {
      expect(resolveName(adapter, "SIN", undefined)).toBe("Jannik Sinner");
    });

    it("falls back to the demo player name", () => {
      expect(resolveName(adapter, "ZVE", undefined)).toBe("Zverev");
    });

    it("never returns null, falling back to the abbreviation", () => {
      expect(resolveName(adapter, "XXX", undefined)).toBe("XXX");
    });
  });

  describe("registry integration", () => {
    it("requires every player-entity league to expose a PLAYER_IDS roster", () => {
      playerLeagues().forEach((league) => {
        const adapter = require(`../../src/adapters/${league.key}`);
        expect(adapter.PLAYER_IDS).toBeDefined();
        expect(Object.keys(adapter.PLAYER_IDS).length).toBeGreaterThan(0);
      });
    });

    it("excludes constructors-based player-entity leagues that lack a driver roster", () => {
      // F1 is entity "player" but tracks constructors, not drivers, so it is
      // filtered out of the generated player directory.
      const keys = playerLeagues().map(({ key }) => key);
      expect(keys).not.toContain("f1");
      expect(require("../../src/adapters/f1").PLAYER_IDS).toBeUndefined();
    });
  });
});
