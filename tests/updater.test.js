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
    const mockError = jest.spyOn(console, "error").mockImplementation();

    expect(() => updateReadmeLocal(tmpDir, "content", "readme-scoreboard-mlb")).toThrow();
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining("Marker not found in README.md"));
    mockError.mockRestore();
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

  it("exits with error when TARGET_REPO is malformed", async () => {
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const mockError = jest.spyOn(console, "error").mockImplementation();

    await expect(updateReadme({ repos: {} }, "not-a-valid-target", "content")).rejects.toThrow(
      "process.exit called",
    );
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining("Invalid TARGET_REPO format"));

    mockError.mockRestore();
    mockExit.mockRestore();
  });

  it("exits with error when fetching the README fails", async () => {
    const getContent = jest.fn().mockRejectedValue(new Error("404 Not Found"));
    const octokit = { repos: { getContent } };

    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const mockError = jest.spyOn(console, "error").mockImplementation();
    const mockLog = jest.spyOn(console, "log").mockImplementation();

    await expect(updateReadme(octokit, "owner/repo", "content")).rejects.toThrow(
      "process.exit called",
    );
    expect(mockError).toHaveBeenCalledWith(
      expect.stringContaining("Failed to fetch README.md from owner/repo"),
    );

    mockLog.mockRestore();
    mockError.mockRestore();
    mockExit.mockRestore();
  });

  it("returns false when the README already contains the target content", async () => {
    const existing = makeReadme("readme-scoreboard", "same content");
    const getContent = jest.fn().mockResolvedValue({
      data: { content: Buffer.from(existing).toString("base64"), sha: "sha-1" },
    });
    const createOrUpdateFileContents = jest.fn();
    const octokit = { repos: { getContent, createOrUpdateFileContents } };

    const mockLog = jest.spyOn(console, "log").mockImplementation();

    await expect(updateReadme(octokit, "owner/repo", "same content")).resolves.toBe(false);
    expect(createOrUpdateFileContents).not.toHaveBeenCalled();

    mockLog.mockRestore();
  });

  it("exits with error when the write fails with a non-conflict status", async () => {
    const getContent = jest.fn().mockResolvedValue({
      data: { content: Buffer.from(makeReadme("readme-scoreboard")).toString("base64"), sha: "sha-1" },
    });
    const createOrUpdateFileContents = jest.fn().mockRejectedValue({ status: 500, message: "server error" });
    const octokit = { repos: { getContent, createOrUpdateFileContents } };

    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const mockError = jest.spyOn(console, "error").mockImplementation();
    const mockLog = jest.spyOn(console, "log").mockImplementation();

    await expect(updateReadme(octokit, "owner/repo", "new content")).rejects.toThrow(
      "process.exit called",
    );
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining("Failed to update README.md"));

    mockLog.mockRestore();
    mockError.mockRestore();
    mockExit.mockRestore();
  });

  it("skips the commit when a 409 retry finds the content already applied", async () => {
    const getContent = jest
      .fn()
      // First fetch: markers present but without the new content, so a write is attempted.
      .mockResolvedValueOnce({
        data: { content: Buffer.from(makeReadme("readme-scoreboard", "old content")).toString("base64"), sha: "old-sha" },
      })
      // Retry fetch: another actor already applied the same content.
      .mockResolvedValueOnce({
        data: { content: Buffer.from(makeReadme("readme-scoreboard", "new content")).toString("base64"), sha: "new-sha" },
      });
    const createOrUpdateFileContents = jest
      .fn()
      .mockRejectedValueOnce({ status: 409, message: "sha conflict" });
    const octokit = { repos: { getContent, createOrUpdateFileContents } };

    const mockLog = jest.spyOn(console, "log").mockImplementation();

    await expect(updateReadme(octokit, "owner/repo", "new content")).resolves.toBe(false);
    expect(createOrUpdateFileContents).toHaveBeenCalledTimes(1);
    expect(getContent).toHaveBeenCalledTimes(2);

    mockLog.mockRestore();
  });

  it("exits with error when the 409 retry also fails", async () => {
    const getContent = jest
      .fn()
      .mockResolvedValueOnce({
        data: { content: Buffer.from(makeReadme("readme-scoreboard")).toString("base64"), sha: "old-sha" },
      })
      .mockRejectedValueOnce(new Error("retry fetch failed"));
    const createOrUpdateFileContents = jest
      .fn()
      .mockRejectedValueOnce({ status: 409, message: "sha conflict" });
    const octokit = { repos: { getContent, createOrUpdateFileContents } };

    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const mockError = jest.spyOn(console, "error").mockImplementation();
    const mockLog = jest.spyOn(console, "log").mockImplementation();

    await expect(updateReadme(octokit, "owner/repo", "new content")).rejects.toThrow(
      "process.exit called",
    );
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining("Failed to update README.md"));

    mockLog.mockRestore();
    mockError.mockRestore();
    mockExit.mockRestore();
  });
});

describe("updateReadmeLocal error handling", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "scoreboard-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("exits with error when README.md does not exist", () => {
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const mockError = jest.spyOn(console, "error").mockImplementation();
    const mockLog = jest.spyOn(console, "log").mockImplementation();

    expect(() => updateReadmeLocal(tmpDir, "content")).toThrow("process.exit called");
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining("README.md not found at"));

    mockLog.mockRestore();
    mockError.mockRestore();
    mockExit.mockRestore();
  });

  it("exits with error when the start marker appears after the end marker", () => {
    const readmePath = path.join(tmpDir, "README.md");
    fs.writeFileSync(
      readmePath,
      "# Title\n<!-- readme-scoreboard end -->\nmiddle\n<!-- readme-scoreboard start -->\n",
    );

    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const mockError = jest.spyOn(console, "error").mockImplementation();
    const mockLog = jest.spyOn(console, "log").mockImplementation();

    expect(() => updateReadmeLocal(tmpDir, "content")).toThrow("process.exit called");
    expect(mockError).toHaveBeenCalledWith(
      expect.stringContaining("Start marker must appear before end marker"),
    );

    mockLog.mockRestore();
    mockError.mockRestore();
    mockExit.mockRestore();
  });
});
