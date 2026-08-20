const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { summaryMarkdown, writeStepSummary, writeActionOutputs } = require("../src/action-summary");

describe("GitHub Actions step summary", () => {
  it("renders the run details as a compact table", () => {
    const summary = summaryMarkdown({
      sport: "nba",
      team: "LAL",
      mode: "live",
      result: "✅ README updated",
      targetRepo: "owner/repo",
    });

    expect(summary).toContain("## 🏆 readme-scoreboard");
    expect(summary).toContain("| League | NBA |");
    expect(summary).toContain("| Sport | NBA |");
    expect(summary).toContain("| Team | LAL |");
    expect(summary).toContain("| Destination | owner/repo |");
  });

  it("writes a summary only when Actions provides a summary path", () => {
    const summaryPath = path.join(os.tmpdir(), `readme-scoreboard-summary-${process.pid}`);
    try {
      expect(writeStepSummary({ sport: "mlb", team: "NYY", mode: "preview", result: "⏭️ README update skipped" }, summaryPath)).toBe(true);
      expect(fs.readFileSync(summaryPath, "utf8")).toContain("| Result | ⏭️ README update skipped |");
      expect(writeStepSummary({ sport: "nba", team: "LAL", mode: "live", result: "✅ README updated" }, "")).toBe(false);
    } finally {
      fs.rmSync(summaryPath, { force: true });
    }
  });

  it("writes machine-readable outputs for downstream workflow steps", () => {
    const outputPath = path.join(os.tmpdir(), `readme-scoreboard-output-${process.pid}`);
    try {
      expect(writeActionOutputs({ updated: true, mode: "live", targetRepo: "owner/repo" }, outputPath)).toBe(true);
      expect(fs.readFileSync(outputPath, "utf8")).toBe("updated=true\nmode=live\ntarget_repo=owner/repo\n");
      expect(writeActionOutputs({ updated: false, mode: "dry-run", targetRepo: "" }, "")).toBe(false);
    } finally {
      fs.rmSync(outputPath, { force: true });
    }
  });
});
