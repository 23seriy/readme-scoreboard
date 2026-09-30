"use strict";

// Season arithmetic must not depend on the host's timezone.
//
// The bug this guards: every adapter asked "what season is it?" with
// `new Date().getMonth()` — the HOST's month. At 2026-09-30T21:47Z the UTC month
// was September (season year 2025) while Asia/Tokyo had already rolled into
// October (season year 2026), so the same board rendered "2025-2026 Record" on
// one machine and "2026-2027 Record" on another. Because that only happens in
// the few hours a year a month boundary is crossed, the existing
// timezone-independence guard caught it late; these tests pin the behaviour at
// the boundary itself rather than at whatever "now" happens to be.

const { utcParts } = require("../src/clock");

// A single instant that is a different calendar day in different zones.
const BOUNDARY_INSTANT = new Date("2026-09-30T21:47:00Z");

describe("utcParts", () => {
  it("reads the calendar in UTC, not the host zone", () => {
    expect(utcParts(BOUNDARY_INSTANT)).toEqual({ year: 2026, month: 9, day: 30 });
  });

  it("does not follow a host zone that has already crossed the boundary", () => {
    // Sanity-check the fixture: at this instant Tokyo really is on Oct 1.
    const tokyoDay = BOUNDARY_INSTANT.toLocaleDateString("en-US", {
      timeZone: "Asia/Tokyo",
    });
    expect(tokyoDay).toBe("10/1/2026");
    // ...and utcParts must ignore that.
    expect(utcParts(BOUNDARY_INSTANT).month).toBe(9);
  });

  it("defaults to the current instant", () => {
    const now = utcParts();
    expect(now.month).toBeGreaterThanOrEqual(1);
    expect(now.month).toBeLessThanOrEqual(12);
    expect(now.day).toBeGreaterThanOrEqual(1);
    expect(now.day).toBeLessThanOrEqual(31);
    expect(Number.isInteger(now.year)).toBe(true);
  });

  it("rolls the month at midnight UTC, not at local midnight", () => {
    // 2026-10-01T00:00Z is October in UTC even though US zones are on Sep 30.
    expect(utcParts(new Date("2026-10-01T00:00:00Z"))).toEqual({
      year: 2026,
      month: 10,
      day: 1,
    });
    expect(utcParts(new Date("2026-09-30T23:59:59Z")).month).toBe(9);
  });
});

describe("season boundaries are stable across zones", () => {
  // Mirrors the NBA/G League convention (season labelled by its END year) and
  // the NHL convention (season labelled by its START year) from the adapters.
  const endYearSeason = ({ year, month }) => (month >= 10 ? year + 1 : year);
  const startYearSeason = ({ year, month }) => (month >= 10 ? year : year - 1);

  it("gives one answer at the September/October boundary", () => {
    const parts = utcParts(BOUNDARY_INSTANT);
    // 21:47Z on Sep 30 is already Oct 1 in Tokyo, but the season must not move.
    expect(endYearSeason(parts)).toBe(2026);
    expect(startYearSeason(parts)).toBe(2025);
  });

  it("moves the season only once UTC itself reaches October", () => {
    const justBefore = utcParts(new Date("2026-09-30T23:59:59Z"));
    const justAfter = utcParts(new Date("2026-10-01T00:00:00Z"));
    expect(startYearSeason(justBefore)).toBe(2025);
    expect(startYearSeason(justAfter)).toBe(2026);
    expect(endYearSeason(justBefore)).toBe(2026);
    expect(endYearSeason(justAfter)).toBe(2027);
  });
});
