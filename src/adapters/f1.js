const { get: httpGet } = require("../http");

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/racing/f1";
const ESPN_BASE_V2 = "https://site.api.espn.com/apis/v2/sports/racing/f1";
const ESPN_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Accept": "application/json",
  "Origin": "https://www.espn.com",
  "Referer": "https://www.espn.com/",
};

// Constructor abbreviations → ESPN team ids (from the F1 teams endpoint).
// Abbreviations match the Constructor Standings entries.
const TEAM_IDS = {
  SCS: "106922", // Alpine
  ASTM: "123986", // Aston Martin
  AUDI: "132212", // Audi
  CAD: "132211", // Cadillac
  JK: "106842", // Ferrari
  JH: "111427", // Haas
  DH: "106892", // McLaren
  LP: "106893", // Mercedes
  RB: "123988", // Racing Bulls
  GL: "106921", // Red Bull
  RM: "106967", // Williams
};

const TEAM_EMOJI = {
  SCS: "🔵", ASTM: "🟢", AUDI: "🔴", CAD: "🛡️", JK: "🐴", JH: "⚪",
  DH: "🧡", LP: "⚫", RB: "💙", GL: "🐂", RM: "🔵",
};

const DEMO_TEAMS = {
  LP: { id: "106893", abbreviation: "LP", name: "Mercedes", full_name: "Mercedes", conference: "Formula 1", division: "" },
  GL: { id: "106921", abbreviation: "GL", name: "Red Bull", full_name: "Red Bull", conference: "Formula 1", division: "" },
  DH: { id: "106892", abbreviation: "DH", name: "McLaren", full_name: "McLaren", conference: "Formula 1", division: "" },
};

const DATA_SOURCE = "ESPN public API";

function getSeasonYear() {
  return new Date().getFullYear();
}

function getLogoUrl() {
  // F1 constructors are not exposed on ESPN's standard team-logo CDN, so the
  // constructor falls back to the F1 league logo in the README.
  return "https://a.espncdn.com/i/teamlogos/leagues/500/f1.png";
}

async function fetchTeamInfo(abbr) {
  const upper = abbr.toUpperCase();
  const id = TEAM_IDS[upper];
  if (!id) return null;
  try {
    const { data } = await httpGet(`${ESPN_BASE}/teams/${id}`, { headers: ESPN_HEADERS });
    const team = data.team;
    if (!team) return null;
    return {
      id,
      abbreviation: upper,
      name: team.displayName || team.name,
      full_name: team.displayName || team.name,
      conference: "Formula 1",
      division: "",
    };
  } catch (error) {
    console.error(`Failed to fetch F1 constructor: ${error.message}`);
    return null;
  }
}

// Constructor standings are authoritative for position and points. F1 exposes
// no team-level game results on the site API, so recentGames stays empty.
async function fetchConstructorStandings(abbr) {
  const season = getSeasonYear();
  try {
    const upper = abbr.toUpperCase();
    const { data } = await httpGet(`${ESPN_BASE_V2}/standings?season=${season}`, { headers: ESPN_HEADERS });
    const group = (data.children || []).find((c) => String(c.name).toLowerCase().includes("constructor"));
    const entries = group?.standings?.entries || [];
    const index = entries.findIndex((e) => e.team?.abbreviation?.toUpperCase() === upper);
    const entry = entries[index];
    if (entry) {
      const stats = Object.fromEntries((entry.stats || []).map((s) => [s.name, s.value]));
      return {
        position: stats.rank || index + 1,
        points: stats.points || 0,
        wins: 0,
        losses: 0,
        season,
        conference: "Formula 1",
        division: "",
      };
    }
    return { position: null, points: 0, wins: 0, losses: 0, season, conference: "Formula 1", division: "" };
  } catch (error) {
    console.error(`Failed to fetch F1 constructor standings: ${error.message}`);
    return { position: null, points: 0, wins: 0, losses: 0, season, conference: "Formula 1", division: "" };
  }
}

async function fetchData(abbr) {
  const team = await fetchTeamInfo(abbr);
  if (!team) return null;

  const standings = await fetchConstructorStandings(abbr);

  const record = {
    wins: standings.wins,
    losses: standings.losses,
    points: standings.points,
    season: standings.season,
  };

  return {
    team,
    record,
    recentGames: [],
    standing: standings.position
      ? { position: standings.position, label: "Constructor Championship" }
      : null,
    f1Points: standings.points,
  };
}

function getDemoData(abbr) {
  const upper = (abbr || "").toUpperCase();
  const team = DEMO_TEAMS[upper] || DEMO_TEAMS.LP;
  const day = 24 * 60 * 60 * 1000;
  return {
    team,
    record: { wins: 0, losses: 0, points: 425, season: getSeasonYear() },
    recentGames: [],
    standing: { position: 1, label: "Constructor Championship" },
    f1Points: 425,
    nextGame: { date: new Date(Date.now() + 7 * day).toISOString(), opponent: "Next GP", isHome: true },
    form: ["W", "W", "L", "W", "W"],
  };
}

module.exports = {
  fetchData,
  getDemoData,
  getLogoUrl,
  getSeasonYear,
  DATA_SOURCE,
  TEAM_EMOJI,
  DEMO_TEAMS,
  TEAM_IDS,
};
