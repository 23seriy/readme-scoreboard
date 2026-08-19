const axios = require("axios");

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba-development";
const ESPN_BASE_V2 = "https://site.api.espn.com/apis/v2/sports/basketball/nba-development";
const ESPN_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Accept": "application/json",
  "Origin": "https://www.espn.com",
  "Referer": "https://www.espn.com/",
};

const TEAM_EMOJI = {
  AUS: "🐐", CAP: "🏛️", CLC: "⚡", CPS: "🦅", CVL: "🌴",
  DEL: "🧥", GBO: "🐝", GRD: "🥇", IWA: "🐺", LAK: "🌊",
  LIN: "🕸️", MCC: "🚗", MHU: "🎸", MNE: "🍀", MXC: "🇲🇽",
  NOB: "💥", OKL: "🔵", OSC: "✨", RAP: "🦖", RCITY: "🌲",
  RGV: "🐍", SAN: "⛵", SCW: "🌊", SLC: "⭐", STO: "👑",
  SXF: "⚡", TEX: "⭐", VALLEY: "☀️", WCB: "🐂", WES: "🗽",
  WIS: "🦌",
};

// ESPN team IDs — sourced from ESPN's G League standings API (authoritative).
const TEAM_IDS = {
  AUS: 2, CAP: 4, CLC: 3, CPS: 28, CVL: 22,
  DEL: 5, GBO: 9, GRD: 8, IWA: 10, LAK: 6,
  LIN: 12, MCC: 15, MHU: 14, MNE: 13, MXC: 124612,
  NOB: 7, OKL: 16, OSC: 11, RAP: 17, RCITY: 128019,
  RGV: 18, SAN: 1, SCW: 20, SLC: 19, STO: 23,
  SXF: 21, TEX: 24, VALLEY: 129713, WCB: 26, WES: 25,
  WIS: 27,
};

// Most clubs' logos live at /nba-development/500/<abbr>.png. These two were
// rebranded recently and ESPN files them under a GUID path instead — verified
// against the logos ESPN itself returns for them.
const LOGO_OVERRIDES = {
  NOB: "https://a.espncdn.com/guid/373d77e0-4edd-aaeb-ec83-eefc2ca511cb/logos/default.png",
  CVL: "https://a.espncdn.com/guid/ed81f2d5-eaa5-343d-5b76-c685a731f733/logos/default.png",
};

const DEMO_TEAMS = {
  OSC: { id: 11, abbreviation: "OSC", name: "Magic", full_name: "Osceola Magic", conference: "Eastern", division: "" },
  RAP: { id: 17, abbreviation: "RAP", name: "Raptors 905", full_name: "Raptors 905", conference: "Eastern", division: "" },
  STO: { id: 23, abbreviation: "STO", name: "Kings", full_name: "Stockton Kings", conference: "Western", division: "" },
};

/**
 * The G League season runs November–April, crossing the new year, and ESPN
 * labels it by the year it ends in — the same convention the NBA uses.
 */
function getSeasonYear() {
  const now = new Date();
  return now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
}

function getLogoUrl(abbr) {
  const upper = abbr.toUpperCase();
  return LOGO_OVERRIDES[upper] || `https://a.espncdn.com/i/teamlogos/nba-development/500/${upper.toLowerCase()}.png`;
}

async function fetchTeamInfo(teamAbbr) {
  const espnId = TEAM_IDS[teamAbbr.toUpperCase()];
  if (!espnId) return null;
  try {
    const { data } = await axios.get(`${ESPN_BASE}/teams/${espnId}`, { headers: ESPN_HEADERS });
    const team = data.team;
    if (!team) return null;
    return {
      id: espnId,
      abbreviation: teamAbbr.toUpperCase(),
      name: team.name,
      full_name: team.displayName,
      conference: "",
      division: "",
    };
  } catch (error) {
    console.error(`Failed to fetch G League team: ${error.message}`);
    return null;
  }
}

async function fetchStandings(teamAbbr) {
  const season = getSeasonYear();
  const empty = { wins: 0, losses: 0, season, conference: "" };
  try {
    const upper = teamAbbr.toUpperCase();
    const { data } = await axios.get(`${ESPN_BASE_V2}/standings?season=${season}`, { headers: ESPN_HEADERS });
    // Conferences, no divisions — entries sit directly under each conference.
    for (const conf of data.children || []) {
      for (const entry of conf.standings?.entries || []) {
        if (entry.team?.abbreviation?.toUpperCase() === upper) {
          const stats = (entry.stats || []).reduce((acc, s) => { acc[s.name] = s.value; return acc; }, {});
          return {
            wins: stats.wins || 0,
            losses: stats.losses || 0,
            season,
            conference: (conf.name || "").replace(" Conference", ""),
          };
        }
      }
    }
    return empty;
  } catch (error) {
    console.error(`Failed to fetch G League standings: ${error.message}`);
    return empty;
  }
}

async function fetchRecentGames(teamAbbr, count = 5) {
  const upper = teamAbbr.toUpperCase();
  const espnId = TEAM_IDS[upper];
  if (!espnId) return [];
  try {
    const season = getSeasonYear();
    // Regular season and playoffs are separate seasontype values. Showcase and
    // preseason games (seasontype 1) are deliberately not fetched.
    const [regData, postData] = await Promise.all([
      axios.get(`${ESPN_BASE}/teams/${espnId}/schedule?season=${season}&seasontype=2`, { headers: ESPN_HEADERS }),
      axios.get(`${ESPN_BASE}/teams/${espnId}/schedule?season=${season}&seasontype=3`, { headers: ESPN_HEADERS }),
    ]);

    const events = [
      ...(regData.data.events || []).map((e) => ({ ...e, gameType: 2 })),
      ...(postData.data.events || []).map((e) => ({ ...e, gameType: 3 })),
    ];

    return events
      .filter((e) => e.competitions?.[0]?.status?.type?.completed)
      .map((e) => {
        const comp = e.competitions[0];
        const teamComp = comp.competitors.find((c) => c.team?.abbreviation?.toUpperCase() === upper);
        const oppComp = comp.competitors.find((c) => c.team?.abbreviation?.toUpperCase() !== upper);
        if (!teamComp || !oppComp) return null;
        const teamScore = teamComp.score?.value ?? 0;
        const oppScore = oppComp.score?.value ?? 0;
        const isHome = teamComp.homeAway === "home";
        return {
          date: e.date,
          postseason: e.gameType === 3,
          status: "Final",
          home_team: {
            id: isHome ? espnId : 0,
            abbreviation: isHome ? upper : oppComp.team.abbreviation,
          },
          visitor_team: {
            id: isHome ? 0 : espnId,
            abbreviation: isHome ? oppComp.team.abbreviation : upper,
          },
          home_team_score: isHome ? teamScore : oppScore,
          visitor_team_score: isHome ? oppScore : teamScore,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, count);
  } catch (error) {
    console.error(`Failed to fetch G League games: ${error.message}`);
    return [];
  }
}

async function fetchData(teamAbbr) {
  try {
    const team = await fetchTeamInfo(teamAbbr);
    if (!team) return null;

    const [record, recentGames] = await Promise.all([
      fetchStandings(teamAbbr),
      fetchRecentGames(teamAbbr),
    ]);

    team.conference = record.conference;
    return { team, record, recentGames };
  } catch (error) {
    console.error(`Failed to fetch G League data: ${error.message}`);
    return null;
  }
}

function getDemoData(teamAbbr) {
  const abbr = teamAbbr.toUpperCase();
  const team = DEMO_TEAMS[abbr];
  if (!team) return null;

  const day = 24 * 60 * 60 * 1000;
  const sample = [
    { daysAgo: 2, teamScore: 118, oppScore: 104, opp: "WIS", isHome: true },
    { daysAgo: 4, teamScore: 99, oppScore: 112, opp: "RAP", isHome: false },
    { daysAgo: 7, teamScore: 125, oppScore: 121, opp: "DEL", isHome: true },
  ];

  return {
    team,
    record: { wins: 26, losses: 10, season: getSeasonYear() },
    recentGames: sample.map((g) => ({
      date: new Date(Date.now() - g.daysAgo * day).toISOString(),
      postseason: false,
      status: "Final",
      home_team: { id: g.isHome ? team.id : 0, abbreviation: g.isHome ? abbr : g.opp },
      visitor_team: { id: g.isHome ? 0 : team.id, abbreviation: g.isHome ? g.opp : abbr },
      home_team_score: g.isHome ? g.teamScore : g.oppScore,
      visitor_team_score: g.isHome ? g.oppScore : g.teamScore,
    })),
  };
}

module.exports = {
  fetchData,
  getDemoData,
  getLogoUrl,
  getSeasonYear,
  TEAM_EMOJI,
  DEMO_TEAMS,
  TEAM_IDS,
  LOGO_OVERRIDES,
};
