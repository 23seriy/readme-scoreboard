const fs = require("node:fs");

const workflow = fs.readFileSync(".github/workflows/codeql.yml", "utf8");

// The repository deliberately uses code scanning's ADVANCED setup instead of the
// GitHub-managed default setup: the managed run's Copilot AI-findings step called
// a model this account cannot use and failed on every push. See the workflow's
// header comment. These assertions keep that arrangement from being undone by
// accident — re-enabling default setup silently disables SARIF uploads from here.
describe("code scanning workflow", () => {
  it("scans the same languages default setup used", () => {
    expect(workflow).toContain("language: [actions, javascript-typescript]");
  });

  it("keeps the analysis categories stable so alerts carry over", () => {
    expect(workflow).toContain('category: "/language:${{ matrix.language }}"');
  });

  it("requests security-events: write, which the upload requires", () => {
    expect(workflow).toContain("security-events: write");
  });

  it("stays least-privilege at the workflow level", () => {
    expect(workflow).toMatch(/permissions:\n\s+contents: read\n/);
  });

  it("bounds the analysis and supersedes in-flight runs", () => {
    expect(workflow).toContain("timeout-minutes: 20");
    expect(workflow).toContain("concurrency:");
    expect(workflow).toContain("cancel-in-progress: true");
  });

  it("can be run on demand as well as on pushes and a weekly schedule", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("schedule:");
    expect(workflow).toContain("branches: [main]");
  });
});
