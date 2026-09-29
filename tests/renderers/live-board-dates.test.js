"use strict";

// Board dates must read the same on every machine. ESPN reports kick-off and
// match times as UTC instants, and formatting them in the HOST's zone made the
// same board render a different day depending on where it was generated:
//   * tennis "Last Match" was Sep 30 on UTC but Sep 29 on US Eastern
//   * college football games were a day later on Asia/Tokyo and Pacific/Auckland
// That made `npm run examples:generate` in CI diff against the committed files,
// so the "example boards are current" gate went red on every push.
//
// The guard in tests/adapters/demo-consistency.test.js cannot catch this: it
// renders DEMO data, whose dates are bare calendar strings, not instants. This
// guard renders live-shaped payloads (real ISO instants) instead.

const { execFileSync } = require("node:child_process");
const path = require("node:path");

// Child processes are REQUIRED: Node caches the timezone at process start, so
// setting process.env.TZ in-process has effectively no effect.
const RENDER_LIVE_BOARDS = `
  const { render } = require("./src/renderers/markdown");

  // 04:00Z on Sep 30 is still Sep 29 in US Eastern and Sep 30 in UTC.
  const tennis = (abbr, full, id) => render("atp", {
    team: { id, abbreviation: abbr, full_name: full, conference: "", division: "" },
    emoji: "\\u{1F3BE}",
    logoUrl: "https://example.test/logo.png",
    standing: { position: 1, label: "" },
    rankPoints: 11000,
    previousRank: 1,
    trend: "-",
    lastMatch: {
      opponent: "Bye", won: true,
      date: "2026-09-30T04:00:00Z",
      sets: [[6, 4], [3, 6]],
    },
  });

  // A Saturday-night US kick-off: 23:10Z Saturday is Sunday east of the US.
  const football = (sport) => render(sport, {
    team: { id: "333", abbreviation: "ALA", full_name: "Alabama", conference: "SEC", division: "" },
    emoji: "\\u{1F3C8}",
    logoUrl: "https://example.test/logo.png",
    record: { wins: 1, losses: 0, season: 2026 },
    recentGames: [{
      date: "2026-09-26T23:10:00Z",
      teamScore: 49, oppScore: 18, oppAbbr: "SC", won: true, isHome: false,
      home_team: { id: "h" }, visitor_team: { id: "333" },
    }],
  });

  const boards = [
    tennis("SIN", "Jannik Sinner", "3623"),
    football("ncaaf"),
    football("nfl"),
  ];
  process.stdout.write(boards.join("\\u0000"));
`;

const TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/New_York",
  "Asia/Tokyo",
  "Pacific/Auckland",
  "Europe/London",
];

const renderLiveBoardsIn = (timeZone) =>
  execFileSync(process.execPath, ["-e", RENDER_LIVE_BOARDS], {
    cwd: path.join(__dirname, "..", ".."),
    env: { ...process.env, TZ: timeZone },
    encoding: "utf8",
  });

describe("live board dates are timezone independent", () => {
  it("renders identical boards in every timezone", () => {
    const utc = renderLiveBoardsIn("UTC");
    for (const timeZone of TIMEZONES.slice(1)) {
      expect(`${timeZone}: ${renderLiveBoardsIn(timeZone)}`).toBe(`${timeZone}: ${utc}`);
    }
  }, 60000);

  it("quotes a US evening kick-off in its own zone, not the host's", () => {
    // 2026-09-26T23:10Z is Saturday evening in the US but Sunday in Tokyo.
    const utcBoard = renderLiveBoardsIn("UTC");
    const tokyoBoard = renderLiveBoardsIn("Asia/Tokyo");
    expect(utcBoard).toContain("Sep 26, 2026");
    expect(tokyoBoard).toContain("Sep 26, 2026");
    expect(tokyoBoard).not.toContain("Sep 27, 2026");
  });

  it("quotes a tennis match date in UTC", () => {
    const pacificBoard = renderLiveBoardsIn("America/Los_Angeles");
    expect(pacificBoard).toContain("Sep 30, 2026");
    expect(pacificBoard).not.toContain("Sep 29, 2026");
  });
});

describe("tennis boards carry no volatile ranking points", () => {
  it("omits the points figure, which ESPN re-posts as tournaments progress", () => {
    // A committed board holding a live points total goes stale within days and
    // the freshness gate can never stay green. Rank and movement are stable.
    const board = renderLiveBoardsIn("UTC");
    expect(board).toContain("🏆 World No. 1");
    expect(board).not.toContain("ranking points");
    expect(board).not.toContain("📍");
  });
});
