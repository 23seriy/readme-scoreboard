const axios = require("axios");
const nfl = require("../../src/adapters/nfl");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

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
