const fs = require("fs");
const path = require("path");
const { LEAGUES } = require("../../src/config/leagues");
const {
  checkSeasonDates,
  validateSeasonWindow,
} = require("../../scripts/check-season-dates");

const workflow = fs.readFileSync(
  path.join(__dirname, "../../.github/workflows/check-season-dates.yml"),
  "utf8"
);

describe("daily season-date verification", () => {
  it("accepts a normalized opening date inside the API season window", () => {
    expect(validateSeasonWindow("La Liga", {
      startDate: "2026-06-01T00:00:00Z",
      endDate: "2027-06-01T23:59:59Z",
    })).toEqual([]);
  });

  it("reports an override that belongs to an older season year", () => {
    expect(validateSeasonWindow("La Liga", {
      startDate: "2027-08-20T00:00:00Z",
      endDate: "2028-06-01T23:59:59Z",
    }, new Date("2027-08-25T00:00:00Z"))).toEqual(["La Liga: normalized start 2027-08-15 is before API season start 2027-08-20"]);
  });

  it("uses the next season year when ESPN returns an ended season", () => {
    expect(validateSeasonWindow("UEFA Europa League", {
      startDate: "2025-08-27T04:00:00Z",
      endDate: "2026-07-01T03:59:59Z",
    }, new Date("2026-08-20T00:00:00Z"))).toEqual([]);
  });

  it("checks every registered league and collects request failures", async () => {
    const request = jest.fn(async (url) => {
      if (url.includes("soccer/esp.1")) throw new Error("upstream unavailable");
      return {
        data: {
          leagues: [{
            season: {
              startDate: "2026-01-01T00:00:00Z",
              endDate: "2027-12-31T23:59:59Z",
            },
          }],
        },
      };
    });

    const result = await checkSeasonDates(request);

    expect(result.checked).toBe(LEAGUES.length);
    expect(result.failures).toContain("La Liga: upstream unavailable");
    expect(request).toHaveBeenCalledTimes(LEAGUES.length);
  });

  it("runs daily with manual dispatch and read-only checkout", () => {
    expect(workflow).toContain('cron: "37 4 * * *"');
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("npm ci --ignore-scripts");
    expect(workflow).toContain("node scripts/check-season-dates.js");
    expect(workflow).toContain("contents: read");
  });
});
