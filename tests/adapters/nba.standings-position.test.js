const axios = require("axios");

jest.mock("axios");

const nba = require("../../src/adapters/nba");

// The conference "standing" used to be `index + 1` into a flattened list of
// all divisions. That list is conference -> division -> entries, and ESPN
// returns each division ALPHABETICAL by team name, so the index was an
// alphabetical slot rather than a rank. It rendered 2-2 Atlanta as
// "🏅 Standing: Eastern · 13" — between 0-4 Miami and 3-1 Charlotte — when
// ESPN ranks it 7th. `playoffSeed` is ESPN's own conference rank and is
// published for every entry, so it is what the board uses now.

function entry(abbr, wins, losses, playoffSeed) {
  return {
    team: { abbreviation: abbr },
    stats: [
      { name: "wins", value: wins },
      { name: "losses", value: losses },
      { name: "playoffSeed", value: playoffSeed },
    ],
  };
}

// Deliberately ALPHABETICAL within each division, exactly as ESPN serves it,
// and the target team is listed last in its division so a flat index would be
// large. Seeds are what make the real ranking recoverable.
function standingsResponse(seedForTarget, { wins = 2, losses = 2, allUnplayed = false } = {}) {
  const seed = (n) => (allUnplayed ? n : n);
  return {
    data: {
      children: [
        {
          name: "Eastern Conference",
          children: [
            {
              name: "Atlantic Division",
              standings: {
                entries: [
                  entry("BKN", allUnplayed ? 0 : 0, allUnplayed ? 0 : 4, seed(14)),
                  entry("BOS", allUnplayed ? 0 : 3, allUnplayed ? 0 : 1, seed(4)),
                  entry("NY", allUnplayed ? 0 : 1, allUnplayed ? 0 : 3, seed(13)),
                ],
              },
            },
            {
              name: "Southeast Division",
              standings: {
                entries: [
                  entry("ATL", wins, losses, seed(seedForTarget)),
                  entry("CHA", allUnplayed ? 0 : 3, allUnplayed ? 0 : 1, seed(3)),
                  entry("MIA", allUnplayed ? 0 : 0, allUnplayed ? 0 : 4, seed(15)),
                ],
              },
            },
          ],
        },
      ],
    },
  };
}

function teamResponse(abbr) {
  return {
    data: { team: { id: 1, abbreviation: abbr, name: abbr, displayName: abbr } },
  };
}

function scheduleResponse() {
  return { data: { events: [] } };
}

function mockStandings(standings) {
  axios.get.mockImplementation((url) => {
    if (String(url).includes("/standings")) return Promise.resolve(standings);
    if (String(url).includes("/schedule")) return Promise.resolve(scheduleResponse());
    return Promise.resolve(teamResponse("ATL"));
  });
}

describe("nba standings position", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("uses ESPN's playoffSeed instead of the alphabetical/division slot", async () => {
    // Atlantic has 3 entries before Southeast, so a flat index would put ATL
    // 4th among six teams. ESPN says 7th in the conference.
    mockStandings(standingsResponse(7));

    const data = await nba.fetchData("ATL");

    expect(data.record.wins).toBe(2);
    expect(data.record.losses).toBe(2);
    expect(data.standing).toEqual({ position: 7, label: "Eastern" });
  });

  it("reports the seed, not 13, for a mid-table team whose name sorts late", async () => {
    mockStandings(standingsResponse(13));

    const data = await nba.fetchData("ATL");

    expect(data.standing.position).toBe(13);
    // The bug surfaced as 13 for a team ESPN ranked 7th; make sure the number
    // now simply tracks the seed rather than coincidentally matching.
    expect(data.standing.position).not.toBe(4);
  });

  it("omits the position when no games have been played yet", async () => {
    // ESPN still publishes seeds in alphabetical order before opening night, so
    // a seed is not yet meaningful and the row should disappear.
    mockStandings(standingsResponse(13, { wins: 0, losses: 0, allUnplayed: true }));

    const data = await nba.fetchData("ATL");

    expect(data.standing).toBeNull();
  });

  it("omits the position when ESPN publishes no playoffSeed", async () => {
    const standings = standingsResponse(7);
    delete standings.data.children[0].children[1].standings.entries[0].stats[2];
    mockStandings(standings);

    const data = await nba.fetchData("ATL");

    expect(data.standing).toBeNull();
  });
});
