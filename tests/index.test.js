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

    updateReadme = jest.fn().mockResolvedValue();
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
    const { main } = require("../src/index");

    await main();

    expect(updateReadme).toHaveBeenCalledWith(expect.anything(), "octocat/octocat", "scoreboard", undefined);
    expect(updateReadmeLocal).not.toHaveBeenCalled();
  });
});
