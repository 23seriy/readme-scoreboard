const { resolveName, apiTeams, mergeRosters } = require("../../scripts/generate-team-directory");

describe("generate-team-directory", () => {
  describe("resolveName", () => {
    const adapter = {
      DEMO_TEAMS: {
        LAL: { full_name: "Los Angeles Lakers", name: "Lakers" },
        BOS: { name: "Celtics" },
      },
    };

    it("prefers a live name when available", () => {
      expect(resolveName(adapter, "LAL", undefined, "Los Angeles Lakers")).toBe("Los Angeles Lakers");
    });

    it("falls back to an object value's full_name", () => {
      expect(resolveName(adapter, "LAL", { full_name: "LA Lakers" }, undefined)).toBe("LA Lakers");
    });

    it("falls back to an object value's name", () => {
      expect(resolveName(adapter, "LAL", { name: "Lakers" }, undefined)).toBe("Lakers");
    });

    it("falls back to the demo team full_name when the live fetch is missing", () => {
      expect(resolveName(adapter, "LAL", undefined, undefined)).toBe("Los Angeles Lakers");
    });

    it("falls back to the demo team name", () => {
      expect(resolveName(adapter, "BOS", undefined, undefined)).toBe("Celtics");
    });

    it("never returns null, falling back to the abbreviation", () => {
      expect(resolveName(adapter, "RMA", undefined, undefined)).toBe("RMA");
    });

    it("prefers a live name over demo data", () => {
      expect(resolveName(adapter, "LAL", undefined, "Real Name")).toBe("Real Name");
    });
  });

  describe("apiTeams", () => {
    it("reads the modern ESPN nested payload shape", () => {
      const payload = { sports: [{ leagues: [{ teams: [{ team: { abbreviation: "LAL", name: "Lakers" } }] }] }] };
      expect(apiTeams(payload)).toEqual([{ abbreviation: "LAL", name: "Lakers" }]);
    });

    it("reads a flat teams array", () => {
      const payload = { teams: [{ abbreviation: "BOS", name: "Celtics" }] };
      expect(apiTeams(payload)).toEqual([{ abbreviation: "BOS", name: "Celtics" }]);
    });

    it("returns an empty array for unexpected payloads", () => {
      expect(apiTeams(undefined)).toEqual([]);
      expect(apiTeams({})).toEqual([]);
    });
  });

  describe("mergeRosters", () => {
    it("prefers a live name over an abbreviation-only registry name", () => {
      const registry = [{ abbreviation: "ATL", name: "ATL", id: 1 }];
      const live = [{ abbreviation: "ATL", name: "Atlanta Hawks", id: 1 }];
      expect(mergeRosters(registry, live)).toEqual([
        { abbreviation: "ATL", name: "Atlanta Hawks", id: 1 },
      ]);
    });

    it("keeps the registry abbreviation when the live entry omits one", () => {
      const registry = [{ abbreviation: "AUDI", name: "AUDI", id: 132212 }];
      const live = [{ abbreviation: undefined, name: "Audi", id: 132212 }];
      expect(mergeRosters(registry, live)).toEqual([
        { abbreviation: "AUDI", name: "Audi", id: 132212 },
      ]);
    });

    it("falls back to the registry entry when the live name is just an abbreviation", () => {
      const registry = [{ abbreviation: "TOR", name: "Blue Jays", id: 141 }];
      const live = [{ abbreviation: "TOR", name: "TOR", id: 141 }];
      expect(mergeRosters(registry, live)).toEqual([
        { abbreviation: "TOR", name: "Blue Jays", id: 141 },
      ]);
    });

    it("appends live teams not present in the registry", () => {
      const registry = [{ abbreviation: "LAL", name: "Lakers", id: 13 }];
      const live = [
        { abbreviation: "LAL", name: "Los Angeles Lakers", id: 13 },
        { abbreviation: "BOS", name: "Boston Celtics", id: 2 },
      ];
      const result = mergeRosters(registry, live);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ abbreviation: "BOS", name: "Boston Celtics", id: 2 });
    });

    it("falls back to the name as the abbreviation for abbreviation-less live teams", () => {
      const registry = [];
      const live = [{ abbreviation: undefined, name: "New Expansion", id: 999 }];
      expect(mergeRosters(registry, live)).toEqual([
        { abbreviation: "New Expansion", name: "New Expansion", id: 999 },
      ]);
    });
  });
});
