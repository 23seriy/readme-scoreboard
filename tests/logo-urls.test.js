const nba = require("../src/adapters/nba");
const mlb = require("../src/adapters/mlb");
const nfl = require("../src/adapters/nfl");
const nhl = require("../src/adapters/nhl");
const mls = require("../src/adapters/mls");

const ADAPTERS = { nba, mlb, nfl, nhl, mls };

describe("getLogoUrl", () => {
  describe("every adapter exposes it", () => {
    Object.entries(ADAPTERS).forEach(([sport, adapter]) => {
      it(`${sport} implements getLogoUrl`, () => {
        expect(typeof adapter.getLogoUrl).toBe("function");
      });
    });
  });

  describe("every team in every sport resolves to a URL", () => {
    Object.entries(ADAPTERS).forEach(([sport, adapter]) => {
      it(`${sport}: all ${Object.keys(adapter.TEAM_IDS).length} teams produce an https URL`, () => {
        const teams = Object.keys(adapter.TEAM_IDS);
        expect(teams.length).toBeGreaterThan(0);
        teams.forEach((abbr) => {
          const url = adapter.getLogoUrl(abbr);
          expect(typeof url).toBe("string");
          expect(url).toMatch(/^https:\/\//);
        });
      });

      it(`${sport}: no team produces a placeholder id of 0`, () => {
        Object.keys(adapter.TEAM_IDS).forEach((abbr) => {
          expect(adapter.getLogoUrl(abbr)).not.toMatch(/\/0\.(png|svg)$/);
        });
      });
    });
  });

  describe("per-sport URL formats", () => {
    it("NBA uses the ESPN CDN, not the NBA CDN (which 403s on logo_dark.svg)", () => {
      const url = nba.getLogoUrl("LAL");
      expect(url).toBe("https://a.espncdn.com/i/teamlogos/nba/500/lal.png");
      expect(url).not.toContain("cdn.nba.com");
      expect(url).not.toContain("logo_dark");
    });

    it("NBA maps abbreviations that differ on ESPN", () => {
      expect(nba.getLogoUrl("GSW")).toContain("/gs.png");
      expect(nba.getLogoUrl("NOP")).toContain("/no.png");
      expect(nba.getLogoUrl("NYK")).toContain("/ny.png");
      expect(nba.getLogoUrl("SAS")).toContain("/sa.png");
      expect(nba.getLogoUrl("UTA")).toContain("/utah.png");
      expect(nba.getLogoUrl("WAS")).toContain("/wsh.png");
    });

    it("MLB uses the ESPN CDN, not mlbstatic (whose .png 404s)", () => {
      const url = mlb.getLogoUrl("NYY");
      expect(url).toBe("https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png");
      expect(url).not.toContain("mlbstatic");
    });

    it("MLB maps AZ to ESPN's ari slug", () => {
      expect(mlb.getLogoUrl("AZ")).toBe("https://a.espncdn.com/i/teamlogos/mlb/500/ari.png");
    });

    it("NFL lowercases the abbreviation", () => {
      expect(nfl.getLogoUrl("KC")).toBe("https://a.espncdn.com/i/teamlogos/nfl/500/kc.png");
    });

    it("NHL maps the three abbreviations the NHL CDN spells differently", () => {
      expect(nhl.getLogoUrl("NJ")).toContain("NJD_dark.svg");
      expect(nhl.getLogoUrl("SJ")).toContain("SJS_dark.svg");
      expect(nhl.getLogoUrl("TB")).toContain("TBL_dark.svg");
    });

    it("NHL leaves already-correct abbreviations alone", () => {
      expect(nhl.getLogoUrl("NYR")).toBe("https://assets.nhle.com/logos/nhl/svg/NYR_dark.svg");
    });

    it("MLS builds from the ESPN team id", () => {
      expect(mls.getLogoUrl("MIA")).toBe("https://a.espncdn.com/i/teamlogos/soccer/500/20232.png");
    });
  });

  describe("MLS team ids are correct and unambiguous", () => {
    it("has all 30 clubs", () => {
      expect(Object.keys(mls.TEAM_IDS).length).toBe(30);
    });

    it("assigns every club a distinct ESPN id", () => {
      const ids = Object.values(mls.TEAM_IDS);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("uses ESPN's authoritative ids for clubs that were previously wrong", () => {
      expect(mls.TEAM_IDS.DAL).toBe(185);
      expect(mls.TEAM_IDS.SJ).toBe(191);
      expect(mls.TEAM_IDS.POR).toBe(9723);
      expect(mls.TEAM_IDS.VAN).toBe(9727);
      expect(mls.TEAM_IDS.SKC).toBe(186);
      expect(mls.TEAM_IDS.HOU).toBe(6077);
      expect(mls.TEAM_IDS.ORL).toBe(12011);
      expect(mls.TEAM_IDS.TOR).toBe(7318);
      expect(mls.TEAM_IDS.MIN).toBe(17362);
      expect(mls.TEAM_IDS.RSL).toBe(4771);
    });

    it("gives every club an emoji", () => {
      Object.keys(mls.TEAM_IDS).forEach((abbr) => {
        expect(mls.TEAM_EMOJI[abbr]).toBeDefined();
      });
    });
  });

  describe("case handling", () => {
    it("accepts lowercase input across sports", () => {
      expect(nba.getLogoUrl("lal")).toBe(nba.getLogoUrl("LAL"));
      expect(mlb.getLogoUrl("nyy")).toBe(mlb.getLogoUrl("NYY"));
      expect(nfl.getLogoUrl("kc")).toBe(nfl.getLogoUrl("KC"));
      expect(nhl.getLogoUrl("nj")).toBe(nhl.getLogoUrl("NJ"));
      expect(mls.getLogoUrl("mia")).toBe(mls.getLogoUrl("MIA"));
    });
  });
});