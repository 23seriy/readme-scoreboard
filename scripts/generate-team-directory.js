const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");
const { get } = require("../src/http");

// These leagues carry hundreds (or draw-determined sets) of teams, so we ask
// for the full roster rather than the default page. Their hardcoded TEAM_IDS
// only lists a handful of entries, which made the generated directory look
// incomplete.
const FULL_ROSTER_KEYS = new Set(["ncaab", "ncaaw", "ncaaf", "ncaa_hockey"]);

function endpointFor(league) {
  return league.endpointOverride?.match(/\((https:\/\/[^)]+)\)/)?.[1]
    || `https://site.api.espn.com/apis/site/v2/sports/${league.endpoint}/teams`;
}

function apiTeams(payload) {
  const teams = payload?.sports?.[0]?.leagues?.[0]?.teams?.map(({ team }) => team) || payload?.teams;
  return Array.isArray(teams) ? teams : [];
}

// The endpoint URL for a league's team list. Collegiate leagues expose the
// full roster behind `?limit=1000`; everything else uses the default page
// (which already returns the complete set for fixed-size leagues).
function teamListUrl(league) {
  const base = endpointFor(league);
  if (FULL_ROSTER_KEYS.has(league.key)) {
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}limit=1000`;
  }
  return base;
}

async function liveTeams(league) {
  try {
    const response = await get(teamListUrl(league), { timeout: 10000 });
    return apiTeams(response.data).map((team) => ({
      abbreviation: team.abbreviation,
      name: team.displayName || team.name,
      id: team.id,
    }));
  } catch {
    return [];
  }
}

// Resolve a team's display name, falling back through known sources so the
// generated directory never contains a null name. When a live API request
// fails or omits a name (e.g. a transient UEFA endpoint hiccup), we prefer the
// adapter's demo data, then the abbreviation itself, so the human-readable
// table never degrades to an empty cell.
function resolveName(adapter, abbreviation, value, live) {
  return live
    || (typeof value === "object" ? (value.full_name || value.name) : null)
    || adapter.DEMO_TEAMS?.[abbreviation]?.full_name
    || adapter.DEMO_TEAMS?.[abbreviation]?.name
    || abbreviation;
}

// Merge the adapter's static registry with the live roster. We prefer the live
// name whenever the API returns a proper (non-abbreviation) name — e.g. NBA
// returns "Atlanta Hawks", not just "ATL" — so the directory shows real team
// names instead of abbreviations. The registry's abbreviation is kept whenever
// the live entry omits one (e.g. F1's Audi/Cadillac), and any live teams not in
// the registry are appended so we never miss a team.
function mergeRosters(registryTeams, live) {
  const liveById = new Map(live.map((t) => [String(t.id), t]));

  const source = registryTeams.map((entry) => {
    const liveEntry = liveById.get(String(entry.id));
    if (liveEntry && liveEntry.name && liveEntry.name !== liveEntry.abbreviation) {
      return {
        abbreviation: liveEntry.abbreviation || entry.abbreviation,
        name: liveEntry.name,
        id: liveEntry.id,
      };
    }
    return entry;
  });

  const registryIds = new Set(source.map((t) => String(t.id)));
  const extraLive = live
    .filter((t) => !registryIds.has(String(t.id)))
    .map((t) => ({ ...t, abbreviation: t.abbreviation || t.name }));
  source.push(...extraLive);

  return source;
}

async function generate() {
const teams = (await Promise.all(LEAGUES.filter((league) => league.entity !== "player").map(async (league) => {
  const adapter = require(`../src/adapters/${league.key}`);
  const registry = adapter.ESPN_TEAM_IDS || adapter.TEAM_IDS || {};
  const live = await liveTeams(league);

  const registryTeams = Object.entries(registry).map(([abbreviation, value]) => ({
    abbreviation,
    name: resolveName(adapter, abbreviation, value, null),
    id: typeof value === "object" ? value.id : value,
  }));

  const source = mergeRosters(registryTeams, live);

  return source.map((t) => ({
    league: league.key,
    leagueName: league.name,
    abbreviation: t.abbreviation,
    name: t.name,
    id: t.id,
  }));
}))).flat();

fs.writeFileSync(
  path.resolve(__dirname, "../team-directory.json"),
  `${JSON.stringify({ generatedFrom: "src/config/leagues.js", generatedAt: new Date().toISOString(), teams }, null, 2)}\n`,
);
}

if (require.main === module) generate().catch((error) => { console.error(error.message); process.exitCode = 1; });

module.exports = { apiTeams, endpointFor, generate, mergeRosters, resolveName, teamListUrl };
