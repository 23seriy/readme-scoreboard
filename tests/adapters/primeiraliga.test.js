const axios = require("axios");
const primeiraliga = require("../../src/adapters/primeiraliga");
const ligue1 = require("../../src/adapters/ligue1");
const seriea = require("../../src/adapters/seriea");
const bundesliga = require("../../src/adapters/bundesliga");
const laliga = require("../../src/adapters/laliga");
const epl = require("../../src/adapters/epl");
const mls = require("../../src/adapters/mls");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("PrimeiraLigaAdapter — league config", () => {
  it("points at ESPN's Primeira Liga slug", () => {
    expect(primeiraliga.LEAGUE_SLUG).toBe("por.1");
    expect(primeiraliga.baseUrl).toContain("/soccer/por.1");
    expect(primeiraliga.baseUrlV2).toContain("/soccer/por.1");
  });

  it("does not collide with the other soccer leagues", () => {
    const slugs = [primeiraliga, ligue1, seriea, bundesliga, laliga, epl, mls].map((a) => a.LEAGUE_SLUG);
    expect(new Set(slugs).size).toBe(7);
  });

  it("has all 18 clubs", () => {
    expect(Object.keys(primeiraliga.TEAM_IDS).length).toBe(18);
  });

  it("assigns every club a distinct ESPN id", () => {
    const ids = Object.values(primeiraliga.TEAM_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every club an emoji", () => {
    Object.keys(primeiraliga.TEAM_IDS).forEach((abbr) => {
      expect(primeiraliga.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("uses ESPN's authoritative ids", () => {
    expect(primeiraliga.TEAM_IDS.SLB).toBe(1929);
    expect(primeiraliga.TEAM_IDS.FCP).toBe(437);
    expect(primeiraliga.TEAM_IDS.SCP).toBe(2250);
    expect(primeiraliga.TEAM_IDS.SCB).toBe(2994);
  });

  it("never produces a placeholder logo id", () => {
    Object.keys(primeiraliga.TEAM_IDS).forEach((abbr) => {
      const url = primeiraliga.getLogoUrl(abbr);
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toMatch(/\/0\.png$/);
    });
  });

  it("FCA resolves to Arouca, not FC Augsburg (Bundesliga)", () => {
    // Adapters are keyed independently, so the collision is harmless — but
    // each must resolve to its own league's club.
    expect(primeiraliga.TEAM_IDS.FCA).toBe(15784);
    expect(bundesliga.TEAM_IDS.FCA).toBe(3841);
    expect(primeiraliga.TEAM_IDS.FCA).not.toBe(bundesliga.TEAM_IDS.FCA);
  });
});

describe("PrimeiraLigaAdapter — season year (Aug–May wraps the calendar year)", () => {
  const seasonFor = (year, monthIndex, day = 15) => {
    jest.useFakeTimers().setSystemTime(new Date(year, monthIndex, day));
    const season = primeiraliga.getSeasonYear();
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

describe("PrimeiraLigaAdapter — fetchData", () => {
  const teamResponse = { data: { team: { id: 1929, abbreviation: "SLB", name: "Benfica", displayName: "Benfica" } } };

  const standingsResponse = {
    data: {
      children: [{
        name: "Portuguese Liga",
        standings: {
          entries: [{
            team: { abbreviation: "SLB" },
            stats: [
              { name: "wins", value: 24 },
              { name: "losses", value: 4 },
              { name: "ties", value: 6 },
            ],
          }],
        },
      }],
    },
  };

  function fixture({ teamScore, oppScore, isHome = true, completed = true, date = "2026-05-17T19:00:00Z" }) {
    const mine = { homeAway: isHome ? "home" : "away", team: { id: 1929, abbreviation: "SLB" }, score: { value: teamScore } };
    const theirs = { homeAway: isHome ? "away" : "home", team: { id: 437, abbreviation: "FCP" }, score: { value: oppScore } };
    return { date, competitions: [{ status: { type: { completed } }, competitors: [mine, theirs] }] };
  }

  it("returns W/L/D from standings", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const result = await primeiraliga.fetchData("SLB");
    expect(result.record.wins).toBe(24);
    expect(result.record.losses).toBe(4);
    expect(result.record.draws).toBe(6);
  });

  it("a full 18-team season totals 34 matches", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const { record } = await primeiraliga.fetchData("SLB");
    expect(record.wins + record.losses + record.draws).toBe(34);
  });

  it("handles a partially played season (this league is already underway)", async () => {
    const earlySeason = {
      data: {
        children: [{
          name: "Portuguese Liga",
          standings: {
            entries: [{
              team: { abbreviation: "SLB" },
              stats: [
                { name: "wins", value: 0 },
                { name: "losses", value: 0 },
                { name: "ties", value: 1 },
              ],
            }],
          },
        }],
      },
    };
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(earlySeason)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 2, oppScore: 2 })] } });
    const { record, recentGames } = await primeiraliga.fetchData("SLB");
    expect(record.wins + record.losses + record.draws).toBe(1);
    expect(recentGames.length).toBe(1);
    expect(recentGames[0].drew).toBe(true);
  });

  it("flags a draw rather than a win or loss", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 2, oppScore: 2 })] } });
    const game = (await primeiraliga.fetchData("SLB")).recentGames[0];
    expect(game.drew).toBe(true);
    expect(game.won).toBe(false);
  });

  it("tracks scores correctly for an away fixture", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 3, oppScore: 1, isHome: false })] } });
    const game = (await primeiraliga.fetchData("SLB")).recentGames[0];
    expect(game.isHome).toBe(false);
    expect(game.teamScore).toBe(3);
    expect(game.visitor_team_score).toBe(3);
    expect(game.home_team_score).toBe(1);
  });

  it("excludes fixtures that have not been played", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [
        fixture({ teamScore: 3, oppScore: 0, completed: true }),
        fixture({ teamScore: 0, oppScore: 0, completed: false }),
      ] } });
    expect((await primeiraliga.fetchData("SLB")).recentGames.length).toBe(1);
  });

  it("returns at most 5 fixtures, newest first", async () => {
    const dates = ["2026-04-05", "2026-04-12", "2026-04-19", "2026-04-26", "2026-05-03", "2026-05-10"];
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: dates.map((d) => fixture({ teamScore: 2, oppScore: 0, date: `${d}T19:00:00Z` })) } });
    const games = (await primeiraliga.fetchData("SLB")).recentGames;
    expect(games.length).toBe(5);
    expect(games[0].date).toContain("2026-05-10");
    expect(games[4].date).toContain("2026-04-12");
  });

  it("returns null when the club is unknown", async () => {
    axios.get.mockRejectedValue(new Error("404"));
    expect(await primeiraliga.fetchData("ZZZ")).toBeNull();
  });
});

describe("PrimeiraLigaAdapter — demo data", () => {
  it("includes the soccer-specific fields the renderer needs", () => {
    const demo = primeiraliga.getDemoData("SLB");
    expect(demo).not.toBeNull();
    demo.recentGames.forEach((g) => {
      expect(typeof g.teamScore).toBe("number");
      expect(typeof g.oppScore).toBe("number");
      expect(typeof g.oppAbbr).toBe("string");
      expect(typeof g.drew).toBe("boolean");
    });
  });

  it("returns null for an unknown club", () => {
    expect(primeiraliga.getDemoData("ZZZ")).toBeNull();
  });
});
