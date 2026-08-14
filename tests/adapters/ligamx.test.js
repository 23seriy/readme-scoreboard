const axios = require("axios");
const ligamx = require("../../src/adapters/ligamx");
const eredivisie = require("../../src/adapters/eredivisie");
const primeiraliga = require("../../src/adapters/primeiraliga");
const ligue1 = require("../../src/adapters/ligue1");
const seriea = require("../../src/adapters/seriea");
const bundesliga = require("../../src/adapters/bundesliga");
const laliga = require("../../src/adapters/laliga");
const epl = require("../../src/adapters/epl");
const mls = require("../../src/adapters/mls");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("LigaMxAdapter — league config", () => {
  it("points at ESPN's Liga MX slug", () => {
    expect(ligamx.LEAGUE_SLUG).toBe("mex.1");
    expect(ligamx.baseUrl).toContain("/soccer/mex.1");
    expect(ligamx.baseUrlV2).toContain("/soccer/mex.1");
  });

  it("does not collide with the other soccer leagues", () => {
    const slugs = [ligamx, eredivisie, primeiraliga, ligue1, seriea, bundesliga, laliga, epl, mls].map((a) => a.LEAGUE_SLUG);
    expect(new Set(slugs).size).toBe(9);
  });

  it("has all 18 clubs", () => {
    expect(Object.keys(ligamx.TEAM_IDS).length).toBe(18);
  });

  it("assigns every club a distinct ESPN id", () => {
    const ids = Object.values(ligamx.TEAM_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every club an emoji", () => {
    Object.keys(ligamx.TEAM_IDS).forEach((abbr) => {
      expect(ligamx.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("uses ESPN's authoritative ids", () => {
    expect(ligamx.TEAM_IDS.AME).toBe(227);
    expect(ligamx.TEAM_IDS.GDL).toBe(219);
    expect(ligamx.TEAM_IDS.CAZ).toBe(218);
    expect(ligamx.TEAM_IDS.UANL).toBe(232);
  });

  it("never produces a placeholder logo id", () => {
    Object.keys(ligamx.TEAM_IDS).forEach((abbr) => {
      const url = ligamx.getLogoUrl(abbr);
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toMatch(/\/0\.png$/);
    });
  });
});

describe("LigaMxAdapter — split-season calendar", () => {
  // Liga MX plays two short tournaments a year rather than one long season,
  // so unlike the European leagues its label stays within one calendar year.
  it("does not span calendar years", () => {
    expect(ligamx.SEASON_SPANS_YEARS).toBe(false);
    expect(epl.SEASON_SPANS_YEARS).toBe(true);
  });

  const seasonFor = (year, monthIndex, day = 15) => {
    jest.useFakeTimers().setSystemTime(new Date(year, monthIndex, day));
    const season = ligamx.getSeasonYear();
    jest.useRealTimers();
    return season;
  };

  it("the Apertura half (August) reports the current year", () => {
    expect(seasonFor(2026, 7)).toBe(2026);
  });

  it("the Clausura half (March) also reports the current year, not the previous one", () => {
    // An Aug–May league would map March back to the prior year. Liga MX must not.
    expect(seasonFor(2026, 2)).toBe(2026);
  });
});

describe("LigaMxAdapter — fetchData", () => {
  const teamResponse = { data: { team: { id: 227, abbreviation: "AME", name: "América", displayName: "América" } } };

  // ESPN groups Liga MX standings by tournament, not by conference.
  const standingsResponse = {
    data: {
      children: [{
        name: "2026 Torneo Apertura",
        standings: {
          entries: [{
            team: { abbreviation: "AME" },
            stats: [
              { name: "wins", value: 2 },
              { name: "losses", value: 0 },
              { name: "ties", value: 1 },
            ],
          }],
        },
      }],
    },
  };

  function fixture({ teamScore, oppScore, isHome = true, completed = true, date = "2026-08-02T02:00:00Z" }) {
    const mine = { homeAway: isHome ? "home" : "away", team: { id: 227, abbreviation: "AME" }, score: { value: teamScore } };
    const theirs = { homeAway: isHome ? "away" : "home", team: { id: 225, abbreviation: "SAN" }, score: { value: oppScore } };
    return { date, competitions: [{ status: { type: { completed } }, competitors: [mine, theirs] }] };
  }

  it("returns W/L/D from standings", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const result = await ligamx.fetchData("AME");
    expect(result.record.wins).toBe(2);
    expect(result.record.losses).toBe(0);
    expect(result.record.draws).toBe(1);
  });

  it("surfaces the tournament name, so the record's scope is visible", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const { team } = await ligamx.fetchData("AME");
    expect(team.conference).toBe("2026 Torneo Apertura");
  });

  it("a tournament is 17 matches, not a 34- or 38-game season", async () => {
    const full = {
      data: {
        children: [{
          name: "2025 Torneo Clausura",
          standings: {
            entries: [{
              team: { abbreviation: "AME" },
              stats: [
                { name: "wins", value: 10 },
                { name: "losses", value: 4 },
                { name: "ties", value: 3 },
              ],
            }],
          },
        }],
      },
    };
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(full)
      .mockResolvedValueOnce({ data: { events: [] } });
    const { record } = await ligamx.fetchData("AME");
    expect(record.wins + record.losses + record.draws).toBe(17);
  });

  it("flags a draw rather than a win or loss", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 1, oppScore: 1 })] } });
    const game = (await ligamx.fetchData("AME")).recentGames[0];
    expect(game.drew).toBe(true);
    expect(game.won).toBe(false);
  });

  it("tracks scores correctly for an away fixture", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 1, oppScore: 0, isHome: false })] } });
    const game = (await ligamx.fetchData("AME")).recentGames[0];
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
        fixture({ teamScore: 3, oppScore: 0, completed: true }),
        fixture({ teamScore: 0, oppScore: 0, completed: false }),
      ] } });
    expect((await ligamx.fetchData("AME")).recentGames.length).toBe(1);
  });

  it("returns at most 5 fixtures, newest first", async () => {
    const dates = ["2026-07-05", "2026-07-12", "2026-07-19", "2026-07-26", "2026-08-02", "2026-08-09"];
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: dates.map((d) => fixture({ teamScore: 2, oppScore: 0, date: `${d}T02:00:00Z` })) } });
    const games = (await ligamx.fetchData("AME")).recentGames;
    expect(games.length).toBe(5);
    expect(games[0].date).toContain("2026-08-09");
    expect(games[4].date).toContain("2026-07-12");
  });

  it("returns null when the club is unknown", async () => {
    axios.get.mockRejectedValue(new Error("404"));
    expect(await ligamx.fetchData("ZZZ")).toBeNull();
  });
});

describe("LigaMxAdapter — demo data", () => {
  it("includes the soccer-specific fields the renderer needs", () => {
    const demo = ligamx.getDemoData("AME");
    expect(demo).not.toBeNull();
    demo.recentGames.forEach((g) => {
      expect(typeof g.teamScore).toBe("number");
      expect(typeof g.oppScore).toBe("number");
      expect(typeof g.oppAbbr).toBe("string");
      expect(typeof g.drew).toBe("boolean");
    });
  });

  it("returns null for an unknown club", () => {
    expect(ligamx.getDemoData("ZZZ")).toBeNull();
  });
});
