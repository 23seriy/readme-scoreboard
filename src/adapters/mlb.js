const { get: httpGet } = require("../http");
const BaseFreeApiAdapter = require("./base-free-api");

const MLB_BASE = "https://statsapi.mlb.com/api/v1";

const TEAM_EMOJI = {
  ATH: "🐘", AZ: "🐍", BAL: "🐦", BOS: "🧦", CHC: "🐻",
  CWS: "⚫", CIN: "🔴", CLE: "⚔️", COL: "🏔️", DET: "🐯",
  HOU: "🚀", KC: "👑", LAA: "😇", LAD: "💙", MIA: "🐬",
  MIL: "🍺", MIN: "🎯", NYM: "🍎", NYY: "⚾", PHI: "🔔",
  PIT: "🏴", SD: "🤎", SF: "🧡", SEA: "🧭", STL: "🐦",
  TB: "😈", TEX: "🤠", TOR: "🐦", WSH: "🇺🇸",
};

const TEAM_IDS = {
  ATH: 133, AZ: 109, BAL: 110, BOS: 111, CHC: 112,
  CWS: 145, CIN: 113, CLE: 114, COL: 115, DET: 116,
  HOU: 117, KC: 118, LAA: 108, LAD: 119, MIA: 146,
  MIL: 158, MIN: 142, NYM: 121, NYY: 147, PHI: 143,
  PIT: 134, SD: 135, SF: 137, SEA: 136, STL: 138,
  TB: 139, TEX: 140, TOR: 141, WSH: 120,
};

// ESPN logo abbreviations, where they differ from MLB Stats API abbreviations.
const ESPN_LOGO_ABBR = {
  AZ: "ari",
};

const DIVISION_NAMES = {
  200: "AL West", 201: "AL East", 202: "AL Central",
  203: "NL West", 204: "NL East", 205: "NL Central",
};

const LEAGUE_NAMES = {
  103: "American League",
  104: "National League",
};

const DEMO_TEAMS = {
  NYY: { id: 147, abbreviation: "NYY", name: "Yankees", full_name: "New York Yankees", league: "American League", division: "AL East" },
  LAD: { id: 119, abbreviation: "LAD", name: "Dodgers", full_name: "Los Angeles Dodgers", league: "National League", division: "NL West" },
  BOS: { id: 111, abbreviation: "BOS", name: "Red Sox", full_name: "Boston Red Sox", league: "American League", division: "AL East" },
  CHC: { id: 112, abbreviation: "CHC", name: "Cubs", full_name: "Chicago Cubs", league: "National League", division: "NL Central" },
  HOU: { id: 117, abbreviation: "HOU", name: "Astros", full_name: "Houston Astros", league: "American League", division: "AL West" },
  TOR: { id: 141, abbreviation: "TOR", name: "Blue Jays", full_name: "Toronto Blue Jays", league: "American League", division: "AL East" },
};

class MlbAdapter extends BaseFreeApiAdapter {
  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;

  getSeasonYear() {
    return new Date().getFullYear();
  }

  async fetchSeasonRecord(teamId) {
    try {
      const season = this.getSeasonYear();
      const { data } = await httpGet(`${MLB_BASE}/standings`, {
        params: { leagueId: "103,104", season, standingsTypes: "regularSeason" },
      });
      for (const record of data.records || []) {
        for (const teamRecord of record.teamRecords || []) {
          if (teamRecord.team.id === teamId) {
            return {
              wins: teamRecord.wins,
              losses: teamRecord.losses,
              season,
              position: teamRecord.divisionRank || teamRecord.sportRank || null,
            };
          }
        }
      }
      return { wins: 0, losses: 0, season, position: null };
    } catch (error) {
      console.error(`Failed to fetch MLB standings: ${error.message}`);
      return { wins: 0, losses: 0, season: this.getSeasonYear(), position: null };
    }
  }

  async fetchTeamRoster(teamAbbr) {
    const teamId = TEAM_IDS[teamAbbr.toUpperCase()];
    if (!teamId) return [];
    try {
      const { data } = await httpGet(`${MLB_BASE}/teams/${teamId}/roster`, {
        params: { rosterType: "active" },
      });
      return (data.roster || []).map((entry) => ({
        id: String(entry.person.id),
        fullName: entry.person.fullName,
      }));
    } catch (error) {
      console.error(`Failed to fetch MLB roster: ${error.message}`);
      return [];
    }
  }

  findPlayerOnRoster(roster, playerName) {
    const target = playerName.trim().toLowerCase();
    return roster.find((player) => player.fullName.toLowerCase() === target) || null;
  }

  async fetchPlayerSeasonStats(athleteId, season) {
    try {
      const { data } = await httpGet(`${MLB_BASE}/people/${athleteId}/stats`, {
        params: { stats: "season", season, group: "hitting" },
      });
      const stat = data.stats?.[0]?.splits?.[0]?.stat;
      if (!stat) return null;
      return {
        avg: parseFloat(stat.avg) || 0,
        homeRuns: stat.homeRuns || 0,
        rbi: stat.rbi || 0,
        hits: stat.hits || 0,
        atBats: stat.atBats || 0,
        games: stat.gamesPlayed || 0,
        ops: stat.ops ? parseFloat(stat.ops) : 0,
      };
    } catch (error) {
      console.error(`Failed to fetch MLB player season stats: ${error.message}`);
      return null;
    }
  }

  async fetchPlayerLastGame(athleteId, season) {
    try {
      const { data } = await httpGet(`${MLB_BASE}/people/${athleteId}/stats`, {
        params: { stats: "gameLog", season, group: "hitting" },
      });
      const games = data.stats?.[0]?.splits || [];
      // The game log is returned in chronological order (oldest first), so the
      // most recent game is the last entry.
      const g = games[games.length - 1];
      if (!g) return null;
      return {
        date: g.date || null,
        opponent: g.opponent?.name || g.opponent?.abbreviation || null,
        hits: g.stat?.hits || 0,
        homeRuns: g.stat?.homeRuns || 0,
        rbi: g.stat?.rbi || 0,
        avg: parseFloat(g.stat?.avg) || 0,
      };
    } catch (error) {
      console.error(`Failed to fetch MLB player last game: ${error.message}`);
      return null;
    }
  }

  async fetchPlayerSpotlight(teamAbbr, playerName) {
    const roster = await this.fetchTeamRoster(teamAbbr);
    const player = this.findPlayerOnRoster(roster, playerName);
    if (!player) {
      const names = roster.slice(0, 8).map((entry) => entry.fullName);
      const suffix = roster.length > 8 ? ", ..." : "";
      throw new Error(`Unknown player "${playerName}" on ${teamAbbr.toUpperCase()}. Try one of: ${names.join(", ")}${suffix}`);
    }
    const season = this.getSeasonYear();
    const [stats, lastGame] = await Promise.all([
      this.fetchPlayerSeasonStats(player.id, season),
      this.fetchPlayerLastGame(player.id, season),
    ]);
    return {
      name: player.fullName,
      season: stats || { avg: 0, homeRuns: 0, rbi: 0, hits: 0, atBats: 0, games: 0, ops: 0 },
      lastGame,
    };
  }

  getDemoData(teamAbbr, playerName) {
    const team = this.DEMO_TEAMS[teamAbbr.toUpperCase()];
    if (!team) return null;

    const demo = super.getDemoData(teamAbbr);
    if (!demo) return null;

    if (teamAbbr.toUpperCase() === "TOR" && playerName && playerName.trim().toLowerCase() === "vladimir guerrero jr.") {
      demo.spotlight = {
        name: "Vladimir Guerrero Jr.",
        season: { avg: 0.259, homeRuns: 8, rbi: 54, hits: 126, atBats: 487, games: 130, ops: 0.682 },
        lastGame: {
          date: "2026-09-07",
          opponent: "Athletics",
          hits: 1,
          homeRuns: 0,
          rbi: 0,
          avg: 0.259,
        },
      };
    } else if (playerName) {
      console.log(`[DEMO] No demo spotlight for player "${playerName}" (demo data only covers Vladimir Guerrero Jr. on TOR)`);
    }

    return demo;
  }

  async fetchData(teamAbbr) {
    try {
      const team = await this.fetchTeamByAbbr(teamAbbr);
      if (!team) return null;

      const fromDate = this.getSeasonStart();
      // Fetch a little past today so the next scheduled (upcoming) game is
      // included, not just games already played or postponed earlier in the
      // season. Otherwise a postponed April game can be mistaken for "next".
      const toDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      const url = this.getGamesUrl(team.id, fromDate, toDate);
      const [{ data }, record] = await Promise.all([
      httpGet(url),
        this.fetchSeasonRecord(team.id),
      ]);
      const allGames = this.parseGameResponse(data);

      // Recent games: regular season + playoffs, no spring training
      const recentGames = allGames
        .filter((g) => g.status === "Final" && g.gameType !== "S")
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      const form = allGames
        .filter((g) => g.status === "Final" && g.gameType !== "S")
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map((g) => {
          const isHome = g.home_team.id === team.id;
          const teamScore = isHome ? g.home_team_score : g.visitor_team_score;
          const oppScore = isHome ? g.visitor_team_score : g.home_team_score;
          return teamScore > oppScore ? "W" : teamScore < oppScore ? "L" : "D";
        });

      const now = Date.now();
      const nextGame = allGames
        .filter((g) => g.status !== "Final" && new Date(g.date).getTime() >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

      return {
        team,
        record,
        recentGames,
        standing: record.position ? { position: record.position, label: team.division || team.league } : null,
        form,
        nextGame: nextGame ? {
          date: nextGame.date,
          opponent: nextGame.home_team.id === team.id ? nextGame.visitor_team.abbreviation : nextGame.home_team.abbreviation,
          isHome: nextGame.home_team.id === team.id,
        } : null,
      };
    } catch (error) {
      console.error(`Failed to fetch MLB data: ${error.message}`);
      return null;
    }
  }

  async fetchTeam(abbr) {
    try {
      const { data } = await httpGet(`${MLB_BASE}/teams`, {
        params: { sportId: 1 },
      });
      const team = data.teams.find(
        (t) => t.abbreviation.toUpperCase() === abbr.toUpperCase()
      );
      if (!team) {
        console.error(`MLB team ${abbr} not found`);
        return null;
      }

      const leagueName = LEAGUE_NAMES[team.league.id] || team.league.name;
      const divisionName = DIVISION_NAMES[team.division.id] || team.division.name;

      return {
        id: team.id,
        abbreviation: team.abbreviation,
        name: team.teamName,
        full_name: team.name,
        league: leagueName,
        division: divisionName,
      };
    } catch (error) {
      console.error(`Failed to fetch MLB team: ${error.message}`);
      return null;
    }
  }

  getGamesUrl(teamId, fromDate, toDate) {
    const from = fromDate.toISOString().split("T")[0];
    const to = toDate.toISOString().split("T")[0];
    return `${MLB_BASE}/schedule?sportId=1&teamId=${teamId}&startDate=${from}&endDate=${to}`;
  }

  abbrById(id) {
    return Object.keys(TEAM_IDS).find((k) => TEAM_IDS[k] === id) || "???";
  }

  getLogoUrl(abbr) {
    const upper = abbr.toUpperCase();
    const slug = ESPN_LOGO_ABBR[upper] || upper.toLowerCase();
    return `https://a.espncdn.com/i/teamlogos/mlb/500/${slug}.png`;
  }

  parseGameResponse(data) {
    if (!data.dates) return [];
    const games = [];
    for (const dateEntry of data.dates) {
      for (const game of dateEntry.games) {
        const homeTeam = game.teams?.home?.team;
        const awayTeam = game.teams?.away?.team;
        if (!homeTeam?.id || !awayTeam?.id) continue;
        const homeScore = game.teams.home.score ?? 0;
        const awayScore = game.teams.away.score ?? 0;
        const isFinal = game.status?.abstractGameState === "Final";
        // Exclude postponed/cancelled games recorded as Final with 0-0 score
        const isRealFinal = isFinal && (homeScore > 0 || awayScore > 0);
        games.push({
          date: game.gameDateTime || game.officialDate,
          gameType: game.gameType,
          home_team: {
            id: homeTeam.id,
            abbreviation: homeTeam.abbreviation || this.abbrById(homeTeam.id),
          },
          visitor_team: {
            id: awayTeam.id,
            abbreviation: awayTeam.abbreviation || this.abbrById(awayTeam.id),
          },
          home_team_score: homeScore,
          visitor_team_score: awayScore,
          status: isRealFinal ? "Final" : "Other",
        });
      }
    }
    return games;
  }

  parseTeamResponse(data) {
    if (!data.teams || data.teams.length === 0) return null;
    const team = data.teams[0];
    return {
      id: team.id,
      abbreviation: team.abbreviation,
      name: team.teamName,
      full_name: team.name,
      league: LEAGUE_NAMES[team.league.id] || team.league.name,
      division: DIVISION_NAMES[team.division.id] || team.division.name,
    };
  }
}

module.exports = new MlbAdapter();
