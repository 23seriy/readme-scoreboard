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
  getDemoData(teamAbbr, playerName) {
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
      spotlight: playerName ? this.getDemoSpotlight(teamAbbr, playerName) : null,
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

  // ------------------------------------------------------------------
  // Player spotlight
  //
  // ESPN exposes no season-stats endpoint for soccer athletes (it 404s), but
  // the game log does carry per-match stat columns. Season totals are
  // therefore summed from the log. Every soccer league shares this endpoint
  // shape, so a single implementation covers all of them.
  // ------------------------------------------------------------------

  findPlayerOnRoster(roster, playerName) {
    const target = playerName.trim().toLowerCase();
    return roster.find((player) => (player.fullName || "").toLowerCase() === target) || null;
  }

  async fetchTeamRoster(teamAbbr) {
    try {
      const team = await this.fetchTeam(teamAbbr);
      if (!team) return [];
      const { data } = await httpGet(`${this.baseUrl}/teams/${team.id}/roster`);
      const athletes = (data.athletes || []).flatMap((group) => group.items || group);
      return athletes
        .filter((athlete) => athlete && athlete.id)
        .map((athlete) => ({
          id: String(athlete.id),
          fullName: athlete.fullName || athlete.displayName || "",
          position: athlete.position?.abbreviation || athlete.position?.name || "",
        }))
        .filter((athlete) => athlete.fullName);
    } catch (error) {
      console.error(`Failed to fetch ${this.LEAGUE_NAME} roster: ${error.message}`);
      return [];
    }
  }

  // Sum a game log into season totals. The log's `names` array labels each
  // numeric column in every event's `stats` array.
  summarizeGameLog(gameLog) {
    const names = gameLog.names || [];
    const events = (gameLog.seasonTypes || [])
      .flatMap((seasonType) => seasonType.categories || [])
      .flatMap((category) => category.events || []);
    const indexOf = (name) => names.indexOf(name);
    const idx = {
      goals: indexOf("totalGoals"),
      assists: indexOf("goalAssists"),
      saves: indexOf("saves"),
      cleanSheets: indexOf("cleanSheet"),
      yellowCards: indexOf("yellowCards"),
      redCards: indexOf("redCards"),
    };
    const total = (column) => {
      if (column === -1) return 0;
      return events.reduce((sum, event) => {
        const value = Number(event.stats?.[column]);
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0);
    };
    return {
      appearances: events.length,
      goals: total(idx.goals),
      assists: total(idx.assists),
      saves: total(idx.saves),
      cleanSheets: total(idx.cleanSheets),
      yellowCards: total(idx.yellowCards),
      redCards: total(idx.redCards),
    };
  }

  async fetchPlayerSeasonStats(athleteId) {
    try {
      const { data } = await httpGet(
        `https://site.web.api.espn.com/apis/common/v3/sports/soccer/${this.LEAGUE_SLUG}/athletes/${athleteId}/gamelog`
      );
      return this.summarizeGameLog(data);
    } catch (error) {
      console.error(`Failed to fetch ${this.LEAGUE_NAME} player season stats: ${error.message}`);
      return null;
    }
  }

  async fetchPlayerLastGame(athleteId) {
    try {
      const { data } = await httpGet(
        `https://site.web.api.espn.com/apis/common/v3/sports/soccer/${this.LEAGUE_SLUG}/athletes/${athleteId}/gamelog`
      );
      const names = data.names || [];
      const categories = (data.seasonTypes || []).flatMap((seasonType) => seasonType.categories || []);
      const latest = categories.flatMap((category) => category.events || [])[0];
      if (!latest) return null;
      const events = data.events || {};
      const meta = events[latest.eventId] || {};
      const at = (name) => {
        const index = names.indexOf(name);
        if (index === -1) return null;
        const value = Number(latest.stats?.[index]);
        return Number.isFinite(value) ? value : null;
      };
      return {
        date: meta.gameDate || null,
        opponent: meta.opponent?.abbreviation || meta.opponent?.displayName || null,
        goals: at("totalGoals"),
        assists: at("goalAssists"),
        saves: at("saves"),
      };
    } catch (error) {
      console.error(`Failed to fetch ${this.LEAGUE_NAME} player last game: ${error.message}`);
      return null;
    }
  }

  async fetchPlayerSpotlight(teamAbbr, playerName) {
    const roster = await this.fetchTeamRoster(teamAbbr);
    const player = this.findPlayerOnRoster(roster, playerName);
    if (!player) {
      const names = roster.slice(0, 8).map((entry) => entry.fullName);
      const suffix = roster.length > 8 ? ", ..." : "";
      throw new Error(`Unknown player "${playerName}" on ${teamAbbr}. Try one of: ${names.join(", ")}${suffix}`);
    }
    const [season, lastGame] = await Promise.all([
      this.fetchPlayerSeasonStats(player.id),
      this.fetchPlayerLastGame(player.id),
    ]);
    // Fail loudly rather than render a line of zeroes: an empty game log means
    // ESPN has no stats for this athlete, and silently printing "0 APP · 0 G"
    // would look like a bug in the board rather than missing upstream data.
    if (!season || season.appearances === 0) {
      throw new Error(
        `No season stats available for "${player.fullName}" on ${teamAbbr} (${this.LEAGUE_NAME}). ` +
        `ESPN has no game log for this athlete yet — this is common in the off-season or early in a season.`
      );
    }
    return { name: player.fullName, position: player.position, season, lastGame };
  }

  // Deterministic demo spotlight: derived from the player's name so repeated
  // runs and the generated examples stay byte-identical.
  getDemoSpotlight(teamAbbr, playerName) {
    const team = this.DEMO_TEAMS[teamAbbr.toUpperCase()];
    if (!team || !playerName) return null;
    const seed = playerName.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return {
      name: playerName,
      position: "MF",
      season: {
        appearances: 20 + (seed % 15),
        goals: seed % 18,
        assists: seed % 12,
        saves: 0,
        cleanSheets: 0,
        yellowCards: seed % 6,
        redCards: 0,
      },
      lastGame: {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        opponent: "RIV",
        goals: seed % 2,
        assists: seed % 2,
        saves: 0,
      },
    };
  }
}

module.exports = BaseSoccerAdapter;
