const { checkDemoConsistency } = require("../../src/demo");

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
