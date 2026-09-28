const axios = require("axios");
const eredivisie = require("../../src/adapters/eredivisie");
const primeiraliga = require("../../src/adapters/primeiraliga");
const ligue1 = require("../../src/adapters/ligue1");
const seriea = require("../../src/adapters/seriea");
const bundesliga = require("../../src/adapters/bundesliga");
const laliga = require("../../src/adapters/laliga");
const epl = require("../../src/adapters/epl");
const mls = require("../../src/adapters/mls");
const mlb = require("../../src/adapters/mlb");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("EredivisieAdapter — league config", () => {
  it("points at ESPN's Eredivisie slug", () => {
    expect(eredivisie.LEAGUE_SLUG).toBe("ned.1");
    expect(eredivisie.baseUrl).toContain("/soccer/ned.1");
    expect(eredivisie.baseUrlV2).toContain("/soccer/ned.1");
  });

  it("does not collide with the other soccer leagues", () => {
    const slugs = [eredivisie, primeiraliga, ligue1, seriea, bundesliga, laliga, epl, mls].map((a) => a.LEAGUE_SLUG);
    expect(new Set(slugs).size).toBe(8);
  });

  it("has all 18 clubs", () => {
    expect(Object.keys(eredivisie.TEAM_IDS).length).toBe(18);
  });

  it("assigns every club a distinct ESPN id", () => {
    const ids = Object.values(eredivisie.TEAM_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every club an emoji", () => {
    Object.keys(eredivisie.TEAM_IDS).forEach((abbr) => {
      expect(eredivisie.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("uses ESPN's authoritative ids", () => {
    expect(eredivisie.TEAM_IDS.AJA).toBe(139);
    expect(eredivisie.TEAM_IDS.PSV).toBe(148);
    expect(eredivisie.TEAM_IDS.FEY).toBe(142);
    expect(eredivisie.TEAM_IDS.AZ).toBe(140);
  });

  it("never produces a placeholder logo id", () => {
    Object.keys(eredivisie.TEAM_IDS).forEach((abbr) => {
      const url = eredivisie.getLogoUrl(abbr);
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toMatch(/\/0\.png$/);
    });
  });

  it("AZ resolves to AZ Alkmaar, not the Arizona Diamondbacks (MLB)", () => {
    // Adapters are keyed independently, so the collision is harmless — but
    // each must resolve within its own sport.
    expect(eredivisie.TEAM_IDS.AZ).toBe(140);
    expect(eredivisie.getLogoUrl("AZ")).toContain("/soccer/500/140.png");
    expect(mlb.getLogoUrl("AZ")).toContain("/mlb/500/ari.png");
  });
});

describe("EredivisieAdapter — season year (Aug–May wraps the calendar year)", () => {
  const seasonFor = (year, monthIndex, day = 15) => {
    jest.useFakeTimers().setSystemTime(new Date(year, monthIndex, day));
    const season = eredivisie.getSeasonYear();
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

describe("EredivisieAdapter — fetchData", () => {
  const teamResponse = { data: { team: { id: 139, abbreviation: "AJA", name: "Ajax", displayName: "Ajax Amsterdam" } } };

  const standingsResponse = {
    data: {
      children: [{
        name: "Dutch Eredivisie",
        standings: {
          entries: [{
            team: { abbreviation: "AJA" },
            stats: [
              { name: "wins", value: 25 },
              { name: "losses", value: 4 },
              { name: "ties", value: 5 },
            ],
          }],
        },
      }],
    },
  };

  function fixture({ teamScore, oppScore, isHome = true, completed = true, date = "2026-05-17T13:30:00Z" }) {
    const mine = { homeAway: isHome ? "home" : "away", team: { id: 139, abbreviation: "AJA" }, score: { value: teamScore } };
    const theirs = { homeAway: isHome ? "away" : "home", team: { id: 148, abbreviation: "PSV" }, score: { value: oppScore } };
    return { date, competitions: [{ status: { type: { completed } }, competitors: [mine, theirs] }] };
  }

  it("returns W/L/D from standings", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const result = await eredivisie.fetchData("AJA");
    expect(result.record.wins).toBe(25);
    expect(result.record.losses).toBe(4);
    expect(result.record.draws).toBe(5);
  });

  it("a full 18-team season totals 34 matches", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const { record } = await eredivisie.fetchData("AJA");
    expect(record.wins + record.losses + record.draws).toBe(34);
  });

  it("handles a partially played season (this league is already underway)", async () => {
    const early = {
      data: {
        children: [{
          name: "Dutch Eredivisie",
          standings: {
            entries: [{
              team: { abbreviation: "AJA" },
              stats: [
                { name: "wins", value: 1 },
                { name: "losses", value: 0 },
                { name: "ties", value: 0 },
              ],
            }],
          },
        }],
      },
    };
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(early)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 2, oppScore: 0 })] } });
    const { record, recentGames } = await eredivisie.fetchData("AJA");
    expect(record.wins + record.losses + record.draws).toBe(1);
    expect(recentGames.length).toBe(1);
    expect(recentGames[0].won).toBe(true);
  });

  it("flags a draw rather than a win or loss", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 2, oppScore: 2 })] } });
    const game = (await eredivisie.fetchData("AJA")).recentGames[0];
    expect(game.drew).toBe(true);
    expect(game.won).toBe(false);
  });

  it("tracks scores correctly for an away fixture", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 2, oppScore: 0, isHome: false })] } });
    const game = (await eredivisie.fetchData("AJA")).recentGames[0];
    expect(game.isHome).toBe(false);
    expect(game.teamScore).toBe(2);
    expect(game.visitor_team_score).toBe(2);
    expect(game.home_team_score).toBe(0);
  });

  it("excludes fixtures that have not been played", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [
        fixture({ teamScore: 3, oppScore: 1, completed: true }),
        fixture({ teamScore: 0, oppScore: 0, completed: false }),
      ] } });
    expect((await eredivisie.fetchData("AJA")).recentGames.length).toBe(1);
  });

  it("returns at most 5 fixtures, newest first", async () => {
    const dates = ["2026-04-05", "2026-04-12", "2026-04-19", "2026-04-26", "2026-05-03", "2026-05-10"];
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: dates.map((d) => fixture({ teamScore: 2, oppScore: 0, date: `${d}T13:30:00Z` })) } });
    const games = (await eredivisie.fetchData("AJA")).recentGames;
    expect(games.length).toBe(5);
    expect(games[0].date).toContain("2026-05-10");
    expect(games[4].date).toContain("2026-04-12");
  });

  it("returns null when the club is unknown", async () => {
    axios.get.mockRejectedValue(new Error("404"));
    expect(await eredivisie.fetchData("ZZZ")).toBeNull();
  });
});

describe("EredivisieAdapter — demo data", () => {
  it("includes the soccer-specific fields the renderer needs", () => {
    const demo = eredivisie.getDemoData("AJA");
    expect(demo).not.toBeNull();
    demo.recentGames.forEach((g) => {
      expect(typeof g.teamScore).toBe("number");
      expect(typeof g.oppScore).toBe("number");
      expect(typeof g.oppAbbr).toBe("string");
      expect(typeof g.drew).toBe("boolean");
    });
  });

  it("returns null for an unknown club", () => {
    expect(eredivisie.getDemoData("ZZZ")).toBeNull();
  });
});
