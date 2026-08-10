const axios = require("axios");
const laliga = require("../../src/adapters/laliga");
const epl = require("../../src/adapters/epl");
const mls = require("../../src/adapters/mls");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("LaLigaAdapter — league config", () => {
  it("points at ESPN's La Liga slug", () => {
    expect(laliga.LEAGUE_SLUG).toBe("esp.1");
    expect(laliga.baseUrl).toContain("/soccer/esp.1");
    expect(laliga.baseUrlV2).toContain("/soccer/esp.1");
  });

  it("does not collide with the other soccer leagues", () => {
    const slugs = [laliga.LEAGUE_SLUG, epl.LEAGUE_SLUG, mls.LEAGUE_SLUG];
    expect(new Set(slugs).size).toBe(3);
  });

  it("has all 20 clubs", () => {
    expect(Object.keys(laliga.TEAM_IDS).length).toBe(20);
  });

  it("assigns every club a distinct ESPN id", () => {
    const ids = Object.values(laliga.TEAM_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every club an emoji", () => {
    Object.keys(laliga.TEAM_IDS).forEach((abbr) => {
      expect(laliga.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("uses ESPN's authoritative ids", () => {
    expect(laliga.TEAM_IDS.RMA).toBe(86);
    expect(laliga.TEAM_IDS.BAR).toBe(83);
    expect(laliga.TEAM_IDS.ATM).toBe(1068);
    expect(laliga.TEAM_IDS.SEV).toBe(243);
  });

  it("never produces a placeholder logo id", () => {
    Object.keys(laliga.TEAM_IDS).forEach((abbr) => {
      const url = laliga.getLogoUrl(abbr);
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toMatch(/\/0\.png$/);
    });
  });
});

describe("LaLigaAdapter — season year (Aug–May wraps the calendar year)", () => {
  const seasonFor = (year, monthIndex, day = 15) => {
    jest.useFakeTimers().setSystemTime(new Date(year, monthIndex, day));
    const season = laliga.getSeasonYear();
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

describe("LaLigaAdapter — fetchData", () => {
  const teamResponse = { data: { team: { id: 86, abbreviation: "RMA", name: "Real Madrid", displayName: "Real Madrid" } } };

  const standingsResponse = {
    data: {
      children: [{
        name: "LALIGA",
        standings: {
          entries: [{
            team: { abbreviation: "RMA" },
            stats: [
              { name: "wins", value: 27 },
              { name: "losses", value: 6 },
              { name: "ties", value: 5 },
            ],
          }],
        },
      }],
    },
  };

  function fixture({ teamScore, oppScore, isHome = true, completed = true, date = "2026-05-23T19:00:00Z" }) {
    const mine = { homeAway: isHome ? "home" : "away", team: { id: 86, abbreviation: "RMA" }, score: { value: teamScore } };
    const theirs = { homeAway: isHome ? "away" : "home", team: { id: 83, abbreviation: "BAR" }, score: { value: oppScore } };
    return { date, competitions: [{ status: { type: { completed } }, competitors: [mine, theirs] }] };
  }

  it("returns W/L/D from standings", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const result = await laliga.fetchData("RMA");
    expect(result.record.wins).toBe(27);
    expect(result.record.losses).toBe(6);
    expect(result.record.draws).toBe(5);
  });

  it("flags a draw rather than a win or loss", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 2, oppScore: 2 })] } });
    const game = (await laliga.fetchData("RMA")).recentGames[0];
    expect(game.drew).toBe(true);
    expect(game.won).toBe(false);
  });

  it("tracks scores correctly for an away fixture", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 0, oppScore: 2, isHome: false })] } });
    const game = (await laliga.fetchData("RMA")).recentGames[0];
    expect(game.isHome).toBe(false);
    expect(game.teamScore).toBe(0);
    expect(game.oppScore).toBe(2);
    expect(game.visitor_team_score).toBe(0);
    expect(game.home_team_score).toBe(2);
  });

  it("excludes fixtures that have not been played", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [
        fixture({ teamScore: 1, oppScore: 0, completed: true }),
        fixture({ teamScore: 0, oppScore: 0, completed: false }),
      ] } });
    expect((await laliga.fetchData("RMA")).recentGames.length).toBe(1);
  });

  it("returns at most 5 fixtures, newest first", async () => {
    const dates = ["2026-04-05", "2026-04-12", "2026-04-19", "2026-04-26", "2026-05-03", "2026-05-10"];
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: dates.map((d) => fixture({ teamScore: 1, oppScore: 0, date: `${d}T19:00:00Z` })) } });
    const games = (await laliga.fetchData("RMA")).recentGames;
    expect(games.length).toBe(5);
    expect(games[0].date).toContain("2026-05-10");
    expect(games[4].date).toContain("2026-04-12");
  });

  it("returns null when the club is unknown", async () => {
    axios.get.mockRejectedValue(new Error("404"));
    expect(await laliga.fetchData("ZZZ")).toBeNull();
  });
});

describe("LaLigaAdapter — demo data", () => {
  it("includes the soccer-specific fields the renderer needs", () => {
    const demo = laliga.getDemoData("RMA");
    expect(demo).not.toBeNull();
    demo.recentGames.forEach((g) => {
      expect(typeof g.teamScore).toBe("number");
      expect(typeof g.oppScore).toBe("number");
      expect(typeof g.oppAbbr).toBe("string");
      expect(typeof g.drew).toBe("boolean");
    });
  });

  it("returns null for an unknown club", () => {
    expect(laliga.getDemoData("ZZZ")).toBeNull();
  });
});