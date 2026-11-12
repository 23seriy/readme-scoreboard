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

  it("accepts an http(s) heading link and rejects anything else", () => {
    expect(() => validateInputs({ ...base, link: "https://example.com/team" })).not.toThrow();
    expect(() => validateInputs({ ...base, link: "http://example.com" })).not.toThrow();
    // Omitted or empty keeps the league default, so it must not be rejected.
    expect(() => validateInputs({ ...base, link: "" })).not.toThrow();
    expect(() => validateInputs({ ...base, link: undefined })).not.toThrow();
    // A bare host or a javascript: URL would render as a broken link.
    expect(() => validateInputs({ ...base, link: "example.com" })).toThrow(/must be an http\(s\) URL/);
    expect(() => validateInputs({ ...base, link: "javascript:alert(1)" })).toThrow(/must be an http\(s\) URL/);
  });

  it("rejects unsupported sports before loading data", () => {
    expect(() => validateInputs({ ...base, sport: "cricket" })).toThrow(/Unsupported sport/);
  });

  it("validates live teams against the team directory, not just the adapter tables", () => {
    // belgian ships TEAM_IDS = {}, scottish only CEL/RAN of 12 clubs — both
    // used to reject real teams that the README's own directory lists.
    const emptyAdapter = { TEAM_IDS: {}, DEMO_TEAMS: { AND: {}, BRU: {} } };
    expect(() => validateInputs({ ...base, sport: "belgian", team: "AND", adapter: emptyAdapter, supportedSports: ["nba", "belgian"] })).not.toThrow();
    expect(() => validateInputs({ ...base, sport: "belgian", team: "ZZZ", adapter: emptyAdapter, supportedSports: ["nba", "belgian"] }))
      .toThrow(/Unknown belgian team abbreviation "ZZZ".*AND \(Anderlecht\)/);

    const scottishAdapter = { TEAM_IDS: { CEL: 256, RAN: 257 }, DEMO_TEAMS: { CEL: {}, RAN: {} } };
    expect(() => validateInputs({ ...base, sport: "scottish", team: "ABE", adapter: scottishAdapter, supportedSports: ["nba", "scottish"] })).not.toThrow();
    expect(() => validateInputs({ ...base, sport: "scottish", team: "HIBS", adapter: scottishAdapter, supportedSports: ["nba", "scottish"] })).not.toThrow();
  });

  it("accepts directory-only college teams and the NFL WAS alias", () => {
    // The NCAA adapters only list 4 teams each; the directory lists hundreds.
    const ncaafAdapter = { TEAM_IDS: { ALA: 1, OSU: 2, MICH: 3, UGA: 4 }, DEMO_TEAMS: {} };
    expect(() => validateInputs({ ...base, sport: "ncaaf", team: "TEX", adapter: ncaafAdapter, supportedSports: ["nba", "ncaaf"] })).not.toThrow();

    // WAS is not in the directory (it lists WSH); it survives only because
    // the adapter's table still contributes its keys.
    const nflAdapter = { TEAM_IDS: { WAS: 32 }, DEMO_TEAMS: {} };
    expect(() => validateInputs({ ...base, sport: "nfl", team: "WAS", adapter: nflAdapter, supportedSports: ["nba", "nfl"] })).not.toThrow();
  });

  it("keeps validating individual sports from the adapter tables", () => {
    // atp, wta, nascar, indycar and ufc have no directory entries — their
    // TEAM_IDS are players, drivers and fighters, so validation still comes
    // from the adapter alone.
    const atpAdapter = { TEAM_IDS: { SIN: 1, ALC: 2 }, DEMO_TEAMS: {} };
    expect(() => validateInputs({ ...base, sport: "atp", team: "SIN", adapter: atpAdapter, supportedSports: ["nba", "atp"] })).not.toThrow();
    expect(() => validateInputs({ ...base, sport: "atp", team: "ZZZ", adapter: atpAdapter, supportedSports: ["nba", "atp"] }))
      .toThrow(/Unknown atp team abbreviation "ZZZ"/);
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
    expect(() => validateInputs({ ...base, player: "Luka Doncic", teamsCount: 1 })).not.toThrow();
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

  it("allows player: with sport: wnba, which shares the NBA's athlete endpoints", () => {
    expect(() => validateInputs({
      ...base,
      sport: "wnba",
      player: "Napheesa Collier",
      teamsCount: 1,
      supportedSports: ["nba", "wnba", "mlb", "nfl", "nhl"],
    })).not.toThrow();
  });

  it("allows player: for college basketball, which shares the NBA's athlete endpoints", () => {
    for (const sport of ["ncaab", "ncaaw"]) {
      expect(() => validateInputs({
        ...base,
        sport,
        player: "Some Player",
        teamsCount: 1,
        supportedSports: ["nba", "wnba", "ncaab", "ncaaw"],
      })).not.toThrow();
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
    for (const sport of ["atp", "wta"]) {
      expect(() => validateInputs({
        ...base,
        sport,
        player: "Someone",
        teamsCount: 1,
        supportedSports: ["nba", "atp", "wta"],
      })).toThrow(new RegExp(`player: is not yet supported for sport "${sport}"`));
    }
  });

  it("rejects player: for constructor-based boards with no athlete roster", () => {
    // F1 is a team sport (constructors, not drivers), so it is excluded for a
    // different reason than the individual-sport boards above.
    expect(() => validateInputs({
      ...base,
      sport: "f1",
      player: "Someone",
      teamsCount: 1,
      supportedSports: ["nba", "f1"],
    })).toThrow('player: is not yet supported for sport "f1"');
  });

  it("rejects player: together with multiple teams", () => {
    expect(() => validateInputs({ ...base, player: "Luka Doncic", teamsCount: 2 }))
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
