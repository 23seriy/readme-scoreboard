const axios = require("axios");
const BaseFreeApiAdapter = require("./base-free-api");

const NHL_BASE = "https://api-web.nhle.com/v1";

class NHLAdapter extends BaseFreeApiAdapter {
  TEAM_EMOJI = {
    ANA: "🦆", ARI: "🐺", BOS: "🐻", BUF: "🦬", CAR: "🐱",
    CBJ: "💣", CGY: "🔥", CHI: "🐂", COL: "🏔️", DAL: "⭐",
    DET: "🐙", EDM: "🧡", FLA: "🐆", LAK: "👑", MIN: "🌲",
    MTL: "🔴", NJ: "😈", NSH: "🎸", NYI: "🗽", NYR: "🦢",
    OTT: "🏛️", PHI: "🔔", PIT: "🐧", SJ: "🦈", SEA: "⚓",
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
    const upper = abbr.toUpperCase();
    const id = this.TEAM_IDS[upper];
    if (!id) return null;

    try {
      const { data } = await axios.get(`${NHL_BASE}/club-schedule-season/${upper.toLowerCase()}/now`);
      const games = data.games || [];
      const sample = games[0];

      let teamName = upper;
      let fullName = upper;
      let conference = "";
      let division = "";

      if (sample) {
        const isHome = sample.homeTeam.abbrev === upper;
        const teamData = isHome ? sample.homeTeam : sample.awayTeam;
        teamName = teamData.commonName?.default || upper;
        fullName = teamData.placeName?.default
          ? `${teamData.placeName.default} ${teamName}`
          : teamName;
      }

      return { id, abbreviation: upper, name: teamName, full_name: fullName, conference, division };
    } catch (error) {
      console.error(`Failed to fetch NHL team info: ${error.message}`);
      return { id, abbreviation: upper, name: upper, full_name: upper, conference: "", division: "" };
    }
  }

  getGamesUrl(teamId) {
    const abbr = Object.keys(this.TEAM_IDS).find((k) => this.TEAM_IDS[k] === Number(teamId));
    if (!abbr) throw new Error(`Unknown NHL team ID: ${teamId}`);
    return `${NHL_BASE}/club-schedule-season/${abbr.toLowerCase()}/now`;
  }

  parseGameResponse(data) {
    const games = data.games || [];
    return games.map((game) => ({
      date: game.startTimeUTC,
      home_team: {
        id: game.homeTeam.id,
        abbreviation: game.homeTeam.abbrev,
      },
      visitor_team: {
        id: game.awayTeam.id,
        abbreviation: game.awayTeam.abbrev,
      },
      home_team_score: game.homeTeam.score ?? 0,
      visitor_team_score: game.awayTeam.score ?? 0,
      status: game.gameState === "OFF" || game.gameState === "FINAL" ? "Final" : "InProgress",
    }));
  }

  parseTeamResponse(data) {
    const standings = data.standings || [];
    if (standings.length === 0) return null;
    const entry = standings[0];
    return {
      id: entry.teamId,
      abbreviation: entry.teamAbbrev.default,
      name: entry.teamCommonName.default,
      full_name: entry.teamName.default,
      conference: entry.conferenceName,
      division: entry.divisionName,
    };
  }
}

module.exports = new NHLAdapter();
