const axios = require("axios");
const wnba = require("../../src/adapters/wnba");
const nba = require("../../src/adapters/nba");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("WnbaAdapter — league config", () => {
  it("has all 15 clubs", () => {
    expect(Object.keys(wnba.TEAM_IDS).length).toBe(15);
  });

  it("assigns every club a distinct ESPN id", () => {
    const ids = Object.values(wnba.TEAM_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every club an emoji", () => {
    Object.keys(wnba.TEAM_IDS).forEach((abbr) => {
      expect(wnba.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("uses ESPN's authoritative ids", () => {
    expect(wnba.TEAM_IDS.MIN).toBe(8);
    expect(wnba.TEAM_IDS.NY).toBe(9);
    expect(wnba.TEAM_IDS.LV).toBe(17);
  });

  it("carries the expansion clubs, whose ids sit far outside the original range", () => {
    // Golden State, Portland and Toronto joined recently — hardcoding a
    // historical roster would silently omit them.
    expect(wnba.TEAM_IDS.GS).toBe(129689);
    expect(wnba.TEAM_IDS.POR).toBe(132052);
    expect(wnba.TEAM_IDS.TOR).toBe(131935);
  });

  it("builds logo URLs from the abbreviation, on the wnba path", () => {
    expect(wnba.getLogoUrl("MIN")).toBe("https://a.espncdn.com/i/teamlogos/wnba/500/min.png");
    expect(wnba.getLogoUrl("min")).toBe(wnba.getLogoUrl("MIN"));
  });

  it("never produces a placeholder logo id", () => {
    Object.keys(wnba.TEAM_IDS).forEach((abbr) => {
      expect(wnba.getLogoUrl(abbr)).toMatch(/^https:\/\/a\.espncdn\.com\/i\/teamlogos\/wnba\/500\/[a-z]+\.png$/);
    });
  });

  it("keeps abbreviations that collide with the NBA on their own sport's path", () => {
    // ATL, CHI, DAL, LA, MIN, PHX and WSH exist in both leagues.
    ["ATL", "CHI", "DAL", "MIN", "PHX"].forEach((abbr) => {
      expect(wnba.getLogoUrl(abbr)).toContain("/wnba/500/");
      expect(nba.getLogoUrl(abbr)).toContain("/nba/500/");
    });
  });
});

describe("WnbaAdapter — season year (May–Oct sits inside one calendar year)", () => {
  const seasonFor = (year, monthIndex, day = 15) => {
    jest.useFakeTimers().setSystemTime(new Date(year, monthIndex, day));
    const season = wnba.getSeasonYear();
    jest.useRealTimers();
    return season;
  };

  it("mid-season (August) is the current year", () => {
    expect(seasonFor(2026, 7)).toBe(2026);
  });

  it("January is still the current year — unlike the NBA, the season does not wrap", () => {
    expect(seasonFor(2026, 0)).toBe(2026);
  });

  it("December is the current year", () => {
    expect(seasonFor(2026, 11)).toBe(2026);
  });
});

describe("WnbaAdapter — fetchData", () => {
  const teamResponse = { data: { team: { id: 8, name: "Lynx", displayName: "Minnesota Lynx" } } };

  const standingsResponse = {
    data: {
      children: [
        {
          name: "Eastern Conference",
          standings: { entries: [{ team: { abbreviation: "NY" }, stats: [{ name: "wins", value: 21 }, { name: "losses", value: 14 }] }] },
        },
        {
          name: "Western Conference",
          standings: { entries: [{ team: { abbreviation: "MIN" }, stats: [{ name: "wins", value: 28 }, { name: "losses", value: 7 }] }] },
        },
      ],
    },
  };

  function game({ teamScore, oppScore, isHome = true, completed = true, date = "2026-08-12T02:00:00Z" }) {
    const mine = { homeAway: isHome ? "home" : "away", team: { abbreviation: "MIN" }, score: { value: teamScore } };
    const theirs = { homeAway: isHome ? "away" : "home", team: { abbreviation: "POR" }, score: { value: oppScore } };
    return { date, competitions: [{ status: { type: { completed } }, competitors: [mine, theirs] }] };
  }

  const mockCalls = ({ reg = [], post = [] }) => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: reg } })
      .mockResolvedValueOnce({ data: { events: post } });
  };

  it("returns the record and conference from standings", async () => {
    mockCalls({});
    const result = await wnba.fetchData("MIN");
    expect(result.record.wins).toBe(28);
    expect(result.record.losses).toBe(7);
    expect(result.team.conference).toBe("Western");
  });

  it("strips the word Conference so the renderer can append it", async () => {
    mockCalls({});
    const { team } = await wnba.fetchData("MIN");
    expect(team.conference).not.toContain("Conference");
  });

  it("finds a team in the other conference", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { team: { id: 9, name: "Liberty", displayName: "New York Liberty" } } })
      .mockResolvedValueOnce(standingsResponse)
      .mockResolvedValueOnce({ data: { events: [] } })
      .mockResolvedValueOnce({ data: { events: [] } });
    const { record, team } = await wnba.fetchData("NY");
    expect(record.wins).toBe(21);
    expect(team.conference).toBe("Eastern");
  });

  it("flags playoff games and leaves regular-season games unflagged", async () => {
    mockCalls({
      reg: [game({ teamScore: 90, oppScore: 80, date: "2026-08-01T02:00:00Z" })],
      post: [game({ teamScore: 81, oppScore: 86, date: "2026-09-29T02:00:00Z" })],
    });
    const games = (await wnba.fetchData("MIN")).recentGames;
    expect(games[0].postseason).toBe(true);
    expect(games[1].postseason).toBe(false);
  });

  it("tracks scores correctly for an away game", async () => {
    mockCalls({ reg: [game({ teamScore: 85, oppScore: 81, isHome: false })] });
    const g = (await wnba.fetchData("MIN")).recentGames[0];
    expect(g.visitor_team.abbreviation).toBe("MIN");
    expect(g.visitor_team_score).toBe(85);
    expect(g.home_team_score).toBe(81);
  });

  it("excludes games that have not finished", async () => {
    mockCalls({ reg: [
      game({ teamScore: 90, oppScore: 80, completed: true }),
      game({ teamScore: 0, oppScore: 0, completed: false }),
    ] });
    expect((await wnba.fetchData("MIN")).recentGames.length).toBe(1);
  });

  it("returns at most 5 games, newest first", async () => {
    const dates = ["2026-07-01", "2026-07-08", "2026-07-15", "2026-07-22", "2026-08-01", "2026-08-08"];
    mockCalls({ reg: dates.map((d) => game({ teamScore: 90, oppScore: 80, date: `${d}T02:00:00Z` })) });
    const games = (await wnba.fetchData("MIN")).recentGames;
    expect(games.length).toBe(5);
    expect(games[0].date).toContain("2026-08-08");
    expect(games[4].date).toContain("2026-07-08");
  });

  it("returns null for an unknown club without calling the API", async () => {
    expect(await wnba.fetchData("ZZZ")).toBeNull();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("returns null when the API fails", async () => {
    axios.get.mockRejectedValue(new Error("500"));
    expect(await wnba.fetchData("MIN")).toBeNull();
  });
});

describe("WnbaAdapter — demo data", () => {
  it("includes the fields the renderer needs", () => {
    const demo = wnba.getDemoData("MIN");
    expect(demo).not.toBeNull();
    expect(demo.record.wins).toBeGreaterThan(0);
    demo.recentGames.forEach((g) => {
      expect(typeof g.home_team_score).toBe("number");
      expect(typeof g.visitor_team_score).toBe("number");
      expect(typeof g.postseason).toBe("boolean");
    });
  });

  it("has no division, since the WNBA does not use them", () => {
    expect(wnba.getDemoData("MIN").team.division).toBe("");
  });

  it("returns null for an unknown club", () => {
    expect(wnba.getDemoData("ZZZ")).toBeNull();
  });

  it("includes richer stats in demo data", () => {
    const demo = wnba.getDemoData("MIN");
    expect(demo.standing.position).toBeTruthy();
    expect(Array.isArray(demo.form)).toBe(true);
    expect(demo.nextGame.opponent).toBeTruthy();
  });
});

describe("WnbaAdapter — rich stats helpers", () => {
  function event({ completed = true, homeId = 8, awayId = 3, homeScore = 2, awayScore = 1, date = "2026-08-01T00:00:00Z" }) {
    const home = { homeAway: "home", team: { id: homeId, abbreviation: "MIN" }, score: { value: homeScore } };
    const away = { homeAway: "away", team: { id: awayId, abbreviation: "POR" }, score: { value: awayScore } };
    return { date, competitions: [{ status: { type: { completed } }, competitors: [home, away] }] };
  }

  it("parseForm returns last five results as W/D/L", () => {
    const events = [
      event({ homeScore: 2, awayScore: 1, date: "2026-08-01T00:00:00Z" }), // W
      event({ homeScore: 1, awayScore: 1, date: "2026-08-02T00:00:00Z" }), // D
      event({ homeScore: 0, awayScore: 2, date: "2026-08-03T00:00:00Z" }), // L
    ];
    expect(wnba.parseForm(events, "MIN")).toEqual(["W", "D", "L"]);
  });

  it("parseNextGame returns the first upcoming fixture", () => {
    const upcoming = {
      date: "2026-08-10T00:00:00Z",
      competitions: [{
        status: { type: { completed: false } },
        competitors: [
          { homeAway: "home", team: { id: 8, abbreviation: "MIN" }, score: { value: 0 } },
          { homeAway: "away", team: { id: 3, abbreviation: "POR" }, score: { value: 0 } },
        ],
      }],
    };
    const next = wnba.parseNextGame([upcoming], "MIN");
    expect(next.date).toContain("2026-08-10");
    expect(next.isHome).toBe(true);
  });

  it("parseNextGame returns null when there is no upcoming fixture", () => {
    expect(wnba.parseNextGame([], "MIN")).toBeNull();
  });
});
