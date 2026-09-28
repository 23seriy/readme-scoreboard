const axios = require("axios");
const seriea = require("../../src/adapters/seriea");
const bundesliga = require("../../src/adapters/bundesliga");
const laliga = require("../../src/adapters/laliga");
const epl = require("../../src/adapters/epl");
const mls = require("../../src/adapters/mls");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("SerieAAdapter — league config", () => {
  it("points at ESPN's Serie A slug", () => {
    expect(seriea.LEAGUE_SLUG).toBe("ita.1");
    expect(seriea.baseUrl).toContain("/soccer/ita.1");
    expect(seriea.baseUrlV2).toContain("/soccer/ita.1");
  });

  it("does not collide with the other soccer leagues", () => {
    const slugs = [seriea, bundesliga, laliga, epl, mls].map((a) => a.LEAGUE_SLUG);
    expect(new Set(slugs).size).toBe(5);
  });

  it("has all 20 clubs", () => {
    expect(Object.keys(seriea.TEAM_IDS).length).toBe(20);
  });

  it("assigns every club a distinct ESPN id", () => {
    const ids = Object.values(seriea.TEAM_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every club an emoji", () => {
    Object.keys(seriea.TEAM_IDS).forEach((abbr) => {
      expect(seriea.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("uses ESPN's authoritative ids", () => {
    expect(seriea.TEAM_IDS.INT).toBe(110);
    expect(seriea.TEAM_IDS.JUV).toBe(111);
    expect(seriea.TEAM_IDS.MIL).toBe(103);
    expect(seriea.TEAM_IDS.ROMA).toBe(104);
    expect(seriea.TEAM_IDS.NAP).toBe(114);
  });

  it("never produces a placeholder logo id", () => {
    Object.keys(seriea.TEAM_IDS).forEach((abbr) => {
      const url = seriea.getLogoUrl(abbr);
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toMatch(/\/0\.png$/);
    });
  });

  it("keeps TOR (Torino) separate from the NHL and MLB clubs sharing that abbreviation", () => {
    // Adapters are keyed independently, so the collision is harmless — but
    // Serie A's TOR must resolve to Torino's soccer id, not a hockey team.
    expect(seriea.TEAM_IDS.TOR).toBe(239);
    expect(seriea.getLogoUrl("TOR")).toContain("/soccer/500/239.png");
  });
});

describe("SerieAAdapter — season year (Aug–May wraps the calendar year)", () => {
  const seasonFor = (year, monthIndex, day = 15) => {
    jest.useFakeTimers().setSystemTime(new Date(year, monthIndex, day));
    const season = seriea.getSeasonYear();
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

describe("SerieAAdapter — fetchData", () => {
  const teamResponse = { data: { team: { id: 110, abbreviation: "INT", name: "Internazionale", displayName: "Internazionale" } } };

  const standingsResponse = {
    data: {
      children: [{
        name: "Italian Serie A",
        standings: {
          entries: [{
            team: { abbreviation: "INT" },
            stats: [
              { name: "wins", value: 27 },
              { name: "losses", value: 5 },
              { name: "ties", value: 6 },
            ],
          }],
        },
      }],
    },
  };

  function fixture({ teamScore, oppScore, isHome = true, completed = true, date = "2026-05-23T18:45:00Z" }) {
    const mine = { homeAway: isHome ? "home" : "away", team: { id: 110, abbreviation: "INT" }, score: { value: teamScore } };
    const theirs = { homeAway: isHome ? "away" : "home", team: { id: 111, abbreviation: "JUV" }, score: { value: oppScore } };
    return { date, competitions: [{ status: { type: { completed } }, competitors: [mine, theirs] }] };
  }

  it("returns W/L/D from standings", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const result = await seriea.fetchData("INT");
    expect(result.record.wins).toBe(27);
    expect(result.record.losses).toBe(5);
    expect(result.record.draws).toBe(6);
  });

  it("a full 20-team season totals 38 matches", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const { record } = await seriea.fetchData("INT");
    expect(record.wins + record.losses + record.draws).toBe(38);
  });

  it("flags a draw rather than a win or loss", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 3, oppScore: 3 })] } });
    const game = (await seriea.fetchData("INT")).recentGames[0];
    expect(game.drew).toBe(true);
    expect(game.won).toBe(false);
  });

  it("handles a 0-0 draw (Serie A sees many)", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 0, oppScore: 0 })] } });
    const game = (await seriea.fetchData("INT")).recentGames[0];
    expect(game.drew).toBe(true);
    expect(game.teamScore).toBe(0);
    expect(game.oppScore).toBe(0);
  });

  it("tracks scores correctly for an away fixture", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 3, oppScore: 0, isHome: false })] } });
    const game = (await seriea.fetchData("INT")).recentGames[0];
    expect(game.isHome).toBe(false);
    expect(game.teamScore).toBe(3);
    expect(game.visitor_team_score).toBe(3);
    expect(game.home_team_score).toBe(0);
  });

  it("excludes fixtures that have not been played", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [
        fixture({ teamScore: 2, oppScore: 0, completed: true }),
        fixture({ teamScore: 0, oppScore: 0, completed: false }),
      ] } });
    expect((await seriea.fetchData("INT")).recentGames.length).toBe(1);
  });

  it("returns at most 5 fixtures, newest first", async () => {
    const dates = ["2026-04-05", "2026-04-12", "2026-04-19", "2026-04-26", "2026-05-03", "2026-05-10"];
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: dates.map((d) => fixture({ teamScore: 1, oppScore: 0, date: `${d}T18:45:00Z` })) } });
    const games = (await seriea.fetchData("INT")).recentGames;
    expect(games.length).toBe(5);
    expect(games[0].date).toContain("2026-05-10");
    expect(games[4].date).toContain("2026-04-12");
  });

  it("returns null when the club is unknown", async () => {
    axios.get.mockRejectedValue(new Error("404"));
    expect(await seriea.fetchData("ZZZ")).toBeNull();
  });
});

describe("SerieAAdapter — demo data", () => {
  it("includes the soccer-specific fields the renderer needs", () => {
    const demo = seriea.getDemoData("INT");
    expect(demo).not.toBeNull();
    demo.recentGames.forEach((g) => {
      expect(typeof g.teamScore).toBe("number");
      expect(typeof g.oppScore).toBe("number");
      expect(typeof g.oppAbbr).toBe("string");
      expect(typeof g.drew).toBe("boolean");
    });
  });

  it("returns null for an unknown club", () => {
    expect(seriea.getDemoData("ZZZ")).toBeNull();
  });
});