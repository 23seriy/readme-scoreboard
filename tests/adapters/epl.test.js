const axios = require("axios");
const epl = require("../../src/adapters/epl");
const mls = require("../../src/adapters/mls");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("EplAdapter — league config", () => {
  it("points at ESPN's Premier League slug", () => {
    expect(epl.LEAGUE_SLUG).toBe("eng.1");
    expect(epl.baseUrl).toContain("/soccer/eng.1");
    expect(epl.baseUrlV2).toContain("/soccer/eng.1");
  });

  it("does not collide with the MLS slug", () => {
    expect(epl.LEAGUE_SLUG).not.toBe(mls.LEAGUE_SLUG);
  });

  it("has all 20 clubs", () => {
    expect(Object.keys(epl.TEAM_IDS).length).toBe(20);
  });

  it("assigns every club a distinct ESPN id", () => {
    const ids = Object.values(epl.TEAM_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every club an emoji", () => {
    Object.keys(epl.TEAM_IDS).forEach((abbr) => {
      expect(epl.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("uses ESPN's authoritative ids", () => {
    expect(epl.TEAM_IDS.LIV).toBe(364);
    expect(epl.TEAM_IDS.ARS).toBe(359);
    expect(epl.TEAM_IDS.MNC).toBe(382);
    expect(epl.TEAM_IDS.MAN).toBe(360);
  });

  it("never produces a placeholder logo id", () => {
    Object.keys(epl.TEAM_IDS).forEach((abbr) => {
      const url = epl.getLogoUrl(abbr);
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toMatch(/\/0\.png$/);
    });
  });
});

describe("EplAdapter — season year (Aug–May wraps the calendar year)", () => {
  const seasonFor = (year, monthIndex, day = 15) => {
    jest.useFakeTimers().setSystemTime(new Date(year, monthIndex, day));
    const season = epl.getSeasonYear();
    jest.useRealTimers();
    return season;
  };

  it("August belongs to the season starting that year", () => {
    expect(seasonFor(2026, 7)).toBe(2026);
  });

  it("December belongs to the season that started in August", () => {
    expect(seasonFor(2026, 11)).toBe(2026);
  });

  it("January belongs to the previous year's season", () => {
    expect(seasonFor(2027, 0)).toBe(2026);
  });

  it("May (season end) still belongs to the previous year's season", () => {
    expect(seasonFor(2027, 4)).toBe(2026);
  });

  it("MLS is unaffected — its season sits in one calendar year", () => {
    jest.useFakeTimers().setSystemTime(new Date(2027, 0, 15));
    expect(mls.getSeasonYear()).toBe(2027);
    jest.useRealTimers();
  });
});

describe("EplAdapter — fetchData", () => {
  const teamResponse = { data: { team: { id: 364, abbreviation: "LIV", name: "Liverpool", displayName: "Liverpool" } } };

  const standingsResponse = {
    data: {
      children: [{
        name: "English Premier League",
        standings: {
          entries: [{
            team: { abbreviation: "LIV" },
            stats: [
              { name: "wins", value: 17 },
              { name: "losses", value: 12 },
              { name: "ties", value: 9 },
            ],
          }],
        },
      }],
    },
  };

  function fixture({ teamScore, oppScore, isHome = true, completed = true, date = "2026-05-24T14:00:00Z" }) {
    const mine = { homeAway: isHome ? "home" : "away", team: { id: 364, abbreviation: "LIV" }, score: { value: teamScore } };
    const theirs = { homeAway: isHome ? "away" : "home", team: { id: 337, abbreviation: "BRE" }, score: { value: oppScore } };
    return { date, competitions: [{ status: { type: { completed } }, competitors: [mine, theirs] }] };
  }

  it("returns W/L/D from standings", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const result = await epl.fetchData("LIV");
    expect(result.record.wins).toBe(17);
    expect(result.record.losses).toBe(12);
    expect(result.record.draws).toBe(9);
  });

  it("flags a draw rather than a win or loss", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 1, oppScore: 1 })] } });
    const result = await epl.fetchData("LIV");
    expect(result.recentGames[0].drew).toBe(true);
    expect(result.recentGames[0].won).toBe(false);
  });

  it("marks a win", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 3, oppScore: 1 })] } });
    const game = (await epl.fetchData("LIV")).recentGames[0];
    expect(game.won).toBe(true);
    expect(game.drew).toBe(false);
  });

  it("tracks scores correctly for an away fixture", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 2, oppScore: 4, isHome: false })] } });
    const game = (await epl.fetchData("LIV")).recentGames[0];
    expect(game.isHome).toBe(false);
    expect(game.teamScore).toBe(2);
    expect(game.oppScore).toBe(4);
    expect(game.visitor_team_score).toBe(2);
    expect(game.home_team_score).toBe(4);
  });

  it("excludes fixtures that have not been played", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [
        fixture({ teamScore: 1, oppScore: 0, completed: true }),
        fixture({ teamScore: 0, oppScore: 0, completed: false }),
      ] } });
    expect((await epl.fetchData("LIV")).recentGames.length).toBe(1);
  });

  it("returns at most 5 fixtures, newest first", async () => {
    const dates = ["2026-04-01", "2026-04-08", "2026-04-15", "2026-04-22", "2026-05-01", "2026-05-09"];
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: dates.map((d) => fixture({ teamScore: 1, oppScore: 0, date: `${d}T14:00:00Z` })) } });
    const games = (await epl.fetchData("LIV")).recentGames;
    expect(games.length).toBe(5);
    expect(games[0].date).toContain("2026-05-09");
    expect(games[4].date).toContain("2026-04-08");
  });

  it("returns null when the club is unknown", async () => {
    axios.get.mockRejectedValue(new Error("404"));
    expect(await epl.fetchData("ZZZ")).toBeNull();
  });
});

describe("EplAdapter — demo data", () => {
  it("includes the soccer-specific fields the renderer needs", () => {
    const demo = epl.getDemoData("LIV");
    expect(demo).not.toBeNull();
    demo.recentGames.forEach((g) => {
      expect(typeof g.teamScore).toBe("number");
      expect(typeof g.oppScore).toBe("number");
      expect(typeof g.oppAbbr).toBe("string");
      expect(typeof g.drew).toBe("boolean");
    });
  });

  it("covers a win, a draw and a loss", () => {
    const games = epl.getDemoData("LIV").recentGames;
    expect(games.some((g) => g.won)).toBe(true);
    expect(games.some((g) => g.drew)).toBe(true);
    expect(games.some((g) => !g.won && !g.drew)).toBe(true);
  });

  it("returns null for an unknown club", () => {
    expect(epl.getDemoData("ZZZ")).toBeNull();
  });
});