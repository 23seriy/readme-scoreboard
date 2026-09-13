const { get: httpGet } = require("../http");
const { buildGameLog, dateOffset, opponentPool, recordFromGames } = require("../demo");

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
      const { data } = await httpGet(url);
      const allGames = this.parseGameResponse(data);
      const season = this.getSeasonYear();

      // Regular season only for W-L record (exclude spring training "S" and playoffs)
      let wins = 0, losses = 0;
      const regularFinals = allGames.filter(
        (g) => g.status === "Final" && g.gameType === "R"
      );
      for (const game of regularFinals) {
        const isHome = game.home_team.id === team.id;
        const teamScore = isHome ? game.home_team_score : game.visitor_team_score;
        const oppScore = isHome ? game.visitor_team_score : game.home_team_score;
        if (teamScore > oppScore) wins++;
        else losses++;
      }

      const record = { wins, losses, season };
      // Recent games: regular season + playoffs, no spring training
      const recentGames = allGames
        .filter((g) => g.status === "Final" && g.gameType !== "S")
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      return { team, record, recentGames };
    } catch (error) {
      console.error(`Failed to fetch data: ${error.message}`);
      return null;
    }
  }

  // Deterministic sample board. The record is counted from the same game log
  // that is displayed, so the two can never disagree.
  getDemoData(teamAbbr) {
    const abbr = teamAbbr.toUpperCase();
    const team = this.DEMO_TEAMS[abbr];
    if (!team) return null;

    const ownTeams = Object.keys(this.DEMO_TEAMS).filter((key) => key !== abbr);
    // League tables are tiny (one entry per gallery example), so pad with a
    // per-sport pool. Without this, a 70-game log repeats opponents and the
    // "next" fixture would duplicate a game already shown.
    const extras = opponentPool([this.DEMO_POOL_KEY], []);
    const opponents = [...new Set([...extras, ...ownTeams])].filter((key) => key !== abbr);
    const log = buildGameLog({
      seed: `${this.constructor.name}-${abbr}`,
      opponents,
      wins: 42,
      losses: 28,
      scoreRange: { team: [1, 9], opponent: [0, 9] },
    });
    log.reverse();
    const recentGames = log.slice(0, 5);
    const record = recordFromGames(log, this.getSeasonYear());

    // Keep the upcoming fixture distinct from anything just played.
    const playedRecently = new Set(recentGames.map((g) => g.oppAbbr));
    const nextOpponent = opponents.find((opp) => !playedRecently.has(opp)) || opponents[0];

    return {
      team,
      record,
      standing: { position: 4, label: team.division || team.conference || "" },
      form: recentGames.map((g) => (g.won ? "W" : "L")),
      nextGame: {
        date: dateOffset(2),
        opponent: nextOpponent,
        isHome: true,
      },
      recentGames: recentGames.map((g) => ({
        date: g.date,
        home_team: {
          id: g.isHome ? team.id : 0,
          abbreviation: g.isHome ? team.abbreviation : g.oppAbbr,
        },
        visitor_team: {
          id: g.isHome ? 0 : team.id,
          abbreviation: g.isHome ? g.oppAbbr : team.abbreviation,
        },
        home_team_score: g.isHome ? g.teamScore : g.oppScore,
        visitor_team_score: g.isHome ? g.oppScore : g.teamScore,
        status: "Final",
        isHome: g.isHome,
        teamScore: g.teamScore,
        oppScore: g.oppScore,
        oppAbbr: g.oppAbbr,
        won: g.won,
        drew: g.drew,
      })),
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
      const { data } = await httpGet(url);

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
      const { data } = await httpGet(url);

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
