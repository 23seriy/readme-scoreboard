const { FLAG_TO_COUNTRY, countryForFlag } = require("../src/countries");

describe("countries", () => {
  describe("FLAG_TO_COUNTRY", () => {
    it("maps regional-indicator flag pairs to country names", () => {
      expect(FLAG_TO_COUNTRY["🇺🇸"]).toBe("United States");
      expect(FLAG_TO_COUNTRY["🇨🇦"]).toBe("Canada");
      expect(FLAG_TO_COUNTRY["🇷🇸"]).toBe("Serbia");
    });

    it("uses the Czechia short-form name rather than Czech Republic", () => {
      expect(FLAG_TO_COUNTRY["🇨🇿"]).toBe("Czechia");
    });

    it("contains only non-empty string values", () => {
      for (const [flag, country] of Object.entries(FLAG_TO_COUNTRY)) {
        expect(typeof flag).toBe("string");
        expect(typeof country).toBe("string");
        expect(country.length).toBeGreaterThan(0);
      }
    });
  });

  describe("countryForFlag", () => {
    it("returns the country name for a known flag", () => {
      expect(countryForFlag("🇦🇷")).toBe("Argentina");
      expect(countryForFlag("🇯🇵")).toBe("Japan");
    });

    it("returns an empty string for an unknown flag", () => {
      expect(countryForFlag("🇿🇿")).toBe("");
    });

    it("returns an empty string for an empty string", () => {
      expect(countryForFlag("")).toBe("");
    });
  });
});
