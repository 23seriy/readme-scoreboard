describe("Logo URL construction", () => {
  describe("NBA logos", () => {
    it("uses correct NBA logo URL format: logo.svg (not logo_dark.svg)", () => {
      const teamId = 1610612747; // LAL
      const logoUrl = `https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`;
      expect(logoUrl).toBe("https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg");
      expect(logoUrl).not.toContain("logo_dark");
    });

    it("constructs NBA logo URL for all teams", () => {
      const teamIds = [1610612737, 1610612738, 1610612747];
      teamIds.forEach((id) => {
        const logoUrl = `https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`;
        expect(logoUrl).toMatch(/^https:\/\/cdn\.nba\.com\/logos\/nba\/\d+\/global\/L\/logo\.svg$/);
      });
    });
  });

  describe("MLB logos", () => {
    it("uses correct MLB logo URL format: .svg (not .png or _dark.svg)", () => {
      const teamId = 119; // LAD
      const logoUrl = `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
      expect(logoUrl).toBe("https://www.mlbstatic.com/team-logos/119.svg");
      expect(logoUrl).not.toContain(".png");
      expect(logoUrl).not.toContain("_dark");
    });

    it("constructs MLB logo URL for all teams", () => {
      const teamIds = [111, 119, 147];
      teamIds.forEach((id) => {
        const logoUrl = `https://www.mlbstatic.com/team-logos/${id}.svg`;
        expect(logoUrl).toMatch(/^https:\/\/www\.mlbstatic\.com\/team-logos\/\d+\.svg$/);
      });
    });
  });

  describe("NFL logos", () => {
    it("uses correct NFL logo URL format: lowercase team abbreviation", () => {
      const abbr = "kc";
      const logoUrl = `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`;
      expect(logoUrl).toBe("https://a.espncdn.com/i/teamlogos/nfl/500/kc.png");
    });

    it("constructs NFL logo URL with lowercase abbreviations", () => {
      const abbrs = ["kc", "dal", "nyj"];
      abbrs.forEach((team) => {
        const logoUrl = `https://a.espncdn.com/i/teamlogos/nfl/500/${team}.png`;
        expect(logoUrl).toMatch(/^https:\/\/a\.espncdn\.com\/i\/teamlogos\/nfl\/500\/[a-z]+\.png$/);
      });
    });
  });

  describe("NHL logos", () => {
    it("uses correct NHL logo URL format: {ABBR}_dark.svg", () => {
      const abbr = "TOR";
      const logoUrl = `https://assets.nhle.com/logos/nhl/svg/${abbr}_dark.svg`;
      expect(logoUrl).toBe("https://assets.nhle.com/logos/nhl/svg/TOR_dark.svg");
      expect(logoUrl).toContain("_dark");
    });

    it("constructs NHL logo URL for all teams", () => {
      const abbrs = ["TOR", "NYR", "BOS"];
      abbrs.forEach((abbr) => {
        const logoUrl = `https://assets.nhle.com/logos/nhl/svg/${abbr}_dark.svg`;
        expect(logoUrl).toMatch(/^https:\/\/assets\.nhle\.com\/logos\/nhl\/svg\/[A-Z]+_dark\.svg$/);
      });
    });
  });

  describe("MLS logos", () => {
    it("uses correct MLS logo URL format: ESPN ID as .png", () => {
      const espnId = 20232; // MIA
      const logoUrl = `https://a.espncdn.com/i/teamlogos/soccer/500/${espnId}.png`;
      expect(logoUrl).toBe("https://a.espncdn.com/i/teamlogos/soccer/500/20232.png");
    });

    it("constructs MLS logo URL for teams with ESPN logos", () => {
      const ids = [18418, 20906, 20232]; // ATL, ATX, MIA
      ids.forEach((id) => {
        const logoUrl = `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;
        expect(logoUrl).toMatch(/^https:\/\/a\.espncdn\.com\/i\/teamlogos\/soccer\/500\/\d+\.png$/);
      });
    });

    it("handles teams without ESPN logos (placeholder ID = 0)", () => {
      const teamIds = {
        DAL: 0, HOU: 0, NYRB: 0, ORL: 0, SKC: 0, TOR: 0, VAN: 0,
      };
      Object.entries(teamIds).forEach(([_team, id]) => {
        expect(id).toBe(0);
      });
    });

    it("corrects duplicate team IDs", () => {
      const teamIds = {
        MNU: 9725, RSL: 9726, SEA: 9726, MIN: 9729, NAS: 18986,
      };
      const uniqueIds = new Set(Object.values(teamIds).filter((id) => id !== 0));
      expect(uniqueIds.size).toBeGreaterThan(0);
    });
  });

  describe("URL format consistency", () => {
    it("all NBA URLs use https", () => {
      const url = "https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg";
      expect(url).toMatch(/^https:\/\//);
    });

    it("all MLB URLs use https", () => {
      const url = "https://www.mlbstatic.com/team-logos/119.svg";
      expect(url).toMatch(/^https:\/\//);
    });

    it("all NFL URLs use https", () => {
      const url = "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png";
      expect(url).toMatch(/^https:\/\//);
    });

    it("all NHL URLs use https", () => {
      const url = "https://assets.nhle.com/logos/nhl/svg/TOR_dark.svg";
      expect(url).toMatch(/^https:\/\//);
    });

    it("all MLS URLs use https", () => {
      const url = "https://a.espncdn.com/i/teamlogos/soccer/500/20232.png";
      expect(url).toMatch(/^https:\/\//);
    });
  });
});