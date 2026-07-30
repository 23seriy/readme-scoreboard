const axios = require("axios");

const BDL_BASE = "https://api.balldontlie.io/v1";

const TEAM_EMOJI = {
  ATL: "🦅", BOS: "☘️", BKN: "🏙️", CHA: "🐝", CHI: "🐂",
  CLE: "⚔️", DAL: "🐴", DEN: "⛏️", DET: "🏎️", GSW: "🌉",
  HOU: "🚀", IND: "🏎️", LAC: "⛵", LAL: "👑", MEM: "🐻",
  MIA: "🔥", MIL: "🦌", MIN: "🐺", NOP: "⚜️", NYK: "🗽",
  OKC: "⚡", ORL: "✨", PHI: "🔔", PHX: "☀️", POR: "🌹",
  SAC: "👑", SAS: "🤠", TOR: "🦖", UTA: "🎵", WAS: "🧙",
};

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

const DEMO_TEAMS = {
  LAL: { id: 14, abbreviation: "LAL", city: "Los Angeles", name: "Lakers", full_name: "Los Angeles Lakers", conference: "West", division: "Pacific" },
  BOS: { id: 2, abbreviation: "BOS", city: "Boston", name: "Celtics", full_name: "Boston Celtics", conference: "East", division: "Atlantic" },
  GSW: { id: 10, abbreviation: "GSW", city: "Golden State", name: "Warriors", full_name: "Golden State Warriors", conference: "West", division: "Pacific" },
  NYK: { id: 20, abbreviation: "NYK", city: "New York", name: "Knicks", full_name: "New York Knicks", conference: "East", division: "Atlantic" },
  CHI: { id: 5, abbreviation: "CHI", city: "Chicago", name: "Bulls", full_name: "Chicago Bulls", conference: "East", division: "Central" },
  MIA: { id: 16, abbreviation: "MIA", city: "Miami", name: "Heat", full_name: "Miami Heat", conference: "East", division: "Southeast" },
  DAL: { id: 7, abbreviation: "DAL", city: "Dallas", name: "Mavericks", full_name: "Dallas Mavericks", conference: "West", division: "Southwest" },
  DEN: { id: 8, abbreviation: "DEN", city: "Denver", name: "Nuggets", full_name: "Denver Nuggets", conference: "West", division: "Northwest" },
  PHX: { id: 25, abbreviation: "PHX", city: "Phoenix", name: "Suns", full_name: "Phoenix Suns", conference: "West", division: "Pacific" },
  OKC: { id: 21, abbreviation: "OKC", city: "Oklahoma City", name: "Thunder", full_name: "Oklahoma City Thunder", conference: "West", division: "Northwest" },
};

async function fetchTeam(teamAbbr, apiKey) {
  try {
    const { data } = await axios.get(`${BDL_BASE}/teams`, {
      headers: { Authorization: apiKey },
    });
    const team = data.data.find(
      (t) => t.abbreviation.toUpperCase() === teamAbbr.toUpperCase()
    );
    if (!team) {
      console.error(`Team ${teamAbbr} not found`);
      return null;
    }
    return team;
  } catch (error) {
    console.error(`Failed to fetch team: ${error.message}`);
    return null;
  }
}

async function fetchRecentGames(teamId, apiKey, count = 5) {
  try {
    const today = new Date();
    // Look back 180 days to cover offseason gaps (no NBA games Jul-Sep)
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 180);

    const { data } = await axios.get(`${BDL_BASE}/games`, {
      headers: { Authorization: apiKey },
      params: {
        "team_ids[]": teamId,
        start_date: pastDate.toISOString().split("T")[0],
        end_date: today.toISOString().split("T")[0],
        per_page: 50,
      },
    });

    return data.data
      .filter((g) => g.status === "Final")
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, count);
  } catch (error) {
    console.error(`Failed to fetch games: ${error.message}`);
    return [];
  }
}

async function fetchSeasonRecord(teamId, apiKey) {
  try {
    const currentYear = new Date().getFullYear();
    const season =
      new Date().getMonth() >= 9 ? currentYear : currentYear - 1;

    const { data } = await axios.get(`${BDL_BASE}/games`, {
      headers: { Authorization: apiKey },
      params: {
        "team_ids[]": teamId,
        seasons: [season],
        per_page: 100,
      },
    });

    const finalGames = data.data.filter((g) => g.status === "Final");
    let wins = 0;
    let losses = 0;

    for (const game of finalGames) {
      const isHome = game.home_team.id === teamId;
      const teamScore = isHome
        ? game.home_team_score
        : game.visitor_team_score;
      const oppScore = isHome
        ? game.visitor_team_score
        : game.home_team_score;

      if (teamScore > oppScore) {
        wins++;
      } else {
        losses++;
      }
    }

    return { wins, losses, season };
  } catch (error) {
    console.error(`Failed to fetch season record: ${error.message}`);
    return { wins: 0, losses: 0, season: 0 };
  }
}

function getDemoData(teamAbbr) {
  const abbr = teamAbbr.toUpperCase();
  const team = DEMO_TEAMS[abbr] || {
    id: 1, abbreviation: abbr, city: abbr, name: abbr,
    full_name: `${abbr} Team`, conference: "West", division: "Pacific",
  };
  const opponents = ["GSW", "DEN", "PHX", "SAC", "DAL"].filter((t) => t !== abbr);
  const games = opponents.slice(0, 5).map((opp, i) => {
    const won = Math.random() > 0.4;
    const teamScore = won ? 105 + Math.floor(Math.random() * 20) : 95 + Math.floor(Math.random() * 10);
    const oppScore = won ? 95 + Math.floor(Math.random() * 10) : 105 + Math.floor(Math.random() * 20);
    const d = new Date();
    d.setDate(d.getDate() - (i * 3 + 1));
    return {
      date: d.toISOString(),
      status: "Final",
      home_team: i % 2 === 0 ? team : { id: 99, abbreviation: opp },
      visitor_team: i % 2 === 0 ? { id: 99, abbreviation: opp } : team,
      home_team_score: i % 2 === 0 ? teamScore : oppScore,
      visitor_team_score: i % 2 === 0 ? oppScore : teamScore,
    };
  });
  return {
    team,
    recentGames: games,
    record: { wins: 48, losses: 22, season: new Date().getFullYear() - 1 },
  };
}

async function fetchData(teamAbbr, apiKey) {
  const team = await fetchTeam(teamAbbr, apiKey);
  if (!team) {
    return null;
  }

  // Sequential calls with delay to respect free-tier rate limit (5 req/min)
  const recentGames = await fetchRecentGames(team.id, apiKey, 5);
  await new Promise((r) => setTimeout(r, 15000));
  const record = await fetchSeasonRecord(team.id, apiKey);

  return { team, recentGames, record };
}

module.exports = {
  fetchData,
  getDemoData,
  TEAM_EMOJI,
  TEAM_IDS,
};
