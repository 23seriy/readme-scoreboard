const fs = require("node:fs");

describe("README maintenance workflow coordination", () => {
  it("serializes season and college updates through one concurrency group", () => {
    const season = fs.readFileSync(".github/workflows/update-season-status.yml", "utf8");
    const college = fs.readFileSync(".github/workflows/update-college-rosters.yml", "utf8");
    const group = /concurrency:\n {2}group: ([^\n]+)/;

    expect(season).toMatch(group);
    expect(college).toMatch(group);
    expect(season.match(group)[1]).toBe("readme-maintenance");
    expect(college.match(group)[1]).toBe("readme-maintenance");
    expect(season).toContain("cancel-in-progress: false");
    expect(college).toContain("cancel-in-progress: false");
  });

  it("bounds scheduled maintenance and verification jobs", () => {
    for (const file of [
      ".github/workflows/update-season-status.yml",
      ".github/workflows/update-college-rosters.yml",
      ".github/workflows/check-season-dates.yml",
      ".github/workflows/api-health.yml",
    ]) {
      const workflow = fs.readFileSync(file, "utf8");
      expect(workflow).toMatch(/runs-on: ubuntu-latest\n\s+timeout-minutes: 10/);
    }
  });

  it("keeps workflow permissions explicit and least-privilege", () => {
    for (const file of [
      ".github/workflows/ci.yml",
      ".github/workflows/demo-smoke.yml",
      ".github/workflows/check-season-dates.yml",
      ".github/workflows/api-health.yml",
    ]) {
      const workflow = fs.readFileSync(file, "utf8");
      expect(workflow).toMatch(/permissions:\n\s+contents: read/);
    }

    for (const file of [
      ".github/workflows/update-season-status.yml",
      ".github/workflows/update-college-rosters.yml",
    ]) {
      const workflow = fs.readFileSync(file, "utf8");
      expect(workflow).toMatch(/permissions:\n\s+contents: write\n\s+pull-requests: write/);
    }
  });
});
