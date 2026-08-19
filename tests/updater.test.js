const path = require("path");
const fs = require("fs");
const os = require("os");

// injectContent is not exported, so we test through updateReadmeLocal
const { updateReadme, updateReadmeLocal, parseTargetRepo } = require("../src/updater");

function makeReadme(markerName, inner = "") {
  const start = `<!-- ${markerName} start -->`;
  const end = `<!-- ${markerName} end -->`;
  return `# Title\n${start}\n${inner}\n${end}\n## Footer\n`;
}

describe("updateReadmeLocal / injectContent", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "scoreboard-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("injects content between default markers", () => {
    const readmePath = path.join(tmpDir, "README.md");
    fs.writeFileSync(readmePath, makeReadme("readme-scoreboard"));

    expect(updateReadmeLocal(tmpDir, "new content")).toBe(true);

    const result = fs.readFileSync(readmePath, "utf-8");
    expect(result).toContain("new content");
    expect(result).toContain("<!-- readme-scoreboard start -->");
    expect(result).toContain("<!-- readme-scoreboard end -->");
  });

  it("injects content between custom markers", () => {
    const readmePath = path.join(tmpDir, "README.md");
    fs.writeFileSync(readmePath, makeReadme("readme-scoreboard-mlb"));

    updateReadmeLocal(tmpDir, "mlb content", "readme-scoreboard-mlb");

    const result = fs.readFileSync(readmePath, "utf-8");
    expect(result).toContain("mlb content");
    expect(result).toContain("<!-- readme-scoreboard-mlb start -->");
    expect(result).toContain("<!-- readme-scoreboard-mlb end -->");
  });

  it("replaces existing content between custom markers", () => {
    const readmePath = path.join(tmpDir, "README.md");
    fs.writeFileSync(readmePath, makeReadme("readme-scoreboard-nhl", "old nhl stats"));

    updateReadmeLocal(tmpDir, "new nhl stats", "readme-scoreboard-nhl");

    const result = fs.readFileSync(readmePath, "utf-8");
    expect(result).toContain("new nhl stats");
    expect(result).not.toContain("old nhl stats");
  });

  it("supports multiple independent marker sections in one README", () => {
    const readmePath = path.join(tmpDir, "README.md");
    const content =
      makeReadme("readme-scoreboard-mlb", "old mlb") +
      makeReadme("readme-scoreboard-nhl", "old nhl");
    fs.writeFileSync(readmePath, content);

    updateReadmeLocal(tmpDir, "new mlb", "readme-scoreboard-mlb");

    const result = fs.readFileSync(readmePath, "utf-8");
    expect(result).toContain("new mlb");
    expect(result).toContain("old nhl");
  });

  it("exits with error when markers are not found", () => {
    const readmePath = path.join(tmpDir, "README.md");
    fs.writeFileSync(readmePath, "# No markers here\n");

    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    expect(() => updateReadmeLocal(tmpDir, "content", "readme-scoreboard-mlb")).toThrow();
    mockExit.mockRestore();
  });

  it("skips write when content is unchanged", () => {
    const readmePath = path.join(tmpDir, "README.md");
    const initial = makeReadme("readme-scoreboard", "same content");
    fs.writeFileSync(readmePath, initial);

    // Inject the same content that's already there after injection
    expect(updateReadmeLocal(tmpDir, "same content")).toBe(false);

    // mtimeMs should be the same if no write happened — but Jest doesn't guarantee
    // timing precision, so just verify the content is still valid
    const result = fs.readFileSync(readmePath, "utf-8");
    expect(result).toContain("same content");
  });
});

describe("updateReadme target handling", () => {
  it.each(["owner/repo/extra", "/repo", "owner/", "owner", ""]) (
    "rejects malformed target %s before API use",
    (target) => {
      expect(() => parseTargetRepo(target)).toThrow(/owner\/repo/);
    }
  );

  it("retries once after a stale README SHA conflict", async () => {
    const getContent = jest.fn()
      .mockResolvedValueOnce({ data: { content: Buffer.from(makeReadme("readme-scoreboard")).toString("base64"), sha: "old-sha" } })
      .mockResolvedValueOnce({ data: { content: Buffer.from(makeReadme("readme-scoreboard")).toString("base64"), sha: "new-sha" } });
    const createOrUpdateFileContents = jest.fn()
      .mockRejectedValueOnce({ status: 409, message: "sha conflict" })
      .mockResolvedValueOnce({ data: {} });
    const octokit = { repos: { getContent, createOrUpdateFileContents } };

    await expect(updateReadme(octokit, "owner/repo", "fresh content")).resolves.toBe(true);

    expect(getContent).toHaveBeenCalledTimes(2);
    expect(createOrUpdateFileContents).toHaveBeenCalledTimes(2);
    expect(createOrUpdateFileContents.mock.calls[1][0].sha).toBe("new-sha");
  });
});
