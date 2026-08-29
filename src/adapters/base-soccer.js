const { get: httpGet } = require("../http");
const BaseFreeApiAdapter = require("./base-free-api");

const ESPN_HOST = "https://site.api.espn.com/apis";

/**
 * Shared behaviour for soccer leagues on ESPN's free API.
 *
 * Every league lives at the same endpoints under a different slug
 * (MLS = usa.1, Premier League = eng.1, ...), so subclasses only supply
 * the slug, their team tables, and their season window.
 */
class BaseSoccerAdapter extends BaseFreeApiAdapter {
  // Subclasses must define: LEAGUE_SLUG, LEAGUE_NAME, TEAM_EMOJI,
  // TEAM_IDS, DEMO_TEAMS. SEASON_SPANS_YEARS defaults to false
  // (calendar-year seasons like MLS); set true for Aug–May leagues.
  SEASON_SPANS_YEARS = false;

  get baseUrl() {
    return `${ESPN_HOST}/site/v2/sports/soccer/${this.LEAGUE_SLUG}`;
  }

  get baseUrlV2() {
    return `${ESPN_HOST}/v2/sports/soccer/${this.LEAGUE_SLUG}`;
  }

  /**
   * ESPN labels a season by the year it starts in. Leagues that run
   * Aug–May therefore belong to the previous year once January arrives.
   */
  getSeasonYear() {
    const now = new Date();
    const year = now.getFullYear();
    if (!this.SEASON_SPANS_YEARS) return year;
    // Months Jan–Jun still belong to the season that began last year.
    return now.getMonth() + 1 <= 6 ? year - 1 : year;
  }

  getLogoUrl(abbr) {
    const upper = abbr.toUpperCase();
    if (this.TEAM_LOGO_OVERRIDES?.[upper]) return this.TEAM_LOGO_OVERRIDES[upper];
    // Dynamic leagues may not have a static roster yet; keep demo logos
    // available until the first live team lookup populates TEAM_IDS.
    const id = this.TEAM_IDS[upper] || this.DEMO_TEAMS?.[upper]?.id;
    return id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png` : null;
  }

  /**
   * The base demo data has no soccer-specific fields (draws, per-team
   * scores), so build a soccer-shaped sample instead.
   */
  getDemoData(teamAbbr) {
    const team = this.DEMO_TEAMS[teamAbbr.toUpperCase()];
    if (!team) return null;

    const day = 24 * 60 * 60 * 1000;
    const sample = [
      { daysAgo: 3, teamScore: 3, oppScore: 1, oppAbbr: "OPP", isHome: true },
      { daysAgo: 7, teamScore: 2, oppScore: 2, oppAbbr: "RIV", isHome: false },
      { daysAgo: 11, teamScore: 0, oppScore: 1, oppAbbr: "UTD", isHome: false },
    ];

    return {
      team,
      record: { wins: 18, losses: 6, draws: 6, season: this.getSeasonYear() },
      standing: { position: 2, label: this.LEAGUE_NAME },
      form: ["W", "D", "W", "L", "W"],
      nextGame: {
        date: new Date(Date.now() + 3 * day).toISOString(),
        opponent: "OPP",
        isHome: true,
      },
      recentGames: sample.map((g) => ({
        date: new Date(Date.now() - g.daysAgo * day).toISOString(),
        gameType: "R",
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
        won: g.teamScore > g.oppScore,
        drew: g.teamScore === g.oppScore,
      })),
    };
  }

  async fetchTeam(abbr) {
    try {
      const upper = abbr.toUpperCase();
      const configuredId = this.TEAM_IDS[upper];
      let data;
      if (configuredId) {
        ({ data } = await httpGet(`${this.baseUrl}/teams/${configuredId}`));
      } else {
        ({ data } = await httpGet(`${this.baseUrl}/teams?limit=1000`));
      }
      const teams = [
        ...(data.teams || []),
        ...(data.sports || []).flatMap((sport) => sport.leagues || []).flatMap((league) => league.teams || []),
      ].map((entry) => entry.team || entry);
      const team = configuredId ? data.team : teams.find((candidate) => candidate.abbreviation?.toUpperCase() === upper);
      if (!team) return null;
      this.TEAM_IDS[upper] = Number(team.id);
      return {
        id: team.id,
        abbreviation: team.abbreviation,
        name: team.name,
        full_name: team.displayName,
        conference: "",
        division: "",
      };
    } catch (error) {
      console.error(`Failed to fetch ${this.LEAGUE_NAME} team: ${error.message}`);
      return null;
    }
  }

  /**
   * Table position and W/L/D come from standings, which is authoritative —
   * counting fixtures would miss abandoned and rescheduled matches.
   */
  async fetchConferenceRecord(teamAbbr) {
    const season = this.getSeasonYear();
    const empty = { conference: "", wins: 0, losses: 0, draws: 0, season };
    try {
      const upper = teamAbbr.toUpperCase();
      const { data } = await httpGet(`${this.baseUrlV2}/standings?season=${season}`);
      for (const group of (data.children || [])) {
        const entries = group.standings?.entries || [];
        const index = entries.findIndex((e) => e.team?.abbreviation?.toUpperCase() === upper);
        const entry = entries[index];
        if (entry) {
          const stats = (entry.stats || []).reduce((acc, s) => { acc[s.name] = s.value; return acc; }, {});
          return {
            // Conference for MLS; for single-table leagues ESPN returns
            // the league name here, which the renderer falls back on.
            conference: group.name || "",
            wins: stats.wins || 0,
            losses: stats.losses || 0,
            draws: stats.ties || 0,
            position: index + 1,
            season,
          };
        }
      }
      return empty;
    } catch (error) {
      console.error(`Failed to fetch ${this.LEAGUE_NAME} standings: ${error.message}`);
      return empty;
    }
  }

  parseSchedule(events, teamId) {
    return (events || [])
      .filter((e) => e.competitions?.[0]?.status?.type?.completed)
      .map((e) => {
        const comp = e.competitions[0];
        const teamComp = comp.competitors.find((c) => String(c.team?.id) === String(teamId));
        const oppComp = comp.competitors.find((c) => String(c.team?.id) !== String(teamId));
        if (!teamComp || !oppComp) return null;
        const home = comp.competitors.find((c) => c.homeAway === "home");
        const away = comp.competitors.find((c) => c.homeAway === "away");
        const teamScore = teamComp.score?.value ?? 0;
        const oppScore = oppComp.score?.value ?? 0;
        return {
          date: e.date,
          gameType: "R",
          home_team: { id: home?.team?.id, abbreviation: home?.team?.abbreviation },
          visitor_team: { id: away?.team?.id, abbreviation: away?.team?.abbreviation },
          home_team_score: home?.score?.value ?? 0,
          visitor_team_score: away?.score?.value ?? 0,
          status: "Final",
          // Soccer-specific
          isHome: teamComp.homeAway === "home",
          teamScore,
          oppScore,
          oppAbbr: oppComp.team?.abbreviation,
          won: teamScore > oppScore,
          drew: teamScore === oppScore,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }

  async fetchData(teamAbbr) {
    try {
      const team = await this.fetchTeamByAbbr(teamAbbr);
      if (!team) return null;

      const season = this.getSeasonYear();
      const [standings, schedData] = await Promise.all([
        this.fetchConferenceRecord(teamAbbr),
        httpGet(`${this.baseUrl}/teams/${team.id}/schedule?season=${season}`),
      ]);

      team.conference = standings.conference;

      return {
        team,
        record: {
          wins: standings.wins,
          losses: standings.losses,
          draws: standings.draws,
          season: standings.season,
        },
        recentGames: this.parseSchedule(schedData.data.events, team.id),
        standing: standings.position
          ? { position: standings.position, label: standings.conference }
          : null,
        form: this.parseForm(schedData.data.events, team.id),
        nextGame: this.parseNextGame(schedData.data.events, team.id),
      };
    } catch (error) {
      console.error(`Failed to fetch ${this.LEAGUE_NAME} data: ${error.message}`);
      return null;
    }
  }

  // Last five completed results as W/D/L, most recent first.
  parseForm(events, teamId) {
    return (events || [])
      .filter((e) => e.competitions?.[0]?.status?.type?.completed)
      .map((e) => {
        const comp = e.competitions[0];
        const teamComp = comp.competitors.find((c) => String(c.team?.id) === String(teamId));
        const oppComp = comp.competitors.find((c) => String(c.team?.id) !== String(teamId));
        if (!teamComp || !oppComp) return null;
        const teamScore = Number(teamComp.score?.value ?? 0);
        const oppScore = Number(oppComp.score?.value ?? 0);
        return teamScore === oppScore ? "D" : teamScore > oppScore ? "W" : "L";
      })
      .filter(Boolean)
      .slice(0, 5);
  }

  // First upcoming (not yet completed) fixture for a team.
  parseNextGame(events, teamId) {
    const upcoming = (events || [])
      .filter((e) => e.competitions?.[0]?.status?.type?.completed === false)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    if (!upcoming) return null;
    const comp = upcoming.competitions[0];
    const teamComp = comp.competitors.find((c) => String(c.team?.id) === String(teamId));
    const oppComp = comp.competitors.find((c) => String(c.team?.id) !== String(teamId));
    if (!teamComp || !oppComp) return null;
    return {
      date: upcoming.date,
      opponent: oppComp.team?.abbreviation || oppComp.team?.displayName,
      isHome: teamComp.homeAway === "home",
    };
  }

  // Unused by soccer adapters — schedule parsing is handled above.
  parseGameResponse() { return []; }
  parseTeamResponse() { return null; }
  getGamesUrl() { return ""; }
}

module.exports = BaseSoccerAdapter;
