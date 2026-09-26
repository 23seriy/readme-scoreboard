const { LEAGUES } = require("../../src/config/leagues");

// `seasonWindow.start` drives the season status line ("Next season starts
// <month> <year>"), and each league also carries `nextLabel` with the month name
// to print. Those two are duplicated data, so they can drift apart.
//
// The NHL bug was different, and worth stating plainly: its window AND its label
// both said October, agreeing with each other and with nothing else. The board
// announced a season start three days after the league's own API said it began
// (2026-09-29), and the only reason it looked plausible is that the redundant
// label repeated the window instead of contradicting it. Consistency between two
// copies of a fact proves nothing about the fact — hence the dated assertion at
// the bottom, which pins the value against the upstream source.
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WINDOWED = LEAGUES.filter((league) => league.seasonWindow?.start);

describe("league season windows", () => {
  it.each(WINDOWED.map((league) => [league.key, league]))(
    "%s names the same month in nextLabel as in seasonWindow.start",
    (_key, league) => {
      const { start, nextLabel } = league.seasonWindow;
      // "late March" is a supported refinement of "March".
      const label = String(nextLabel || "").replace(/^late /i, "");
      expect(label).toBe(MONTHS[start[0] - 1]);
    }
  );

  // NOTE: `seasonWindow.start` and the dated top-level `fallback` are NOT
  // asserted to agree. They are separate fields with separate consumers (the
  // status line and the README table), and gleague genuinely diverges: its
  // window says November while its fallback is dated 2026-12-19, and ESPN's own
  // metadata for that league claims September 1. That disagreement is reported
  // rather than pinned here, because a test asserting an invariant nobody has
  // verified is just a second unverified claim.

  // The upstream API is the tiebreaker when a window and its label disagree:
  // api-web.nhle.com/v1/standings-season reports 20262027 starting 2026-09-29,
  // three days before the board used to say the season began.
  it("starts the NHL season on the date the league publishes", () => {
    const nhl = LEAGUES.find((league) => league.key === "nhl");
    expect(nhl.seasonWindow.start).toEqual([9, 29]);
    expect(nhl.fallback[0]).toBe("2026-09-29");
    expect(nhl.seasonWindow.nextLabel).toBe("September");
  });
});
