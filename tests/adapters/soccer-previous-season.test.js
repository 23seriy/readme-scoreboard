const axios = require("axios");
const epl = require("../../src/adapters/epl");

jest.mock("axios");

// A season that has produced no completed match yet — not started, or a day old —
// used to render "📅 No recent games found" with a 0-0 record, which reads as a
// broken board rather than a season that has barely begun. The soccer base now
// walks back one season and shows those results instead.
//
// The season parameter the adapter asks for is derived from the clock, so these
// assertions look at the *relative* request (`season - 1`), not a fixed year.
const teamResponse = {
  data: { team: { id: 359, abbreviation: "ARS", name: "Arsenal", displayName: "Arsenal" } },
};

function standingsFor(abbreviation, wins, losses, ties) {
  return {
    data: {
      children: [
        {
          name: "English Premier League",
          standings: {
            entries: [
              {
                team: { abbreviation },
                stats: [
                  { name: "wins", value: wins },
                  { name: "losses", value: losses },
                  { name: "ties", value: ties },
                ],
              },
            ],
          },
        },
      ],
    },
  };
}

// One completed match, in the shape parseSchedule expects.
function completedMatch(date, oppAbbr, teamScore, oppScore) {
  return {
    date,
    competitions: [
      {
        status: { type: { completed: true } },
        competitors: [
          { team: { id: 359, abbreviation: "ARS" }, homeAway: "home", score: { value: teamScore } },
          { team: { id: 999, abbreviation: oppAbbr }, homeAway: "away", score: { value: oppScore } },
        ],
      },
    ],
  };
}

function seasonParamOf(url) {
  return Number(String(url).match(/season=(\d{4})/)?.[1] ?? NaN);
}

describe("soccer — previous season fallback", () => {
  it("falls back to the previous season when this one has no completed match", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsFor("ARS", 0, 0, 0)) // current season: nothing played
      .mockResolvedValueOnce({ data: { events: [] } }) // current schedule: empty
      .mockResolvedValueOnce({ data: { events: [] } }) // fixture feed
      .mockResolvedValueOnce(standingsFor("ARS", 20, 8, 10)) // previous season table
      .mockResolvedValueOnce({
        data: { events: [completedMatch("2026-05-19T15:00:00Z", "LEE", 3, 1)] },
      });

    const result = await epl.fetchData("ARS");

    expect(result.recentGames).toHaveLength(1);
    expect(result.recentGames[0].home_team_score).toBe(3);
    // The record comes from the same season as the games, not the empty current one.
    expect(result.record.wins).toBe(20);
    expect(result.record.losses).toBe(8);
  });

  it("requests one season earlier, and only when this season is empty", async () => {
    axios.get.mockReset();
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsFor("ARS", 0, 0, 0))
      .mockResolvedValueOnce({ data: { events: [] } })
      .mockResolvedValueOnce({ data: { events: [] } })
      .mockResolvedValueOnce(standingsFor("ARS", 20, 8, 10))
      .mockResolvedValueOnce({ data: { events: [completedMatch("2026-05-19T15:00:00Z", "LEE", 3, 1)] } });

    await epl.fetchData("ARS");

    const seasons = axios.get.mock.calls
      .map(([url]) => String(url))
      .filter((url) => url.includes("/schedule?season="))
      .map(seasonParamOf)
      .filter((year) => !Number.isNaN(year));
    const current = Math.max(...seasons);
    expect(seasons).toContain(current - 1);
  });

  it("keeps the current season when it does have results", async () => {
    axios.get.mockReset();
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsFor("ARS", 6, 1, 2))
      .mockResolvedValueOnce({
        data: { events: [completedMatch("2026-10-18T15:00:00Z", "CHE", 2, 0)] },
      })
      .mockResolvedValueOnce({ data: { events: [] } });

    const result = await epl.fetchData("ARS");

    expect(result.recentGames).toHaveLength(1);
    expect(result.record.wins).toBe(6);
    // Exactly one *completed* schedule call: the fixture feed shares the same
    // `?season=` shape, so counting every schedule URL gives 2 and proves
    // nothing — the same trap as the next-fixture guard.
    const completedScheduleSeasons = axios.get.mock.calls
      .map(([url]) => String(url))
      .filter((url) => url.includes("/schedule?season=") && !url.includes("fixture=true"))
      .map(seasonParamOf);
    expect(completedScheduleSeasons).toHaveLength(1);
  });
});
