const { checkDemoConsistency } = require("../../src/demo");
const { LEAGUES } = require("../../src/config/leagues");

// Every board in the examples gallery is generated from getDemoData(), so each
// adapter must produce sample data that is (a) identical on every run and
// (b) internally consistent. Historically the NFL demo advertised a hardcoded
// 9W-3L record alongside randomly regenerated games and listed the same team as
// both already-played and up-next, so these checks guard against regressions.

const CASES = [
  { key: "nfl", team: "KC", player: "Patrick Mahomes" },
  { key: "nfl", team: "BUF" },
  { key: "nba", team: "LAL", player: "Luka Doncic" },
  { key: "mlb", team: "NYY" },
  { key: "mlb", team: "TOR", player: "Vladimir Guerrero Jr." },
  { key: "nhl", team: "NYR", player: "Artemi Panarin" },
  { key: "epl", team: "ARS", player: "Bukayo Saka" },
  { key: "laliga", team: "RMA", player: "Kylian Mbappe" },
  { key: "mls", team: "ATL", player: "Miguel Almiron" },
  { key: "ucl", team: "RMA", player: "Vinicius Junior" },
  { key: "ncaaf", team: "ALA" },
  { key: "f1", team: "LP" },
  { key: "atp", team: "SIN" },
  { key: "wta", team: "SAB" },
];

describe("demo data consistency", () => {
  it.each(CASES)("$key/$team is deterministic", ({ key, team, player }) => {
    const adapter = require(`../../src/adapters/${key}`);
    const first = adapter.getDemoData(team, player);
    const second = adapter.getDemoData(team, player);
    expect(second).toEqual(first);
  });

  it.each(CASES)("$key/$team is internally consistent", ({ key, team, player }) => {
    const adapter = require(`../../src/adapters/${key}`);
    const data = adapter.getDemoData(team, player);
    expect(checkDemoConsistency(data)).toEqual([]);
  });

  it.each(CASES)("$key/$team carries a team and a record", ({ key, team, player }) => {
    const adapter = require(`../../src/adapters/${key}`);
    const data = adapter.getDemoData(team, player);
    expect(data.team).toBeTruthy();
    expect(data.record).toBeTruthy();
    expect(typeof data.record.wins).toBe("number");
    expect(typeof data.record.losses).toBe("number");
  });
});

describe("demo data never depends on the wall clock", () => {
  // Freezing time to two very different instants must not change the output,
  // otherwise the committed examples would churn on every regeneration.
  it.each(CASES)("$key/$team is stable across dates", ({ key, team, player }) => {
    const adapter = require(`../../src/adapters/${key}`);
    const realNow = Date.now;
    try {
      Date.now = () => new Date("2026-01-04T00:00:00Z").getTime();
      const january = JSON.stringify(adapter.getDemoData(team, player));
      Date.now = () => new Date("2027-06-15T12:00:00Z").getTime();
      const june = JSON.stringify(adapter.getDemoData(team, player));
      expect(june).toBe(january);
    } finally {
      Date.now = realNow;
    }
  });
});

describe("demo consistency catches every contradiction it claims to", () => {
  // checks 1–3 had no negative test: they were only ever called on data that
  // satisfied them, so nothing proved they would fire at all.
  it("rejects a record that covers fewer games than the board shows", () => {
    expect(checkDemoConsistency({
      record: { wins: 1, losses: 0, draws: 0 },
      recentGames: [{ date: "2026-01-01", won: true }, { date: "2026-01-08", won: true }],
    })).toEqual([expect.stringContaining("record covers only 1")]);
  });

  it("rejects a next opponent that was just played", () => {
    expect(checkDemoConsistency({
      record: { wins: 1, losses: 0, draws: 0 },
      recentGames: [{ date: "2026-01-01", oppAbbr: "KC", won: true }],
      nextGame: { opponent: "KC" },
    })).toEqual([expect.stringContaining("also appears in recent games")]);
  });

  it("rejects a spotlight last game that is not among the recent games", () => {
    expect(checkDemoConsistency({
      record: { wins: 1, losses: 0, draws: 0 },
      recentGames: [{ date: "2026-01-01T00:00:00Z", won: true }],
      spotlight: { lastGame: { date: "2025-12-01T00:00:00Z" } },
    })).toEqual([expect.stringContaining("matches no recent game")]);
  });

  it("reports missing data instead of passing silently", () => {
    expect(checkDemoConsistency(null)).toEqual(["no data returned"]);
  });
});

describe("demo scorelines never contradict the result", () => {
  // The sample generator floored the winning margin at zero, so a zero-point
  // winner rendered as "W 0-0". That is only reachable where scores start at
  // 0 — soccer and hockey — and it shipped in every one of those galleries
  // until the World Cup's demo made it obvious. These cases prove the guard
  // rejects that shape rather than merely not noticing it.
  function withGame(game) {
    return { record: { wins: 1, losses: 0, draws: 0 }, recentGames: [{ date: "2026-01-04T00:00:00Z", ...game }] };
  }

  it("rejects a win that was not won", () => {
    expect(checkDemoConsistency(withGame({ teamScore: 0, oppScore: 0, won: true, drew: false })))
      .toEqual([expect.stringContaining("is a win at 0-0")]);
  });

  it("rejects a loss with a winning score", () => {
    expect(checkDemoConsistency(withGame({ teamScore: 3, oppScore: 1, won: false, drew: false })))
      .toEqual([expect.stringContaining("is a loss at 3-1")]);
  });

  it("rejects a draw with unequal scores", () => {
    expect(checkDemoConsistency(withGame({ teamScore: 2, oppScore: 1, won: false, drew: true })))
      .toEqual([expect.stringContaining("is a draw at 2-1")]);
  });

  it("accepts results that match their scoreline", () => {
    expect(checkDemoConsistency(withGame({ teamScore: 1, oppScore: 0, won: true, drew: false }))).toEqual([]);
    expect(checkDemoConsistency(withGame({ teamScore: 1, oppScore: 1, won: false, drew: true }))).toEqual([]);
    expect(checkDemoConsistency(withGame({ teamScore: 0, oppScore: 2, won: false, drew: false }))).toEqual([]);
  });

  it("ignores games that declare no result", () => {
    // Scores without flags are not a claim that anything won.
    expect(checkDemoConsistency(withGame({ teamScore: 1, oppScore: 1 }))).toEqual([]);
  });
});

// The curated CASES list above missed `wnba`, which is how a Date.now() leak in
// its demo board went unnoticed until its committed example began churning. This
// block derives a case from every league instead, and uses fake timers so that
// `new Date()` (not just Date.now()) is frozen too.
//
// Only the date-bearing fields are compared: a demo board may legitimately label
// its record with the current season year (most adapters do), but its DATES must
// come from the pinned demo clock, or the committed examples churn on every
// regeneration.
const ALL_LEAGUES = LEAGUES.map(({ key }) => key)
  .map((key) => ({ key, team: Object.keys(require(`../../src/adapters/${key}`).DEMO_TEAMS || {})[0] }))
  .filter(({ team }) => Boolean(team));

function demoDates(data) {
  return JSON.stringify({
    recent: (data.recentGames || []).map((game) => game.date),
    next: data.nextGame?.date ?? null,
    spotlight: data.spotlight?.lastGame?.date ?? null,
  });
}

describe("every league's demo dates ignore the system clock", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it.each(ALL_LEAGUES)("$key uses pinned dates on any day", ({ key, team }) => {
    const adapter = require(`../../src/adapters/${key}`);

    jest.setSystemTime(new Date("2026-01-04T00:00:00Z"));
    const early = demoDates(adapter.getDemoData(team));
    jest.setSystemTime(new Date("2026-09-19T12:00:00Z"));
    const late = demoDates(adapter.getDemoData(team));

    expect(late).toBe(early);
  });

  it.each(ALL_LEAGUES)("$key demo data is internally consistent", ({ key, team }) => {
    const adapter = require(`../../src/adapters/${key}`);
    expect(checkDemoConsistency(adapter.getDemoData(team))).toEqual([]);
  });
});
