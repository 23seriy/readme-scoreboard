const axios = require("axios");

jest.mock("axios");

const nba = require("../../src/adapters/nba");

// Same gap as the soccer base, and the same fix: a season with no completed game
// yet rendered "📅 No recent games found" over a 0-0 record. The adapter now walks
// back one season and shows those results and that record instead.
//
// The season is derived from the clock, so assertions look at the request shape
// and the resolved data rather than at a hardcoded year.
const teamResponse = {
  data: { team: { id: 13, abbreviation: "LAL", name: "Lakers", displayName: "Los Angeles Lakers" } },
};

// ESPN's v2 standings nest twice — conference, then division, then the entries.
// A flatter guess silently matched nothing, and the record came back 0-0.
function standingsResponse(wins, losses) {
  return {
    data: {
      children: [
        {
          name: "Western Conference",
          children: [
            {
              name: "Pacific Division",
              standings: {
                entries: [
                  {
                    team: { abbreviation: "LAL" },
                    stats: [
                      { name: "wins", value: wins },
                      { name: "losses", value: losses },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  };
}

function scheduleResponse(events) {
  return { data: { events } };
}

function completedGame(date, homeScore, awayScore) {
  return {
    date,
    competitions: [
      {
        status: { type: { completed: true } },
        competitors: [
          { team: { id: 13, abbreviation: "LAL" }, homeAway: "home", score: { value: homeScore } },
          { team: { id: 25, abbreviation: "GSW" }, homeAway: "away", score: { value: awayScore } },
        ],
      },
    ],
  };
}

describe("NBA — previous season fallback", () => {
  beforeEach(() => axios.get.mockReset());

  it("uses the previous season's games and record when this season has none", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse(0, 0)) // current season: nothing played
      .mockResolvedValueOnce(scheduleResponse([])) // regular season
      .mockResolvedValueOnce(scheduleResponse([])) // playoffs
      // Fallback, previous season:
      .mockResolvedValueOnce(standingsResponse(53, 29))
      .mockResolvedValueOnce(scheduleResponse([completedGame("2026-04-12T02:00:00Z", 110, 98)]))
      .mockResolvedValueOnce(scheduleResponse([]));

    const result = await nba.fetchData("LAL");

    expect(result.recentGames).toHaveLength(1);
    expect(result.recentGames[0].home_team_score).toBe(110);
    // Record comes from the same season as the games, not the empty current one.
    expect(result.record.wins).toBe(53);
    expect(result.record.losses).toBe(29);
  });

  it("keeps the current season when it has results", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standingsResponse(1, 0))
      .mockResolvedValueOnce(scheduleResponse([completedGame("2026-10-20T02:00:00Z", 112, 105)]))
      .mockResolvedValueOnce(scheduleResponse([]));

    const result = await nba.fetchData("LAL");

    expect(result.recentGames).toHaveLength(1);
    expect(result.record.wins).toBe(1);
    // Four calls only — no previous-season lookup for a season under way.
    expect(axios.get).toHaveBeenCalledTimes(4);
  });
});
