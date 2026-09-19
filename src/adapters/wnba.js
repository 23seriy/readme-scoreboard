const { get: httpGet } = require("../http");
const { dateOffset } = require("../demo");

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/basketball/wnba";
const ESPN_BASE_V2 = "https://site.api.espn.com/apis/v2/sports/basketball/wnba";
// Athlete stats live on the shared common/v3 host, same shape as the NBA's.
const ESPN_ATHLETE_BASE = "https://site.web.api.espn.com/apis/common/v3/sports/basketball/wnba/athletes";

// Fixed season for sample boards so generated examples don't drift.
const DEMO_SEASON = 2026;

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
  DAL: { id: 3, abbreviation: "DAL", name: "Wings", full_name: "Dallas Wings", conference: "Western", division: "" },
};

// Demo rosters so `--demo` and the generated examples can render the Player
// Spotlight block without a network call. Ids are real ESPN athlete ids (and
// the team each player actually plays for) verified against the live rosters:
// they are what the headshot URL is built from, so a wrong id shows the wrong
// face. The Women's league turns over fast, so re-check when adding players.
const DEMO_PLAYERS = {
  MIN: [
    { id: "3917450", fullName: "Napheesa Collier", position: "F" },
    { id: "2529205", fullName: "Kayla McBride", position: "G" },
  ],
  NY: [
    { id: "2998928", fullName: "Breanna Stewart", position: "F" },
    { id: "4066533", fullName: "Sabrina Ionescu", position: "G" },
  ],
  LV: [
    { id: "3149391", fullName: "A'ja Wilson", position: "C" },
    { id: "4065870", fullName: "Jackie Young", position: "G" },
  ],
  DAL: [
    { id: "4433730", fullName: "Paige Bueckers", position: "G" },
  ],
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

// ESPN publishes a square cut-out headshot per athlete id, at the same path
// shape the NBA uses. Returns null without an id so the renderer omits the
// image rather than emitting a broken one.
function getPlayerHeadshotUrl(playerId) {
  return playerId
    ? `https://a.espncdn.com/i/headshots/wnba/players/full/${playerId}.png`
    : null;
}

async function fetchTeamInfo(teamAbbr) {
  const espnId = TEAM_IDS[teamAbbr.toUpperCase()];
  if (!espnId) return null;
  try {
    const { data } = await httpGet(`${ESPN_BASE}/teams/${espnId}`, { headers: ESPN_HEADERS });
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
  const empty = { wins: 0, losses: 0, season, conference: "", position: null };
  try {
    const upper = teamAbbr.toUpperCase();
    const { data } = await httpGet(
      `${ESPN_BASE_V2}/standings?season=${season}`,
      { headers: ESPN_HEADERS }
    );
    // The WNBA has conferences but no divisions, so entries sit directly under
    // each conference rather than a nested division level.
    for (const conf of data.children || []) {
      const entries = conf.standings?.entries || [];
      const index = entries.findIndex((e) => e.team?.abbreviation?.toUpperCase() === upper);
      const entry = entries[index];
      if (entry) {
        const stats = (entry.stats || []).reduce((acc, s) => { acc[s.name] = s.value; return acc; }, {});
        return {
          wins: stats.wins || 0,
          losses: stats.losses || 0,
          season,
          conference: (conf.name || "").replace(" Conference", ""),
          position: index + 1,
        };
      }
    }
    return empty;
  } catch (error) {
    console.error(`Failed to fetch WNBA standings: ${error.message}`);
    return empty;
  }
}

async function fetchScheduleEvents(teamAbbr) {
  const upper = teamAbbr.toUpperCase();
  const espnId = TEAM_IDS[upper];
  if (!espnId) return [];
  const season = getSeasonYear();
  // Regular season and playoffs are separate seasontype values. Preseason
  // (seasontype 1) is deliberately not fetched — it isn't a real result.
  const [regData, postData] = await Promise.all([
    httpGet(`${ESPN_BASE}/teams/${espnId}/schedule?season=${season}&seasontype=2`, { headers: ESPN_HEADERS }),
    httpGet(`${ESPN_BASE}/teams/${espnId}/schedule?season=${season}&seasontype=3`, { headers: ESPN_HEADERS }),
  ]);

  return [
    ...(regData.data.events || []).map((e) => ({ ...e, gameType: 2 })),
    ...(postData.data.events || []).map((e) => ({ ...e, gameType: 3 })),
  ];
}

async function fetchRecentGames(teamAbbr, count = 5, events) {
  const upper = teamAbbr.toUpperCase();
  const espnId = TEAM_IDS[upper];
  if (!espnId) return [];
  try {
    const schedule = events || await fetchScheduleEvents(teamAbbr);

    return schedule
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

function parseForm(events, upper) {
  return (events || [])
    .filter((e) => e.competitions?.[0]?.status?.type?.completed)
    .map((e) => {
      const comp = e.competitions[0];
      const teamComp = comp.competitors.find((c) => c.team?.abbreviation?.toUpperCase() === upper);
      const oppComp = comp.competitors.find((c) => c.team?.abbreviation?.toUpperCase() !== upper);
      if (!teamComp || !oppComp) return null;
      const teamScore = teamComp.score?.value ?? 0;
      const oppScore = oppComp.score?.value ?? 0;
      return teamScore > oppScore ? "W" : teamScore < oppScore ? "L" : "D";
    })
    .filter(Boolean)
    .slice(0, 5);
}

function parseNextGame(events, upper) {
  const upNext = (events || [])
    .filter((e) => e.competitions?.[0]?.status?.type?.completed === false)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  if (!upNext) return null;
  const comp = upNext.competitions[0];
  const teamComp = comp.competitors.find((c) => c.team?.abbreviation?.toUpperCase() === upper);
  const oppComp = comp.competitors.find((c) => c.team?.abbreviation?.toUpperCase() !== upper);
  if (!teamComp || !oppComp) return null;
  return { date: upNext.date, opponent: oppComp.team?.abbreviation, isHome: teamComp.homeAway === "home" };
}

async function fetchData(teamAbbr) {
  try {
    const team = await fetchTeamInfo(teamAbbr);
    if (!team) return null;

    const [record, events] = await Promise.all([
      fetchStandings(teamAbbr),
      fetchScheduleEvents(teamAbbr),
    ]);

    const upper = teamAbbr.toUpperCase();
    const recentGames = await fetchRecentGames(teamAbbr, 5, events);

    team.conference = record.conference;
    return {
      team,
      record,
      recentGames,
      standing: record.position ? { position: record.position, label: record.conference } : null,
      form: parseForm(events, upper),
      nextGame: parseNextGame(events, upper),
    };
  } catch (error) {
    console.error(`Failed to fetch WNBA data: ${error.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Player spotlight
//
// The WNBA's athlete endpoints mirror the NBA's exactly: the same common/v3
// splits payload with `avgPoints`/`avgRebounds`/`avgAssists`, and the same game
// log columns (`points`, `totalRebounds`, `assists`, `minutes`). The
// implementation is duplicated rather than shared so each league owns its own
// endpoints, matching how every other adapter in this repo is structured.
// ---------------------------------------------------------------------------

async function fetchTeamRoster(teamAbbr) {
  const espnId = TEAM_IDS[teamAbbr.toUpperCase()];
  if (!espnId) return [];
  try {
    const { data } = await httpGet(`${ESPN_BASE}/teams/${espnId}/roster`, { headers: ESPN_HEADERS });
    return (data.athletes || []).map((athlete) => ({
      id: String(athlete.id),
      fullName: athlete.fullName,
      position: athlete.position?.abbreviation || "",
    }));
  } catch (error) {
    console.error(`Failed to fetch WNBA roster: ${error.message}`);
    return [];
  }
}

function findPlayerOnRoster(roster, playerName) {
  const target = playerName.trim().toLowerCase();
  return roster.find((player) => (player.fullName || "").toLowerCase() === target) || null;
}

function statByName(names, stats, name) {
  const index = names.indexOf(name);
  return index === -1 ? null : parseFloat(stats[index]);
}

async function fetchPlayerSeasonAverages(athleteId) {
  try {
    const { data } = await httpGet(`${ESPN_ATHLETE_BASE}/${athleteId}/splits`, { headers: ESPN_HEADERS });
    const names = data.names || [];
    const stats = data.splitCategories?.[0]?.splits?.[0]?.stats || [];
    const points = statByName(names, stats, "avgPoints");
    const rebounds = statByName(names, stats, "avgRebounds");
    const assists = statByName(names, stats, "avgAssists");
    if (points == null || rebounds == null || assists == null) return null;
    return { points, rebounds, assists };
  } catch (error) {
    console.error(`Failed to fetch WNBA player season averages: ${error.message}`);
    return null;
  }
}

// Date and opponent for the player's last game come from the event summary. The
// opponent is whichever competitor is not the player's own team, so the caller
// passes the team abbreviation the spotlight is on.
async function fetchPlayerLastGameMeta(eventId, teamAbbr) {
  try {
    const upper = teamAbbr.toUpperCase();
    const { data } = await httpGet(
      `${ESPN_BASE}/summary?event=${eventId}`,
      { headers: ESPN_HEADERS }
    );
    const comp = data.header?.competitions?.[0];
    if (!comp) return null;
    // WNBA abbreviations mostly match ESPN's, but a few differ (e.g. the
    // Liberty are NY, Golden State is GS). Comparing against the abbreviation
    // passed in is enough: the summary always lists exactly two competitors,
    // so the one that isn't this team is the opponent.
    const opponent = (comp.competitors || []).find(
      (c) => (c.team?.abbreviation || "").toUpperCase() !== upper
    );
    if (!opponent) return null;
    return {
      date: comp.date || null,
      opponent: opponent.team?.displayName || opponent.team?.name || opponent.team?.abbreviation || null,
    };
  } catch (error) {
    console.error(`Failed to fetch WNBA player last game meta: ${error.message}`);
    return null;
  }
}

async function fetchPlayerLastGame(athleteId, teamAbbr) {
  try {
    const { data } = await httpGet(`${ESPN_ATHLETE_BASE}/${athleteId}/gamelog`, { headers: ESPN_HEADERS });
    const names = data.names || [];
    // The game log is newest-first, so the most recent game is the first event.
    const events = (data.seasonTypes || [])
      .flatMap((seasonType) => seasonType.categories || [])
      .flatMap((category) => category.events || []);
    const latest = events[0];
    if (!latest) return null;
    const points = statByName(names, latest.stats, "points");
    const rebounds = statByName(names, latest.stats, "totalRebounds");
    const assists = statByName(names, latest.stats, "assists");
    const minutes = statByName(names, latest.stats, "minutes");
    if (points == null || rebounds == null || assists == null || minutes == null) return null;
    const result = { points, rebounds, assists, minutes };
    const meta = await fetchPlayerLastGameMeta(latest.eventId, teamAbbr);
    if (meta) Object.assign(result, meta);
    return result;
  } catch (error) {
    console.error(`Failed to fetch WNBA player last game: ${error.message}`);
    return null;
  }
}

async function fetchPlayerSpotlight(teamAbbr, playerName) {
  const roster = await fetchTeamRoster(teamAbbr);
  const player = findPlayerOnRoster(roster, playerName);
  if (!player) {
    const names = roster.slice(0, 8).map((entry) => entry.fullName);
    const suffix = roster.length > 8 ? ", ..." : "";
    throw new Error(`Unknown player "${playerName}" on ${teamAbbr}. Try one of: ${names.join(", ")}${suffix}`);
  }
  const [season, lastGame] = await Promise.all([
    fetchPlayerSeasonAverages(player.id),
    fetchPlayerLastGame(player.id, teamAbbr),
  ]);
  return {
    name: player.fullName,
    position: player.position,
    season: season || { points: 0, rebounds: 0, assists: 0 },
    lastGame,
    headshotUrl: getPlayerHeadshotUrl(player.id),
  };
}

// Deterministic demo spotlight derived from the player's name, so repeated runs
// and the generated examples stay byte-identical. `recentGames` is the team
// board's own list, so the spotlight's last game can't contradict it.
function getDemoSpotlight(teamAbbr, playerName, recentGames = []) {
  const abbr = teamAbbr.toUpperCase();
  const roster = DEMO_PLAYERS[abbr] || DEMO_PLAYERS.MIN;
  const player = playerName ? findPlayerOnRoster(roster, playerName) : roster[0];
  if (!player) return null;
  const seed = player.fullName.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const last = recentGames[0];
  // The team board's demo games carry no top-level opponent field (the same
  // shape the NBA uses), so the opponent is whichever side isn't this team.
  const lastOpponent = last
    ? (last.visitor_team?.abbreviation === abbr
        ? last.home_team?.abbreviation
        : last.visitor_team?.abbreviation)
    : "LV";
  return {
    name: player.fullName,
    position: player.position,
    season: {
      points: Number((18 + (seed % 90) / 10).toFixed(1)),
      rebounds: Number((3 + (seed % 80) / 10).toFixed(1)),
      assists: Number((2 + (seed % 70) / 10).toFixed(1)),
    },
    headshotUrl: getPlayerHeadshotUrl(player.id),
    lastGame: {
      points: 12 + (seed % 20),
      rebounds: 2 + (seed % 9),
      assists: 1 + (seed % 8),
      minutes: 24 + (seed % 14),
      date: last ? last.date : dateOffset(0),
      opponent: lastOpponent || "LV",
    },
  };
}

function getDemoData(teamAbbr, playerName) {
  const abbr = teamAbbr.toUpperCase();
  const team = DEMO_TEAMS[abbr];
  if (!team) return null;

  const sample = [
    { daysAgo: 2, teamScore: 85, oppScore: 81, opp: "POR", isHome: false, postseason: false },
    { daysAgo: 5, teamScore: 92, oppScore: 78, opp: "SEA", isHome: true, postseason: false },
    { daysAgo: 8, teamScore: 74, oppScore: 88, opp: "LV", isHome: false, postseason: false },
  ];

  // Dates come from the pinned demo clock (DEMO_NOW) rather than Date.now(), so
  // the committed examples stay byte-identical across days. Using the wall clock
  // here made examples/wnba-min-napheesa-collier.md churn on every regeneration.
  const recentGames = sample.map((g) => ({
    date: dateOffset(-g.daysAgo),
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
  }));

  return {
    team,
    record: { wins: 28, losses: 7, season: DEMO_SEASON },
    standing: { position: 1, label: team.conference },
    form: ["W", "W", "L"],
    nextGame: { date: dateOffset(3), opponent: "POR", isHome: true },
    recentGames,
    spotlight: playerName ? getDemoSpotlight(abbr, playerName, recentGames) : null,
  };
}

module.exports = {
  fetchData,
  getDemoData,
  getLogoUrl,
  getSeasonYear,
  parseForm,
  parseNextGame,
  getPlayerHeadshotUrl,
  fetchTeamRoster,
  findPlayerOnRoster,
  fetchPlayerSeasonAverages,
  fetchPlayerLastGame,
  fetchPlayerLastGameMeta,
  fetchPlayerSpotlight,
  getDemoSpotlight,
  TEAM_EMOJI,
  DEMO_TEAMS,
  DEMO_PLAYERS,
  TEAM_IDS,
};
