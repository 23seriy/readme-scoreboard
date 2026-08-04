const axios = require("axios");
const adapter = require("../../src/adapters/mls");

jest.mock("axios");

const LAFC_TEAM = {
  id: 18966,
  abbreviation: "LAFC",
  name: "LAFC",
  full_name: "Los Angeles FC",
  conference: "",
  division: "",
};

function makeEvent({ homeId, awayId, homeAbbr, awayAbbr, homeScore, awayScore, completed = true, date = "2026-07-01T02:00:00Z" }) {
  return {
    date,
    competitions: [{
      status: { type: { completed } },
      competitors: [
        {
          homeAway: "home",
          team: { id: homeId, abbreviation: homeAbbr },
          score: { value: homeScore },
        },
        {
          homeAway: "away",
          team: { id: awayId, abbreviation: awayAbbr },
          score: { value: awayScore },
        },
      ],
    }],
  };
}

function makeStandingsResponse(abbr, wins, losses, draws, conference = "Western Conference") {
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
              { name: "ties", value: draws },
            ],
          }],
        },
      }],
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(adapter, "fetchTeamByAbbr").mockResolvedValue({ ...LAFC_TEAM });
});

describe("MlsAdapter — fetchConferenceRecord", () => {
  it("returns W/L/D and conference name from standings", async () => {
    axios.get.mockResolvedValue(makeStandingsResponse("LAFC", 10, 5, 4));
    const record = await adapter.fetchConferenceRecord("LAFC");
    expect(record.wins).toBe(10);
    expect(record.losses).toBe(5);
    expect(record.draws).toBe(4);
    expect(record.conference).toBe("Western Conference");
  });

  it("returns zeros when team not found in standings", async () => {
    axios.get.mockResolvedValue({ data: { children: [{ name: "Eastern Conference", standings: { entries: [] } }] } });
    const record = await adapter.fetchConferenceRecord("LAFC");
    expect(record.wins).toBe(0);
    expect(record.losses).toBe(0);
    expect(record.draws).toBe(0);
  });

  it("returns zeros on API error", async () => {
    axios.get.mockRejectedValue(new Error("network error"));
    const record = await adapter.fetchConferenceRecord("LAFC");
    expect(record.wins).toBe(0);
    expect(record.losses).toBe(0);
    expect(record.draws).toBe(0);
  });
});

describe("MlsAdapter — fetchData", () => {
  it("sets conference from standings on the team object", async () => {
    axios.get
      .mockResolvedValueOnce(makeStandingsResponse("LAFC", 10, 5, 4, "Western Conference"))
      .mockResolvedValueOnce({ data: { events: [] } });
    const result = await adapter.fetchData("LAFC");
    expect(result.team.conference).toBe("Western Conference");
  });

  it("uses standings API for W/L/D record, not game counting", async () => {
    axios.get
      .mockResolvedValueOnce(makeStandingsResponse("LAFC", 10, 5, 4))
      .mockResolvedValueOnce({
        data: {
          events: [
            makeEvent({ homeId: 18966, awayId: 999, homeAbbr: "LAFC", awayAbbr: "LA", homeScore: 3, awayScore: 1 }),
            makeEvent({ homeId: 18966, awayId: 999, homeAbbr: "LAFC", awayAbbr: "LA", homeScore: 1, awayScore: 1 }),
          ],
        },
      });
    const result = await adapter.fetchData("LAFC");
    expect(result.record.wins).toBe(10);
    expect(result.record.losses).toBe(5);
    expect(result.record.draws).toBe(4);
  });

  it("correctly identifies won, drew, and lost games", async () => {
    axios.get
      .mockResolvedValueOnce(makeStandingsResponse("LAFC", 3, 1, 1))
      .mockResolvedValueOnce({
        data: {
          events: [
            makeEvent({ homeId: 18966, awayId: 999, homeAbbr: "LAFC", awayAbbr: "LA",  homeScore: 3, awayScore: 1, date: "2026-07-03T02:00:00Z" }),
            makeEvent({ homeId: 18966, awayId: 999, homeAbbr: "LAFC", awayAbbr: "SKC", homeScore: 1, awayScore: 1, date: "2026-07-02T02:00:00Z" }),
            makeEvent({ homeId: 999,   awayId: 18966, homeAbbr: "SEA", awayAbbr: "LAFC", homeScore: 2, awayScore: 0, date: "2026-07-01T02:00:00Z" }),
          ],
        },
      });
    const result = await adapter.fetchData("LAFC");
    expect(result.recentGames[0].won).toBe(true);
    expect(result.recentGames[0].drew).toBe(false);
    expect(result.recentGames[1].drew).toBe(true);
    expect(result.recentGames[1].won).toBe(false);
    expect(result.recentGames[2].won).toBe(false);
    expect(result.recentGames[2].drew).toBe(false);
  });

  it("excludes incomplete (upcoming) games from recent games", async () => {
    axios.get
      .mockResolvedValueOnce(makeStandingsResponse("LAFC", 5, 2, 1))
      .mockResolvedValueOnce({
        data: {
          events: [
            makeEvent({ homeId: 18966, awayId: 999, homeAbbr: "LAFC", awayAbbr: "LA", homeScore: 2, awayScore: 0, completed: true }),
            makeEvent({ homeId: 18966, awayId: 999, homeAbbr: "LAFC", awayAbbr: "VAN", homeScore: 0, awayScore: 0, completed: false }),
          ],
        },
      });
    const result = await adapter.fetchData("LAFC");
    expect(result.recentGames.length).toBe(1);
    expect(result.recentGames[0].oppAbbr).toBe("LA");
  });

  it("returns most recent 5 games sorted by date descending", async () => {
    const dates = ["2026-06-01", "2026-06-08", "2026-06-15", "2026-06-22", "2026-06-29", "2026-07-06"];
    axios.get
      .mockResolvedValueOnce(makeStandingsResponse("LAFC", 6, 0, 0))
      .mockResolvedValueOnce({
        data: {
          events: dates.map((d) =>
            makeEvent({ homeId: 18966, awayId: 999, homeAbbr: "LAFC", awayAbbr: "LA", homeScore: 1, awayScore: 0, date: `${d}T02:00:00Z` })
          ),
        },
      });
    const result = await adapter.fetchData("LAFC");
    expect(result.recentGames.length).toBe(5);
    expect(result.recentGames[0].date).toContain("2026-07-06");
    expect(result.recentGames[4].date).toContain("2026-06-08");
  });

  it("correctly identifies home vs away", async () => {
    axios.get
      .mockResolvedValueOnce(makeStandingsResponse("LAFC", 1, 0, 0))
      .mockResolvedValueOnce({
        data: {
          events: [
            // LAFC is home
            makeEvent({ homeId: 18966, awayId: 999, homeAbbr: "LAFC", awayAbbr: "SKC", homeScore: 2, awayScore: 1 }),
          ],
        },
      });
    const result = await adapter.fetchData("LAFC");
    expect(result.recentGames[0].isHome).toBe(true);
    expect(result.recentGames[0].oppAbbr).toBe("SKC");
  });

  it("returns null when team not found", async () => {
    jest.spyOn(adapter, "fetchTeamByAbbr").mockResolvedValue(null);
    const result = await adapter.fetchData("ZZZ");
    expect(result).toBeNull();
  });
});
