const fs = require("node:fs");
const path = require("node:path");

const { LEAGUES } = require("../../src/config/leagues");
const { runSmokeChecks } = require("../../scripts/demo-smoke");

describe("demo smoke checks", () => {
  it("renders demo data for every supported league", () => {
    expect(runSmokeChecks()).toEqual({ checked: LEAGUES.length, failures: [] });
  });

  it("runs in CI on pushes, pull requests, and manual dispatch", () => {
    const workflowPath = path.join(__dirname, "../../.github/workflows/demo-smoke.yml");
    const workflow = fs.readFileSync(workflowPath, "utf8");

    expect(workflow).toContain("push:");
    expect(workflow).toContain("pull_request:");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("npm run smoke:demo");
  });
});
