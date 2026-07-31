const axios = require("axios");

const ESPN_BASE = "https://site.api.espn.com/v2/site/en/sports/football/nfl";

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
    const { data } = await axios.get(`${ESPN_BASE}/teams`);
    const team = data.teams.find(
      (t) => t.abbreviation.toUpperCase() === teamAbbr.toUpperCase()
    );
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
    const { data } = await axios.get(`${ESPN_BASE}/teams/${teamAbbr.toUpperCase()}/schedule`);
    const games = [];

    for (const game of (data.schedule || []).slice(-count * 2)) {
      if (game.status.type.name === "STATUS_FINAL") {
        const isHome = game.home.team.abbreviation.toUpperCase() === teamAbbr.toUpperCase();
        const teamData = isHome ? game.home : game.away;
        const oppData = isHome ? game.away : game.home;

        games.push({
          date: game.date.split("T")[0],
          teamScore: teamData.score,
          oppScore: oppData.score,
          oppAbbr: oppData.team.abbreviation,
          isHome,
          won: teamData.score > oppData.score,
        });
      }
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
