const fs = require("fs");
const path = require("path");
const { get: httpGet } = require("../src/http");
const { LEAGUES: LEAGUE_REGISTRY } = require("../src/config/leagues");

const START_MARKER = "<!-- supported-sports:start -->";
const END_MARKER = "<!-- supported-sports:end -->";
const LEAGUE_LIST_START = "<!-- league-list:start -->";
const LEAGUE_LIST_END = "<!-- league-list:end -->";

// League metadata is owned by the registry in src/config/leagues.js, so these
// lookups are derived from it instead of kept as a second, drifting copy.
// Adding a league to the registry is enough to give it a table row and a logo.
const LEAGUES = LEAGUE_REGISTRY.map(({ category, name, endpoint, key }) => [category, name, endpoint, key]);
const LEAGUE_LOGOS = Object.fromEntries(
  LEAGUE_REGISTRY.map((league) => [league.name, [league.logo.light, league.logo.dark]]),
);

// Conservative fallback windows keep the table useful if an upstream API is
// temporarily unavailable. The next successful daily run replaces these with
// the API's exact season dates.
const FALLBACK_WINDOWS = Object.fromEntries(
  LEAGUE_REGISTRY.map((league) => [league.name, league.fallback]),
);

// ESPN season windows can begin with preseason, scheduling, or other setup
// activity. Use each competition's first official fixture for the public
// status table instead of marking a league active before play begins.
//
// Every value here equals the registry's own `fallback[0]` for that league,
// because that date *is* the first official fixture. The two are kept equal on
// purpose: tests/scripts/season-status.test.js fails if one moves without the
// other. Leagues absent from this map use ESPN's window as-is.
const SEASON_START_OVERRIDES = {
  MLS: "2026-02-21T00:00:00Z",
  "Premier League": "2026-08-21T00:00:00Z",
  "UEFA Champions League": "2026-07-07T00:00:00Z",
  "UEFA Europa League": "2026-07-09T00:00:00Z",
  "La Liga": "2026-08-15T00:00:00Z",
  Bundesliga: "2026-08-28T00:00:00Z",
  "Serie A": "2026-08-22T00:00:00Z",
  "Ligue 1": "2026-08-23T00:00:00Z",
  "Primeira Liga": "2026-08-09T00:00:00Z",
  Eredivisie: "2026-08-07T00:00:00Z",
  "Liga MX": "2026-07-16T00:00:00Z",
  Brasileirão: "2026-01-28T00:00:00Z",
  NWSL: "2026-03-13T00:00:00Z",
  "Saudi Pro League": "2026-08-13T00:00:00Z",
  "J1 League": "2026-08-07T00:00:00Z",
  "Scottish Premiership": "2026-07-31T00:00:00Z",
  "Belgian Pro League": "2026-08-07T00:00:00Z",
  NBA: "2026-10-20T00:00:00Z",
  MLB: "2026-03-25T00:00:00Z",
  NFL: "2026-09-09T00:00:00Z",
  NHL: "2026-09-29T00:00:00Z",
  WNBA: "2026-05-08T00:00:00Z",
  "NBA G League": "2026-12-19T00:00:00Z",
  "NCAA Men's Basketball": "2026-11-02T00:00:00Z",
  "NCAA Women's Basketball": "2026-11-02T00:00:00Z",
  "College Football": "2026-08-27T00:00:00Z",
  "NCAA Men's Ice Hockey": "2026-10-02T00:00:00Z",
};

const ENDPOINT_OVERRIDES = Object.fromEntries(
  LEAGUE_REGISTRY.filter((league) => league.endpointOverride)
    .map((league) => [league.name, league.endpointOverride]),
);

function leagueCell(name) {
  const logo = LEAGUE_LOGOS[name];
  if (!logo) return name;
  const [light, dark] = logo.map((asset) => asset.startsWith("http") ? asset : `https://a.espncdn.com/i/${asset}`);
  return `<picture><source media="(prefers-color-scheme: dark)" srcset="${dark}"><img src="${light}" alt="${name} logo" height="20"></picture> ${name}`;
}

function isoDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function classifySeason(window, now = new Date()) {
  const start = new Date(window.startDate);
  const end = new Date(window.endDate);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
    throw new Error("Season window contains an invalid date");
  }

  if (now >= start && now <= end) {
    return { active: true, date: isoDate(end) };
  }

  if (now < start) {
    return { active: false, date: isoDate(start) };
  }

  const nextStart = new Date(start);
  nextStart.setUTCFullYear(nextStart.getUTCFullYear() + 1);
  return { active: false, date: isoDate(nextStart) };
}

function formatSeasonCell(status) {
  return status.active
    ? `🟢 In progress · ends ${status.date}`
    : `🔴 Off-season · starts ${status.date}`;
}

function updateSupportedSportsTable(readme, rows) {
  const start = readme.indexOf(START_MARKER);
  const end = readme.indexOf(END_MARKER);
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Supported sports table markers are missing or out of order");
  }

  const sportIcons = { Basketball: "🏀", Baseball: "⚾", Football: "🏈", Hockey: "🏒", Soccer: "⚽", Tennis: "🎾" };
  const table = [
    "| Sport | League | Key | Season | Endpoint |",
    "|-------|--------|-----|--------|----------|",
    ...rows.map((row) => `| ${sportIcons[row.sport] || "🏆"}&nbsp;${row.sport} | ${row.league || row.name} | \`${row.key}\` | ${row.season} | ${row.endpoint} |`),
  ].join("\n");
  return `${readme.slice(0, start + START_MARKER.length)}\n${table}\n${readme.slice(end)}`;
}

// Reads naturally whether there is one league, two, or forty.
function joinLeagueNames(names) {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

// The intro sentence names every league. It is generated from the same rows as
// the table so the two cannot disagree: adding a league updates both.
function updateLeagueList(readme, rows) {
  const start = readme.indexOf(LEAGUE_LIST_START);
  const end = readme.indexOf(LEAGUE_LIST_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error("League list markers are missing or out of order");
  }

  const names = rows.map((row) => `**${row.name}**`);
  const sentence = `Currently supports ${joinLeagueNames(names)} with more sports coming soon`;
  return `${readme.slice(0, start + LEAGUE_LIST_START.length)}\n${sentence}\n${readme.slice(end)}`;
}

async function fetchSeason(slug, request = httpGet) {
  const { data } = await request(`https://site.api.espn.com/apis/site/v2/sports/${slug}/scoreboard`, {
    timeout: 15000,
  });
  const season = data.leagues?.[0]?.season;
  if (!season?.startDate || !season?.endDate) {
    throw new Error(`No season dates returned for ${slug}`);
  }
  return season;
}

function seasonRelativeStart(override, seasonStart, seasonEnd, now = new Date()) {
  const seasonStartDate = new Date(seasonStart);
  const seasonEndDate = new Date(seasonEnd);
  let seasonYear = seasonStartDate.getUTCFullYear();
  if (now > seasonEndDate) seasonYear += 1;
  return override.replace(/^\d{4}/, String(seasonYear));
}

function normalizeSeasonWindow(name, season, now = new Date()) {
  const fallback = FALLBACK_WINDOWS[name];
  if (fallback) {
    const fallbackStart = new Date(fallback[0]);
    const fallbackEnd = new Date(fallback[1]);
    const apiStart = new Date(season.startDate);
    const apiEnd = new Date(season.endDate);
    if (now >= fallbackStart && now <= fallbackEnd && (apiStart > now || apiEnd < now)) {
      return { startDate: fallback[0], endDate: fallback[1] };
    }
  }

  const override = SEASON_START_OVERRIDES[name];
  const startDate = override
    ? seasonRelativeStart(override, season.startDate, season.endDate, now)
    : season.startDate;
  return { ...season, startDate };
}

async function buildRows(now = new Date(), { strict = false } = {}) {
  return Promise.all(LEAGUES.map(async ([sport, name, slug, key]) => {
    const endpoint = ENDPOINT_OVERRIDES[name] || `[\`${slug}\`](https://site.api.espn.com/apis/site/v2/sports/${slug}/teams)`;
    try {
      const season = normalizeSeasonWindow(name, await fetchSeason(slug), now);
      return { sport, name, key, league: leagueCell(name), season: formatSeasonCell(classifySeason(season, now)), endpoint };
    } catch (error) {
      if (strict) throw new Error(`${name}: ${error.message}`, { cause: error });
      console.warn(`Season dates unavailable for ${name}: ${error.message}`);
      const fallback = FALLBACK_WINDOWS[name];
      const season = fallback
        ? formatSeasonCell(classifySeason({ startDate: fallback[0], endDate: fallback[1] }, now))
        : "⚪ Date unavailable";
      return { sport, name, key, league: leagueCell(name), season, endpoint };
    }
  }));
}

async function main() {
  const readmePath = path.resolve(__dirname, "..", "README.md");
  const readme = fs.readFileSync(readmePath, "utf8");
  const rows = await buildRows(new Date(), { strict: process.argv.includes("--strict") });
  const withTable = updateSupportedSportsTable(readme, rows);
  const updated = updateLeagueList(withTable, rows);
  if (updated !== readme) fs.writeFileSync(readmePath, updated);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  LEAGUES,
  buildRows,
  classifySeason,
  fetchSeason,
  formatSeasonCell,
  normalizeSeasonWindow,
  updateSupportedSportsTable,
  updateLeagueList,
  SEASON_START_OVERRIDES,
};
