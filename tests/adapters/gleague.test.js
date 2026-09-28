const axios = require("axios");
const gleague = require("../../src/adapters/gleague");
const nba = require("../../src/adapters/nba");
const wnba = require("../../src/adapters/wnba");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("GLeagueAdapter — league config", () => {
  it("has all 31 teams", () => {
    expect(Object.keys(gleague.TEAM_IDS).length).toBe(31);
  });

  it("assigns every team a distinct ESPN id", () => {
    const ids = Object.values(gleague.TEAM_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every team an emoji", () => {
    Object.keys(gleague.TEAM_IDS).forEach((abbr) => {
      expect(gleague.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("uses ESPN's authoritative ids", () => {
    expect(gleague.TEAM_IDS.OSC).toBe(11);
    expect(gleague.TEAM_IDS.RAP).toBe(17);
    expect(gleague.TEAM_IDS.MXC).toBe(124612);
  });
});

describe("GLeagueAdapter — logo paths", () => {
  it("builds most logos from the lowercase abbreviation", () => {
    expect(gleague.getLogoUrl("OSC")).toBe("https://a.espncdn.com/i/teamlogos/nba-development/500/osc.png");
    expect(gleague.getLogoUrl("osc")).toBe(gleague.getLogoUrl("OSC"));
  });

  it("uses the GUID path for the two clubs ESPN files there", () => {
    // Noblesville and Coachella Valley were rebranded recently; their logos
    // 404 on the standard /nba-development/500/<abbr>.png path.
    expect(gleague.getLogoUrl("NOB")).toContain("/guid/");
    expect(gleague.getLogoUrl("CVL")).toContain("/guid/");
    expect(gleague.getLogoUrl("NOB")).not.toContain("/nba-development/500/nob.png");
    expect(gleague.getLogoUrl("CVL")).not.toContain("/nba-development/500/cvl.png");
  });

  it("overrides exactly the two known clubs, not more", () => {
    expect(Object.keys(gleague.LOGO_OVERRIDES).sort()).toEqual(["CVL", "NOB"]);
  });

  it("every team resolves to an https URL", () => {
    Object.keys(gleague.TEAM_IDS).forEach((abbr) => {
      expect(gleague.getLogoUrl(abbr)).toMatch(/^https:\/\//);
    });
  });

  it("keeps abbreviations shared with the NBA and WNBA on their own sport's path", () => {
    // CLC/CAP/DEL etc. are G League-only, but AUS/SAN-style short codes and any
    // future overlap must never resolve to another league's CDN path.
    ["OSC", "RAP", "WIS"].forEach((abbr) => {
      expect(gleague.getLogoUrl(abbr)).toContain("/nba-development/500/");
    });
    expect(nba.getLogoUrl("LAL")).toContain("/nba/500/");
    expect(wnba.getLogoUrl("MIN")).toContain("/wnba/500/");
  });
});

describe("GLeagueAdapter — season year (Nov–Apr, labelled by the end year)", () => {
  const seasonFor = (year, monthIndex, day = 15) => {
    jest.useFakeTimers().setSystemTime(new Date(year, monthIndex, day));
    const season = gleague.getSeasonYear();
    jest.useRealTimers();
    return season;
  };

  it("December belongs to next year's season, matching ESPN's end-year label", () => {
    // Verified against live data: a 2025-12 game is filed under season 2026.
    expect(seasonFor(2025, 11)).toBe(2026);
  });

  it("March is the current year", () => {
    expect(seasonFor(2026, 2)).toBe(2026);
  });

  it("differs from the WNBA, whose season sits in one calendar year", () => {
    jest.useFakeTimers().setSystemTime(new Date(2025, 11, 15));
    expect(gleague.getSeasonYear()).toBe(2026);
    expect(wnba.getSeasonYear()).toBe(2025);
    jest.useRealTimers();
  });
});

describe("GLeagueAdapter — fetchData", () => {
  const teamResponse = { data: { team: { id: 11, name: "Magic", displayName: "Osceola Magic" } } };

  const standingsResponse = {
    data: {
      children: [
        { name: "Eastern Conference", standings: { entries: [{ team: { abbreviation: "OSC" }, stats: [{ name: "wins", value: 26 }, { name: "losses", value: 10 }] }] } },
        { name: "Western Conference", standings: { entries: [{ team: { abbreviation: "STO" }, stats: [{ name: "wins", value: 23 }, { name: "losses", value: 13 }] }] } },
      ],
    },
  };

  function game({ teamScore, oppScore, isHome = true, completed = true, date = "2026-03-28T00:00:00Z" }) {
    const mine = { homeAway: isHome ? "home" : "away", team: { abbreviation: "OSC" }, score: { value: teamScore } };
    const theirs = { homeAway: isHome ? "away" : "home", team: { abbreviation: "MCC" }, score: { value: oppScore } };
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
    const result = await gleague.fetchData("OSC");
    expect(result.record.wins).toBe(26);
    expect(result.record.losses).toBe(10);
    expect(result.team.conference).toBe("Eastern");
  });

  it("strips the word Conference so the renderer can append it", async () => {
    mockCalls({});
    const { team } = await gleague.fetchData("OSC");
    expect(team.conference).not.toContain("Conference");
  });

  it("flags playoff games and leaves regular-season games unflagged", async () => {
    mockCalls({
      reg: [game({ teamScore: 125, oppScore: 119, date: "2026-03-28T00:00:00Z" })],
      post: [game({ teamScore: 121, oppScore: 134, date: "2026-04-05T00:00:00Z" })],
    });
    const games = (await gleague.fetchData("OSC")).recentGames;
    expect(games[0].postseason).toBe(true);
    expect(games[1].postseason).toBe(false);
  });

  it("tracks scores correctly for an away game", async () => {
    mockCalls({ reg: [game({ teamScore: 99, oppScore: 112, isHome: false })] });
    const g = (await gleague.fetchData("OSC")).recentGames[0];
    expect(g.visitor_team.abbreviation).toBe("OSC");
    expect(g.visitor_team_score).toBe(99);
    expect(g.home_team_score).toBe(112);
  });

  it("excludes games that have not finished", async () => {
    mockCalls({ reg: [
      game({ teamScore: 118, oppScore: 104, completed: true }),
      game({ teamScore: 0, oppScore: 0, completed: false }),
    ] });
    expect((await gleague.fetchData("OSC")).recentGames.length).toBe(1);
  });

  it("returns at most 5 games, newest first", async () => {
    const dates = ["2026-02-01", "2026-02-08", "2026-02-15", "2026-02-22", "2026-03-01", "2026-03-08"];
    mockCalls({ reg: dates.map((d) => game({ teamScore: 110, oppScore: 100, date: `${d}T00:00:00Z` })) });
    const games = (await gleague.fetchData("OSC")).recentGames;
    expect(games.length).toBe(5);
    expect(games[0].date).toContain("2026-03-08");
    expect(games[4].date).toContain("2026-02-08");
  });

  it("returns null for an unknown team without calling the API", async () => {
    expect(await gleague.fetchData("ZZZ")).toBeNull();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("returns null when the API fails", async () => {
    axios.get.mockRejectedValue(new Error("500"));
    expect(await gleague.fetchData("OSC")).toBeNull();
  });
});

describe("GLeagueAdapter — demo data", () => {
  it("includes the fields the renderer needs", () => {
    const demo = gleague.getDemoData("OSC");
    expect(demo).not.toBeNull();
    demo.recentGames.forEach((g) => {
      expect(typeof g.home_team_score).toBe("number");
      expect(typeof g.visitor_team_score).toBe("number");
      expect(typeof g.postseason).toBe("boolean");
    });
  });

  it("has no division, since the G League does not use them", () => {
    expect(gleague.getDemoData("OSC").team.division).toBe("");
  });

  it("returns null for an unknown team", () => {
    expect(gleague.getDemoData("ZZZ")).toBeNull();
  });

  it("includes richer stats in demo data", () => {
    const demo = gleague.getDemoData("OSC");
    expect(demo.standing.position).toBeTruthy();
    expect(Array.isArray(demo.form)).toBe(true);
    expect(demo.nextGame.opponent).toBeTruthy();
  });
});

describe("GLeagueAdapter — rich stats helpers", () => {
  function event({ completed = true, homeId = 11, awayId = 27, homeScore = 2, awayScore = 1, date = "2026-12-01T00:00:00Z" }) {
    const home = { homeAway: "home", team: { id: homeId, abbreviation: "OSC" }, score: { value: homeScore } };
    const away = { homeAway: "away", team: { id: awayId, abbreviation: "WIS" }, score: { value: awayScore } };
    return { date, competitions: [{ status: { type: { completed } }, competitors: [home, away] }] };
  }

  it("parseForm returns last five results as W/D/L", () => {
    const events = [
      event({ homeScore: 2, awayScore: 1, date: "2026-12-01T00:00:00Z" }),
      event({ homeScore: 1, awayScore: 1, date: "2026-12-02T00:00:00Z" }),
      event({ homeScore: 0, awayScore: 2, date: "2026-12-03T00:00:00Z" }),
    ];
    expect(gleague.parseForm(events, "OSC")).toEqual(["W", "D", "L"]);
  });

  it("parseNextGame returns the first upcoming fixture", () => {
    const upcoming = {
      date: "2026-12-10T00:00:00Z",
      competitions: [{
        status: { type: { completed: false } },
        competitors: [
          { homeAway: "home", team: { id: 11, abbreviation: "OSC" }, score: { value: 0 } },
          { homeAway: "away", team: { id: 27, abbreviation: "WIS" }, score: { value: 0 } },
        ],
      }],
    };
    const next = gleague.parseNextGame([upcoming], "OSC");
    expect(next.date).toContain("2026-12-10");
    expect(next.isHome).toBe(true);
  });

  it("parseNextGame returns null when there is no upcoming fixture", () => {
    expect(gleague.parseNextGame([], "OSC")).toBeNull();
  });
});
