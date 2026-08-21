const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");

const teams = LEAGUES.flatMap((league) => {
  const adapter = require(`../src/adapters/${league.key}`);
  const registry = adapter.ESPN_TEAM_IDS || adapter.TEAM_IDS || {};
  return Object.entries(registry).map(([abbreviation, value]) => ({
    league: league.key,
    leagueName: league.name,
    abbreviation,
    name: typeof value === "object" ? (value.full_name || value.name || null) : null,
    id: typeof value === "object" ? value.id : value,
  }));
});

fs.writeFileSync(
  path.resolve(__dirname, "../team-directory.json"),
  `${JSON.stringify({ generatedFrom: "src/config/leagues.js", teams }, null, 2)}\n`,
);
