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

async function generate() {
const teams = (await Promise.all(LEAGUES.map(async (league) => {
  const adapter = require(`../src/adapters/${league.key}`);
  const registry = adapter.ESPN_TEAM_IDS || adapter.TEAM_IDS || {};
  const live = await liveTeams(league);

  // When the live roster is larger than the hardcoded registry (college and
  // UEFA tournament leagues), prefer the complete live list so the directory
  // isn't missing teams. Otherwise keep the adapter's own roster as the
  // authoritative source. Any hardcoded teams the live endpoint omits are
  // appended so we never drop a supported team.
  let source;
  if (live.length > Object.keys(registry).length) {
    const liveIds = new Set(live.map((t) => String(t.id)));
    const registryTeams = Object.entries(registry).map(([abbreviation, value]) => ({
      abbreviation,
      name: resolveName(adapter, abbreviation, value, null),
      id: typeof value === "object" ? value.id : value,
    }));
    const extra = registryTeams.filter((t) => !liveIds.has(String(t.id)));
    source = [...live, ...extra];
  } else {
    source = Object.entries(registry).map(([abbreviation, value]) => ({
      abbreviation,
      name: resolveName(adapter, abbreviation, value, null),
      id: typeof value === "object" ? value.id : value,
    }));
  }

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

module.exports = { apiTeams, endpointFor, generate, resolveName, teamListUrl };
