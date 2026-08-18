const fs = require("fs");
const path = require("path");
const axios = require("axios");

const START_MARKER = "<!-- supported-sports:start -->";
const END_MARKER = "<!-- supported-sports:end -->";

// ESPN exposes the current season window on each league scoreboard response.
// Keeping this map here makes the daily job data-driven without changing the
// adapters that power the action itself.
const LEAGUES = [
  ["Basketball", "NBA", "basketball/nba"],
  ["Baseball", "MLB", "baseball/mlb"],
  ["Football", "NFL", "football/nfl"],
  ["Hockey", "NHL", "hockey/nhl"],
  ["Soccer", "MLS", "soccer/usa.1"],
  ["Soccer", "Premier League", "soccer/eng.1"],
  ["Soccer", "La Liga", "soccer/esp.1"],
  ["Soccer", "Bundesliga", "soccer/ger.1"],
  ["Soccer", "Serie A", "soccer/ita.1"],
  ["Soccer", "Ligue 1", "soccer/fra.1"],
  ["Soccer", "Primeira Liga", "soccer/por.1"],
  ["Soccer", "Eredivisie", "soccer/ned.1"],
  ["Basketball", "WNBA", "basketball/wnba"],
  ["Soccer", "Liga MX", "soccer/mex.1"],
  ["Soccer", "Brasileirão", "soccer/bra.1"],
  ["Soccer", "NWSL", "soccer/usa.nwsl"],
  ["Soccer", "Saudi Pro League", "soccer/ksa.1"],
  ["Soccer", "J1 League", "soccer/jpn.1"],
  ["Soccer", "Scottish Premiership", "soccer/sco.1"],
  ["Soccer", "Belgian Pro League", "soccer/bel.1"],
  ["Soccer", "UEFA Champions League", "soccer/uefa.champions"],
  ["Soccer", "UEFA Europa League", "soccer/uefa.europa"],
  ["Basketball", "NBA G League", "basketball/nba-development"],
  ["Basketball", "NCAA Men's Basketball", "basketball/mens-college-basketball"],
  ["Basketball", "NCAA Women's Basketball", "basketball/womens-college-basketball"],
  ["Football", "College Football", "football/college-football"],
  ["Hockey", "NCAA Men's Ice Hockey", "hockey/mens-college-hockey"],
];

const LEAGUE_LOGOS = {
  NBA: ["teamlogos/leagues/500/nba.png", "teamlogos/leagues/500-dark/nba.png"],
  MLB: ["teamlogos/leagues/500/mlb.png", "teamlogos/leagues/500-dark/mlb.png"],
  NFL: ["teamlogos/leagues/500/nfl.png", "teamlogos/leagues/500-dark/nfl.png"],
  NHL: ["teamlogos/leagues/500/nhl.png", "teamlogos/leagues/500-dark/nhl.png"],
  WNBA: ["teamlogos/leagues/500/wnba.png", "teamlogos/leagues/500-dark/wnba.png"],
  "NBA G League": ["teamlogos/leagues/500/nba_gleague.png", "teamlogos/leagues/500-dark/nba_gleague.png"],
  MLS: ["leaguelogos/soccer/500/19.png", "leaguelogos/soccer/500-dark/19.png"],
  "Premier League": ["leaguelogos/soccer/500/23.png", "leaguelogos/soccer/500-dark/23.png"],
  "La Liga": ["leaguelogos/soccer/500/15.png", "leaguelogos/soccer/500-dark/15.png"],
  Bundesliga: ["leaguelogos/soccer/500/10.png", "leaguelogos/soccer/500-dark/10.png"],
  "Serie A": ["leaguelogos/soccer/500/12.png", "leaguelogos/soccer/500-dark/12.png"],
  "Ligue 1": ["leaguelogos/soccer/500/9.png", "leaguelogos/soccer/500-dark/9.png"],
  "Primeira Liga": ["leaguelogos/soccer/500/14.png", "leaguelogos/soccer/500-dark/14.png"],
  Eredivisie: ["leaguelogos/soccer/500/11.png", "leaguelogos/soccer/500-dark/11.png"],
  "Liga MX": ["leaguelogos/soccer/500/22.png", "leaguelogos/soccer/500-dark/22.png"],
  Brasileirão: ["leaguelogos/soccer/500/85.png", "leaguelogos/soccer/500-dark/85.png"],
  NWSL: ["leaguelogos/soccer/500/2323.png", "leaguelogos/soccer/500-dark/2323.png"],
  "Saudi Pro League": ["leaguelogos/soccer/500/2488.png", "leaguelogos/soccer/500-dark/2488.png"],
  "J1 League": ["leaguelogos/soccer/500/2199.png", "leaguelogos/soccer/500-dark/2199.png"],
  "Scottish Premiership": ["leaguelogos/soccer/500/45.png", "leaguelogos/soccer/500-dark/45.png"],
  "Belgian Pro League": ["leaguelogos/soccer/500/6.png", "leaguelogos/soccer/500-dark/6.png"],
  "UEFA Champions League": ["leaguelogos/soccer/500/2.png", "leaguelogos/soccer/500-dark/2.png"],
  "UEFA Europa League": ["leaguelogos/soccer/500/2310.png", "leaguelogos/soccer/500-dark/2310.png"],
  "NCAA Men's Basketball": ["https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png", "https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png"],
  "NCAA Women's Basketball": ["https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png", "https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png"],
  "College Football": ["https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-football-college.png", "https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-football-college.png"],
  "NCAA Men's Ice Hockey": ["https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-hockey.png", "https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-hockey.png"],
};

// Conservative fallback windows keep the table useful if an upstream API is
// temporarily unavailable. The next successful daily run replaces these with
// the API's exact season dates.
const FALLBACK_WINDOWS = {
  NBA: ["2026-09-30", "2027-06-26"], MLB: ["2026-02-19", "2026-11-12"],
  NFL: ["2026-08-06", "2027-02-16"], NHL: ["2026-09-15", "2027-07-01"],
  MLS: ["2026-01-01", "2026-12-31"], "Premier League": ["2026-06-01", "2027-06-01"],
  "La Liga": ["2026-06-01", "2027-06-01"], Bundesliga: ["2026-07-01", "2027-07-01"],
  "Serie A": ["2026-06-05", "2027-07-01"], "Ligue 1": ["2026-06-01", "2027-06-01"],
  "Primeira Liga": ["2026-07-01", "2027-07-01"], Eredivisie: ["2026-06-01", "2027-06-01"],
  WNBA: ["2026-04-03", "2026-10-20"], "Liga MX": ["2026-06-01", "2027-06-01"],
  Brasileirão: ["2026-01-01", "2026-12-31"], NWSL: ["2026-01-01", "2026-12-31"],
  "Saudi Pro League": ["2026-07-01", "2027-07-01"], "J1 League": ["2026-01-01", "2027-07-01"],
  "NBA G League": ["2025-09-01", "2026-05-01"],
  "Scottish Premiership": ["2026-06-01", "2027-06-01"],
  "Belgian Pro League": ["2026-07-01", "2027-07-01"],
  "UEFA Champions League": ["2026-07-01", "2027-07-01"],
  "UEFA Europa League": ["2026-08-27", "2027-07-01"],
  "NCAA Men's Basketball": ["2026-07-13", "2027-04-07"],
  "NCAA Women's Basketball": ["2026-07-13", "2027-04-07"],
  "College Football": ["2026-02-01", "2027-01-28"],
  "NCAA Men's Ice Hockey": ["2026-09-01", "2027-05-01"],
};

const ENDPOINT_OVERRIDES = {
  MLB: "[MLB Stats API](https://statsapi.mlb.com/api/v1/teams?sportId=1)",
  NHL: "[NHL Web API](https://api-web.nhle.com/v1/standings/now)",
};

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

  const sportIcons = { Basketball: "🏀", Baseball: "⚾", Football: "🏈", Hockey: "🏒", Soccer: "⚽" };
  const table = [
    "| Sport | League | Season | Endpoint |",
    "|-------|--------|--------|----------|",
    ...rows.map((row) => `| ${sportIcons[row.sport] || "🏆"}&nbsp;${row.sport} | ${row.league || row.name} | ${row.season} | ${row.endpoint} |`),
  ].join("\n");
  return `${readme.slice(0, start + START_MARKER.length)}\n${table}\n${readme.slice(end)}`;
}

async function fetchSeason(slug) {
  const { data } = await axios.get(`https://site.api.espn.com/apis/site/v2/sports/${slug}/scoreboard`, {
    timeout: 15000,
  });
  const season = data.leagues?.[0]?.season;
  if (!season?.startDate || !season?.endDate) {
    throw new Error(`No season dates returned for ${slug}`);
  }
  return season;
}

async function buildRows(now = new Date()) {
  return Promise.all(LEAGUES.map(async ([sport, name, slug]) => {
    const endpoint = ENDPOINT_OVERRIDES[name] || `[\`${slug}\`](https://site.api.espn.com/apis/site/v2/sports/${slug}/teams)`;
    try {
      const season = await fetchSeason(slug);
      return { sport, name, league: leagueCell(name), season: formatSeasonCell(classifySeason(season, now)), endpoint };
    } catch (error) {
      console.warn(`Season dates unavailable for ${name}: ${error.message}`);
      const fallback = FALLBACK_WINDOWS[name];
      const season = fallback
        ? formatSeasonCell(classifySeason({ startDate: fallback[0], endDate: fallback[1] }, now))
        : "⚪ Date unavailable";
      return { sport, name, league: leagueCell(name), season, endpoint };
    }
  }));
}

async function main() {
  const readmePath = path.resolve(__dirname, "..", "README.md");
  const readme = fs.readFileSync(readmePath, "utf8");
  const rows = await buildRows();
  const updated = updateSupportedSportsTable(readme, rows);
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
  updateSupportedSportsTable,
};
