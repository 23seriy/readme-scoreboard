const { get: httpGet } = require("../http");
const {
  buildGameLog,
  dateOffset,
  makeRng,
  opponentPool,
  recordFromGames,
  seedFromString,
} = require("../demo");

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
  getDemoData(abbr, playerName) {
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
      // Stays null unless a player is requested, so generated examples without
      // `player:` are unchanged.
      spotlight: playerName ? this.getDemoSpotlight(upper, playerName, recentGames) : null,
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

  // ---------------------------------------------------------------------------
  // Player spotlight
  //
  // These leagues share ESPN's basketball athlete surface: the common/v3
  // `splits` payload carrying `avgPoints`/`avgRebounds`/`avgAssists`, and a game
  // log with `points`/`totalRebounds`/`assists`/`minutes`. Leagues whose upstream
  // lacks that data stay out of `PLAYER_SPOTLIGHT_SPORTS` in src/validation.js,
  // so implementing it here does not expose them.
  // ---------------------------------------------------------------------------

  get athleteBaseUrl() {
    return `https://site.web.api.espn.com/apis/common/v3/sports/${this.SPORT}/${this.LEAGUE_SLUG}/athletes`;
  }

  // Prefer the headshot the roster already advertises; the constructed CDN path
  // is a fallback. The renderer skips the image entirely when this is falsy.
  getPlayerHeadshotUrl(athlete) {
    return athlete?.headshot?.href
      || `https://a.espncdn.com/i/headshots/${this.SPORT}/${this.LEAGUE_SLUG}/players/full/${athlete?.id}.png`;
  }

  async fetchTeamRoster(teamAbbr) {
    const espnId = this.TEAM_IDS[teamAbbr.toUpperCase()];
    if (!espnId) return [];
    try {
      const { data } = await httpGet(`${this.baseUrl}/teams/${espnId}/roster`);
      return (data.athletes || [])
        .flatMap((entry) => (entry.items ? entry.items : [entry]))
        .filter(Boolean)
        .map((athlete) => ({
          id: String(athlete.id),
          fullName: athlete.fullName || athlete.displayName,
          position: athlete.position?.abbreviation || "",
          headshotUrl: this.getPlayerHeadshotUrl(athlete),
        }));
    } catch (error) {
      console.error(`Failed to fetch ${this.LEAGUE_NAME} roster: ${error.message}`);
      return [];
    }
  }

  findPlayerOnRoster(roster, playerName) {
    const target = (playerName || "").trim().toLowerCase();
    return roster.find((player) => (player.fullName || "").toLowerCase() === target) || null;
  }

  statByName(names, stats, name) {
    const index = names.indexOf(name);
    return index === -1 ? null : parseFloat(stats[index]);
  }

  async fetchPlayerSeasonAverages(athleteId) {
    try {
      const { data } = await httpGet(`${this.athleteBaseUrl}/${athleteId}/splits`);
      const names = data.names || [];
      const stats = data.splitCategories?.[0]?.splits?.[0]?.stats || [];
      const points = this.statByName(names, stats, "avgPoints");
      const rebounds = this.statByName(names, stats, "avgRebounds");
      const assists = this.statByName(names, stats, "avgAssists");
      if (points == null || rebounds == null || assists == null) return null;
      return { points, rebounds, assists };
    } catch (error) {
      console.error(`Failed to fetch ${this.LEAGUE_NAME} player averages: ${error.message}`);
      return null;
    }
  }

  // The opponent for a player's last game comes from the event summary: of the
  // two competitors, whichever is not this team is the opponent. The team is
  // identified by its ESPN id first — the abbreviation a user types is not
  // always ESPN's (e.g. UCONN is CONN upstream), and matching on abbreviation
  // alone would return the player's own team as the opponent.
  async fetchPlayerLastGameMeta(eventId, teamAbbr) {
    try {
      const upper = teamAbbr.toUpperCase();
      const teamId = this.TEAM_IDS[upper];
      const { data } = await httpGet(`${this.baseUrl}/summary?event=${eventId}`);
      const comp = data.header?.competitions?.[0];
      if (!comp) return null;
      const competitors = comp.competitors || [];
      const isOwnTeam = (entry) =>
        (teamId != null && String(entry.team?.id) === String(teamId))
        || (entry.team?.abbreviation || "").toUpperCase() === upper;
      const own = competitors.find(isOwnTeam);
      // With the own team unidentified, any guess could be its own opponent.
      if (!own) return null;
      const opponent = competitors.find((entry) => entry !== own);
      if (!opponent) return null;
      return {
        date: comp.date || null,
        opponent: opponent.team?.displayName || opponent.team?.name || opponent.team?.abbreviation || null,
      };
    } catch (error) {
      console.error(`Failed to fetch ${this.LEAGUE_NAME} last game: ${error.message}`);
      return null;
    }
  }

  async fetchPlayerLastGame(athleteId, teamAbbr) {
    try {
      const { data } = await httpGet(`${this.athleteBaseUrl}/${athleteId}/gamelog`);
      const names = data.names || [];
      // The log is newest-first, so the first event is the most recent game.
      const events = (data.seasonTypes || [])
        .flatMap((seasonType) => seasonType.categories || [])
        .flatMap((category) => category.events || []);
      const latest = events[0];
      if (!latest) return null;
      const points = this.statByName(names, latest.stats, "points");
      const rebounds = this.statByName(names, latest.stats, "totalRebounds");
      const assists = this.statByName(names, latest.stats, "assists");
      const minutes = this.statByName(names, latest.stats, "minutes");
      if (points == null || rebounds == null || assists == null || minutes == null) return null;
      const meta = await this.fetchPlayerLastGameMeta(latest.eventId, teamAbbr);
      return meta
        ? { points, rebounds, assists, minutes, ...meta }
        : { points, rebounds, assists, minutes };
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
      this.fetchPlayerSeasonAverages(player.id),
      this.fetchPlayerLastGame(player.id, teamAbbr),
    ]);
    return {
      name: player.fullName,
      position: player.position,
      season: season || { points: 0, rebounds: 0, assists: 0 },
      lastGame,
      headshotUrl: player.headshotUrl || null,
    };
  }

  // Seeded from the player's name, so repeated runs and the generated examples
  // stay byte-identical — nothing here reads the clock or Math.random, and the
  // last game reuses the board's own fixture so the two cannot disagree.
  getDemoSpotlight(teamAbbr, playerName, recentGames = []) {
    if (!playerName) return null;
    const rng = makeRng(seedFromString(`${this.LEAGUE_SLUG}:${playerName}`));
    const round1 = (value) => Math.round(value * 10) / 10;
    const last = recentGames[0];
    return {
      name: playerName,
      season: {
        points: round1(9 + rng() * 13),
        rebounds: round1(2 + rng() * 8),
        assists: round1(1 + rng() * 6),
      },
      lastGame: {
        points: Math.round(rng() * 28),
        rebounds: Math.round(rng() * 11),
        assists: Math.round(rng() * 9),
        minutes: 22 + Math.round(rng() * 14),
        date: last?.date || dateOffset(3),
        opponent: last?.oppAbbr || teamAbbr,
      },
    };
  }
}

module.exports = BaseEspnLeagueAdapter;
