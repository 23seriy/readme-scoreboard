const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");

// The player directory lists individual athletes, not teams. A league is
// included when its registry marks it as a player entity AND its adapter
// exposes a dedicated `PLAYER_IDS` roster. This keeps constructors-based
// leagues (e.g. F1, which is `entity: "player"` but tracks teams) out of the
// player directory until they expose a real driver roster.
function playerLeagues() {
  return LEAGUES.filter((league) => {
    if (league.entity !== "player") return false;
    try { return Boolean(require(`../src/adapters/${league.key}`).PLAYER_IDS); }
    catch { return false; }
  });
}

function resolveName(adapter, abbreviation, value) {
  return (typeof value === "object" ? (value.full_name || value.name) : null)
    || adapter.DEMO_TEAMS?.[abbreviation]?.full_name
    || adapter.DEMO_TEAMS?.[abbreviation]?.name
    || abbreviation;
}

async function generate() {
  const players = (await Promise.all(playerLeagues().map(async (league) => {
    const adapter = require(`../src/adapters/${league.key}`);
    const roster = adapter.PLAYER_IDS || {};
    return Object.entries(roster).map(([abbreviation, value]) => ({
      league: league.key,
      leagueName: league.name,
      abbreviation,
      name: resolveName(adapter, abbreviation, value),
      id: typeof value === "object" ? value.id : value,
    }));
  }))).flat().sort((a, b) =>
    a.league.localeCompare(b.league) || a.abbreviation.localeCompare(b.abbreviation));

  fs.writeFileSync(
    path.resolve(__dirname, "../player-directory.json"),
    `${JSON.stringify({ generatedFrom: "src/config/leagues.js", generatedAt: new Date().toISOString(), players }, null, 2)}\n`,
  );
}

if (require.main === module) generate().catch((error) => { console.error(error.message); process.exitCode = 1; });

module.exports = { generate, playerLeagues, resolveName };
