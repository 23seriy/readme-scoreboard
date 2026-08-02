const axios = require("axios");

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";

const TEAM_EMOJI = {
  ARI: "🔴", ATL: "🔴", BAL: "🦅", BUF: "🐴", CAR: "🐯",
  CHI: "🐻", CIN: "🐯", CLE: "🟤", DAL: "🤠", DEN: "🐎",
  DET: "🦁", GB: "🧀", HOU: "🚀", IND: "🐴", JAX: "🐆",
  KC: "👑", LAC: "⚡", LAR: "🐏", LV: "☠️", MIA: "🐬",
  MIN: "🟣", NE: "😈", NO: "🎺", NYG: "👹", NYJ: "✈️",
  PHI: "🦅", PIT: "🖤", SF: "🟨", SEA: "🟦", TB: "🏴",
  TEN: "🎸", WAS: "🔴",
};

const TEAM_IDS = {
  ARI: 1, ATL: 2, BAL: 3, BUF: 4, CAR: 5,
  CHI: 6, CIN: 7, CLE: 8, DAL: 9, DEN: 10,
  DET: 11, GB: 12, HOU: 13, IND: 14, JAX: 15,
  KC: 16, LAC: 17, LAR: 18, LV: 19, MIA: 20,
  MIN: 21, NE: 22, NO: 23, NYG: 24, NYJ: 25,
  PHI: 26, PIT: 27, SF: 28, SEA: 29, TB: 30,
  TEN: 31, WAS: 32,
};

const DEMO_TEAMS = {
  KC: { id: 16, abbreviation: "KC", name: "Chiefs", full_name: "Kansas City Chiefs", conference: "AFC", division: "AFC West" },
  SF: { id: 28, abbreviation: "SF", name: "49ers", full_name: "San Francisco 49ers", conference: "NFC", division: "NFC West" },
  DAL: { id: 9, abbreviation: "DAL", name: "Cowboys", full_name: "Dallas Cowboys", conference: "NFC", division: "NFC East" },
  BUF: { id: 4, abbreviation: "BUF", name: "Bills", full_name: "Buffalo Bills", conference: "AFC", division: "AFC East" },
  PHI: { id: 26, abbreviation: "PHI", name: "Eagles", full_name: "Philadelphia Eagles", conference: "NFC", division: "NFC East" },
};

// Static conf/division map — NFL divisions never change
const TEAM_CONF_DIV = {
  ARI: ["NFC", "NFC West"],  ATL: ["NFC", "NFC South"], BAL: ["AFC", "AFC North"], BUF: ["AFC", "AFC East"],
  CAR: ["NFC", "NFC South"], CHI: ["NFC", "NFC North"], CIN: ["AFC", "AFC North"], CLE: ["AFC", "AFC North"],
  DAL: ["NFC", "NFC East"],  DEN: ["AFC", "AFC West"],  DET: ["NFC", "NFC North"], GB:  ["NFC", "NFC North"],
  HOU: ["AFC", "AFC South"], IND: ["AFC", "AFC South"], JAX: ["AFC", "AFC South"], KC:  ["AFC", "AFC West"],
  LAC: ["AFC", "AFC West"],  LAR: ["NFC", "NFC West"],  LV:  ["AFC", "AFC West"],  MIA: ["AFC", "AFC East"],
  MIN: ["NFC", "NFC North"], NE:  ["AFC", "AFC East"],  NO:  ["NFC", "NFC South"], NYG: ["NFC", "NFC East"],
  NYJ: ["AFC", "AFC East"],  PHI: ["NFC", "NFC East"],  PIT: ["AFC", "AFC North"], SF:  ["NFC", "NFC West"],
  SEA: ["NFC", "NFC West"],  TB:  ["NFC", "NFC South"], TEN: ["AFC", "AFC South"], WAS: ["NFC", "NFC East"],
};

async function fetchTeamInfo(teamAbbr) {
  try {
    const upper = teamAbbr.toUpperCase();
    const { data } = await axios.get(`${ESPN_BASE}/teams/${upper}`);
    const team = data.team;
    if (!team) {
      console.error(`NFL team ${upper} not found`);
      return null;
    }
    const [conference, division] = TEAM_CONF_DIV[upper] || ["", ""];
    return {
      id: team.id,
      abbreviation: team.abbreviation,
      name: team.name,
      full_name: team.displayName,
      conference,
      division,
      // Carry record from team endpoint for fetchSeasonRecord to use
      _record: team.record,
    };
  } catch (error) {
    console.error(`Failed to fetch NFL team: ${error.message}`);
    return null;
  }
}

function parseRecordFromTeam(teamRecord, season) {
  const total = (teamRecord?.items || []).find((i) => i.type === "total");
  const stats = (total?.stats || []).reduce((acc, s) => { acc[s.name] = s.value; return acc; }, {});
  const wins = stats.wins || 0;
  const losses = stats.losses || 0;
  const winPct = wins + losses > 0 ? (wins / (wins + losses)).toFixed(3) : ".000";
  return { wins, losses, season, winPct };
}

async function fetchSeasonRecord(team) {
  // If the current season hasn't started yet, fetch last year's team data for the record
  const now = new Date();
  const currentYear = now.getFullYear();
  // NFL season runs Sep–Feb; if before Sep use previous year's season
  const nflSeason = now.getMonth() < 8 ? currentYear - 1 : currentYear;

  if (nflSeason === currentYear && team._record) {
    return parseRecordFromTeam(team._record, currentYear);
  }

  try {
    const { data } = await axios.get(`${ESPN_BASE}/teams/${team.abbreviation}?season=${nflSeason}`);
    return parseRecordFromTeam(data.team?.record, nflSeason);
  } catch (error) {
    console.error(`Failed to fetch NFL standings: ${error.message}`);
    return { wins: 0, losses: 0, season: nflSeason, winPct: ".000" };
  }
}

async function fetchRecentGames(teamAbbr, count = 5) {
  try {
    const upper = teamAbbr.toUpperCase();
    const now = new Date();
    // NFL season runs Sep–Feb; if before Sep use previous year's season
    const season = now.getMonth() < 8 ? now.getFullYear() - 1 : now.getFullYear();
    // Fetch regular season and postseason separately; exclude preseason (type 1)
    const [regData, postData] = await Promise.all([
      axios.get(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${upper}/schedule?season=${season}&seasontype=2`),
      axios.get(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${upper}/schedule?season=${season}&seasontype=3`),
    ]);

    const events = [
      ...(regData.data.events || []).map((e) => ({ ...e, seasonType: 2 })),
      ...(postData.data.events || []).map((e) => ({ ...e, seasonType: 3 })),
    ];

    const games = [];
    for (const event of events) {
      const comp = event.competitions?.[0];
      if (!comp) continue;
      if (comp.status?.type?.name !== "STATUS_FINAL") continue;
      const competitors = comp.competitors || [];
      const teamComp = competitors.find((c) => c.team?.abbreviation?.toUpperCase() === upper);
      const oppComp = competitors.find((c) => c.team?.abbreviation?.toUpperCase() !== upper);
      if (!teamComp || !oppComp) continue;
      const teamScore = parseFloat(teamComp.score?.value ?? teamComp.score ?? 0);
      const oppScore = parseFloat(oppComp.score?.value ?? oppComp.score ?? 0);
      games.push({
        date: event.date?.split("T")[0] || comp.date?.split("T")[0],
        gameType: event.seasonType,
        teamScore,
        oppScore,
        oppAbbr: oppComp.team.abbreviation,
        isHome: teamComp.homeAway === "home",
        won: teamScore > oppScore,
      });
    }

    return games
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, count);
  } catch (error) {
    console.error(`Failed to fetch NFL schedule: ${error.message}`);
    return [];
  }
}

function getDemoData(teamAbbr) {
  const abbr = teamAbbr.toUpperCase();
  const team = DEMO_TEAMS[abbr] || {
    id: 16, abbreviation: abbr, name: abbr,
    full_name: `${abbr} Team`, conference: "AFC", division: "AFC West",
  };
  const opponents = ["KC", "SF", "DAL", "BUF", "PHI"].filter((t) => t !== abbr);
  const games = opponents.slice(0, 5).map((opp, i) => {
    const won = Math.random() > 0.4;
    const teamScore = won ? 21 + Math.floor(Math.random() * 20) : 10 + Math.floor(Math.random() * 10);
    const oppScore = won ? 10 + Math.floor(Math.random() * 10) : 21 + Math.floor(Math.random() * 20);
    const d = new Date();
    d.setDate(d.getDate() - (i * 7 + 1));
    return {
      date: d.toISOString().split("T")[0],
      teamScore,
      oppScore,
      oppAbbr: opp,
      isHome: i % 2 === 0,
      won,
    };
  });
  return {
    team,
    recentGames: games,
    record: { wins: 9, losses: 3, season: new Date().getFullYear(), winPct: ".750" },
  };
}

async function fetchData(teamAbbr) {
  const team = await fetchTeamInfo(teamAbbr);
  if (!team) {
    return null;
  }

  const [record, recentGames] = await Promise.all([
    fetchSeasonRecord(team),
    fetchRecentGames(teamAbbr, 5),
  ]);

  return { team, recentGames, record };
}

module.exports = {
  fetchData,
  getDemoData,
  TEAM_EMOJI,
  TEAM_IDS,
};
