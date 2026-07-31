const axios = require("axios");

const MLB_BASE = "https://statsapi.mlb.com/api/v1";

const TEAM_EMOJI = {
  ATH: "🐘", AZ: "🐍", BAL: "🐦", BOS: "🧦", CHC: "🐻",
  CWS: "⚫", CIN: "🔴", CLE: "⚔️", COL: "🏔️", DET: "🐯",
  HOU: "🚀", KC: "👑", LAA: "😇", LAD: "💙", MIA: "🐬",
  MIL: "🍺", MIN: "🎯", NYM: "🍎", NYY: "⚾", PHI: "🔔",
  PIT: "🏴", SD: "🤎", SF: "🧡", SEA: "🧭", STL: "🐦",
  TB: "😈", TEX: "🤠", TOR: "🐦", WSH: "🇺🇸",
};

// MLB team IDs for logo URLs
const TEAM_IDS = {
  ATH: 133, AZ: 109, BAL: 110, BOS: 111, CHC: 112,
  CWS: 145, CIN: 113, CLE: 114, COL: 115, DET: 116,
  HOU: 117, KC: 118, LAA: 108, LAD: 119, MIA: 146,
  MIL: 158, MIN: 142, NYM: 121, NYY: 147, PHI: 143,
  PIT: 134, SD: 135, SF: 137, SEA: 136, STL: 138,
  TB: 139, TEX: 140, TOR: 141, WSH: 120,
};

const DIVISION_NAMES = {
  200: "AL West", 201: "AL East", 202: "AL Central",
  203: "NL West", 204: "NL East", 205: "NL Central",
};

const LEAGUE_NAMES = {
  103: "American League",
  104: "National League",
};

const DEMO_TEAMS = {
  NYY: { id: 147, abbreviation: "NYY", name: "Yankees", full_name: "New York Yankees", league: "American League", division: "AL East" },
  LAD: { id: 119, abbreviation: "LAD", name: "Dodgers", full_name: "Los Angeles Dodgers", league: "National League", division: "NL West" },
  BOS: { id: 111, abbreviation: "BOS", name: "Red Sox", full_name: "Boston Red Sox", league: "American League", division: "AL East" },
  CHC: { id: 112, abbreviation: "CHC", name: "Cubs", full_name: "Chicago Cubs", league: "National League", division: "NL Central" },
  HOU: { id: 117, abbreviation: "HOU", name: "Astros", full_name: "Houston Astros", league: "American League", division: "AL West" },
};

async function fetchTeamInfo(teamAbbr) {
  try {
    const { data } = await axios.get(`${MLB_BASE}/teams`, {
      params: { sportId: 1 },
    });
    const team = data.teams.find(
      (t) => t.abbreviation.toUpperCase() === teamAbbr.toUpperCase()
    );
    if (!team) {
      console.error(`MLB team ${teamAbbr} not found`);
      return null;
    }
    const leagueName = LEAGUE_NAMES[team.league.id] || team.league.name;
    const divisionName = DIVISION_NAMES[team.division.id] || team.division.name;
    return {
      id: team.id,
      abbreviation: team.abbreviation,
      name: team.teamName,
      full_name: team.name,
      league: leagueName,
      division: divisionName,
    };
  } catch (error) {
    console.error(`Failed to fetch MLB team: ${error.message}`);
    return null;
  }
}

async function fetchSeasonRecord(teamId) {
  try {
    const currentYear = new Date().getFullYear();
    // Try current year first, fall back to previous if no data
    const { data } = await axios.get(`${MLB_BASE}/standings`, {
      params: {
        leagueId: "103,104",
        season: currentYear,
        standingsTypes: "regularSeason",
      },
    });

    for (const division of data.records) {
      const teamRecord = division.teamRecords.find(
        (t) => t.team.id === teamId
      );
      if (teamRecord) {
        return {
          wins: teamRecord.wins,
          losses: teamRecord.losses,
          season: currentYear,
          winPct: teamRecord.winningPercentage,
        };
      }
    }

    // Try previous year if current year has no data
    const { data: prevData } = await axios.get(`${MLB_BASE}/standings`, {
      params: {
        leagueId: "103,104",
        season: currentYear - 1,
        standingsTypes: "regularSeason",
      },
    });

    for (const division of prevData.records) {
      const teamRecord = division.teamRecords.find(
        (t) => t.team.id === teamId
      );
      if (teamRecord) {
        return {
          wins: teamRecord.wins,
          losses: teamRecord.losses,
          season: currentYear - 1,
          winPct: teamRecord.winningPercentage,
        };
      }
    }

    return { wins: 0, losses: 0, season: currentYear, winPct: ".000" };
  } catch (error) {
    console.error(`Failed to fetch MLB standings: ${error.message}`);
    return { wins: 0, losses: 0, season: new Date().getFullYear(), winPct: ".000" };
  }
}

async function fetchRecentGames(teamId, count = 5) {
  try {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 30);

    const { data } = await axios.get(`${MLB_BASE}/schedule`, {
      params: {
        sportId: 1,
        teamId,
        startDate: pastDate.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      },
    });

    const games = [];
    for (const date of (data.dates || [])) {
      for (const game of date.games) {
        if (game.status.abstractGameState === "Final") {
          const isHome = game.teams.home.team.id === teamId;
          const teamData = isHome ? game.teams.home : game.teams.away;
          const oppData = isHome ? game.teams.away : game.teams.home;
          games.push({
            date: game.officialDate,
            teamScore: teamData.score,
            oppScore: oppData.score,
            opponent: oppData.team.name,
            oppAbbr: "", // Will be resolved below
            oppId: oppData.team.id,
            isHome,
            won: teamData.isWinner,
          });
        }
      }
    }

    // Resolve opponent abbreviations
    if (games.length > 0) {
      const { data: teamsData } = await axios.get(`${MLB_BASE}/teams`, {
        params: { sportId: 1 },
      });
      const teamsMap = {};
      for (const t of teamsData.teams) {
        teamsMap[t.id] = t.abbreviation;
      }
      for (const game of games) {
        game.oppAbbr = teamsMap[game.oppId] || "???";
      }
    }

    return games
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, count);
  } catch (error) {
    console.error(`Failed to fetch MLB schedule: ${error.message}`);
    return [];
  }
}

function getDemoData(teamAbbr) {
  const abbr = teamAbbr.toUpperCase();
  const team = DEMO_TEAMS[abbr] || {
    id: 147, abbreviation: abbr, name: abbr,
    full_name: `${abbr} Team`, league: "American League", division: "AL East",
  };
  const opponents = ["BOS", "NYM", "PHI", "ATL", "TOR"].filter((t) => t !== abbr);
  const games = opponents.slice(0, 5).map((opp, i) => {
    const won = Math.random() > 0.4;
    const teamScore = won ? 4 + Math.floor(Math.random() * 6) : 1 + Math.floor(Math.random() * 3);
    const oppScore = won ? 1 + Math.floor(Math.random() * 3) : 4 + Math.floor(Math.random() * 6);
    const d = new Date();
    d.setDate(d.getDate() - (i + 1));
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
    record: { wins: 55, losses: 40, season: new Date().getFullYear(), winPct: ".579" },
  };
}

async function fetchData(teamAbbr) {
  const team = await fetchTeamInfo(teamAbbr);
  if (!team) {
    return null;
  }

  const [record, recentGames] = await Promise.all([
    fetchSeasonRecord(team.id),
    fetchRecentGames(team.id, 5),
  ]);

  return { team, recentGames, record };
}

module.exports = {
  fetchData,
  getDemoData,
  TEAM_EMOJI,
  TEAM_IDS,
};
