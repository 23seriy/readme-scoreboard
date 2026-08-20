const {
  classifySeason,
  formatSeasonCell,
  normalizeSeasonWindow,
  updateSupportedSportsTable,
} = require("../../scripts/update-season-status");
const fs = require("fs");
const path = require("path");

const workflow = fs.readFileSync(
  path.join(__dirname, "../../.github/workflows/update-season-status.yml"),
  "utf-8"
);
const collegeWorkflow = fs.readFileSync(
  path.join(__dirname, "../../.github/workflows/update-college-rosters.yml"),
  "utf-8"
);

describe("season status updater", () => {
  it("serializes scheduled runs and protects the automation branch push", () => {
    expect(workflow).toContain("group: readme-maintenance");
    expect(workflow).toContain("cancel-in-progress: false");
    expect(workflow).toContain("git push --force-with-lease=");
    expect(workflow).not.toContain("git push --force origin automation/season-status");
  });

  it.each([
    [workflow, "season status"],
    [collegeWorkflow, "college roster"],
  ])("opens one %s maintenance PR with the workflow token", (workflowText) => {
    expect(workflowText).toContain("id: publish");
    expect(workflowText).toContain('echo "changed=false" >> "$GITHUB_OUTPUT"');
    expect(workflowText).toContain("if: steps.publish.outputs.changed == 'true'");
    expect(workflowText).toContain("pull-requests: write");
    expect(workflowText).toContain("GH_TOKEN: ${{ github.token }}");
    expect(workflowText).toContain("gh pr list");
    expect(workflowText).toContain("gh pr create");
    expect(workflowText).toContain("--state open");
  });

  it("marks a season in progress and shows its end date", () => {
    const status = classifySeason(
      { startDate: "2026-08-01T00:00:00Z", endDate: "2027-05-31T23:59:59Z" },
      new Date("2026-08-16T12:00:00Z")
    );

    expect(status).toEqual({ active: true, date: "2027-05-31" });
    expect(formatSeasonCell(status)).toBe("🟢 In progress · ends 2027-05-31");
  });

  it("marks an ended season off-season and shows the next start date", () => {
    const status = classifySeason(
      { startDate: "2026-03-01T00:00:00Z", endDate: "2026-07-31T23:59:59Z" },
      new Date("2026-08-16T12:00:00Z")
    );

    expect(status).toEqual({ active: false, date: "2027-03-01" });
    expect(formatSeasonCell(status)).toBe("🔴 Off-season · starts 2027-03-01");
  });

  it("uses the first regular-season contest date for NCAA men's basketball", () => {
    expect(normalizeSeasonWindow("NCAA Men's Basketball", {
      startDate: "2026-07-13T00:00:00Z",
      endDate: "2027-04-07T23:59:59Z",
    })).toEqual({
      startDate: "2026-11-02T00:00:00Z",
      endDate: "2027-04-07T23:59:59Z",
    });
  });

  it("uses the first regular-season contest date for NCAA women's basketball", () => {
    expect(normalizeSeasonWindow("NCAA Women's Basketball", {
      startDate: "2026-07-13T00:00:00Z",
      endDate: "2027-04-07T23:59:59Z",
    })).toEqual({
      startDate: "2026-11-02T00:00:00Z",
      endDate: "2027-04-07T23:59:59Z",
    });
  });

  it("uses the first scheduled college-football game date", () => {
    expect(normalizeSeasonWindow("College Football", {
      startDate: "2026-02-01T00:00:00Z",
      endDate: "2027-01-28T23:59:59Z",
    })).toEqual({
      startDate: "2026-08-27T00:00:00Z",
      endDate: "2027-01-28T23:59:59Z",
    });
  });

  it.each([
    ["NBA", "2026-09-30T00:00:00Z", "2026-10-20T00:00:00Z"],
    ["MLB", "2026-02-19T00:00:00Z", "2026-03-25T00:00:00Z"],
    ["NFL", "2026-08-06T00:00:00Z", "2026-09-09T00:00:00Z"],
    ["NHL", "2026-09-15T00:00:00Z", "2026-09-29T00:00:00Z"],
    ["WNBA", "2026-04-03T00:00:00Z", "2026-05-08T00:00:00Z"],
    ["NBA G League", "2025-09-01T00:00:00Z", "2026-12-19T00:00:00Z"],
  ])("normalizes %s to its regular-season start", (name, apiStart, regularStart) => {
    expect(normalizeSeasonWindow(name, {
      startDate: apiStart,
      endDate: "2027-06-30T23:59:59Z",
    }).startDate).toBe(regularStart);
  });

  it("updates only the marked supported-sports table", () => {
    const readme = [
      "before",
      "<!-- supported-sports:start -->",
      "| Sport | Status | Endpoint |",
      "|---|---|---|",
      "| old | old | old |",
      "<!-- supported-sports:end -->",
      "after",
    ].join("\n");
    const updated = updateSupportedSportsTable(readme, [
      { name: "NBA", sport: "Basketball", season: "🟢 In progress · ends 2027-06-30", endpoint: "[`basketball/nba`](https://example.com)" },
    ]);

    expect(updated).toContain("| Sport | League | Season | Endpoint |");
    expect(updated).toContain("| 🏀&nbsp;Basketball | NBA | 🟢 In progress · ends 2027-06-30 | [`basketball/nba`](https://example.com) |");
    expect(updated).toContain("before\n<!-- supported-sports:start -->");
    expect(updated).toContain("<!-- supported-sports:end -->\nafter");
  });
});
