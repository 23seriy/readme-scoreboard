const axios = require("axios");

class BaseFreeApiAdapter {
  constructor() {
    if (this.constructor === BaseFreeApiAdapter) {
      throw new Error("BaseFreeApiAdapter is abstract and cannot be instantiated directly");
    }
  }

  async fetchData(teamAbbr) {
    try {
      const team = await this.fetchTeamByAbbr(teamAbbr);
      if (!team) return null;

      const fromDate = this.getSeasonStart();
      const url = this.getGamesUrl(team.id, fromDate, new Date());
      const { data } = await axios.get(url);
      const allGames = this.parseGameResponse(data);
      const season = this.getSeasonYear();

      let wins = 0, losses = 0;
      const finalGames = allGames.filter((g) => g.status === "Final");
      for (const game of finalGames) {
        const isHome = game.home_team.id === team.id;
        const teamScore = isHome ? game.home_team_score : game.visitor_team_score;
        const oppScore = isHome ? game.visitor_team_score : game.home_team_score;
        if (teamScore > oppScore) wins++;
        else losses++;
      }

      const record = { wins, losses, season };
      const recentGames = finalGames
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      return { team, record, recentGames };
    } catch (error) {
      console.error(`Failed to fetch data: ${error.message}`);
      return null;
    }
  }

  getDemoData(teamAbbr) {
    const team = this.DEMO_TEAMS[teamAbbr.toUpperCase()];
    if (!team) return null;

    return {
      team,
      record: { wins: 42, losses: 28, season: this.getSeasonYear() },
      recentGames: [
        {
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          home_team: { id: 1, abbreviation: "OPP" },
          visitor_team: { id: team.id, abbreviation: team.abbreviation },
          home_team_score: 3,
          visitor_team_score: 2,
          status: "Final",
        },
        {
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          home_team: { id: team.id, abbreviation: team.abbreviation },
          visitor_team: { id: 2, abbreviation: "OPP" },
          home_team_score: 4,
          visitor_team_score: 1,
          status: "Final",
        },
      ],
    };
  }

  getSeasonYear() {
    const now = new Date();
    const month = now.getMonth() + 1;
    return month >= 10 ? now.getFullYear() : now.getFullYear() - 1;
  }

  // Returns the date from which the current season's games should be counted.
  // MLB/NBA default to April 1; NFL overrides to September 1.
  getSeasonStart() {
    const year = new Date().getFullYear();
    return new Date(`${year}-04-01`);
  }

  async fetchTeamByAbbr(abbr) {
    try {
      const team = await this.fetchTeam(abbr);
      if (!team) {
        console.error(`Team ${abbr} not found`);
        return null;
      }
      return team;
    } catch (error) {
      console.error(`Failed to fetch team: ${error.message}`);
      return null;
    }
  }

  async fetchRecentGames(teamId, count = 5) {
    try {
      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 180);

      const url = this.getGamesUrl(teamId, pastDate, today);
      const { data } = await axios.get(url);

      const games = this.parseGameResponse(data);
      if (!games) return [];

      return games
        .filter((g) => g.status === "Final")
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, count);
    } catch (error) {
      console.error(`Failed to fetch games: ${error.message}`);
      return [];
    }
  }

  async fetchSeasonRecord(teamId) {
    try {
      const season = this.getSeasonYear();
      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 180);

      const url = this.getGamesUrl(teamId, pastDate, today);
      const { data } = await axios.get(url);

      const games = this.parseGameResponse(data);
      if (!games || games.length === 0) {
        return { wins: 0, losses: 0, season };
      }

      let wins = 0;
      let losses = 0;

      for (const game of games) {
        if (game.status !== "Final") continue;

        const isHome = game.home_team.id === teamId;
        const teamScore = isHome ? game.home_team_score : game.visitor_team_score;
        const oppScore = isHome ? game.visitor_team_score : game.home_team_score;

        if (teamScore > oppScore) {
          wins++;
        } else {
          losses++;
        }
      }

      return { wins, losses, season };
    } catch (error) {
      console.error(`Failed to fetch season record: ${error.message}`);
      return { wins: 0, losses: 0, season: this.getSeasonYear() };
    }
  }

  async fetchTeam(_abbr) {
    throw new Error("fetchTeam() must be implemented by subclass");
  }

  getGamesUrl(_teamId, _fromDate, _toDate) {
    throw new Error("getGamesUrl() must be implemented by subclass");
  }

  parseGameResponse(_data) {
    throw new Error("parseGameResponse() must be implemented by subclass");
  }

  parseTeamResponse(_data) {
    throw new Error("parseTeamResponse() must be implemented by subclass");
  }

  TEAM_EMOJI = {};
  TEAM_IDS = {};
  DEMO_TEAMS = {};
}

module.exports = BaseFreeApiAdapter;
