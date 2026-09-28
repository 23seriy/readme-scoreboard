const axios = require("axios");
const epl = require("../../src/adapters/epl");
const mls = require("../../src/adapters/mls");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

// A game log shaped like ESPN's soccer athlete payload: `names` labels the
// numeric columns in each event's `stats` array.
function gameLog(rows) {
  const names = ["cleanSheet", "saves", "goalsConceded", "totalGoals", "goalAssists", "foulsCommitted", "foulsSuffered", "yellowCards", "redCards"];
  return {
    names,
    events: Object.fromEntries(rows.map((row, index) => [
      String(1000 + index),
      { gameDate: `2026-0${(index % 9) + 1}-1${index % 9}T15:00Z`, opponent: { abbreviation: row.opponent } },
    ])),
    seasonTypes: [
      {
        categories: [
          {
            names,
            events: rows.map((row, index) => ({
              eventId: String(1000 + index),
              stats: [
                String(row.cleanSheet ?? 0),
                String(row.saves ?? 0),
                String(row.goalsConceded ?? 0),
                String(row.goals ?? 0),
                String(row.assists ?? 0),
                "0", "0",
                String(row.yellowCards ?? 0),
                String(row.redCards ?? 0),
              ],
            })),
          },
        ],
      },
    ],
  };
}

describe("soccer adapters — metadata", () => {
  it("expose the shared spotlight surface from the base class", () => {
    for (const adapter of [epl, mls]) {
      expect(typeof adapter.fetchPlayerSpotlight).toBe("function");
      expect(typeof adapter.fetchTeamRoster).toBe("function");
      expect(typeof adapter.findPlayerOnRoster).toBe("function");
      expect(typeof adapter.fetchPlayerSeasonStats).toBe("function");
      expect(typeof adapter.fetchPlayerLastGame).toBe("function");
      expect(typeof adapter.summarizeGameLog).toBe("function");
    }
  });
});

describe("soccer adapters — summarizeGameLog", () => {
  it("sums goals, assists, and appearances across every event", () => {
    const totals = epl.summarizeGameLog(gameLog([
      { goals: 1, assists: 0, opponent: "CHE" },
      { goals: 2, assists: 1, opponent: "LIV" },
      { goals: 0, assists: 3, opponent: "TOT" },
    ]));

    expect(totals.appearances).toBe(3);
    expect(totals.goals).toBe(3);
    expect(totals.assists).toBe(4);
  });

  it("counts appearances even when the player recorded nothing", () => {
    const totals = epl.summarizeGameLog(gameLog([
      { opponent: "CHE" },
      { opponent: "LIV" },
    ]));

    expect(totals.appearances).toBe(2);
    expect(totals.goals).toBe(0);
    expect(totals.assists).toBe(0);
  });

  it("sums goalkeeper columns for a keeper's log", () => {
    const totals = epl.summarizeGameLog(gameLog([
      { saves: 4, cleanSheet: 1, opponent: "CHE" },
      { saves: 2, goalsConceded: 3, opponent: "LIV" },
    ]));

    expect(totals.saves).toBe(6);
    expect(totals.cleanSheets).toBe(1);
  });

  it("sums disciplinary columns", () => {
    const totals = epl.summarizeGameLog(gameLog([
      { yellowCards: 1, opponent: "CHE" },
      { yellowCards: 1, redCards: 1, opponent: "LIV" },
    ]));

    expect(totals.yellowCards).toBe(2);
    expect(totals.redCards).toBe(1);
  });

  it("returns zeroed totals for an empty game log", () => {
    const totals = epl.summarizeGameLog({ names: [], seasonTypes: [] });
    expect(totals).toEqual({
      appearances: 0, goals: 0, assists: 0, saves: 0, cleanSheets: 0, yellowCards: 0, redCards: 0,
    });
  });

  it("ignores non-numeric stat values rather than producing NaN", () => {
    const log = gameLog([{ goals: 2, opponent: "CHE" }]);
    log.seasonTypes[0].categories[0].events[0].stats[3] = "--";
    const totals = epl.summarizeGameLog(log);
    expect(totals.goals).toBe(0);
  });
});

describe("soccer adapters — fetchTeamRoster", () => {
  it("flattens position groups and keeps id, name, and position", async () => {
    // fetchTeam resolves the club first, then the roster.
    axios.get
      .mockResolvedValueOnce({ data: { team: { id: "359", abbreviation: "ARS", displayName: "Arsenal" } } })
      .mockResolvedValueOnce({
        data: {
          athletes: [
            { items: [{ id: "1", fullName: "Bukayo Saka", position: { abbreviation: "RW" } }] },
            { items: [{ id: "2", fullName: "David Raya", position: { abbreviation: "G" } }] },
          ],
        },
      });

    const roster = await epl.fetchTeamRoster("ARS");
    expect(roster).toEqual([
      { id: "1", fullName: "Bukayo Saka", position: "RW" },
      { id: "2", fullName: "David Raya", position: "G" },
    ]);
  });

  it("returns an empty array when the roster request fails", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { team: { id: "359", abbreviation: "ARS", displayName: "Arsenal" } } })
      .mockRejectedValueOnce(new Error("network error"));

    await expect(epl.fetchTeamRoster("ARS")).resolves.toEqual([]);
  });
});

describe("soccer adapters — findPlayerOnRoster", () => {
  const roster = [
    { id: "1", fullName: "Bukayo Saka", position: "RW" },
    { id: "2", fullName: "Martin Ødegaard", position: "CM" },
  ];

  it("matches an exact full name", () => {
    expect(epl.findPlayerOnRoster(roster, "Bukayo Saka")).toEqual(roster[0]);
  });

  it("matches case-insensitively and trims whitespace", () => {
    expect(epl.findPlayerOnRoster(roster, "  bukayo saka ")).toEqual(roster[0]);
  });

  it("matches names containing diacritics exactly", () => {
    expect(epl.findPlayerOnRoster(roster, "Martin Ødegaard")).toEqual(roster[1]);
  });

  it("returns null when nothing matches", () => {
    expect(epl.findPlayerOnRoster(roster, "Erling Haaland")).toBeNull();
  });
});

describe("soccer adapters — fetchPlayerSpotlight", () => {
  it("returns season totals and the latest game for a known player", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { team: { id: "359", abbreviation: "ARS", displayName: "Arsenal" } } })
      .mockResolvedValueOnce({
        data: { athletes: [{ items: [{ id: "1", fullName: "Bukayo Saka", position: { abbreviation: "RW" } }] }] },
      })
      // season stats
      .mockResolvedValueOnce({ data: gameLog([{ goals: 1, assists: 1, opponent: "CHE" }, { goals: 2, assists: 0, opponent: "LIV" }]) })
      // last game
      .mockResolvedValueOnce({ data: gameLog([{ goals: 1, assists: 1, opponent: "CHE" }, { goals: 2, assists: 0, opponent: "LIV" }]) });

    const spotlight = await epl.fetchPlayerSpotlight("ARS", "Bukayo Saka");
    expect(spotlight.name).toBe("Bukayo Saka");
    expect(spotlight.position).toBe("RW");
    expect(spotlight.season.appearances).toBe(2);
    expect(spotlight.season.goals).toBe(3);
    expect(spotlight.lastGame.opponent).toBe("CHE");
  });

  it("lists roster names in the error for an unknown player", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { team: { id: "359", abbreviation: "ARS", displayName: "Arsenal" } } })
      .mockResolvedValueOnce({
        data: { athletes: [{ items: [{ id: "1", fullName: "Bukayo Saka", position: { abbreviation: "RW" } }] }] },
      });

    await expect(epl.fetchPlayerSpotlight("ARS", "Nobody Here")).rejects.toThrow(
      /Unknown player "Nobody Here" on ARS\. Try one of: Bukayo Saka/,
    );
  });

  it("throws a clear error instead of rendering zeroes when the game log is empty", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { team: { id: "359", abbreviation: "ARS", displayName: "Arsenal" } } })
      .mockResolvedValueOnce({
        data: { athletes: [{ items: [{ id: "1", fullName: "Illan Meslier", position: { abbreviation: "G" } }] }] },
      })
      .mockResolvedValueOnce({ data: { names: [], seasonTypes: [] } })
      .mockResolvedValueOnce({ data: { names: [], seasonTypes: [] } });

    await expect(epl.fetchPlayerSpotlight("ARS", "Illan Meslier")).rejects.toThrow(
      /No season stats available for "Illan Meslier" on ARS \(Premier League\)/,
    );
  });
});

describe("soccer adapters — demo spotlight", () => {
  it("returns a spotlight for a named player on a demo team", () => {
    const data = epl.getDemoData("ARS", "Bukayo Saka");
    expect(data.spotlight.name).toBe("Bukayo Saka");
    expect(data.spotlight.season.appearances).toBeGreaterThan(0);
  });

  it("omits the spotlight when no player name is given", () => {
    expect(epl.getDemoData("ARS").spotlight).toBeNull();
  });

  it("is deterministic across calls", () => {
    expect(epl.getDemoData("ARS", "Bukayo Saka").spotlight)
      .toEqual(epl.getDemoData("ARS", "Bukayo Saka").spotlight);
  });

  it("returns null for an unknown demo team", () => {
    expect(epl.getDemoData("ZZZ", "Someone")).toBeNull();
  });

  it("works for every soccer league through the shared base class", () => {
    for (const adapter of [epl, mls]) {
      const team = Object.keys(adapter.DEMO_TEAMS)[0];
      const demo = adapter.getDemoData(team, "Test Player");
      expect(demo.spotlight.name).toBe("Test Player");
      expect(demo.spotlight.season.appearances).toBeGreaterThan(0);
    }
  });
});
