const { resolveName, playerLeagues } = require("../../scripts/generate-player-directory");
const { LEAGUES } = require("../../src/config/leagues");

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
      // F1 tracks constructors, so it is a team league too.
      expect(keys).not.toContain("f1");
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

    it("keeps constructors-based team leagues (F1) out of the player directory", () => {
      // F1 tracks constructors, not drivers: its entity is "team", so it is
      // listed in the team directory and never treated as a player league.
      expect(LEAGUES.find(({ key }) => key === "f1").entity).toBe("team");
      const keys = playerLeagues().map(({ key }) => key);
      expect(keys).not.toContain("f1");
    });
  });
});
