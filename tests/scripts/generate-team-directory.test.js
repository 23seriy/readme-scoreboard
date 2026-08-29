const { resolveName, apiTeams } = require("../../scripts/generate-team-directory");

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
});
