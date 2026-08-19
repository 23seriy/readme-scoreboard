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
});
