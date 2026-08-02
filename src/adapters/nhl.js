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
    // Name is populated from the schedule response in fetchData; return a stub here.
    return { id, abbreviation: upper, name: upper, full_name: upper, conference: "", division: "" };
  }

  async fetchConferenceDivision(abbr) {
    try {
      // standings/now is unavailable off-season; use last regular-season date
      const seasonCode = this.getSeasonCode(this.getSeasonYear() - 1);
      const { data: seasonData } = await axios.get(`${NHL_BASE}/standings-season`);
      const seasons = seasonData.seasons || [];
      const prev = seasons.slice().reverse().find((s) => s.id === Number(seasonCode));
      const endDate = prev?.standingsEnd || "2025-04-17";
      const { data } = await axios.get(`${NHL_BASE}/standings/${endDate}`);
      const entry = (data.standings || []).find(
        (s) => s.teamAbbrev?.default?.toUpperCase() === abbr.toUpperCase()
      );
      return {
        conference: entry?.conferenceName || "",
        division: entry?.divisionName || "",
      };
    } catch {
      return { conference: "", division: "" };
    }
  }

  getSeasonCode(year) {
    return `${year}${year + 1}`;
  }

  getGamesUrl(teamId, _fromDate, _toDate, season = "now") {
    const abbr = Object.keys(this.TEAM_IDS).find((k) => this.TEAM_IDS[k] === Number(teamId));
    if (!abbr) throw new Error(`Unknown NHL team ID: ${teamId}`);
    return `${NHL_BASE}/club-schedule-season/${abbr.toLowerCase()}/${season}`;
  }

  async fetchData(teamAbbr) {
    try {
      const [team, confDiv] = await Promise.all([
        this.fetchTeamByAbbr(teamAbbr),
        this.fetchConferenceDivision(teamAbbr),
      ]);
      if (!team) return null;
      team.conference = confDiv.conference;
      team.division = confDiv.division;

      // Try current season first; fall back to previous season during off-season
      let allGames = [];
      let usedSeasonYear = this.getSeasonYear();
      for (const season of ["now", this.getSeasonCode(this.getSeasonYear() - 1)]) {
        const url = this.getGamesUrl(team.id, null, null, season);
        const { data } = await axios.get(url);
        allGames = this.parseGameResponse(data);
        if (allGames.some((g) => g.status === "Final")) {
          if (season !== "now") usedSeasonYear = this.getSeasonYear() - 1;
          // Extract team name from schedule now that we have games
          const sample = (data.games || []).find(
            (g) => g.homeTeam?.abbrev === team.abbreviation || g.awayTeam?.abbrev === team.abbreviation
          );
          if (sample) {
            const isHome = sample.homeTeam.abbrev === team.abbreviation;
            const td = isHome ? sample.homeTeam : sample.awayTeam;
            team.name = td.commonName?.default || team.abbreviation;
            team.full_name = td.placeName?.default
              ? `${td.placeName.default} ${team.name}`
              : team.name;
          }
          break;
        }
      }

      // Regular season (gameType 2) only for the W-L record
      const regularFinals = allGames.filter((g) => g.status === "Final" && g.gameType === 2);
      let wins = 0, losses = 0;
      for (const game of regularFinals) {
        const isHome = game.home_team.id === team.id;
        const teamScore = isHome ? game.home_team_score : game.visitor_team_score;
        const oppScore = isHome ? game.visitor_team_score : game.home_team_score;
        if (teamScore > oppScore) wins++;
        else losses++;
      }

      const record = { wins, losses, season: usedSeasonYear };
      // Recent games: regular season + playoffs (gameType 2 or 3), not pre-season
      const recentGames = allGames
        .filter((g) => g.status === "Final" && g.gameType !== 1)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      return { team, record, recentGames };
    } catch (error) {
      console.error(`Failed to fetch NHL data: ${error.message}`);
      return null;
    }
  }

  parseGameResponse(data) {
    const games = data.games || [];
    return games.map((game) => ({
      date: game.startTimeUTC,
      gameType: game.gameType,
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
