"use strict";

// Season arithmetic must not depend on where the process runs.
//
// "What season is it?" is a question about a calendar position, and every
// adapter used to answer it with `new Date().getMonth()` — the HOST's local
// month. That makes the answer differ between machines around a month
// boundary: at 2026-09-30T21:47Z the UTC month was still September (season
// year 2025) while Asia/Tokyo had already rolled into October (season year
// 2026), so the same demo board rendered "2025-2026 Record" on one machine and
// "2026-2027 Record" on another. The timezone-independence guard caught it, but
// only on the few hours a year the boundary is actually crossed.
//
// Reading the calendar in UTC makes the answer identical everywhere and, more
// importantly, stable: a run can no longer change season just because the
// machine (or CI runner) sits in a different zone.
function utcParts(date = new Date()) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

module.exports = { utcParts };
