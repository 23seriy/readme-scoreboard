const { get: httpGet } = require("../http");

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/tennis/atp";
const ESPN_CORE_BASE = "https://sports.core.api.espn.com/v2/sports/tennis/leagues/atp";
const ESPN_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Accept": "application/json",
  "Origin": "https://www.espn.com",
  "Referer": "https://www.espn.com/",
};

// Player abbreviations → ESPN athlete ids (from the ATP rankings response).
// Tennis is an individual sport, so a "team" is a single ranked player.
const PLAYER_IDS = {
  SIN: { id: "3623", name: "Jannik Sinner", full_name: "Jannik Sinner" },
  ZVE: { id: "2375", name: "Alexander Zverev", full_name: "Alexander Zverev" },
  ALC: { id: "3782", name: "Carlos Alcaraz", full_name: "Carlos Alcaraz" },
  FAA: { id: "3209", name: "Felix Auger-Aliassime", full_name: "Felix Auger-Aliassime" },
  DJO: { id: "296", name: "Novak Djokovic", full_name: "Novak Djokovic" },
  COB: { id: "7602", name: "Flavio Cobolli", full_name: "Flavio Cobolli" },
  DEM: { id: "2651", name: "Alex de Minaur", full_name: "Alex de Minaur" },
  MED: { id: "2383", name: "Daniil Medvedev", full_name: "Daniil Medvedev" },
  SHE: { id: "9250", name: "Ben Shelton", full_name: "Ben Shelton" },
  FRI: { id: "2946", name: "Taylor Fritz", full_name: "Taylor Fritz" },
  FIL: { id: "10052", name: "Arthur Fils", full_name: "Arthur Fils" },
  TIA: { id: "2708", name: "Frances Tiafoe", full_name: "Frances Tiafoe" },
};

const PLAYER_EMOJI = {
  SIN: "🇮🇹", ZVE: "🇩🇪", ALC: "🇪🇸", FAA: "🇨🇦", DJO: "🇷🇸",
  COB: "🇮🇹", DEM: "🇦🇺", MED: "🇷🇺", SHE: "🇺🇸", FRI: "🇺🇸",
  FIL: "🇫🇷", TIA: "🇺🇸",
};

const DEMO_PLAYERS = {
  SIN: { id: "3623", abbreviation: "SIN", name: "Jannik Sinner", full_name: "Jannik Sinner", conference: "ATP", division: "", rank: 1, points: 12800 },
  ALC: { id: "3782", abbreviation: "ALC", name: "Carlos Alcaraz", full_name: "Carlos Alcaraz", conference: "ATP", division: "", rank: 3, points: 7160 },
  ZVE: { id: "2375", abbreviation: "ZVE", name: "Alexander Zverev", full_name: "Alexander Zverev", conference: "ATP", division: "", rank: 2, points: 7790 },
};

const DATA_SOURCE = "ESPN public API";

function getSeasonYear() {
  return new Date().getFullYear();
}

// ATP has no per-team logo on ESPN's CDN, so fall back to the tennis icon used
// by the ATP league itself.
function getLogoUrl() {
  return "https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-tennis.png";
}

async function fetchRankings() {
  const { data } = await httpGet(`${ESPN_BASE}/rankings`, { headers: ESPN_HEADERS });
  return data.rankings?.[0]?.ranks || [];
}

function rankToEntry(rankEntry, abbr, fullName) {
  const athlete = rankEntry?.athlete;
  return {
    position: rankEntry?.current ?? null,
    previous: rankEntry?.previous ?? null,
    points: rankEntry?.points ?? 0,
    trend: rankEntry?.trend ?? "-",
    name: athlete?.displayName || fullName || abbr,
    id: athlete?.id || "",
  };
}

// Latest completed (or in-progress) match for a player. The core API exposes a
// player's most recent competition, from which we read the opponent, whether the
// player won, the match date, and set scores.
async function fetchLastMatch(playerId) {
  try {
    const { data: comps } = await httpGet(
      `${ESPN_CORE_BASE}/athletes/${playerId}/competitions`,
      { headers: ESPN_HEADERS },
    );
    const item = comps.items?.[0];
    if (!item) return null;

    const { data: competition } = await httpGet(item.$ref.split("?")[0], { headers: ESPN_HEADERS });
    const competitors = competition.competitors || [];
    const me = competitors.find((c) => String(c.id) === String(playerId));
    const opponent = competitors.find((c) => String(c.id) !== String(playerId));
    if (!me || !opponent) return null;

    // Set scores come from each competitor's linescores (a $ref to paginated items).
    const sets = [];
    for (const competitor of competitors) {
      const ref = competitor.linescores?.$ref;
      if (!ref) continue;
      try {
        const { data: scores } = await httpGet(ref.split("?")[0], { headers: ESPN_HEADERS });
        sets.push((scores.items || []).map((s) => s.value));
      } catch {
        /* ignore linescore fetch failures */
      }
    }

    return {
      opponent: opponent.name,
      won: me.winner === true,
      date: competition.date,
      sets,
    };
  } catch (error) {
    console.error(`Failed to fetch ${playerId} last match: ${error.message}`);
    return null;
  }
}

// The player object shared with the renderer. Individual-sport boards treat a
// ranked player like an F1 constructor: a single "team" with a standing and
// points, plus the player's latest match result.
async function fetchData(abbr) {
  const upper = (abbr || "").toUpperCase();
  const player = PLAYER_IDS[upper];
  if (!player) return null;

  try {
    const [ranks, lastMatch] = await Promise.all([
      fetchRankings(),
      fetchLastMatch(player.id),
    ]);
    const entry = ranks.find((r) => String(r.athlete?.id) === String(player.id));
    if (!entry) return null;

    const rank = rankToEntry(entry, upper, player.full_name);
    return {
      team: {
        id: player.id,
        abbreviation: upper,
        name: rank.name,
        full_name: rank.name,
        conference: "ATP",
        division: "",
      },
      record: { wins: 0, losses: 0, points: rank.points, season: getSeasonYear() },
      recentGames: [],
      standing: rank.position
        ? { position: rank.position, label: "ATP" }
        : null,
      rankPoints: rank.points,
      previousRank: rank.previous,
      trend: rank.trend,
      lastMatch,
    };
  } catch (error) {
    console.error(`Failed to fetch ATP ranking: ${error.message}`);
    return null;
  }
}

function getDemoData(abbr) {
  const upper = (abbr || "").toUpperCase();
  const player = DEMO_PLAYERS[upper];
  if (!player) return null;
  const { rank = 1, points = 12800 } = player;
  return {
    team: player,
    record: { wins: 0, losses: 0, points, season: getSeasonYear() },
    recentGames: [],
    standing: { position: rank, label: "ATP" },
    rankPoints: points,
    previousRank: rank,
    trend: "-",
    lastMatch: {
      opponent: "Alexander Zverev",
      won: true,
      date: "2026-07-12T15:05:00Z",
      sets: [[6, 7, 6, 6], [7, 6, 3, 4]],
    },
  };
}

module.exports = {
  fetchData,
  getDemoData,
  getLogoUrl,
  getSeasonYear,
  DATA_SOURCE,
  TEAM_EMOJI: PLAYER_EMOJI,
  DEMO_TEAMS: DEMO_PLAYERS,
  TEAM_IDS: PLAYER_IDS,
  // Individual-sport adapters expose their athlete roster separately so the
  // player-directory generator can distinguish real players from constructors
  // (e.g. F1's TEAM_IDS maps to teams, not drivers).
  PLAYER_IDS,
};
