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
});
