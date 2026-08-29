const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");
const { get } = require("../src/http");

function endpointFor(league) {
  return league.endpointOverride?.match(/\((https:\/\/[^)]+)\)/)?.[1]
    || `https://site.api.espn.com/apis/site/v2/sports/${league.endpoint}/teams`;
}

function apiTeams(payload) {
  const teams = payload?.sports?.[0]?.leagues?.[0]?.teams?.map(({ team }) => team) || payload?.teams;
  return Array.isArray(teams) ? teams : [];
}

async function liveNames(league) {
  try {
    const response = await get(endpointFor(league), { timeout: 10000 });
    return new Map(apiTeams(response.data).map((team) => [team.abbreviation, team.displayName || team.name]));
  } catch {
    return new Map();
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
  const names = await liveNames(league);
  return Object.entries(registry).map(([abbreviation, value]) => ({
    league: league.key,
    leagueName: league.name,
    abbreviation,
    name: resolveName(adapter, abbreviation, value, names.get(abbreviation)),
    id: typeof value === "object" ? value.id : value,
  }));
}))).flat();

fs.writeFileSync(
  path.resolve(__dirname, "../team-directory.json"),
  `${JSON.stringify({ generatedFrom: "src/config/leagues.js", generatedAt: new Date().toISOString(), teams }, null, 2)}\n`,
);
}

if (require.main === module) generate().catch((error) => { console.error(error.message); process.exitCode = 1; });

module.exports = { apiTeams, endpointFor, generate, resolveName };
