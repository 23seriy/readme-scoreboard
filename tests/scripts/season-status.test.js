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
    expect(workflow).toContain("git fetch origin automation/season-status");
    expect(workflow).not.toContain("git fetch origin automation/season-status || true");
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

  it("does not ignore automation-branch fetch failures", () => {
    expect(collegeWorkflow).toContain("git fetch origin automation/college-rosters");
    expect(collegeWorkflow).not.toContain("git fetch origin automation/college-rosters || true");
  });

  it("verifies live season dates before allowing a README update", () => {
    const preflight = "node scripts/check-season-dates.js";
    const updater = "node scripts/update-season-status.js --strict";

    expect(workflow).toContain(preflight);
    expect(workflow).toContain(updater);
    expect(workflow.indexOf(preflight)).toBeLessThan(workflow.indexOf(updater));
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
    ["NBA G League", "2026-09-01T00:00:00Z", "2026-12-19T00:00:00Z"],
  ])("normalizes %s to its regular-season start", (name, apiStart, regularStart) => {
    expect(normalizeSeasonWindow(name, {
      startDate: apiStart,
      endDate: "2027-06-30T23:59:59Z",
    }).startDate).toBe(regularStart);
  });

  it("uses the NCAA Division I men's hockey first contest date", () => {
    expect(normalizeSeasonWindow("NCAA Men's Ice Hockey", {
      startDate: "2026-09-01T00:00:00Z",
      endDate: "2027-05-01T23:59:59Z",
    }).startDate).toBe("2026-10-02T00:00:00Z");
  });

  it.each([
    ["MLS", "2026-01-01T00:00:00Z", "2026-02-21T00:00:00Z"],
    ["Premier League", "2026-06-01T00:00:00Z", "2026-08-21T00:00:00Z"],
    ["La Liga", "2026-06-01T00:00:00Z", "2026-08-15T00:00:00Z"],
    ["Bundesliga", "2026-07-01T00:00:00Z", "2026-08-28T00:00:00Z"],
    ["Serie A", "2026-06-05T00:00:00Z", "2026-08-22T00:00:00Z"],
    ["Ligue 1", "2026-06-01T00:00:00Z", "2026-08-23T00:00:00Z"],
    ["Primeira Liga", "2026-07-01T00:00:00Z", "2026-08-09T00:00:00Z"],
    ["Eredivisie", "2026-06-01T00:00:00Z", "2026-08-07T00:00:00Z"],
    ["Liga MX", "2026-06-01T00:00:00Z", "2026-07-16T00:00:00Z"],
    ["Brasileirão", "2026-01-01T00:00:00Z", "2026-01-28T00:00:00Z"],
    ["NWSL", "2026-01-01T00:00:00Z", "2026-03-13T00:00:00Z"],
    ["Saudi Pro League", "2026-07-01T00:00:00Z", "2026-08-13T00:00:00Z"],
    ["J1 League", "2026-01-01T00:00:00Z", "2026-08-07T00:00:00Z"],
    ["Scottish Premiership", "2026-06-01T00:00:00Z", "2026-07-31T00:00:00Z"],
    ["Belgian Pro League", "2026-07-01T00:00:00Z", "2026-08-07T00:00:00Z"],
    ["UEFA Champions League", "2026-07-01T00:00:00Z", "2026-07-07T00:00:00Z"],
    ["UEFA Europa League", "2026-08-27T00:00:00Z", "2026-07-09T00:00:00Z"],
  ])("normalizes %s to its published opening date", (name, apiStart, regularStart) => {
    expect(normalizeSeasonWindow(name, {
      startDate: apiStart,
      endDate: "2027-07-01T23:59:59Z",
    }, new Date("2026-06-01T00:00:00Z")).startDate).toBe(regularStart);
  });

  it("rolls published opening dates into the season's reported year", () => {
    expect(normalizeSeasonWindow("La Liga", {
      startDate: "2027-06-01T00:00:00Z",
      endDate: "2028-06-01T23:59:59Z",
    }, new Date("2027-08-25T00:00:00Z")).startDate).toBe("2027-08-15T00:00:00Z");
  });

  it("keeps the active Champions League season when ESPN jumps to next year", () => {
    expect(normalizeSeasonWindow("UEFA Champions League", {
      startDate: "2027-07-01T00:00:00Z",
      endDate: "2028-06-30T23:59:59Z",
    }, new Date("2026-08-21T12:00:00Z"))).toEqual({
      startDate: "2026-07-07",
      endDate: "2027-06-05",
    });
  });

  it("keeps the active Europa League season when ESPN jumps to next year", () => {
    expect(normalizeSeasonWindow("UEFA Europa League", {
      startDate: "2027-07-01T00:00:00Z",
      endDate: "2028-06-30T23:59:59Z",
    }, new Date("2026-08-21T12:00:00Z"))).toEqual({
      startDate: "2026-07-09",
      endDate: "2027-05-26",
    });
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
