const axios = require("axios");
const nfl = require("../../src/adapters/nfl");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

function makeTeamResponse(abbr = "KC", name = "Chiefs", displayName = "Kansas City Chiefs") {
  return { data: { team: { id: 16, abbreviation: abbr, name, displayName, record: null } } };
}

function makeStandingsResponse(abbr, wins, losses, conference = "American Football Conference") {
  return {
    data: {
      children: [{
        name: conference,
        standings: {
          entries: [{
            team: { abbreviation: abbr },
            stats: [
              { name: "wins", value: wins },
              { name: "losses", value: losses },
            ],
          }],
        },
      }],
    },
  };
}

function makeScheduleResponse(events) {
  return { data: { events } };
}

function makeEvent({ teamAbbr, oppAbbr, teamScore, oppScore, isHome = true, completed = true, date = "2026-09-15T00:00:00Z", seasonType = 2 }) {
  const teamComp = { homeAway: isHome ? "home" : "away", team: { abbreviation: teamAbbr }, score: { value: teamScore } };
  const oppComp = { homeAway: isHome ? "away" : "home", team: { abbreviation: oppAbbr }, score: { value: oppScore } };
  return {
    date,
    seasonType,
    competitions: [{
      status: { type: { completed, name: completed ? "STATUS_FINAL" : "STATUS_SCHEDULED" } },
      competitors: [teamComp, oppComp],
    }],
  };
}

describe("NFLAdapter — league config", () => {
  it("covers all 32 teams in TEAM_IDS and TEAM_EMOJI", () => {
    expect(Object.keys(nfl.TEAM_IDS).length).toBe(32);
    expect(Object.keys(nfl.TEAM_EMOJI).length).toBe(32);
  });

  it("gives every team a conference/division", () => {
    Object.keys(nfl.TEAM_IDS).forEach((abbr) => {
      expect(nfl.getDemoData(abbr).team.conference).toBeTruthy();
      expect(nfl.getDemoData(abbr).team.division).toBeTruthy();
    });
  });
});

describe("NFLAdapter — fetchStandings", () => {
  const standingsResponse = {
    data: {
      children: [
        {
          name: "American Football Conference",
          standings: {
            entries: [
              { team: { abbreviation: "BUF" }, stats: [{ name: "wins", value: 5 }, { name: "losses", value: 1 }] },
              { team: { abbreviation: "KC" }, stats: [{ name: "wins", value: 4 }, { name: "losses", value: 2 }] },
            ],
          },
        },
      ],
    },
  };

  it("returns the conference rank (1-based index) for the team", async () => {
    axios.get.mockResolvedValueOnce(standingsResponse);
    const result = await nfl.fetchStandings("KC");
    expect(result.position).toBe(2);
    expect(result.conference).toBe("American Football");
    expect(result.wins).toBe(4);
    expect(result.losses).toBe(2);
  });

  it("returns the top team at position 1", async () => {
    axios.get.mockResolvedValueOnce(standingsResponse);
    const result = await nfl.fetchStandings("BUF");
    expect(result.position).toBe(1);
    expect(result.wins).toBe(5);
  });

  it("returns null position when the team is not in the standings", async () => {
    axios.get.mockResolvedValueOnce(standingsResponse);
    const result = await nfl.fetchStandings("XXX");
    expect(result.position).toBeNull();
    expect(result.conference).toBe("");
  });

  it("falls back to null on a fetch error", async () => {
    axios.get.mockRejectedValueOnce(new Error("network"));
    const result = await nfl.fetchStandings("KC");
    expect(result).toBeNull();
  });
});

describe("NFLAdapter — parseNextGame", () => {
  const events = [
    { date: "2026-09-15T00:15Z", competitions: [{ status: { type: { completed: false } }, competitors: [
      { team: { abbreviation: "KC" }, homeAway: "home" },
      { team: { abbreviation: "DEN" }, homeAway: "away" },
    ] }] },
    { date: "2026-09-08T00:15Z", competitions: [{ status: { type: { completed: false } }, competitors: [
      { team: { abbreviation: "KC" }, homeAway: "away" },
      { team: { abbreviation: "LAC" }, homeAway: "home" },
    ] }] },
  ];

  it("returns the earliest non-final game", () => {
    const next = nfl.parseNextGame(events, "KC");
    expect(next.opponent).toBe("LAC");
    expect(next.isHome).toBe(false);
  });

  it("returns null when there is no upcoming game", () => {
    const finalEvents = events.map((e) => ({
      ...e,
      competitions: [{ status: { type: { completed: true } }, competitors: e.competitions[0].competitors }],
    }));
    expect(nfl.parseNextGame(finalEvents, "KC")).toBeNull();
  });

  it("returns null when there are no events", () => {
    expect(nfl.parseNextGame([], "KC")).toBeNull();
  });
});

describe("NFLAdapter — demo data", () => {
  it("now includes a standing and next game", () => {
    const demo = nfl.getDemoData("KC");
    expect(demo.standing.position).toBeGreaterThan(0);
    expect(demo.standing.label).toBeTruthy();
    expect(demo.nextGame.opponent).toBeTruthy();
    expect(demo.nextGame.date).toBeTruthy();
  });

  it("falls back to a demo team for an unknown abbreviation", () => {
    const demo = nfl.getDemoData("ZZZ");
    expect(demo).not.toBeNull();
    expect(demo.team.abbreviation).toBe("ZZZ");
    expect(demo.standing.position).toBeGreaterThan(0);
  });
});

describe("NFLAdapter — fetchData", () => {
  it("returns team, conference standing, and next game", async () => {
    axios.get
      .mockResolvedValueOnce(makeTeamResponse())
      .mockResolvedValueOnce(makeStandingsResponse("KC", 4, 2))
      .mockResolvedValueOnce(makeScheduleResponse([
        makeEvent({ teamAbbr: "KC", oppAbbr: "LAC", teamScore: 28, oppScore: 24, isHome: false, completed: true }),
      ]))
      .mockResolvedValueOnce(makeScheduleResponse([
        makeEvent({ teamAbbr: "KC", oppAbbr: "DEN", teamScore: 0, oppScore: 0, isHome: true, completed: false, date: "2026-09-15T00:00:00Z" }),
      ]));

    const result = await nfl.fetchData("KC");
    expect(result.team.full_name).toBe("Kansas City Chiefs");
    expect(result.standing).toEqual({ position: 1, label: "American Football" });
    expect(result.nextGame).toEqual({ date: "2026-09-15T00:00:00Z", opponent: "DEN", isHome: true });
    expect(result.recentGames).toHaveLength(1);
  });

  it("derives the record from standings when available", async () => {
    axios.get
      .mockResolvedValueOnce(makeTeamResponse())
      .mockResolvedValueOnce(makeStandingsResponse("KC", 7, 3))
      .mockResolvedValueOnce(makeScheduleResponse([]))
      .mockResolvedValueOnce(makeScheduleResponse([]));

    const result = await nfl.fetchData("KC");
    expect(result.record.wins).toBe(7);
    expect(result.record.losses).toBe(3);
    // No upcoming game → nextGame is null.
    expect(result.nextGame).toBeNull();
  });

  it("falls back to the season record when standings are unavailable", async () => {
    // Team info, then standings returns null (fetch error), then record fetch.
    axios.get
      .mockResolvedValueOnce(makeTeamResponse())
      // standings: use a Null-safe fallback path — reject to simulate failure
      .mockRejectedValueOnce(new Error("standings down"))
      // fetchScheduleEvents (reg + post)
      .mockResolvedValueOnce(makeScheduleResponse([]))
      .mockResolvedValueOnce(makeScheduleResponse([]))
      // fetchSeasonRecord fallback
      .mockResolvedValueOnce({ data: { team: { record: { items: [{ type: "total", stats: [
        { name: "wins", value: 9 },
        { name: "losses", value: 3 },
      ] }] } } } });

    const result = await nfl.fetchData("KC");
    expect(result.record.wins).toBe(9);
    expect(result.record.losses).toBe(3);
    // No standing since the standings fetch failed.
    expect(result.standing).toBeNull();
  });

  it("returns the earliest non-final game from the combined schedule", async () => {
    axios.get
      .mockResolvedValueOnce(makeTeamResponse())
      .mockResolvedValueOnce(makeStandingsResponse("KC", 4, 2))
      .mockResolvedValueOnce(makeScheduleResponse([
        makeEvent({ teamAbbr: "KC", oppAbbr: "DEN", teamScore: 0, oppScore: 0, isHome: true, completed: false, date: "2026-09-20T00:00:00Z" }),
        makeEvent({ teamAbbr: "KC", oppAbbr: "LAC", teamScore: 0, oppScore: 0, isHome: false, completed: false, date: "2026-09-15T00:00:00Z" }),
      ]))
      .mockResolvedValueOnce(makeScheduleResponse([]));

    const result = await nfl.fetchData("KC");
    expect(result.nextGame.opponent).toBe("LAC");
  });

  it("returns null when the team is unknown", async () => {
    axios.get.mockResolvedValueOnce({ data: { team: null } });
    const result = await nfl.fetchData("ZZZ");
    expect(result).toBeNull();
  });
});
