const axios = require("axios");
const ligue1 = require("../../src/adapters/ligue1");
const seriea = require("../../src/adapters/seriea");
const bundesliga = require("../../src/adapters/bundesliga");
const laliga = require("../../src/adapters/laliga");
const epl = require("../../src/adapters/epl");
const mls = require("../../src/adapters/mls");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("Ligue1Adapter — league config", () => {
  it("points at ESPN's Ligue 1 slug", () => {
    expect(ligue1.LEAGUE_SLUG).toBe("fra.1");
    expect(ligue1.baseUrl).toContain("/soccer/fra.1");
    expect(ligue1.baseUrlV2).toContain("/soccer/fra.1");
  });

  it("does not collide with the other soccer leagues", () => {
    const slugs = [ligue1, seriea, bundesliga, laliga, epl, mls].map((a) => a.LEAGUE_SLUG);
    expect(new Set(slugs).size).toBe(6);
  });

  it("has all 18 clubs", () => {
    expect(Object.keys(ligue1.TEAM_IDS).length).toBe(18);
  });

  it("assigns every club a distinct ESPN id", () => {
    const ids = Object.values(ligue1.TEAM_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every club an emoji", () => {
    Object.keys(ligue1.TEAM_IDS).forEach((abbr) => {
      expect(ligue1.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("uses ESPN's authoritative ids", () => {
    expect(ligue1.TEAM_IDS.PSG).toBe(160);
    expect(ligue1.TEAM_IDS.OLM).toBe(176);
    expect(ligue1.TEAM_IDS.MON).toBe(174);
    expect(ligue1.TEAM_IDS.LYON).toBe(167);
  });

  it("never produces a placeholder logo id", () => {
    Object.keys(ligue1.TEAM_IDS).forEach((abbr) => {
      const url = ligue1.getLogoUrl(abbr);
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toMatch(/\/0\.png$/);
    });
  });
});

describe("Ligue1Adapter — abbreviations that collide with other leagues", () => {
  // Adapters are keyed independently, so sharing an abbreviation is harmless.
  // These pin each one to the right club in case a lookup is ever shared.
  it("BRE resolves to Brest, not Brentford (EPL)", () => {
    expect(ligue1.TEAM_IDS.BRE).toBe(6997);
    expect(epl.TEAM_IDS.BRE).toBe(337);
    expect(ligue1.TEAM_IDS.BRE).not.toBe(epl.TEAM_IDS.BRE);
  });

  it("PAR resolves to Paris FC, not Parma (Serie A)", () => {
    expect(ligue1.TEAM_IDS.PAR).toBe(6851);
    expect(seriea.TEAM_IDS.PAR).toBe(115);
    expect(ligue1.TEAM_IDS.PAR).not.toBe(seriea.TEAM_IDS.PAR);
  });

  it("PAR and PSG are distinct Paris clubs", () => {
    expect(ligue1.TEAM_IDS.PAR).not.toBe(ligue1.TEAM_IDS.PSG);
  });
});

describe("Ligue1Adapter — season year (Aug–May wraps the calendar year)", () => {
  const seasonFor = (year, monthIndex, day = 15) => {
    jest.useFakeTimers().setSystemTime(new Date(year, monthIndex, day));
    const season = ligue1.getSeasonYear();
    jest.useRealTimers();
    return season;
  };

  it("August belongs to the season starting that year", () => {
    expect(seasonFor(2026, 7)).toBe(2026);
  });

  it("January belongs to the previous year's season", () => {
    expect(seasonFor(2027, 0)).toBe(2026);
  });

  it("May (season end) still belongs to the previous year's season", () => {
    expect(seasonFor(2027, 4)).toBe(2026);
  });
});

describe("Ligue1Adapter — fetchData", () => {
  const teamResponse = { data: { team: { id: 160, abbreviation: "PSG", name: "Paris Saint-Germain", displayName: "Paris Saint-Germain" } } };

  const standingsResponse = {
    data: {
      children: [{
        name: "French Ligue 1",
        standings: {
          entries: [{
            team: { abbreviation: "PSG" },
            stats: [
              { name: "wins", value: 24 },
              { name: "losses", value: 6 },
              { name: "ties", value: 4 },
            ],
          }],
        },
      }],
    },
  };

  function fixture({ teamScore, oppScore, isHome = true, completed = true, date = "2026-05-17T19:00:00Z" }) {
    const mine = { homeAway: isHome ? "home" : "away", team: { id: 160, abbreviation: "PSG" }, score: { value: teamScore } };
    const theirs = { homeAway: isHome ? "away" : "home", team: { id: 176, abbreviation: "OLM" }, score: { value: oppScore } };
    return { date, competitions: [{ status: { type: { completed } }, competitors: [mine, theirs] }] };
  }

  it("returns W/L/D from standings", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const result = await ligue1.fetchData("PSG");
    expect(result.record.wins).toBe(24);
    expect(result.record.losses).toBe(6);
    expect(result.record.draws).toBe(4);
  });

  it("a full 18-team season totals 34 matches", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const { record } = await ligue1.fetchData("PSG");
    expect(record.wins + record.losses + record.draws).toBe(34);
  });

  it("flags a draw rather than a win or loss", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 2, oppScore: 2 })] } });
    const game = (await ligue1.fetchData("PSG")).recentGames[0];
    expect(game.drew).toBe(true);
    expect(game.won).toBe(false);
  });

  it("tracks scores correctly for an away fixture", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 1, oppScore: 2, isHome: false })] } });
    const game = (await ligue1.fetchData("PSG")).recentGames[0];
    expect(game.isHome).toBe(false);
    expect(game.teamScore).toBe(1);
    expect(game.visitor_team_score).toBe(1);
    expect(game.home_team_score).toBe(2);
  });

  it("excludes fixtures that have not been played", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [
        fixture({ teamScore: 3, oppScore: 0, completed: true }),
        fixture({ teamScore: 0, oppScore: 0, completed: false }),
      ] } });
    expect((await ligue1.fetchData("PSG")).recentGames.length).toBe(1);
  });

  it("returns at most 5 fixtures, newest first", async () => {
    const dates = ["2026-04-05", "2026-04-12", "2026-04-19", "2026-04-26", "2026-05-03", "2026-05-10"];
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: dates.map((d) => fixture({ teamScore: 2, oppScore: 0, date: `${d}T19:00:00Z` })) } });
    const games = (await ligue1.fetchData("PSG")).recentGames;
    expect(games.length).toBe(5);
    expect(games[0].date).toContain("2026-05-10");
    expect(games[4].date).toContain("2026-04-12");
  });

  it("returns null when the club is unknown", async () => {
    axios.get.mockRejectedValue(new Error("404"));
    expect(await ligue1.fetchData("ZZZ")).toBeNull();
  });
});

describe("Ligue1Adapter — demo data", () => {
  it("includes the soccer-specific fields the renderer needs", () => {
    const demo = ligue1.getDemoData("PSG");
    expect(demo).not.toBeNull();
    demo.recentGames.forEach((g) => {
      expect(typeof g.teamScore).toBe("number");
      expect(typeof g.oppScore).toBe("number");
      expect(typeof g.oppAbbr).toBe("string");
      expect(typeof g.drew).toBe("boolean");
    });
  });

  it("returns null for an unknown club", () => {
    expect(ligue1.getDemoData("ZZZ")).toBeNull();
  });
});