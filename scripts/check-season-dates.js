const { LEAGUES } = require("../src/config/leagues");
const { get: httpGet } = require("../src/http");
const { fetchSeason, normalizeSeasonWindow } = require("./update-season-status");

function isoDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function validateSeasonWindow(name, season, now = new Date()) {
  const apiStart = new Date(season.startDate);
  const apiEnd = new Date(season.endDate);
  const normalized = normalizeSeasonWindow(name, season, now);
  const normalizedStart = new Date(normalized.startDate);
  const failures = [];

  if ([apiStart, apiEnd, normalizedStart].some((date) => Number.isNaN(date.valueOf()))) {
    return [`${name}: season window contains an invalid date`];
  }
  if (apiStart >= apiEnd) {
    failures.push(`${name}: API season start ${isoDate(apiStart)} is not before end ${isoDate(apiEnd)}`);
  }
  // Compare CALENDAR DAYS, not instants. This invariant exists to catch an
  // override that lands in a different, earlier season — a date-level mistake.
  // Comparing instants flagged the same day as a violation whenever the two
  // sides disagreed on the time of day: the fixture calendar reports the
  // opener's kick-off (2026-02-21T08:00Z) while the registry stores the day
  // (2026-02-21T00:00Z), so 13 leagues were reported as "before API season
  // start 2026-02-21" while quoting that same date on both sides.
  if (isoDate(normalizedStart) < isoDate(apiStart)) {
    failures.push(`${name}: normalized start ${isoDate(normalizedStart)} is before API season start ${isoDate(apiStart)}`);
  }
  if (now <= apiEnd && normalizedStart > apiEnd) {
    failures.push(`${name}: normalized start ${isoDate(normalizedStart)} is after API season end ${isoDate(apiEnd)}`);
  }
  return failures;
}

async function checkSeasonDates(request = httpGet) {
  const results = await Promise.all(LEAGUES.map(async ({ name, endpoint }) => {
    try {
      const season = await fetchSeason(endpoint, request);
      return validateSeasonWindow(name, season);
    } catch (error) {
      return [`${name}: ${error.message}`];
    }
  }));

  return {
    checked: LEAGUES.length,
    failures: results.flat(),
  };
}

if (require.main === module) {
  checkSeasonDates().then((result) => {
    if (result.failures.length > 0) {
      console.error(`Season-date verification failed for ${result.failures.length} issue(s) across ${result.checked} leagues:`);
      result.failures.forEach((failure) => console.error(`- ${failure}`));
      process.exitCode = 1;
      return;
    }
    console.log(`Season-date verification passed for all ${result.checked} supported leagues.`);
  }).catch((error) => {
    console.error(`Season-date verification failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { checkSeasonDates, validateSeasonWindow };
