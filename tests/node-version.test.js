const fs = require("node:fs");
const path = require("node:path");

const WORKFLOW_DIR = ".github/workflows";
const NVMRC = path.join(__dirname, "..", ".nvmrc");

// Lowest major mentioned in a range, so "^20.19.0 || ^22.13.0 || >=24" reports 20
// rather than passing as "24 is in there somewhere".
function lowestMajor(range) {
  const numbers = [...String(range).matchAll(/\d+/g)]
    .map((match) => Number(match[0]))
    .filter((value) => value >= 18);
  return numbers.length > 0 ? Math.min(...numbers) : null;
}

const pinned = fs.existsSync(NVMRC) ? fs.readFileSync(NVMRC, "utf8").trim() : "";

describe("Node.js version", () => {
  // Node 24 was only ever implied: CI and action.yml ran on it while nothing
  // declared it, so a contributor could be a major behind without knowing, and
  // package manages could not warn anybody. These pin the declaration to the
  // thing that actually runs.
  it("pins .nvmrc to a single major", () => {
    expect(fs.existsSync(NVMRC)).toBe(true);
    expect(pinned).toMatch(/^\d+$/);
  });

  it("declares that same major as the minimum in package.json", () => {
    const { engines } = require("../package.json");

    expect(engines?.node).toBeDefined();
    expect(lowestMajor(engines.node)).toBe(Number(pinned));
  });

  it("runs the action itself on the pinned major", () => {
    const action = fs.readFileSync("action.yml", "utf8");

    expect(action.match(/node-version:\s*"([^"]+)"/)?.[1]).toBe(pinned);
  });

  it("runs every workflow that uses Node on the pinned major", () => {
    const files = fs.readdirSync(WORKFLOW_DIR).filter((file) => file.endsWith(".yml"));
    const withNode = files.filter((file) =>
      fs.readFileSync(path.join(WORKFLOW_DIR, file), "utf8").includes("node-version"));

    expect(withNode.length).toBeGreaterThan(0);
    for (const file of withNode) {
      const versions = [...fs.readFileSync(path.join(WORKFLOW_DIR, file), "utf8")
        .matchAll(/node-version:\s*"([^"]+)"/g)].map((match) => match[1]);

      expect(versions.length).toBeGreaterThan(0);
      for (const version of versions) expect(version).toBe(pinned);
    }
  });

  it("tells contributors, developers, and bug reporters the same major", () => {
    expect(fs.readFileSync("CONTRIBUTING.md", "utf8")).toContain(`Node.js ${pinned}+`);
    expect(fs.readFileSync("README.md", "utf8")).toContain(`Node.js ${pinned} or newer`);
    expect(fs.readFileSync(".github/ISSUE_TEMPLATE/bug_report.md", "utf8")).toContain(`(e.g., ${pinned}.x)`);
  });
});
