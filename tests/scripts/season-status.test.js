const {
  classifySeason,
  formatSeasonCell,
  updateSupportedSportsTable,
} = require("../../scripts/update-season-status");
const fs = require("fs");
const path = require("path");

const workflow = fs.readFileSync(
  path.join(__dirname, "../../.github/workflows/update-season-status.yml"),
  "utf-8"
);

describe("season status updater", () => {
  it("serializes scheduled runs and protects the automation branch push", () => {
    expect(workflow).toContain("group: season-status");
    expect(workflow).toContain("cancel-in-progress: false");
    expect(workflow).toContain("git push --force-with-lease=");
    expect(workflow).not.toContain("git push --force origin automation/season-status");
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
