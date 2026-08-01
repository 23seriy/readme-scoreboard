const axios = require("axios");
const BaseFreeApiAdapter = require("./base-free-api");

const MLB_BASE = "https://statsapi.mlb.com/api/v1";

const TEAM_EMOJI = {
  ATH: "🐘", AZ: "🐍", BAL: "🐦", BOS: "🧦", CHC: "🐻",
  CWS: "⚫", CIN: "🔴", CLE: "⚔️", COL: "🏔️", DET: "🐯",
  HOU: "🚀", KC: "👑", LAA: "😇", LAD: "💙", MIA: "🐬",
  MIL: "🍺", MIN: "🎯", NYM: "🍎", NYY: "⚾", PHI: "🔔",
  PIT: "🏴", SD: "🤎", SF: "🧡", SEA: "🧭", STL: "🐦",
  TB: "😈", TEX: "🤠", TOR: "🐦", WSH: "🇺🇸",
};

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

class MlbAdapter extends BaseFreeApiAdapter {
  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;

  getSeasonYear() {
    return new Date().getFullYear();
  }

  async fetchTeam(abbr) {
    try {
      const { data } = await axios.get(`${MLB_BASE}/teams`, {
        params: { sportId: 1 },
      });
      const team = data.teams.find(
        (t) => t.abbreviation.toUpperCase() === abbr.toUpperCase()
      );
      if (!team) {
        console.error(`MLB team ${abbr} not found`);
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

  getGamesUrl(teamId, fromDate, toDate) {
    const from = fromDate.toISOString().split("T")[0];
    const to = toDate.toISOString().split("T")[0];
    return `${MLB_BASE}/schedule?sportId=1&teamId=${teamId}&startDate=${from}&endDate=${to}`;
  }

  abbrById(id) {
    return Object.keys(TEAM_IDS).find((k) => TEAM_IDS[k] === id) || "???";
  }

  parseGameResponse(data) {
    if (!data.dates) return [];
    const games = [];
    for (const dateEntry of data.dates) {
      for (const game of dateEntry.games) {
        const homeTeam = game.teams?.home?.team;
        const awayTeam = game.teams?.away?.team;
        if (!homeTeam?.id || !awayTeam?.id) continue;
        const homeScore = game.teams.home.score ?? 0;
        const awayScore = game.teams.away.score ?? 0;
        const isFinal = game.status?.abstractGameState === "Final";
        // Exclude postponed/cancelled games recorded as Final with 0-0 score
        const isRealFinal = isFinal && (homeScore > 0 || awayScore > 0);
        games.push({
          date: game.gameDateTime || game.officialDate,
          home_team: {
            id: homeTeam.id,
            abbreviation: homeTeam.abbreviation || this.abbrById(homeTeam.id),
          },
          visitor_team: {
            id: awayTeam.id,
            abbreviation: awayTeam.abbreviation || this.abbrById(awayTeam.id),
          },
          home_team_score: homeScore,
          visitor_team_score: awayScore,
          status: isRealFinal ? "Final" : "Other",
        });
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
      league: LEAGUE_NAMES[team.league.id] || team.league.name,
      division: DIVISION_NAMES[team.division.id] || team.division.name,
    };
  }
}

module.exports = new MlbAdapter();
