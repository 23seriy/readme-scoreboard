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

    it("holds a decodable flag for every country", () => {
      // A key with one regional indicator replaced by U+FFFD (which is how eight
      // entries were once silently broken — Argentina and Italy among them)
      // still looks like a flag in an editor but matches nothing at runtime.
      for (const [flag, country] of Object.entries(FLAG_TO_COUNTRY)) {
        const points = [...flag].map((char) => char.codePointAt(0));
        const isPair = points.length === 2
          && points.every((point) => point >= 0x1f1e6 && point <= 0x1f1ff);
        const isSubdivision = points[0] === 0x1f3f4
          && points[points.length - 1] === 0xe007f;
        expect(`${country}:${isPair || isSubdivision}`).toBe(`${country}:true`);
      }
    });

    it("resolves a country for every UFC fighter's flag", () => {
      // The player directory prints the country beside each athlete, so a flag
      // with no entry would show a blank cell for a real fighter.
      const { TEAM_EMOJI } = require("../src/adapters/ufc");
      Object.entries(TEAM_EMOJI).forEach(([code, flag]) => {
        expect(`${code}:${countryForFlag(flag)}`).not.toBe(`${code}:`);
      });
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
