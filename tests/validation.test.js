const { supportedTeams, validateInputs } = require("../src/validation");

const adapter = {
  DEMO_TEAMS: { LAL: {}, BOS: {} },
  TEAM_IDS: { LAL: 13, BOS: 2, NYK: 18 },
};

describe("input validation", () => {
  const base = { sport: "nba", team: "LAL", isDemo: false, adapter, supportedSports: ["nba", "mlb"] };

  it("accepts valid live inputs and target repositories", () => {
    expect(() => validateInputs({ ...base, targetRepo: "owner/repository" })).not.toThrow();
  });

  it("rejects unsupported sports before loading data", () => {
    expect(() => validateInputs({ ...base, sport: "cricket" })).toThrow(/Unsupported sport/);
  });

  it("rejects unknown team abbreviations with examples", () => {
    expect(() => validateInputs({ ...base, team: "ZZZ" })).toThrow(/Unknown nba team abbreviation "ZZZ".*LAL/);

    const namedAdapter = { TEAM_IDS: { LAL: 13 }, ESPN_TEAM_IDS: { LAL: { full_name: "Los Angeles Lakers" } } };
    expect(() => validateInputs({ ...base, adapter: namedAdapter, team: "ZZZ" })).toThrow(/LAL \(Los Angeles Lakers\)/);
  });

  it("validates demo teams separately from live team IDs", () => {
    expect(supportedTeams(adapter, true)).toEqual(["BOS", "LAL"]);
    expect(() => validateInputs({ ...base, isDemo: true, team: "NYK" })).toThrow(/Unknown nba demo team/);
  });

  it("rejects malformed target repositories", () => {
    expect(() => validateInputs({ ...base, targetRepo: "not-a-repository" })).toThrow(/owner\/repository format/);
  });

  it("allows player: with sport: nba and a single team", () => {
    expect(() => validateInputs({ ...base, player: "Luka Dončić", teamsCount: 1 })).not.toThrow();
  });

  it("allows player: with sport: mlb and a single team", () => {
    expect(() => validateInputs({ ...base, sport: "mlb", player: "Vladimir Guerrero Jr.", teamsCount: 1 })).not.toThrow();
  });

  it("allows player: with sport: nfl and a single team", () => {
    expect(() => validateInputs({ ...base, sport: "nfl", player: "Patrick Mahomes", teamsCount: 1, supportedSports: ["nba", "mlb", "nfl", "nhl"] })).not.toThrow();
  });

  it("allows player: with sport: nhl and a single team", () => {
    expect(() => validateInputs({ ...base, sport: "nhl", player: "Artemi Panarin", teamsCount: 1, supportedSports: ["nba", "mlb", "nfl", "nhl"] })).not.toThrow();
  });

  it("allows player: for every soccer league", () => {
    const soccer = [
      "mls", "epl", "laliga", "bundesliga", "seriea", "ligue1", "primeiraliga",
      "eredivisie", "ligamx", "brasileirao", "nwsl", "saudipro", "j1",
      "scottish", "belgian", "ucl", "uel", "argentina", "aleague", "isl", "csl",
    ];
    for (const sport of soccer) {
      expect(() => validateInputs({
        ...base,
        sport,
        player: "Some Player",
        teamsCount: 1,
        supportedSports: ["nba", "mlb", "nfl", "nhl", ...soccer],
      })).not.toThrow();
    }
  });

  it("rejects player: for basketball leagues ESPN publishes no stats for", () => {
    for (const sport of ["wnba", "ncaab", "ncaaw"]) {
      expect(() => validateInputs({
        ...base,
        sport,
        player: "A'ja Wilson",
        teamsCount: 1,
        supportedSports: ["nba", "mlb", "nfl", "nhl", "wnba", "ncaab", "ncaaw"],
      })).toThrow(new RegExp(`player: is not yet supported for sport "${sport}"`));
    }
  });

  it("rejects player: for leagues with no athlete stats", () => {
    for (const sport of ["ncaaf", "gleague", "ncaa_hockey"]) {
      expect(() => validateInputs({
        ...base,
        sport,
        player: "Someone",
        teamsCount: 1,
        supportedSports: ["nba", "ncaaf", "gleague", "ncaa_hockey"],
      })).toThrow(new RegExp(`player: is not yet supported for sport "${sport}"`));
    }
  });

  it("rejects player: for individual-sport boards that already track one athlete", () => {
    for (const sport of ["f1", "atp", "wta"]) {
      expect(() => validateInputs({
        ...base,
        sport,
        player: "Someone",
        teamsCount: 1,
        supportedSports: ["nba", "f1", "atp", "wta"],
      })).toThrow(new RegExp(`player: is not yet supported for sport "${sport}"`));
    }
  });

  it("rejects player: together with multiple teams", () => {
    expect(() => validateInputs({ ...base, player: "Luka Dončić", teamsCount: 2 }))
      .toThrow(/player: is not supported together with teams:/);
  });

  it("allows player: for a soccer league now that the spotlight is implemented", () => {
    expect(() => validateInputs({ ...base, sport: "epl", player: "Bukayo Saka", teamsCount: 1, supportedSports: ["nba", "mlb", "nfl", "nhl", "epl"] }))
      .not.toThrow();
  });

  it("allows omitting player: entirely", () => {
    expect(() => validateInputs({ ...base, teamsCount: 1 })).not.toThrow();
  });
});
