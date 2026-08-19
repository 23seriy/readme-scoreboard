const { inspectConfig } = require("../scripts/doctor");

describe("configuration doctor", () => {
  it("accepts a complete action configuration without making requests", () => {
    expect(inspectConfig({ SPORT: "nba", TEAM: "LAL", GH_TOKEN: "token", TARGET_REPO: "owner/repo", MARKER: "scoreboard" })).toEqual({
      errors: [],
      warnings: [],
    });
  });

  it("reports every actionable configuration problem", () => {
    const result = inspectConfig({ SPORT: "curling", TEAM: "???", TARGET_REPO: "bad", MARKER: "bad marker" });

    expect(result.errors).toEqual(expect.arrayContaining([
      expect.stringMatching(/Unsupported sport/),
      expect.stringMatching(/TARGET_REPO/),
      expect.stringMatching(/MARKER/),
    ]));
    expect(result.warnings).toContain("GH_TOKEN is not set; README updates will be skipped outside a checked-out workspace.");
  });

  it("allows demo mode without a team or token", () => {
    expect(inspectConfig({ SPORT: "ncaab", DEMO: true })).toEqual({ errors: [], warnings: [] });
  });
});
