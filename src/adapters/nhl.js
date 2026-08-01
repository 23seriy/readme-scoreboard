const axios = require("axios");
const BaseFreeApiAdapter = require("./base-free-api");

const NHL_BASE = "https://statsapi.web.nhl.com/api/v1";

class NHLAdapter extends BaseFreeApiAdapter {
  TEAM_EMOJI = {
    ANA: "🦆", ARI: "🐺", BOS: "🐻", BUF: "🦬", CAR: "🐱",
    CBJ: "💣", CGY: "🔥", CHI: "🐂", COL: "🏔️", DAL: "⭐",
    DET: "🐙", EDM: "🧡", FLA: "🐆", LAK: "👑", MIN: "🐺",
    MTL: "🔴", NJ: "😈", NSH: "⚡", NYI: "🗽", NYR: "🦢",
    OTT: "🦴", PHI: "🔔", PIT: "🐧", SJ: "🦈", SEA: "⚓",
    STL: "🦁", TB: "⚡", TOR: "🍁", VAN: "🐋", VGK: "🏆",
    WPG: "✈️", WSH: "🧙",
  };

  TEAM_IDS = {
    ANA: 24, ARI: 53, BOS: 6, BUF: 7, CAR: 12, CBJ: 29, CGY: 20,
    CHI: 16, COL: 21, DAL: 25, DET: 17, EDM: 22, FLA: 13, LAK: 26,
    MIN: 30, MTL: 8, NJ: 1, NSH: 18, NYI: 2, NYR: 3, OTT: 9, PHI: 4,
    PIT: 5, SJ: 28, SEA: 55, STL: 19, TB: 14, TOR: 10, VAN: 23,
    VGK: 54, WPG: 52, WSH: 15,
  };

  DEMO_TEAMS = {
    NYR: {
      id: 3,
      abbreviation: "NYR",
      name: "Rangers",
      full_name: "New York Rangers",
      conference: "Eastern",
      division: "Metropolitan",
    },
    LAK: {
      id: 26,
      abbreviation: "LAK",
      name: "Kings",
      full_name: "Los Angeles Kings",
      conference: "Western",
      division: "Pacific",
    },
    TOR: {
      id: 10,
      abbreviation: "TOR",
      name: "Maple Leafs",
      full_name: "Toronto Maple Leafs",
      conference: "Eastern",
      division: "Atlantic",
    },
    DET: {
      id: 17,
      abbreviation: "DET",
      name: "Red Wings",
      full_name: "Detroit Red Wings",
      conference: "Eastern",
      division: "Atlantic",
    },
    BOS: {
      id: 6,
      abbreviation: "BOS",
      name: "Bruins",
      full_name: "Boston Bruins",
      conference: "Eastern",
      division: "Atlantic",
    },
    EDM: {
      id: 22,
      abbreviation: "EDM",
      name: "Oilers",
      full_name: "Edmonton Oilers",
      conference: "Western",
      division: "Pacific",
    },
  };

  async fetchTeam(abbr) {
    try {
      const { data } = await axios.get(`${NHL_BASE}/teams`);
      const team = data.teams.find(
        (t) => t.abbreviation.toUpperCase() === abbr.toUpperCase()
      );
      if (!team) return null;

      return {
        id: team.id,
        abbreviation: team.abbreviation,
        name: team.teamName,
        full_name: team.name,
        conference: team.conference.name,
        division: team.division.name,
      };
    } catch (error) {
      console.error(`Failed to fetch NHL team: ${error.message}`);
      return null;
    }
  }

  getGamesUrl(teamId, fromDate, toDate) {
    const from = fromDate.toISOString().split("T")[0];
    const to = toDate.toISOString().split("T")[0];
    return `${NHL_BASE}/schedule?teamId=${teamId}&startDate=${from}&endDate=${to}`;
  }

  parseGameResponse(data) {
    if (!data.dates || !Array.isArray(data.dates)) return [];

    const games = [];
    for (const dateEntry of data.dates) {
      if (dateEntry.games && Array.isArray(dateEntry.games)) {
        for (const game of dateEntry.games) {
          games.push({
            date: game.gameDateTime,
            home_team: {
              id: game.teams.home.team.id,
              abbreviation: game.teams.home.team.abbreviation,
            },
            visitor_team: {
              id: game.teams.away.team.id,
              abbreviation: game.teams.away.team.abbreviation,
            },
            home_team_score: game.teams.home.score || 0,
            visitor_team_score: game.teams.away.score || 0,
            status: game.status.abstractGameState === "Final" ? "Final" : "InProgress",
          });
        }
      }
    }
    return games;
  }

  parseTeamResponse(data) {
    if (!data.teams || data.teams.length === 0) return null;

    const team = data.teams[0];
    return {
      id: team.id,
      abbreviation: team.abbreviation,
      name: team.teamName,
      full_name: team.name,
      conference: team.conference.name,
      division: team.division.name,
    };
  }
}

module.exports = NHLAdapter;
