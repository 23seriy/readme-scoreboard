const { get: httpGet } = require("../http");

const ESPN_BASE = "https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba";
const ESPN_BASE_V2 = "https://site.web.api.espn.com/apis/v2/sports/basketball/nba";
const ESPN_ATHLETE_BASE = "https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes";
const ESPN_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Accept": "application/json",
  "Origin": "https://www.espn.com",
  "Referer": "https://www.espn.com/",
};

const TEAM_EMOJI = {
  ATL: "🦅", BOS: "☘️", BKN: "🏙️", CHA: "🐝", CHI: "🐂",
  CLE: "⚔️", DAL: "🐴", DEN: "⛏️", DET: "🏎️", GSW: "🌉",
  HOU: "🚀", IND: "🏎️", LAC: "⛵", LAL: "👑", MEM: "🐻",
  MIA: "🔥", MIL: "🦌", MIN: "🐺", NOP: "⚜️", NYK: "🗽",
  OKC: "⚡", ORL: "✨", PHI: "🔔", PHX: "☀️", POR: "🌹",
  SAC: "👑", SAS: "🤠", TOR: "🦖", UTA: "🎵", WAS: "🧙",
};

// NBA CDN team IDs (for logo URLs) — separate from ESPN team IDs
const TEAM_IDS = {
  ATL: 1610612737, BOS: 1610612738, BKN: 1610612751, CHA: 1610612766,
  CHI: 1610612741, CLE: 1610612739, DAL: 1610612742, DEN: 1610612743,
  DET: 1610612765, GSW: 1610612744, HOU: 1610612745, IND: 1610612754,
  LAC: 1610612746, LAL: 1610612747, MEM: 1610612763, MIA: 1610612748,
  MIL: 1610612749, MIN: 1610612750, NOP: 1610612740, NYK: 1610612752,
  OKC: 1610612760, ORL: 1610612753, PHI: 1610612755, PHX: 1610612756,
  POR: 1610612757, SAC: 1610612758, SAS: 1610612759, TOR: 1610612761,
  UTA: 1610612762, WAS: 1610612764,
};

// ESPN uses shorter abbreviations for some teams
const ESPN_ABBR = {
  GSW: "GS", NOP: "NO", NYK: "NY", SAS: "SA", UTA: "UTAH", WAS: "WSH",
};

// ESPN team IDs (for schedule/standings API calls)
const ESPN_TEAM_IDS = {
  ATL: 1,  BOS: 2,  BKN: 17, CHA: 30, CHI: 4,  CLE: 5,  DAL: 6,  DEN: 7,
  DET: 8,  GSW: 9,  HOU: 10, IND: 11, LAC: 12, LAL: 13, MEM: 29, MIA: 14,
  MIL: 15, MIN: 16, NOP: 3,  NYK: 18, OKC: 25, ORL: 19, PHI: 20, PHX: 21,
  POR: 22, SAC: 23, SAS: 24, TOR: 28, UTA: 26, WAS: 27,
};

const DEMO_TEAMS = {
  LAL: { id: 13, abbreviation: "LAL", name: "Lakers", full_name: "Los Angeles Lakers", conference: "West", division: "Pacific" },
  BOS: { id: 2,  abbreviation: "BOS", name: "Celtics", full_name: "Boston Celtics", conference: "East", division: "Atlantic" },
  GSW: { id: 9,  abbreviation: "GSW", name: "Warriors", full_name: "Golden State Warriors", conference: "West", division: "Pacific" },
  NYK: { id: 18, abbreviation: "NYK", name: "Knicks", full_name: "New York Knicks", conference: "East", division: "Atlantic" },
  CHI: { id: 4,  abbreviation: "CHI", name: "Bulls", full_name: "Chicago Bulls", conference: "East", division: "Central" },
};

async function fetchTeamInfo(teamAbbr) {
  try {
    const upper = teamAbbr.toUpperCase();
    const espnId = ESPN_TEAM_IDS[upper];
    if (!espnId) { console.error(`Unknown NBA team: ${upper}`); return null; }
    const { data } = await httpGet(`${ESPN_BASE}/teams/${espnId}`, { headers: ESPN_HEADERS });
    const team = data.team;
    if (!team) return null;
    return {
      id: espnId,
      abbreviation: upper,
      name: team.name,
      full_name: team.displayName,
      conference: "",
      division: "",
    };
  } catch (error) {
    console.error(`Failed to fetch NBA team: ${error.message}`);
    return null;
  }
}

async function fetchTeamRoster(teamAbbr) {
  const upper = teamAbbr.toUpperCase();
  const espnId = ESPN_TEAM_IDS[upper];
  if (!espnId) return [];
  try {
    const { data } = await httpGet(`${ESPN_BASE}/teams/${espnId}/roster`, { headers: ESPN_HEADERS });
    return (data.athletes || []).map((athlete) => ({ id: String(athlete.id), fullName: athlete.fullName }));
  } catch (error) {
    console.error(`Failed to fetch NBA roster: ${error.message}`);
    return [];
  }
}

function findPlayerOnRoster(roster, playerName) {
  const target = playerName.trim().toLowerCase();
  return roster.find((player) => player.fullName.toLowerCase() === target) || null;
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
    console.error(`Failed to fetch NBA player season averages: ${error.message}`);
    return null;
  }
}

async function fetchPlayerLastGame(athleteId) {
  try {
    const { data } = await httpGet(`${ESPN_ATHLETE_BASE}/${athleteId}/gamelog`, { headers: ESPN_HEADERS });
    const names = data.names || [];
    const events = data.seasonTypes?.[0]?.categories?.[0]?.events || [];
    const latest = events[0];
    if (!latest) return null;
    const points = statByName(names, latest.stats, "points");
    const rebounds = statByName(names, latest.stats, "totalRebounds");
    const assists = statByName(names, latest.stats, "assists");
    const minutes = statByName(names, latest.stats, "minutes");
    if (points == null || rebounds == null || assists == null || minutes == null) return null;
    return { points, rebounds, assists, minutes };
  } catch (error) {
    console.error(`Failed to fetch NBA player last game: ${error.message}`);
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
    fetchPlayerLastGame(player.id),
  ]);
  return { name: player.fullName, season: season || { points: 0, rebounds: 0, assists: 0 }, lastGame };
}

async function fetchStandings(teamAbbr) {
  try {
    const upper = teamAbbr.toUpperCase();
    const espnAbbr = ESPN_ABBR[upper] || upper;
    const now = new Date();
    // NBA season ends in June; ESPN season param = end year
    // Oct-Dec: new season (ends next year), Jan-Sep: current season (ends this year)
    const season = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
    const { data } = await httpGet(
      `${ESPN_BASE_V2}/standings?level=3&season=${season}&seasontype=2`,
      { headers: ESPN_HEADERS }
    );
    for (const conf of (data.children || [])) {
      const allDivEntries = (conf.children || []).flatMap((div) => div.standings?.entries || []);
      const index = allDivEntries.findIndex(
        (e) => e.team?.abbreviation?.toUpperCase() === espnAbbr.toUpperCase()
      );
      for (const div of (conf.children || [])) {
        const entry = (div.standings?.entries || []).find(
          (e) => e.team?.abbreviation?.toUpperCase() === espnAbbr.toUpperCase()
        );
        if (entry) {
          const stats = Object.fromEntries((entry.stats || []).map((s) => [s.name, s.value]));
          return {
            wins: stats.wins || 0,
            losses: stats.losses || 0,
            season,
            conference: conf.name?.replace(" Conference", "") || "",
            division: div.name?.replace(" Division", "") || "",
            position: index >= 0 ? index + 1 : null,
          };
        }
      }
    }
    return { wins: 0, losses: 0, season, conference: "", division: "", position: null };
  } catch (error) {
    console.error(`Failed to fetch NBA standings: ${error.message}`);
    return { wins: 0, losses: 0, season: new Date().getFullYear() - 1, conference: "", division: "" };
  }
}

async function fetchScheduleEvents(teamAbbr) {
  const upper = teamAbbr.toUpperCase();
  const espnId = ESPN_TEAM_IDS[upper];
  const now = new Date();
  const season = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
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
  try {
    const upper = teamAbbr.toUpperCase();
    const espnId = ESPN_TEAM_IDS[upper];
    const espnAbbr = (ESPN_ABBR[upper] || upper).toUpperCase();
    const schedule = events || await fetchScheduleEvents(teamAbbr);

    return schedule
      .filter((e) => e.competitions?.[0]?.status?.type?.completed)
      .map((e) => {
        const comp = e.competitions[0];
        const teamComp = comp.competitors.find((c) => c.team?.abbreviation?.toUpperCase() === espnAbbr.toUpperCase());
        const oppComp = comp.competitors.find((c) => c.team?.abbreviation?.toUpperCase() !== espnAbbr.toUpperCase());
        if (!teamComp || !oppComp) return null;
        const teamScore = teamComp.score?.value ?? parseFloat(teamComp.score) ?? 0;
        const oppScore = oppComp.score?.value ?? parseFloat(oppComp.score) ?? 0;
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
    console.error(`Failed to fetch NBA games: ${error.message}`);
    return [];
  }
}

function parseNbaForm(events, espnAbbr) {
  return (events || [])
    .filter((e) => e.competitions?.[0]?.status?.type?.completed)
    .map((e) => {
      const comp = e.competitions[0];
      const teamComp = comp.competitors.find((c) => c.team?.abbreviation?.toUpperCase() === espnAbbr.toUpperCase());
      const oppComp = comp.competitors.find((c) => c.team?.abbreviation?.toUpperCase() !== espnAbbr.toUpperCase());
      if (!teamComp || !oppComp) return null;
      const teamScore = teamComp.score?.value ?? parseFloat(teamComp.score) ?? 0;
      const oppScore = oppComp.score?.value ?? parseFloat(oppComp.score) ?? 0;
      return teamScore > oppScore ? "W" : teamScore < oppScore ? "L" : "D";
    })
    .filter(Boolean)
    .slice(0, 5);
}

function parseNbaNextGame(events, espnAbbr) {
  const upNext = (events || [])
    .filter((e) => e.competitions?.[0]?.status?.type?.completed === false)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  if (!upNext) return null;
  const comp = upNext.competitions[0];
  const teamComp = comp.competitors.find((c) => c.team?.abbreviation?.toUpperCase() === espnAbbr.toUpperCase());
  const oppComp = comp.competitors.find((c) => c.team?.abbreviation?.toUpperCase() !== espnAbbr.toUpperCase());
  if (!teamComp || !oppComp) return null;
  return { date: upNext.date, opponent: oppComp.team?.abbreviation, isHome: teamComp.homeAway === "home" };
}

function getDemoData(teamAbbr, playerName) {
  const abbr = teamAbbr.toUpperCase();
  const team = DEMO_TEAMS[abbr] || {
    id: 13, abbreviation: abbr, name: abbr,
    full_name: `${abbr} Team`, conference: "West", division: "Pacific",
  };
  const opponents = ["GSW", "DEN", "PHX", "SAC", "DAL"].filter((t) => t !== abbr);
  const games = opponents.slice(0, 5).map((opp, i) => {
    const won = i % 3 !== 2;
    const teamScore = won ? 110 + i * 3 : 98 + i;
    const oppScore = won ? 98 + i : 110 + i * 3;
    const d = new Date("2026-04-01");
    d.setDate(d.getDate() - i * 3);
    return {
      date: d.toISOString(),
      postseason: false,
      status: "Final",
      home_team: i % 2 === 0 ? team : { id: 0, abbreviation: opp },
      visitor_team: i % 2 === 0 ? { id: 0, abbreviation: opp } : team,
      home_team_score: i % 2 === 0 ? teamScore : oppScore,
      visitor_team_score: i % 2 === 0 ? oppScore : teamScore,
    };
  });
  let spotlight;
  if (abbr === "LAL" && playerName && playerName.trim().toLowerCase() === "luka dončić") {
    spotlight = {
      name: "Luka Dončić",
      season: { points: 33.5, rebounds: 7.7, assists: 8.3 },
      lastGame: { points: 26, rebounds: 4, assists: 7, minutes: 34 },
    };
  } else if (playerName) {
    console.log(`[DEMO] No demo spotlight for player "${playerName}" (demo data only covers Luka Dončić on LAL)`);
  }

  return {
    team,
    recentGames: games,
    record: { wins: 50, losses: 32, season: new Date().getFullYear() - 1 },
    standing: { position: 3, label: team.conference },
    form: ["W", "W", "L", "W", "W"],
    nextGame: { date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), opponent: "DEN", isHome: true },
    ...(spotlight ? { spotlight } : {}),
  };
}

async function fetchData(teamAbbr) {
  const [team, standings] = await Promise.all([
    fetchTeamInfo(teamAbbr),
    fetchStandings(teamAbbr),
  ]);
  if (!team) return null;

  team.conference = standings.conference;
  team.division = standings.division;

  const upper = teamAbbr.toUpperCase();
  const espnAbbr = (ESPN_ABBR[upper] || upper).toUpperCase();
  const events = await fetchScheduleEvents(teamAbbr);
  const recentGames = await fetchRecentGames(teamAbbr, 5, events);
  const record = { wins: standings.wins, losses: standings.losses, season: standings.season };

  return {
    team,
    recentGames,
    record,
    standing: standings.position ? { position: standings.position, label: standings.conference } : null,
    form: parseNbaForm(events, espnAbbr),
    nextGame: parseNbaNextGame(events, espnAbbr),
  };
}

function getLogoUrl(abbr) {
  const upper = abbr.toUpperCase();
  const slug = (ESPN_ABBR[upper] || upper).toLowerCase();
  return `https://a.espncdn.com/i/teamlogos/nba/500/${slug}.png`;
}

module.exports = {
  fetchData,
  getDemoData,
  getLogoUrl,
  fetchTeamRoster,
  findPlayerOnRoster,
  fetchPlayerSeasonAverages,
  fetchPlayerLastGame,
  fetchPlayerSpotlight,
  TEAM_EMOJI,
  DEMO_TEAMS,
  TEAM_IDS,
  ESPN_TEAM_IDS,
  ESPN_ABBR,
};
