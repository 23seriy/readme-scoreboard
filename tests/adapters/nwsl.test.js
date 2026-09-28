const axios = require("axios");
const nwsl = require("../../src/adapters/nwsl");
const mls = require("../../src/adapters/mls");
const epl = require("../../src/adapters/epl");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("NwslAdapter — league config", () => {
  it("points at ESPN's NWSL slug", () => {
    expect(nwsl.LEAGUE_SLUG).toBe("usa.nwsl");
    expect(nwsl.baseUrl).toContain("/soccer/usa.nwsl");
    expect(nwsl.baseUrlV2).toContain("/soccer/usa.nwsl");
  });

  it("does not collide with MLS, the other US soccer league", () => {
    expect(nwsl.LEAGUE_SLUG).not.toBe(mls.LEAGUE_SLUG);
  });

  it("has all 16 clubs", () => {
    expect(Object.keys(nwsl.TEAM_IDS).length).toBe(16);
  });

  it("assigns every club a distinct ESPN id", () => {
    const ids = Object.values(nwsl.TEAM_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every club an emoji", () => {
    Object.keys(nwsl.TEAM_IDS).forEach((abbr) => {
      expect(nwsl.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("uses ESPN's authoritative ids", () => {
    expect(nwsl.TEAM_IDS.GFC).toBe(15364);
    expect(nwsl.TEAM_IDS.POR).toBe(15362);
    expect(nwsl.TEAM_IDS.KC).toBe(20907);
  });

  it("carries the 2026 expansion clubs, whose ids sit outside the founding range", () => {
    // Boston and Denver joined for 2026 — a hardcoded historical roster would
    // have omitted them.
    expect(nwsl.TEAM_IDS.BOS).toBe(131562);
    expect(nwsl.TEAM_IDS.DEN).toBe(131563);
  });

  it("never produces a placeholder logo id", () => {
    Object.keys(nwsl.TEAM_IDS).forEach((abbr) => {
      const url = nwsl.getLogoUrl(abbr);
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toMatch(/\/0\.png$/);
    });
  });
});

describe("NwslAdapter — abbreviations that collide with other leagues", () => {
  // Adapters are keyed independently, so sharing an abbreviation is harmless —
  // but each must resolve within its own league.
  it("POR resolves to Portland Thorns, not Portland Timbers (MLS)", () => {
    expect(nwsl.TEAM_IDS.POR).toBe(15362);
    expect(mls.TEAM_IDS.POR).toBe(9723);
    expect(nwsl.TEAM_IDS.POR).not.toBe(mls.TEAM_IDS.POR);
  });

  it("SEA resolves to Seattle Reign, not Seattle Sounders (MLS)", () => {
    expect(nwsl.TEAM_IDS.SEA).toBe(15363);
    expect(mls.TEAM_IDS.SEA).toBe(9726);
    expect(nwsl.TEAM_IDS.SEA).not.toBe(mls.TEAM_IDS.SEA);
  });

  it("HOU resolves to the Houston Dash, not the Houston Dynamo (MLS)", () => {
    expect(nwsl.TEAM_IDS.HOU).toBe(17346);
    expect(mls.TEAM_IDS.HOU).toBe(6077);
    expect(nwsl.TEAM_IDS.HOU).not.toBe(mls.TEAM_IDS.HOU);
  });
});

describe("NwslAdapter — season year (March–November, one calendar year)", () => {
  it("does not span calendar years", () => {
    expect(nwsl.SEASON_SPANS_YEARS).toBe(false);
    expect(epl.SEASON_SPANS_YEARS).toBe(true);
  });

  const seasonFor = (year, monthIndex, day = 15) => {
    jest.useFakeTimers().setSystemTime(new Date(year, monthIndex, day));
    const season = nwsl.getSeasonYear();
    jest.useRealTimers();
    return season;
  };

  it("mid-season (August) is the current year", () => {
    expect(seasonFor(2026, 7)).toBe(2026);
  });

  it("April is the current year, not the previous one", () => {
    expect(seasonFor(2026, 3)).toBe(2026);
  });
});

describe("NwslAdapter — fetchData", () => {
  const teamResponse = { data: { team: { id: 15364, abbreviation: "GFC", name: "Gotham FC", displayName: "Gotham FC" } } };

  const standingsResponse = {
    data: {
      children: [{
        name: "NWSL Regular Season",
        standings: {
          entries: [{
            team: { abbreviation: "GFC" },
            stats: [
              { name: "wins", value: 12 },
              { name: "losses", value: 3 },
              { name: "ties", value: 4 },
            ],
          }],
        },
      }],
    },
  };

  function fixture({ teamScore, oppScore, isHome = true, completed = true, date = "2026-08-07T23:00:00Z" }) {
    const mine = { homeAway: isHome ? "home" : "away", team: { id: 15364, abbreviation: "GFC" }, score: { value: teamScore } };
    const theirs = { homeAway: isHome ? "away" : "home", team: { id: 21423, abbreviation: "SD" }, score: { value: oppScore } };
    return { date, competitions: [{ status: { type: { completed } }, competitors: [mine, theirs] }] };
  }

  it("returns W/L/D from standings", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } });
    const result = await nwsl.fetchData("GFC");
    expect(result.record.wins).toBe(12);
    expect(result.record.losses).toBe(3);
    expect(result.record.draws).toBe(4);
  });

  it("flags a draw rather than a win or loss", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 2, oppScore: 2 })] } });
    const game = (await nwsl.fetchData("GFC")).recentGames[0];
    expect(game.drew).toBe(true);
    expect(game.won).toBe(false);
  });

  it("tracks scores correctly for an away fixture", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 1, oppScore: 0, isHome: false })] } });
    const game = (await nwsl.fetchData("GFC")).recentGames[0];
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
        fixture({ teamScore: 3, oppScore: 1, completed: true }),
        fixture({ teamScore: 0, oppScore: 0, completed: false }),
      ] } });
    expect((await nwsl.fetchData("GFC")).recentGames.length).toBe(1);
  });

  it("returns at most 5 fixtures, newest first", async () => {
    const dates = ["2026-06-05", "2026-06-12", "2026-06-19", "2026-06-26", "2026-07-03", "2026-07-10"];
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: dates.map((d) => fixture({ teamScore: 2, oppScore: 0, date: `${d}T23:00:00Z` })) } });
    const games = (await nwsl.fetchData("GFC")).recentGames;
    expect(games.length).toBe(5);
    expect(games[0].date).toContain("2026-07-10");
    expect(games[4].date).toContain("2026-06-12");
  });

  it("returns null when the club is unknown", async () => {
    axios.get.mockRejectedValue(new Error("404"));
    expect(await nwsl.fetchData("ZZZ")).toBeNull();
  });
});

describe("NwslAdapter — demo data", () => {
  it("includes the soccer-specific fields the renderer needs", () => {
    const demo = nwsl.getDemoData("GFC");
    expect(demo).not.toBeNull();
    demo.recentGames.forEach((g) => {
      expect(typeof g.teamScore).toBe("number");
      expect(typeof g.oppScore).toBe("number");
      expect(typeof g.oppAbbr).toBe("string");
      expect(typeof g.drew).toBe("boolean");
    });
  });

  it("returns null for an unknown club", () => {
    expect(nwsl.getDemoData("ZZZ")).toBeNull();
  });
});
