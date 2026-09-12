// Shared helpers for deterministic sample ("demo") data.
//
// Demo boards are committed as generated examples, so they must be identical
// on every run regardless of the wall clock. Every value below is derived from
// a seed instead of Math.random()/Date.now(), and records are derived *from*
// the same game log that is displayed, so a board can never advertise a record
// that contradicts the games printed beneath it.

// Fixed "today" for demo data. Chosen mid-season so a full-season board looks
// realistic without drifting as the real clock advances.
const DEMO_NOW = new Date("2026-01-04T00:00:00Z");

const DAY_MS = 24 * 60 * 60 * 1000;

function dateOffset(days, from = DEMO_NOW) {
  return new Date(from.getTime() + days * DAY_MS).toISOString();
}

// Seeded 32-bit xorshift. Only needs to be stable and reasonably well spread.
function makeRng(seed) {
  let state = seed >>> 0 || 1;
  return function next() {
    state ^= state << 13; state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5; state >>>= 0;
    return state / 0x100000000;
  };
}

// FNV-1a string hash, used to turn a team/player abbreviation into a seed.
function seedFromString(value) {
  let hash = 2166136261;
  for (const ch of String(value)) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Deterministic shuffle: sorting by a seeded key avoids mutating the input.
function seededShuffle(items, rng) {
  return [...items]
    .map((item) => ({ item, key: rng() }))
    .sort((a, b) => a.key - b.key)
    .map((entry) => entry.item);
}

// Build a full, internally consistent game log for a team.
//
// `wins`/`losses`/`draws` describe the WHOLE log; the caller displays only the
// most recent slice. Because the record is counted from this same array, the
// headline totals always reconcile with the results shown.
function buildGameLog({
  seed,
  opponents,
  wins,
  losses,
  draws = 0,
  scoreRange,
  reverse = false,
}) {
  const rng = makeRng(seedFromString(seed));
  const results = seededShuffle(
    [
      ...Array.from({ length: wins }, () => "win"),
      ...Array.from({ length: losses }, () => "loss"),
      ...Array.from({ length: draws }, () => "draw"),
    ],
    rng
  );
  const pool = seededShuffle(opponents, rng);
  const total = results.length;

  // A pure shuffle can clump all the wins at the end of the season, which makes
  // the displayed slice look nothing like the overall record (e.g. a 18-6-6
  // team showing five straight wins). Deal the "special" results out across the
  // season first, then fill the gaps, so any slice is representative.
  const specials = results.filter((r) => r !== "win");
  const slots = [];
  for (let i = 0; i < specials.length; i += 1) {
    slots.push(Math.floor(((i + 0.5) * total) / specials.length));
  }
  const arranged = new Array(total).fill("win");
  const usedSlots = new Set();
  specials.forEach((result, i) => {
    let slot = slots[i];
    while (usedSlots.has(slot)) slot = (slot + 1) % total;
    usedSlots.add(slot);
    arranged[slot] = result;
  });

  const log = arranged.map((result, index) => {
    const [teamLow, teamHigh] = scoreRange.team;
    const [oppLow, oppHigh] = scoreRange.opponent;
    const low = result === "win" ? teamLow : oppLow;
    const high = result === "win" ? teamHigh : oppHigh;
    const teamScore = low + Math.floor(rng() * (high - low + 1));
    const oppScore = result === "win"
      ? Math.max(0, teamScore - (1 + Math.floor(rng() * 13)))
      : result === "loss"
        ? teamScore + 1 + Math.floor(rng() * 13)
        : teamScore;
    const d = new Date(DEMO_NOW);
    d.setUTCDate(d.getUTCDate() - (total - 1 - index) * 7);
    return {
      date: d.toISOString(),
      teamScore,
      oppScore,
      oppAbbr: pool[index % pool.length],
      isHome: rng() > 0.5,
      result,
      won: result === "win",
      drew: result === "draw",
    };
  });

  if (reverse) log.reverse();
  return log;
}

// Count W/L(/D) totals straight from a game log.
function recordFromGames(games, season) {
  const wins = games.filter((g) => g.won).length;
  const losses = games.filter((g) => !g.won && !g.drew).length;
  const draws = games.filter((g) => g.drew).length;
  const played = wins + losses + draws;
  const record = {
    wins,
    losses,
    season,
  };
  if (draws > 0) record.draws = draws;
  record.winPct = played > 0 ? (wins / played).toFixed(3) : ".000";
  return record;
}

// Convert a raw game-log entry into the shape renderers expect. Doing this in
// one place stops adapters from drifting: the NFL demo used to hand the
// renderer bare log objects, which produced "Invalid Date" and blank scores.
function toRendererGame(game, team) {
  const homeScore = game.isHome ? game.teamScore : game.oppScore;
  const awayScore = game.isHome ? game.oppScore : game.teamScore;
  return {
    date: game.date,
    status: "Final",
    home_team: {
      id: game.isHome ? team.id : 0,
      abbreviation: game.isHome ? team.abbreviation : game.oppAbbr,
    },
    visitor_team: {
      id: game.isHome ? 0 : team.id,
      abbreviation: game.isHome ? game.oppAbbr : team.abbreviation,
    },
    home_team_score: homeScore,
    visitor_team_score: awayScore,
    teamScore: game.teamScore,
    oppScore: game.oppScore,
    oppAbbr: game.oppAbbr,
    isHome: game.isHome,
    won: game.won,
    drew: game.drew,
  };
}

// A league's DEMO_TEAMS table is often only 2–6 entries (one per gallery
// example), which is too few to fill a full season without repeating. These
// extras pad the opponent pool so recent games and the next fixture can all
// name different teams. They are only ever used as opponents — never as the
// subject of a board.
const DEMO_OPPONENT_POOLS = {
  baseball: ["SEA", "ATL", "PHI", "SD", "TB", "MIL", "BAL", "CLE", "MIN", "TEX"],
  hockey: ["COL", "VGK", "CAR", "FLA", "TBL", "DAL", "WPG", "MIN", "SEA", "PIT"],
  soccer: ["MNC", "NEW", "TOT", "CHE", "BHA", "AVL", "WHU", "EVE"],
  "usa.1": ["SEA", "POR", "ATX", "DAL", "HOU", "CLB", "PHI", "CIN"],
  "uefa.champions": ["MCI", "BAY", "INT", "PSG", "DOR", "POR", "BEN", "NAP"],
  "esp.1": ["SEV", "BET", "VIL", "RSO", "ATH", "CEL", "GIR", "OSA"],
  "college-football": ["UGA", "OSU", "MICH", "TEX", "OU", "LSU", "CLEM", "ORE", "PSU", "FSU"],
  basketball: ["BOS", "DEN", "GSW", "PHX", "MIL", "NYK", "CLE", "DAL", "MIA", "OKC"],
};

// Pick a pool for an explicit sport key, falling back through known keys.
function opponentPool(keys, fallback = []) {
  for (const key of keys) {
    if (key && DEMO_OPPONENT_POOLS[key]) return DEMO_OPPONENT_POOLS[key];
  }
  return fallback;
}

// Structural invariants every sample board must satisfy. Used by the test suite
// so a future adapter can't reintroduce the "fabricated record" class of bug.
function checkDemoConsistency(data) {
  const problems = [];
  if (!data) return ["no data returned"];

  const games = data.recentGames || [];
  const record = data.record || {};

  // 1. The displayed games must not contradict the headline record: a record of
  //    N games can't have fewer than the games shown.
  const played = (record.wins || 0) + (record.losses || 0) + (record.draws || 0);
  if (played > 0 && games.length > played) {
    problems.push(`shows ${games.length} games but record covers only ${played}`);
  }

  // 2. The upcoming opponent must be something other than a team just played.
  if (data.nextGame?.opponent && games.some((g) => g.oppAbbr === data.nextGame.opponent)) {
    problems.push(`next opponent ${data.nextGame.opponent} also appears in recent games`);
  }

  // 3. The spotlight's last game must be one of the team's own recent games.
  const spotlight = data.spotlight;
  if (spotlight?.lastGame && games.length) {
    const dates = new Set(games.map((g) => String(g.date).slice(0, 10)));
    if (!dates.has(String(spotlight.lastGame.date).slice(0, 10))) {
      problems.push("spotlight last-game date matches no recent game");
    }
  }

  return problems;
}

module.exports = {
  DAY_MS,
  DEMO_NOW,
  DEMO_OPPONENT_POOLS,
  buildGameLog,
  checkDemoConsistency,
  dateOffset,
  makeRng,
  opponentPool,
  recordFromGames,
  seedFromString,
  seededShuffle,
  toRendererGame,
};
