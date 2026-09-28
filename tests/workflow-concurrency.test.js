const fs = require("node:fs");

describe("README maintenance workflow coordination", () => {
  it("serializes season and team-directory updates through one concurrency group", () => {
    const season = fs.readFileSync(".github/workflows/update-season-status.yml", "utf8");
    const teamDir = fs.readFileSync(".github/workflows/update-team-directory.yml", "utf8");
    const group = /concurrency:\n {2}group: ([^\n]+)/;

    expect(season).toMatch(group);
    expect(teamDir).toMatch(group);
    expect(season.match(group)[1]).toBe("readme-maintenance");
    expect(teamDir.match(group)[1]).toBe("readme-maintenance");
    expect(season).toContain("cancel-in-progress: false");
    expect(teamDir).toContain("cancel-in-progress: false");
  });

  it("serializes release alias updates so concurrent releases cannot race", () => {
    const release = fs.readFileSync(".github/workflows/release.yml", "utf8");
    const group = /concurrency:\n {2}group: ([^\n]+)/;

    // Two releases published back-to-back both force-push `v1`; without a
    // concurrency group the loser fails with "cannot lock ref 'refs/tags/v1'".
    expect(release).toMatch(group);
    expect(release.match(group)[1]).toBe("release-major-tag");
    expect(release).toContain("cancel-in-progress: false");
    // A release must not queue behind scheduled README maintenance.
    expect(release.match(group)[1]).not.toBe("readme-maintenance");
  });

  it("bounds scheduled maintenance and verification jobs", () => {
    for (const file of [
      ".github/workflows/update-season-status.yml",
      ".github/workflows/update-team-directory.yml",
      ".github/workflows/check-season-dates.yml",
      ".github/workflows/api-health.yml",
    ]) {
      const workflow = fs.readFileSync(file, "utf8");
      expect(workflow).toMatch(/runs-on: ubuntu-24\.04\n\s+timeout-minutes: 10/);
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
      ".github/workflows/update-team-directory.yml",
    ]) {
      const workflow = fs.readFileSync(file, "utf8");
      expect(workflow).toMatch(/permissions:\n\s+contents: write\n\s+pull-requests: write/);
    }
  });
});
