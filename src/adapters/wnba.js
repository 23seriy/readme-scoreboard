const axios = require("axios");

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/basketball/wnba";
const ESPN_BASE_V2 = "https://site.api.espn.com/apis/v2/sports/basketball/wnba";
const ESPN_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Accept": "application/json",
  "Origin": "https://www.espn.com",
  "Referer": "https://www.espn.com/",
};

const TEAM_EMOJI = {
  ATL: "🌙", CHI: "☁️", CON: "☀️", DAL: "🪽", GS: "⚔️",
  IND: "🔥", LA: "✨", LV: "🎰", MIN: "🐆", NY: "🗽",
  PHX: "☿️", POR: "🔥", SEA: "⚡", TOR: "🍁", WSH: "🔮",
};

// ESPN team IDs — sourced from ESPN's WNBA standings API (authoritative).
// Golden State, Portland and Toronto are recent expansion clubs, which is why
// their ids sit far outside the original range.
const TEAM_IDS = {
  ATL: 20, CHI: 19, CON: 18, DAL: 3, GS: 129689,
  IND: 5, LA: 6, LV: 17, MIN: 8, NY: 9,
  PHX: 11, POR: 132052, SEA: 14, TOR: 131935, WSH: 16,
};

const DEMO_TEAMS = {
  MIN: { id: 8, abbreviation: "MIN", name: "Lynx", full_name: "Minnesota Lynx", conference: "Western", division: "" },
  NY: { id: 9, abbreviation: "NY", name: "Liberty", full_name: "New York Liberty", conference: "Eastern", division: "" },
  LV: { id: 17, abbreviation: "LV", name: "Aces", full_name: "Las Vegas Aces", conference: "Western", division: "" },
};

/**
 * The WNBA season runs May–October, so it sits inside a single calendar year —
 * unlike the NBA, whose season crosses the new year.
 */
function getSeasonYear() {
  return new Date().getFullYear();
}

function getLogoUrl(abbr) {
  return `https://a.espncdn.com/i/teamlogos/wnba/500/${abbr.toLowerCase()}.png`;
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
    console.error(`Failed to fetch WNBA team: ${error.message}`);
    return null;
  }
}

/**
 * Record and conference come from standings, which is authoritative — counting
 * games would miss anything the schedule endpoint omits.
 */
async function fetchStandings(teamAbbr) {
  const season = getSeasonYear();
  const empty = { wins: 0, losses: 0, season, conference: "" };
  try {
    const upper = teamAbbr.toUpperCase();
    const { data } = await axios.get(
      `${ESPN_BASE_V2}/standings?season=${season}`,
      { headers: ESPN_HEADERS }
    );
    // The WNBA has conferences but no divisions, so entries sit directly under
    // each conference rather than a nested division level.
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
    console.error(`Failed to fetch WNBA standings: ${error.message}`);
    return empty;
  }
}

async function fetchRecentGames(teamAbbr, count = 5) {
  const upper = teamAbbr.toUpperCase();
  const espnId = TEAM_IDS[upper];
  if (!espnId) return [];
  try {
    const season = getSeasonYear();
    // Regular season and playoffs are separate seasontype values. Preseason
    // (seasontype 1) is deliberately not fetched — it isn't a real result.
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
    console.error(`Failed to fetch WNBA games: ${error.message}`);
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
    console.error(`Failed to fetch WNBA data: ${error.message}`);
    return null;
  }
}

function getDemoData(teamAbbr) {
  const abbr = teamAbbr.toUpperCase();
  const team = DEMO_TEAMS[abbr];
  if (!team) return null;

  const day = 24 * 60 * 60 * 1000;
  const sample = [
    { daysAgo: 2, teamScore: 85, oppScore: 81, opp: "POR", isHome: false, postseason: false },
    { daysAgo: 5, teamScore: 92, oppScore: 78, opp: "SEA", isHome: true, postseason: false },
    { daysAgo: 8, teamScore: 74, oppScore: 88, opp: "LV", isHome: false, postseason: false },
  ];

  return {
    team,
    record: { wins: 28, losses: 7, season: getSeasonYear() },
    recentGames: sample.map((g) => ({
      date: new Date(Date.now() - g.daysAgo * day).toISOString(),
      postseason: g.postseason,
      status: "Final",
      home_team: {
        id: g.isHome ? team.id : 0,
        abbreviation: g.isHome ? abbr : g.opp,
      },
      visitor_team: {
        id: g.isHome ? 0 : team.id,
        abbreviation: g.isHome ? g.opp : abbr,
      },
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
  TEAM_IDS,
};
