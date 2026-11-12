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

    // A name must never silently degrade to the abbreviation itself: that
    // is what wrote rows like { name: "CON" } into the committed directory
    // (PR #512). A null name is the signal for the caller to rescue the
    // team from the live roster or the team-detail endpoint, or fail loudly.
    it("returns null when no source has a proper name", () => {
      expect(resolveName(adapter, "RMA", undefined, undefined)).toBeNull();
    });

    it("does not let an abbreviation-only live name win over demo data", () => {
      expect(resolveName(adapter, "LAL", undefined, "LAL")).toBe("Los Angeles Lakers");
    });

    it("returns null for a WNBA team with no demo entry when live data misses (CON regression)", () => {
      const wnbaAdapter = { DEMO_TEAMS: { MIN: { full_name: "Minnesota Lynx" } } };
      // WNBA TEAM_IDS are bare numbers (CON: 18) and CON has no demo entry,
      // so a live miss used to resolve the name to "CON" itself.
      expect(resolveName(wnbaAdapter, "CON", 18, undefined)).toBeNull();
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

    it("keeps the registry abbreviation when live data spells it differently (Austria VIE disambiguation)", () => {
      const registry = [
        { abbreviation: "AUS", name: null, id: 1382 },
        { abbreviation: "RAP", name: null, id: 519 },
      ];
      // ESPN lists both Vienna clubs as "VIE"; the registry deliberately
      // disambiguates them, and the live abbreviation must not win.
      const live = [
        { abbreviation: "VIE", name: "Austria Vienna", id: 1382 },
        { abbreviation: "VIE", name: "Rapid Vienna", id: 519 },
      ];
      expect(mergeRosters(registry, live)).toEqual([
        { abbreviation: "AUS", name: "Austria Vienna", id: 1382 },
        { abbreviation: "RAP", name: "Rapid Vienna", id: 519 },
      ]);
    });

    it("matches by abbreviation when the registry and live id spaces differ (NFL TEN)", () => {
      // The NFL registry uses its own sequential ids (TEN: 31) while live
      // data carries ESPN ids (TEN: 10); id matching alone never fires.
      const registry = [{ abbreviation: "TEN", name: null, id: 31 }];
      const live = [{ abbreviation: "TEN", name: "Tennessee Titans", id: 10 }];
      expect(mergeRosters(registry, live)).toEqual([
        { abbreviation: "TEN", name: "Tennessee Titans", id: 31 },
      ]);
    });

    it("never lets an id collision misattribute a live name (NHL NJ/BOS)", () => {
      // Registry ids are NHL ids (NJ: 1) while live ids are ESPN ids
      // (BOS: 1); a naive id match would name New Jersey "Boston Bruins".
      const registry = [{ abbreviation: "NJ", name: null, id: 1 }];
      const live = [
        { abbreviation: "BOS", name: "Boston Bruins", id: 1 },
        { abbreviation: "NJ", name: "New Jersey Devils", id: 11 },
      ];
      expect(mergeRosters(registry, live)).toEqual([
        { abbreviation: "NJ", name: "New Jersey Devils", id: 1 },
        { abbreviation: "BOS", name: "Boston Bruins", id: 1 },
      ]);
    });

    it("leaves a registry entry unnamed when the live name is just the abbreviation", () => {
      const registry = [{ abbreviation: "PAOK", name: null, id: 605 }];
      const live = [{ abbreviation: "PAOK", name: "PAOK", id: 605 }];
      expect(mergeRosters(registry, live)).toEqual([
        { abbreviation: "PAOK", name: null, id: 605 },
      ]);
    });

    it("does not emit a WNBA row named after its own abbreviation on a live miss (CON regression)", () => {
      const registry = [{ abbreviation: "CON", name: null, id: 18 }];
      expect(mergeRosters(registry, [])).toEqual([
        { abbreviation: "CON", name: null, id: 18 },
      ]);
    });

    it("skips placeholder live teams instead of writing them into the directory", () => {
      const registry = [];
      const live = [
        { abbreviation: "TBD Away", name: "TBD Away", id: 131554 },
        { abbreviation: "TBD Home", name: "TBD Home", id: 131556 },
      ];
      expect(mergeRosters(registry, live)).toEqual([]);
    });

    it("skips live teams with no abbreviation instead of using the name as one", () => {
      const registry = [];
      const live = [{ abbreviation: undefined, name: "New Expansion", id: 999 }];
      expect(mergeRosters(registry, live)).toEqual([]);
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
  });
});
