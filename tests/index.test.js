const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

describe("main", () => {
  const originalEnv = process.env;
  let updateReadme;
  let updateReadmeLocal;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      GH_TOKEN: "test-token",
      SPORT: "nba",
      TEAM: "LAL",
      GITHUB_WORKSPACE: "/tmp/github-workspace",
      TARGET_REPO: "",
    };

    updateReadme = jest.fn().mockResolvedValue(true);
    updateReadmeLocal = jest.fn();

    jest.doMock("@octokit/rest", () => ({
      Octokit: jest.fn(() => ({
        users: { getAuthenticated: jest.fn().mockResolvedValue({ data: { login: "octocat" } }) },
      })),
    }));
    jest.doMock("../src/updater", () => ({ updateReadme, updateReadmeLocal }));
    jest.doMock("../src/renderers/markdown", () => ({ render: jest.fn(() => "scoreboard") }));
    jest.doMock("../src/adapters/nba", () => ({
      TEAM_EMOJI: {},
      getLogoUrl: jest.fn(() => "https://example.com/logo.png"),
      fetchData: jest.fn().mockResolvedValue({
        team: { abbreviation: "LAL", full_name: "Los Angeles Lakers" },
        record: {},
        recentGames: [],
      }),
    }));
    jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it("uses the GitHub API when an Actions workspace and token are both present", async () => {
    const outputPath = path.join(os.tmpdir(), `readme-scoreboard-index-output-${process.pid}`);
    process.env.GITHUB_OUTPUT = outputPath;
    const { main } = require("../src/index");

    try {
      await main();

      expect(updateReadme).toHaveBeenCalledWith(expect.anything(), "octocat/octocat", expect.stringContaining("scoreboard\n\n_Last updated:"), undefined);
      expect(updateReadmeLocal).not.toHaveBeenCalled();
      expect(fs.readFileSync(outputPath, "utf8")).toBe("updated=true\nmode=live\ntarget_repo=octocat/octocat\n");
    } finally {
      fs.rmSync(outputPath, { force: true });
    }
  });

  it("renders live data without writing when dry run is enabled", async () => {
    process.env.GH_TOKEN = "";
    process.env.DRY_RUN = "true";

    const { main } = require("../src/index");

    await main();

    expect(updateReadme).not.toHaveBeenCalled();
    expect(updateReadmeLocal).not.toHaveBeenCalled();
  });

  it("accepts explicit dry-run boolean values and rejects typos", () => {
    const { parseDryRun, parseCompact } = require("../src/index");

    expect(parseDryRun("true")).toBe(true);
    expect(parseDryRun("1")).toBe(true);
    expect(parseDryRun("yes")).toBe(true);
    expect(parseDryRun("false")).toBe(false);
    expect(parseDryRun("0")).toBe(false);
    expect(parseDryRun("no")).toBe(false);
    expect(() => parseDryRun("tru")).toThrow(/DRY_RUN must be true or false/);
    expect(parseCompact("yes")).toBe(true);
    expect(parseCompact("0")).toBe(false);
    expect(() => parseCompact("maybe")).toThrow(/COMPACT must be true or false/);
  });
});
