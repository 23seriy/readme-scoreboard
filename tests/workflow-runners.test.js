const fs = require("node:fs");
const path = require("node:path");

const WORKFLOW_DIR = ".github/workflows";

function workflowFiles() {
  return fs
    .readdirSync(WORKFLOW_DIR)
    .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
    .sort();
}

function runnerLabels(file) {
  const workflow = fs.readFileSync(path.join(WORKFLOW_DIR, file), "utf8");
  return [...workflow.matchAll(/runs-on: (.+)$/gm)].map((match) => match[1].trim());
}

describe("workflow runner pinning", () => {
  // `ubuntu-latest` is a moving target: GitHub migrates it to a newer Ubuntu
  // release on its own schedule (the runner-images notice announced Ubuntu 26
  // for 2026-10-19), so behaviour can change without a commit in this repo.
  // Pinning keeps CI reproducible; upgrading becomes a deliberate change.
  it("pins every job to a versioned Ubuntu runner", () => {
    for (const file of workflowFiles()) {
      const runners = runnerLabels(file);

      expect(runners.length).toBeGreaterThan(0);
      for (const runner of runners) {
        expect(runner).toMatch(/^ubuntu-\d{2}\.\d{2}$/);
      }
    }
  });

  it("uses one consistent runner across every workflow", () => {
    const runners = new Set();
    for (const file of workflowFiles()) {
      for (const runner of runnerLabels(file)) {
        runners.add(runner);
      }
    }

    expect([...runners]).toEqual(["ubuntu-24.04"]);
  });

  // The README shows users how to write *their* workflow; that example should
  // keep using the floating label, so guard against a careless find-and-replace.
  it("leaves the README's example workflow on the floating label", () => {
    const readme = fs.readFileSync("README.md", "utf8");
    expect(readme).toContain("runs-on: ubuntu-latest");
  });
});
