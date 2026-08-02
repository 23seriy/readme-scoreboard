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

async function fetchTeamInfo(teamAbbr) {
  try {
    const { data } = await axios.get(`${ESPN_BASE}/teams?limit=35`);
    const entries = data.sports?.[0]?.leagues?.[0]?.teams || data.teams || [];
    const team = entries
      .map((e) => e.team || e)
      .find((t) => t.abbreviation?.toUpperCase() === teamAbbr.toUpperCase());
    if (!team) {
      console.error(`NFL team ${teamAbbr} not found`);
      return null;
    }
    return {
      id: team.id,
      abbreviation: team.abbreviation,
      name: team.name,
      full_name: team.displayName,
      conference: team.conference?.name || "Unknown",
      division: team.division?.name || "Unknown",
    };
  } catch (error) {
    console.error(`Failed to fetch NFL team: ${error.message}`);
    return null;
  }
}

async function fetchSeasonRecord(teamId, teamAbbr) {
  try {
    const currentYear = new Date().getFullYear();
    const { data } = await axios.get(`${ESPN_BASE}/standings`);

    for (const group of (data.standings?.[0]?.groups || [])) {
      for (const entry of group.entries) {
        if (entry.team.abbreviation.toUpperCase() === teamAbbr.toUpperCase()) {
          const stats = entry.stats.reduce((acc, stat) => {
            acc[stat.name] = stat.value;
            return acc;
          }, {});
          return {
            wins: stats.wins || 0,
            losses: stats.losses || 0,
            season: currentYear,
            winPct: stats["winPercent"] || ".000",
          };
        }
      }
    }

    return { wins: 0, losses: 0, season: currentYear, winPct: ".000" };
  } catch (error) {
    console.error(`Failed to fetch NFL standings: ${error.message}`);
    return { wins: 0, losses: 0, season: new Date().getFullYear(), winPct: ".000" };
  }
}

async function fetchRecentGames(teamAbbr, count = 5) {
  try {
    const upper = teamAbbr.toUpperCase();
    const season = new Date().getFullYear();
    // Fetch regular season and postseason separately; exclude preseason (type 1)
    const [regData, postData] = await Promise.all([
      axios.get(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${upper}/schedule?season=${season}&seasontype=2`),
      axios.get(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${upper}/schedule?season=${season}&seasontype=3`),
    ]);

    const events = [
      ...(regData.data.events || []),
      ...(postData.data.events || []),
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
    fetchSeasonRecord(team.id, teamAbbr),
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
