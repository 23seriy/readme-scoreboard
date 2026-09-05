const { get: httpGet } = require("../http");

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/tennis/wta";
const ESPN_CORE_BASE = "https://sports.core.api.espn.com/v2/sports/tennis/leagues/wta";
const ESPN_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Accept": "application/json",
  "Origin": "https://www.espn.com",
  "Referer": "https://www.espn.com/",
};

// Player abbreviations → ESPN athlete ids (from the WTA rankings response).
// Tennis is an individual sport, so a "team" is a single ranked player.
// Roster is the top 30 WTA singles ranking as of the adapter's last refresh.
const PLAYER_IDS = {
  SAB: { id: "3038", name: "Aryna Sabalenka", full_name: "Aryna Sabalenka" },
  RYB: { id: "3126", name: "Elena Rybakina", full_name: "Elena Rybakina" },
  PEG: { id: "2113", name: "Jessica Pegula", full_name: "Jessica Pegula" },
  GAU: { id: "3626", name: "Coco Gauff", full_name: "Coco Gauff" },
  AND: { id: "9820", name: "Mirra Andreeva", full_name: "Mirra Andreeva" },
  NOS: { id: "6970", name: "Linda Noskova", full_name: "Linda Noskova" },
  MUC: { id: "3039", name: "Karolina Muchova", full_name: "Karolina Muchova" },
  SWI: { id: "3730", name: "Iga Swiatek", full_name: "Iga Swiatek" },
  SVI: { id: "1797", name: "Elina Svitolina", full_name: "Elina Svitolina" },
  ANI: { id: "3221", name: "Amanda Anisimova", full_name: "Amanda Anisimova" },
  KOS: { id: "3382", name: "Marta Kostyuk", full_name: "Marta Kostyuk" },
  BEN: { id: "2183", name: "Belinda Bencic", full_name: "Belinda Bencic" },
  OSA: { id: "2789", name: "Naomi Osaka", full_name: "Naomi Osaka" },
  JOV: { id: "14311", name: "Iva Jovic", full_name: "Iva Jovic" },
  MBO: { id: "11219", name: "Victoria Mboko", full_name: "Victoria Mboko" },
  SHN: { id: "8017", name: "Diana Shnaider", full_name: "Diana Shnaider" },
  CIR: { id: "1774", name: "Sorana Cirstea", full_name: "Sorana Cirstea" },
  EAL: { id: "7759", name: "Alexandra Eala", full_name: "Alexandra Eala" },
  ALE: { id: "3182", name: "Ekaterina Alexandrova", full_name: "Ekaterina Alexandrova" },
  MER: { id: "2221", name: "Elise Mertens", full_name: "Elise Mertens" },
  PAO: { id: "2615", name: "Jasmine Paolini", full_name: "Jasmine Paolini" },
  CHW: { id: "3417", name: "Maja Chwalinska", full_name: "Maja Chwalinska" },
  KAL: { id: "2977", name: "Anna Kalinskaya", full_name: "Anna Kalinskaya" },
  KEY: { id: "1556", name: "Madison Keys", full_name: "Madison Keys" },
  POT: { id: "2971", name: "Anastasia Potapova", full_name: "Anastasia Potapova" },
  BOU: { id: "2392", name: "Marie Bouzkova", full_name: "Marie Bouzkova" },
  NAV: { id: "3785", name: "Emma Navarro", full_name: "Emma Navarro" },
  ALI: { id: "3380", name: "Ann Li", full_name: "Ann Li" },
  KRE: { id: "2042", name: "Barbora Krejcikova", full_name: "Barbora Krejcikova" },
  BEJ: { id: "7819", name: "Sara Bejlek", full_name: "Sara Bejlek" },
};

const PLAYER_EMOJI = {
  SAB: "🇧🇾", RYB: "🇰🇿", PEG: "🇺🇸", GAU: "🇺🇸", AND: "🇷🇺",
  NOS: "🇨🇿", MUC: "🇨🇿", SWI: "🇵🇱", SVI: "🇺🇦", ANI: "🇺🇸",
  KOS: "🇺🇦", BEN: "🇨🇭", OSA: "🇯🇵", JOV: "🇺🇸", MBO: "🇨🇦",
  SHN: "🇷🇺", CIR: "🇷🇴", EAL: "🇵🇭", ALE: "🇷🇺", MER: "🇧🇪",
  PAO: "🇮🇹", CHW: "🇵🇱", KAL: "🇷🇺", KEY: "🇺🇸", POT: "🇷🇺",
  BOU: "🇨🇿", NAV: "🇺🇸", ALI: "🇺🇸", KRE: "🇨🇿", BEJ: "🇨🇿",
};

const DEMO_PLAYERS = {
  SAB: { id: "3038", abbreviation: "SAB", name: "Aryna Sabalenka", full_name: "Aryna Sabalenka", conference: "WTA", division: "", rank: 1, points: 8575 },
  RYB: { id: "3126", abbreviation: "RYB", name: "Elena Rybakina", full_name: "Elena Rybakina", conference: "WTA", division: "", rank: 2, points: 8141 },
  GAU: { id: "3626", abbreviation: "GAU", name: "Coco Gauff", full_name: "Coco Gauff", conference: "WTA", division: "", rank: 4, points: 6704 },
};

const DATA_SOURCE = "ESPN public API";

function getSeasonYear() {
  return new Date().getFullYear();
}

// WTA has no per-team logo on ESPN's CDN, so fall back to the tennis icon used
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
        conference: "WTA",
        division: "",
      },
      record: { wins: 0, losses: 0, points: rank.points, season: getSeasonYear() },
      recentGames: [],
      standing: rank.position
        ? { position: rank.position, label: "WTA" }
        : null,
      rankPoints: rank.points,
      previousRank: rank.previous,
      trend: rank.trend,
      lastMatch,
    };
  } catch (error) {
    console.error(`Failed to fetch WTA ranking: ${error.message}`);
    return null;
  }
}

function getDemoData(abbr) {
  const upper = (abbr || "").toUpperCase();
  const player = DEMO_PLAYERS[upper];
  if (!player) return null;
  const { rank = 1, points = 8575 } = player;
  return {
    team: player,
    record: { wins: 0, losses: 0, points, season: getSeasonYear() },
    recentGames: [],
    standing: { position: rank, label: "WTA" },
    rankPoints: points,
    previousRank: rank,
    trend: "-",
    lastMatch: {
      opponent: "Elena Rybakina",
      won: true,
      date: "2026-08-30T15:05:00Z",
      sets: [[6, 4, 6], [3, 6, 2]],
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
