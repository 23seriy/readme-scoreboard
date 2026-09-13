const { get: httpGet } = require("../http");
const { buildGameLog, dateOffset, opponentPool, recordFromGames } = require("../demo");

const ESPN_HOST = "https://site.api.espn.com/apis";

class BaseEspnLeagueAdapter {
  get baseUrl() {
    return `${ESPN_HOST}/site/v2/sports/${this.SPORT}/${this.LEAGUE_SLUG}`;
  }

  get baseUrlV2() {
    return `${ESPN_HOST}/v2/sports/${this.SPORT}/${this.LEAGUE_SLUG}`;
  }

  getSeasonYear() {
    return new Date().getFullYear();
  }

  getLogoUrl(abbr) {
    const id = this.TEAM_IDS[abbr.toUpperCase()];
    const sportPath = this.SPORT === "basketball" || this.SPORT === "football" || this.SPORT === "hockey" ? "ncaa" : this.SPORT;
    return id ? `https://a.espncdn.com/i/teamlogos/${sportPath}/500/${id}.png` : null;
  }

  // Deterministic sample board. The record is counted from the same game log
  // that is displayed, so the headline record always reconciles with the games.
  getDemoData(abbr, _playerName) {
    const upper = (abbr || "").toUpperCase();
    const team = this.DEMO_TEAMS[upper];
    if (!team) return null;

    const ownTeams = Object.keys(this.DEMO_TEAMS).filter((key) => key !== upper);
    // College/small leagues have tiny demo tables, so pad with a per-sport pool
    // to stop the "next" fixture duplicating a game already shown.
    const extras = opponentPool([this.LEAGUE_SLUG, this.SPORT], []);
    const opponents = [...new Set([...extras, ...ownTeams])].filter((key) => key !== upper);
    const log = buildGameLog({
      seed: `${this.constructor.name || this.LEAGUE_SLUG}-${upper}`,
      opponents: opponents.length ? opponents : ["OPP", "RIV", "UTD"],
      wins: 18,
      losses: 6,
      // CFB/NFL-style scores; harmless for other sports as a sample.
      scoreRange: { team: [14, 45], opponent: [7, 45] },
    });
    log.reverse();
    const recentGames = log.slice(0, 5);
    const record = recordFromGames(log, this.getSeasonYear());

    // Keep the upcoming fixture distinct from anything just played.
    const playedRecently = new Set(recentGames.map((g) => g.oppAbbr));
    const nextOpponent = opponents.find((opp) => !playedRecently.has(opp)) || opponents[0] || "OPP";

    return {
      team,
      record,
      recentGames: recentGames.map((g) => ({
        date: g.date,
        status: "Final",
        gameType: "R",
        home_team: { id: g.isHome ? team.id : 0, abbreviation: g.isHome ? team.abbreviation : g.oppAbbr },
        visitor_team: { id: g.isHome ? 0 : team.id, abbreviation: g.isHome ? g.oppAbbr : team.abbreviation },
        home_team_score: g.isHome ? g.teamScore : g.oppScore,
        visitor_team_score: g.isHome ? g.oppScore : g.teamScore,
        teamScore: g.teamScore,
        oppScore: g.oppScore,
        oppAbbr: g.oppAbbr,
        isHome: g.isHome,
        won: g.won,
        drew: g.drew,
      })),
      standing: { position: 2, label: team.conference },
      form: recentGames.map((g) => (g.won ? "W" : g.drew ? "D" : "L")),
      nextGame: {
        date: dateOffset(7),
        opponent: nextOpponent,
        isHome: true,
      },
    };
  }

  async fetchTeam(abbr) {
    try {
      const upper = abbr.toUpperCase();
      const configuredId = this.TEAM_IDS[upper];
      const { data } = await httpGet(configuredId ? `${this.baseUrl}/teams/${configuredId}` : `${this.baseUrl}/teams?limit=1000`);
      const candidates = configuredId ? [data.team] : [
        ...(data.teams || []),
        ...(data.sports || []).flatMap((sport) => sport.leagues || []).flatMap((league) => league.teams || []),
      ].map((entry) => entry.team || entry);
      const team = configuredId ? data.team : candidates.find((item) => item?.abbreviation?.toUpperCase() === upper);
      if (!team) return null;
      this.TEAM_IDS[upper] = Number(team.id);
      return { id: team.id, abbreviation: team.abbreviation, name: team.name, full_name: team.displayName, conference: "", division: "" };
    } catch (error) {
      console.error(`Failed to fetch ${this.LEAGUE_NAME} team: ${error.message}`);
      return null;
    }
  }

  async fetchData(abbr) {
    try {
      const team = await this.fetchTeam(abbr);
      if (!team) return null;
      const season = this.getSeasonYear();
      const [standingsResponse, scheduleResponse] = await Promise.all([
        httpGet(`${this.baseUrlV2}/standings?season=${season}`),
        httpGet(`${this.baseUrl}/teams/${team.id}/schedule?season=${season}`),
      ]);
      const record = this.findRecord(standingsResponse.data, team.abbreviation, season);
      team.conference = record.conference;
      return {
        team,
        record,
        recentGames: this.parseGames(scheduleResponse.data.events, team.id),
        standing: record.position ? { position: record.position, label: record.conference } : null,
        form: this.parseForm(scheduleResponse.data.events, team.id),
        nextGame: this.parseNextGame(scheduleResponse.data.events, team.id),
      };
    } catch (error) {
      console.error(`Failed to fetch ${this.LEAGUE_NAME} data: ${error.message}`);
      return null;
    }
  }

  // Last five completed results as W/L, most recent first.
  parseForm(events, teamId) {
    return (events || [])
      .filter((event) => event.competitions?.[0]?.status?.type?.completed)
      .map((event) => {
        const competitors = event.competitions[0].competitors;
        const mine = competitors.find((item) => String(item.team?.id) === String(teamId));
        const opponent = competitors.find((item) => String(item.team?.id) !== String(teamId));
        if (!mine || !opponent) return null;
        const teamScore = Number(mine.score?.value ?? mine.score ?? 0);
        const oppScore = Number(opponent.score?.value ?? opponent.score ?? 0);
        return teamScore > oppScore ? "W" : teamScore < oppScore ? "L" : "D";
      })
      .filter(Boolean)
      .slice(0, 5);
  }

  // First upcoming fixture for a team.
  parseNextGame(events, teamId) {
    const upNext = (events || [])
      .filter((event) => event.competitions?.[0]?.status?.type?.completed === false)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    if (!upNext) return null;
    const competitors = upNext.competitions[0].competitors;
    const mine = competitors.find((item) => String(item.team?.id) === String(teamId));
    const opponent = competitors.find((item) => String(item.team?.id) !== String(teamId));
    if (!mine || !opponent) return null;
    const isHome = competitors.find((item) => String(item.team?.id) === String(teamId))?.homeAway === "home";
    return { date: upNext.date, opponent: opponent.team?.abbreviation, isHome };
  }

  findRecord(data, abbr, season) {
    for (const group of data.children || []) {
      const entries = [
        ...(group.standings?.entries || []),
        ...(group.children || []).flatMap((child) => child.standings?.entries || []),
      ];
      const index = entries.findIndex((item) => item.team?.abbreviation?.toUpperCase() === abbr.toUpperCase());
      const entry = entries[index];
      if (entry) {
        const stats = Object.fromEntries((entry.stats || []).map((item) => [item.name, item.value]));
        return { wins: stats.wins || 0, losses: stats.losses || 0, season, conference: group.name || "", position: index + 1 };
      }
    }
    return { wins: 0, losses: 0, season, conference: "", position: null };
  }

  parseGames(events = [], teamId) {
    return events.filter((event) => event.competitions?.[0]?.status?.type?.completed).map((event) => {
      const competitors = event.competitions[0].competitors;
      const mine = competitors.find((item) => String(item.team?.id) === String(teamId));
      const opponent = competitors.find((item) => String(item.team?.id) !== String(teamId));
      if (!mine || !opponent) return null;
      const home = competitors.find((item) => item.homeAway === "home");
      const away = competitors.find((item) => item.homeAway === "away");
      const teamScore = Number(mine.score?.value ?? mine.score ?? 0);
      const oppScore = Number(opponent.score?.value ?? opponent.score ?? 0);
      return {
        date: event.date, status: "Final",
        home_team: { id: home?.team?.id, abbreviation: home?.team?.abbreviation },
        visitor_team: { id: away?.team?.id, abbreviation: away?.team?.abbreviation },
        home_team_score: Number(home?.score?.value ?? home?.score ?? 0),
        visitor_team_score: Number(away?.score?.value ?? away?.score ?? 0),
        teamScore, oppScore, oppAbbr: opponent.team?.abbreviation,
        won: teamScore > oppScore, drew: teamScore === oppScore,
      };
    }).filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }
}

module.exports = BaseEspnLeagueAdapter;
