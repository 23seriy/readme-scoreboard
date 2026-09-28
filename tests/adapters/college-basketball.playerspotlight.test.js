const axios = require("axios");
const ncaab = require("../../src/adapters/ncaab");
const ncaaw = require("../../src/adapters/ncaaw");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

// The base adapter reads these payload shapes: ESPN's common/v3 splits payload
// labels the numbers in `stats` via `names`, and the game log does the same per
// event. Both are the shapes the NBA and WNBA already use.
function rosterResponse(entries) {
  return { data: { athletes: entries } };
}

function splitsResponse(points, rebounds, assists) {
  const names = ["gamesPlayed", "avgPoints", "avgRebounds", "avgAssists"];
  return {
    data: {
      names,
      splitCategories: [{ splits: [{ stats: ["18", String(points), String(rebounds), String(assists)] }] }],
    },
  };
}

function gamelogResponse({ minutes, points, rebounds, assists }) {
  const names = ["minutes", "points", "totalRebounds", "assists"];
  return {
    data: {
      names,
      seasonTypes: [
        { categories: [{ events: [{ eventId: "401856599", stats: [minutes, points, rebounds, assists].map(String) }] }] },
      ],
    },
  };
}

function summaryResponse(ownAbbr, opponentAbbr) {
  return {
    data: {
      header: {
        competitions: [
          {
            date: "2026-04-05T01:19Z",
            competitors: [
              { team: { abbreviation: ownAbbr, displayName: "Arizona Wildcats" } },
              { team: { abbreviation: opponentAbbr, displayName: "Michigan Wolverines" } },
            ],
          },
        ],
      },
    },
  };
}

const PLAYER = { id: "5186456", fullName: "Dwayne Aristode", position: { abbreviation: "F" } };

describe("college basketball — spotlight surface", () => {
  it.each([
    ["ncaab", ncaab],
    ["ncaaw", ncaaw],
  ])("%s exposes the spotlight API from the shared base class", (_key, adapter) => {
    expect(typeof adapter.fetchPlayerSpotlight).toBe("function");
    expect(typeof adapter.fetchTeamRoster).toBe("function");
    expect(typeof adapter.getDemoSpotlight).toBe("function");
  });
});

describe("NcaabAdapter — fetchPlayerSpotlight", () => {
  it("resolves the athlete, season averages, last game and headshot", async () => {
    axios.get
      .mockResolvedValueOnce(rosterResponse([{ ...PLAYER, headshot: { href: "https://cdn.example/arizode.png" } }]))
      .mockResolvedValueOnce(splitsResponse(14.3, 6.1, 2.4))
      .mockResolvedValueOnce(gamelogResponse({ minutes: 34, points: 22, rebounds: 7, assists: 5 }))
      .mockResolvedValueOnce(summaryResponse("ARIZ", "MICH"));

    const spotlight = await ncaab.fetchPlayerSpotlight("ARIZ", "Dwayne Aristode");

    expect(spotlight.name).toBe("Dwayne Aristode");
    expect(spotlight.position).toBe("F");
    expect(spotlight.season).toEqual({ points: 14.3, rebounds: 6.1, assists: 2.4 });
    expect(spotlight.lastGame).toEqual({
      minutes: 34,
      points: 22,
      rebounds: 7,
      assists: 5,
      date: "2026-04-05T01:19Z",
      opponent: "Michigan Wolverines",
    });
    // The roster's own headshot wins over the constructed CDN path.
    expect(spotlight.headshotUrl).toBe("https://cdn.example/arizode.png");
  });

  it("matches the player name case-insensitively", async () => {
    axios.get
      .mockResolvedValueOnce(rosterResponse([PLAYER]))
      .mockResolvedValueOnce(splitsResponse(14.3, 6.1, 2.4))
      .mockResolvedValueOnce(gamelogResponse({ minutes: 34, points: 22, rebounds: 7, assists: 5 }))
      .mockResolvedValueOnce(summaryResponse("ARIZ", "MICH"));

    const spotlight = await ncaab.fetchPlayerSpotlight("ARIZ", "dwayne aristode");
    expect(spotlight.name).toBe("Dwayne Aristode");
  });

  it("falls back to the constructed headshot path when the roster omits one", async () => {
    axios.get
      .mockResolvedValueOnce(rosterResponse([PLAYER]))
      .mockResolvedValueOnce(splitsResponse(14.3, 6.1, 2.4))
      .mockResolvedValueOnce(gamelogResponse({ minutes: 34, points: 22, rebounds: 7, assists: 5 }))
      .mockResolvedValueOnce(summaryResponse("ARIZ", "MICH"));

    const spotlight = await ncaab.fetchPlayerSpotlight("ARIZ", "Dwayne Aristode");
    expect(spotlight.headshotUrl)
      .toBe("https://a.espncdn.com/i/headshots/basketball/mens-college-basketball/players/full/5186456.png");
  });

  it("lists roster names when the player is not found", async () => {
    axios.get.mockResolvedValueOnce(rosterResponse([PLAYER]));

    await expect(ncaab.fetchPlayerSpotlight("ARIZ", "Nobody Here"))
      .rejects.toThrow(/Unknown player "Nobody Here" on ARIZ.*Dwayne Aristode/);
  });

  it("still returns a spotlight when the last game or averages are unavailable", async () => {
    axios.get
      .mockResolvedValueOnce(rosterResponse([PLAYER]))
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: {} });

    const spotlight = await ncaab.fetchPlayerSpotlight("ARIZ", "Dwayne Aristode");
    expect(spotlight.season).toEqual({ points: 0, rebounds: 0, assists: 0 });
    expect(spotlight.lastGame).toBeNull();
  });

  it("identifies the opponent when ESPN abbreviates the team differently", async () => {
    // Regression: UCONN is `CONN` upstream. Comparing abbreviations alone
    // matched neither competitor, so find() returned the player's OWN team and
    // the board rendered "vs UConn Huskies" for a UConn player.
    const summary = {
      data: {
        header: {
          competitions: [
            {
              date: "2026-04-03T23:00Z",
              competitors: [
                { team: { id: 41, abbreviation: "CONN", displayName: "UConn Huskies" } },
                { team: { id: 2509, abbreviation: "SC", displayName: "South Carolina Gamecocks" } },
              ],
            },
          ],
        },
      },
    };
    axios.get
      .mockResolvedValueOnce(rosterResponse([{ id: "5174491", fullName: "KK Arnold", position: { abbreviation: "G" } }]))
      .mockResolvedValueOnce(splitsResponse(7.8, 2.3, 4.8))
      .mockResolvedValueOnce(gamelogResponse({ minutes: 28, points: 2, rebounds: 1, assists: 3 }))
      .mockResolvedValueOnce(summary);

    const spotlight = await ncaaw.fetchPlayerSpotlight("UCONN", "KK Arnold");
    expect(spotlight.lastGame.opponent).toBe("South Carolina Gamecocks");
  });

  it("omits the last-game meta rather than guessing when the own team is unknown", async () => {
    const summaryWithoutOwnTeam = {
      data: { header: { competitions: [{ date: "2026-04-03T23:00Z", competitors: [{ team: { abbreviation: "ABC" } }, { team: { abbreviation: "XYZ" } }] }] } },
    };
    axios.get
      .mockResolvedValueOnce(rosterResponse([PLAYER]))
      .mockResolvedValueOnce(splitsResponse(14.3, 6.1, 2.4))
      .mockResolvedValueOnce(gamelogResponse({ minutes: 34, points: 22, rebounds: 7, assists: 5 }))
      .mockResolvedValueOnce(summaryWithoutOwnTeam);

    const spotlight = await ncaab.fetchPlayerSpotlight("ARIZ", "Dwayne Aristode");
    expect(spotlight.lastGame).toEqual({ minutes: 34, points: 22, rebounds: 7, assists: 5 });
  });
});

describe("college basketball — demo spotlight", () => {
  it("is omitted unless a player is requested, so plain examples are unchanged", () => {
    expect(ncaab.getDemoData("ARIZ").spotlight).toBeNull();
    expect(ncaaw.getDemoData("UCONN").spotlight).toBeNull();
  });

  it("is deterministic and seeded from the player name", () => {
    const first = ncaab.getDemoData("ARIZ", "Dwayne Aristode").spotlight;
    const second = ncaab.getDemoData("ARIZ", "Dwayne Aristode").spotlight;

    expect(first).toEqual(second);
    expect(first.name).toBe("Dwayne Aristode");
    expect(first.season.points).toBeGreaterThan(0);
    expect(first.lastGame.opponent).toEqual(expect.any(String));
  });

  it("reuses the board's own most recent fixture for the last game", () => {
    const data = ncaab.getDemoData("ARIZ", "Dwayne Aristode");
    expect(data.spotlight.lastGame.date).toBe(data.recentGames[0].date);
    expect(data.spotlight.lastGame.opponent).toBe(data.recentGames[0].oppAbbr);
  });

  it("gives different players different sample lines", () => {
    const one = ncaab.getDemoData("ARIZ", "Dwayne Aristode").spotlight;
    const two = ncaab.getDemoData("ARIZ", "Some Other Player").spotlight;
    expect(one.season).not.toEqual(two.season);
  });
});
