const axios = require("axios");
const bundesliga = require("../../src/adapters/bundesliga");
const laliga = require("../../src/adapters/laliga");
const epl = require("../../src/adapters/epl");
const mls = require("../../src/adapters/mls");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("BundesligaAdapter — league config", () => {
  it("points at ESPN's Bundesliga slug", () => {
    expect(bundesliga.LEAGUE_SLUG).toBe("ger.1");
    expect(bundesliga.baseUrl).toContain("/soccer/ger.1");
    expect(bundesliga.baseUrlV2).toContain("/soccer/ger.1");
  });

  it("does not collide with the other soccer leagues", () => {
    const slugs = [bundesliga, laliga, epl, mls].map((a) => a.LEAGUE_SLUG);
    expect(new Set(slugs).size).toBe(4);
  });

  it("has all 18 clubs (the Bundesliga is smaller than the 20-team leagues)", () => {
    expect(Object.keys(bundesliga.TEAM_IDS).length).toBe(18);
  });

  it("assigns every club a distinct ESPN id", () => {
    const ids = Object.values(bundesliga.TEAM_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every club an emoji", () => {
    Object.keys(bundesliga.TEAM_IDS).forEach((abbr) => {
      expect(bundesliga.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("uses ESPN's authoritative ids", () => {
    expect(bundesliga.TEAM_IDS.MUN).toBe(132);
    expect(bundesliga.TEAM_IDS.DOR).toBe(124);
    expect(bundesliga.TEAM_IDS.B04).toBe(131);
    expect(bundesliga.TEAM_IDS.RBL).toBe(11420);
  });

  it("never produces a placeholder logo id", () => {
    Object.keys(bundesliga.TEAM_IDS).forEach((abbr) => {
      const url = bundesliga.getLogoUrl(abbr);
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toMatch(/\/0\.png$/);
    });
  });
});

describe("BundesligaAdapter — season year (Aug–May wraps the calendar year)", () => {
  const seasonFor = (year, monthIndex, day = 15) => {
    jest.useFakeTimers().setSystemTime(new Date(year, monthIndex, day));
    const season = bundesliga.getSeasonYear();
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

describe("BundesligaAdapter — fetchData", () => {
  const teamResponse = { data: { team: { id: 132, abbreviation: "MUN", name: "Bayern Munich", displayName: "Bayern Munich" } } };

  const standingsResponse = {
    data: {
      children: [{
        name: "German Bundesliga",
        standings: {
          entries: [{
            team: { abbreviation: "MUN" },
            stats: [
              { name: "wins", value: 28 },
              { name: "losses", value: 1 },
              { name: "ties", value: 5 },
            ],
          }],
        },
      }],
    },
  };

  function fixture({ teamScore, oppScore, isHome = true, completed = true, date = "2026-05-16T13:30:00Z" }) {
    const mine = { homeAway: isHome ? "home" : "away", team: { id: 132, abbreviation: "MUN" }, score: { value: teamScore } };
    const theirs = { homeAway: isHome ? "away" : "home", team: { id: 124, abbreviation: "DOR" }, score: { value: oppScore } };
    return { date, competitions: [{ status: { type: { completed } }, competitors: [mine, theirs] }] };
  }

  it("returns W/L/D from standings", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const result = await bundesliga.fetchData("MUN");
    expect(result.record.wins).toBe(28);
    expect(result.record.losses).toBe(1);
    expect(result.record.draws).toBe(5);
  });

  it("a full 18-team season totals 34 matches", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const { record } = await bundesliga.fetchData("MUN");
    expect(record.wins + record.losses + record.draws).toBe(34);
  });

  it("flags a draw rather than a win or loss", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 3, oppScore: 3 })] } });
    const game = (await bundesliga.fetchData("MUN")).recentGames[0];
    expect(game.drew).toBe(true);
    expect(game.won).toBe(false);
  });

  it("tracks scores correctly for an away fixture", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 1, oppScore: 0, isHome: false })] } });
    const game = (await bundesliga.fetchData("MUN")).recentGames[0];
    expect(game.isHome).toBe(false);
    expect(game.teamScore).toBe(1);
    expect(game.visitor_team_score).toBe(1);
    expect(game.home_team_score).toBe(0);
  });

  it("excludes fixtures that have not been played", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [
        fixture({ teamScore: 5, oppScore: 1, completed: true }),
        fixture({ teamScore: 0, oppScore: 0, completed: false }),
      ] } });
    expect((await bundesliga.fetchData("MUN")).recentGames.length).toBe(1);
  });

  it("returns at most 5 fixtures, newest first", async () => {
    const dates = ["2026-04-05", "2026-04-12", "2026-04-19", "2026-04-26", "2026-05-03", "2026-05-10"];
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: dates.map((d) => fixture({ teamScore: 2, oppScore: 0, date: `${d}T13:30:00Z` })) } });
    const games = (await bundesliga.fetchData("MUN")).recentGames;
    expect(games.length).toBe(5);
    expect(games[0].date).toContain("2026-05-10");
    expect(games[4].date).toContain("2026-04-12");
  });

  it("returns null when the club is unknown", async () => {
    axios.get.mockRejectedValue(new Error("404"));
    expect(await bundesliga.fetchData("ZZZ")).toBeNull();
  });
});

describe("BundesligaAdapter — demo data", () => {
  it("includes the soccer-specific fields the renderer needs", () => {
    const demo = bundesliga.getDemoData("MUN");
    expect(demo).not.toBeNull();
    demo.recentGames.forEach((g) => {
      expect(typeof g.teamScore).toBe("number");
      expect(typeof g.oppScore).toBe("number");
      expect(typeof g.oppAbbr).toBe("string");
      expect(typeof g.drew).toBe("boolean");
    });
  });

  it("returns null for an unknown club", () => {
    expect(bundesliga.getDemoData("ZZZ")).toBeNull();
  });
});