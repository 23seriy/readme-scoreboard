const { get: httpGet } = require("../http");

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

  getDemoData(abbr) {
    const team = this.DEMO_TEAMS[abbr.toUpperCase()];
    if (!team) return null;
    const day = 24 * 60 * 60 * 1000;
    const games = [
      [3, 1, "OPP"], [2, 4, "RIV"], [5, 2, "UTD"],
    ].map(([teamScore, oppScore, oppAbbr], index) => {
      const isHome = index % 2 === 0;
      return {
        date: new Date(Date.now() - (index + 1) * 3 * day).toISOString(),
        status: "Final",
        home_team: { id: isHome ? team.id : 0, abbreviation: isHome ? team.abbreviation : oppAbbr },
        visitor_team: { id: isHome ? 0 : team.id, abbreviation: isHome ? oppAbbr : team.abbreviation },
        home_team_score: isHome ? teamScore : oppScore,
        visitor_team_score: isHome ? oppScore : teamScore,
        teamScore,
        oppScore,
        oppAbbr,
        isHome,
        won: teamScore > oppScore,
      };
    });
    return { team, record: { wins: 18, losses: 6, season: this.getSeasonYear() }, recentGames: games };
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
      return { team, record, recentGames: this.parseGames(scheduleResponse.data.events, team.id) };
    } catch (error) {
      console.error(`Failed to fetch ${this.LEAGUE_NAME} data: ${error.message}`);
      return null;
    }
  }

  findRecord(data, abbr, season) {
    for (const group of data.children || []) {
      const entries = [
        ...(group.standings?.entries || []),
        ...(group.children || []).flatMap((child) => child.standings?.entries || []),
      ];
      const entry = entries.find((item) => item.team?.abbreviation?.toUpperCase() === abbr.toUpperCase());
      if (entry) {
        const stats = Object.fromEntries((entry.stats || []).map((item) => [item.name, item.value]));
        return { wins: stats.wins || 0, losses: stats.losses || 0, season, conference: group.name || "" };
      }
    }
    return { wins: 0, losses: 0, season, conference: "" };
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
