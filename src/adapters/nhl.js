const { get: httpGet } = require("../http");
const { dateOffset } = require("../demo");
const BaseFreeApiAdapter = require("./base-free-api");

const NHL_BASE = "https://api-web.nhle.com/v1";

class NHLAdapter extends BaseFreeApiAdapter {
  // Selects the opponent pool used to pad sample boards in the base class.
  DEMO_POOL_KEY = "hockey";
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

  // NHL logo CDN codes, where they differ from the abbreviations above.
  LOGO_ABBR = { NJ: "NJD", SJ: "SJS", TB: "TBL" };

  getLogoUrl(abbr) {
    const upper = abbr.toUpperCase();
    const slug = this.LOGO_ABBR[upper] || upper;
    return `https://assets.nhle.com/logos/nhl/svg/${slug}_dark.svg`;
  }

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

  // Demo rosters so `--demo` and the generated examples can render the Player
  // Spotlight block without a network call. NHL rosters turn over constantly,
  // so the live path resolves players from the current roster endpoint instead
  // of a maintained id map.
  DEMO_PLAYERS = {
    NYR: [
      { id: "8478402", fullName: "Artemi Panarin", position: "LW" },
      { id: "8478550", fullName: "Igor Shesterkin", position: "G" },
      { id: "8480078", fullName: "Adam Fox", position: "D" },
    ],
    LAK: [
      { id: "8471685", fullName: "Anze Kopitar", position: "C" },
      { id: "8479977", fullName: "Adrian Kempe", position: "RW" },
      { id: "8481552", fullName: "Quinton Byfield", position: "C" },
    ],
    TOR: [
      { id: "8479318", fullName: "Auston Matthews", position: "C" },
      { id: "8478483", fullName: "Mitch Marner", position: "RW" },
      { id: "8477939", fullName: "William Nylander", position: "RW" },
    ],
    DET: [
      { id: "8482124", fullName: "Lucas Raymond", position: "RW" },
      { id: "8477949", fullName: "Dylan Larkin", position: "C" },
      { id: "8481554", fullName: "Moritz Seider", position: "D" },
    ],
    BOS: [
      { id: "8477956", fullName: "David Pastrnak", position: "RW" },
      { id: "8478397", fullName: "Brad Marchand", position: "LW" },
      { id: "8479619", fullName: "Jeremy Swayman", position: "G" },
    ],
    EDM: [
      { id: "8478402", fullName: "Leon Draisaitl", position: "C" },
      { id: "8477934", fullName: "Connor McDavid", position: "C" },
      { id: "8476456", fullName: "Zach Hyman", position: "LW" },
    ],
  };

  findPlayerOnRoster(roster, playerName) {
    const target = playerName.trim().toLowerCase();
    return roster.find((player) => (player.fullName || "").toLowerCase() === target) || null;
  }

  // The club roster for the current season, flattened across position groups.
  async fetchTeamRoster(teamAbbr) {
    try {
      const upper = teamAbbr.toUpperCase();
      const abbr = this.LOGO_ABBR[upper] || upper;
      const currentYear = new Date().getFullYear();
      // The current season's roster, falling back to the previous season during
      // the off-season when the new roster is not yet published.
      for (const season of [this.getSeasonCode(currentYear - 1), this.getSeasonCode(currentYear - 2)]) {
        try {
          const { data } = await httpGet(`${NHL_BASE}/roster/${abbr.toLowerCase()}/${season}`);
          const groups = [...(data.forwards || []), ...(data.defensemen || []), ...(data.goalies || [])];
          if (groups.length > 0) {
            return groups
              .filter((entry) => entry && (entry.id || entry.playerId))
              .map((entry) => ({
                id: String(entry.id || entry.playerId),
                fullName: `${entry.firstName?.default || ""} ${entry.lastName?.default || ""}`.trim(),
                position: entry.positionCode || entry.position || "",
              }))
              .filter((entry) => entry.fullName);
          }
        } catch {
          // Try the next season window.
        }
      }
      return [];
    } catch (error) {
      console.error(`Failed to fetch NHL roster: ${error.message}`);
      return [];
    }
  }

  // Season scoring totals for a skater. Goalies return saves/goals-against.
  async fetchPlayerSeasonStats(athleteId) {
    try {
      const { data } = await httpGet(`${NHL_BASE}/player/${athleteId}/landing`);
      const featured = data.featuredStats?.regularSeason?.subSeason || {};
      const career = data.careerTotals?.regularSeason || {};
      if (data.position === "G" || data.positionCode === "G") {
        return {
          gamesPlayed: featured.gamesPlayed ?? career.gamesPlayed ?? 0,
          wins: featured.wins ?? career.wins ?? 0,
          goalsAgainstAverage: featured.goalsAgainstAverage ?? career.goalsAgainstAverage ?? 0,
          savePercentage: featured.savePercentage ?? career.savePercentage ?? 0,
          isGoalie: true,
        };
      }
      return {
        gamesPlayed: featured.gamesPlayed ?? career.gamesPlayed ?? 0,
        goals: featured.goals ?? career.goals ?? 0,
        assists: featured.assists ?? career.assists ?? 0,
        points: featured.points ?? career.points ?? 0,
        isGoalie: false,
      };
    } catch (error) {
      console.error(`Failed to fetch NHL player season stats: ${error.message}`);
      return null;
    }
  }

  // The most recent game log entry for the player.
  async fetchPlayerLastGame(athleteId) {
    try {
      const { data } = await httpGet(`${NHL_BASE}/player/${athleteId}/game-log/now`);
      const game = (data.gameLog || [])[0];
      if (!game) return null;
      return {
        date: game.gameDate || null,
        opponent: game.opponentAbbrev || null,
        goals: game.goals ?? null,
        assists: game.assists ?? null,
        points: game.points ?? null,
        saves: game.saves ?? null,
        shotsAgainst: game.shotsAgainst ?? null,
      };
    } catch (error) {
      console.error(`Failed to fetch NHL player last game: ${error.message}`);
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
    return { name: player.fullName, position: player.position, season: season || {}, lastGame };
  }

  // Deterministic demo spotlight so examples stay reproducible. `recentGames`
  // is the team board's own list, so the spotlight's last game matches it.
  getDemoSpotlight(teamAbbr, playerName, recentGames = []) {
    const abbr = teamAbbr.toUpperCase();
    const roster = this.DEMO_PLAYERS[abbr] || this.DEMO_PLAYERS.NYR;
    const player = playerName ? this.findPlayerOnRoster(roster, playerName) : roster[0];
    if (!player) return null;
    const seed = player.fullName.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const isGoalie = player.position === "G";
    const last = recentGames[0];
    const lastDate = last ? last.date : dateOffset(0);
    const lastOpponent = last ? last.oppAbbr : "BOS";
    const season = isGoalie
      ? {
          gamesPlayed: 40 + (seed % 20),
          wins: 25 + (seed % 15),
          goalsAgainstAverage: Number((2.1 + (seed % 90) / 100).toFixed(2)),
          savePercentage: Number((0.9 + (seed % 60) / 1000).toFixed(3)),
          isGoalie: true,
        }
      : {
          gamesPlayed: 60 + (seed % 20),
          goals: 20 + (seed % 35),
          assists: 25 + (seed % 45),
          points: 45 + (seed % 80),
          isGoalie: false,
        };
    return {
      name: player.fullName,
      position: player.position,
      season,
      lastGame: isGoalie
        ? {
            date: lastDate,
            opponent: lastOpponent,
            saves: 24 + (seed % 14),
            shotsAgainst: 27 + (seed % 15),
          }
        : {
            date: lastDate,
            opponent: lastOpponent,
            goals: seed % 2,
            assists: seed % 3,
            points: (seed % 2) + (seed % 3),
          },
    };
  }

  // Overrides the base implementation so the demo payload can carry a spotlight.
  getDemoData(teamAbbr, playerName) {
    const base = super.getDemoData(teamAbbr);
    if (!base) return null;
    return {
      ...base,
      spotlight: playerName
        ? this.getDemoSpotlight(teamAbbr, playerName, base.recentGames || [])
        : null,
    };
  }

  async fetchConferenceDivision(abbr) {
    try {
      // standings/now is unavailable off-season; find the most recently completed season
      const { data: seasonData } = await httpGet(`${NHL_BASE}/standings-season`);
      const seasons = seasonData.seasons || [];
      const today = new Date().toISOString().slice(0, 10);
      // Pick the latest season whose standingsEnd is in the past
      const completed = seasons.slice().reverse().find((s) => s.standingsEnd && s.standingsEnd <= today);
      const endDate = completed?.standingsEnd || "2026-04-17";
      const { data } = await httpGet(`${NHL_BASE}/standings/${endDate}`);
      const entry = (data.standings || []).find(
        (s) => s.teamAbbrev?.default?.toUpperCase() === abbr.toUpperCase()
      );
      return {
        conference: entry?.conferenceName || "",
        division: entry?.divisionName || "",
        position: entry?.divisionSequence || entry?.conferenceSequence || null,
      };
    } catch {
      return { conference: "", division: "", position: null };
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

      // Try "now", then this calendar year's season, then last year's — whichever has Final games
      const currentYear = new Date().getFullYear();
      const seasonsToTry = [
        "now",
        this.getSeasonCode(currentYear - 1), // e.g. 20252026 when year=2026
        this.getSeasonCode(currentYear - 2), // e.g. 20242025 as last resort
      ];
      let allGames = [];
      let usedSeasonYear = currentYear - 1;
      for (const season of seasonsToTry) {
        const url = this.getGamesUrl(team.id, null, null, season);
        const { data } = await httpGet(url);
        allGames = this.parseGameResponse(data);
        if (allGames.some((g) => g.status === "Final")) {
          // Derive the display year from the season code (first 4 digits)
          usedSeasonYear = season === "now" ? currentYear - 1 : parseInt(season.slice(0, 4), 10);
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

      const form = allGames
        .filter((g) => g.status === "Final" && g.gameType !== 1)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map((g) => {
          const isHome = g.home_team.id === team.id;
          const teamScore = isHome ? g.home_team_score : g.visitor_team_score;
          const oppScore = isHome ? g.visitor_team_score : g.home_team_score;
          return teamScore > oppScore ? "W" : teamScore < oppScore ? "L" : "D";
        });

      const nextGame = allGames
        .filter((g) => g.status !== "Final")
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

      return {
        team,
        record,
        recentGames,
        standing: confDiv.position
          ? { position: confDiv.position, label: team.division || team.conference }
          : null,
        form,
        nextGame: nextGame ? {
          date: nextGame.date,
          opponent: nextGame.home_team.id === team.id ? nextGame.visitor_team.abbreviation : nextGame.home_team.abbreviation,
          isHome: nextGame.home_team.id === team.id,
        } : null,
      };
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
