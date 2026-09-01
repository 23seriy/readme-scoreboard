const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");

function validate(directory) {
  const errors = [];
  if (!directory || !Array.isArray(directory.players)) return ["players must be an array"];
  // Only leagues that expose a genuine athlete roster (PLAYER_IDS) may appear
  // in the player directory. A player-entity league without a PLAYER_IDS (e.g.
  // F1, whose entity is "player" but tracks constructors) is excluded, so it is
  // not required to have a roster here.
  const expected = new Set(
    LEAGUES
      .filter(({ entity }) => entity === "player")
      .filter(({ key }) => {
        try { return Boolean(require(`../src/adapters/${key}`).PLAYER_IDS); }
        catch { return false; }
      })
      .map(({ key }) => key),
  );
  const seen = new Set();
  const counts = new Map();
  directory.players.forEach((player) => {
    if (!expected.has(player.league)) errors.push(`unsupported player league: ${player.league}`);
    if (!player.abbreviation || !Number.isFinite(Number(player.id))) errors.push(`invalid player entry: ${JSON.stringify(player)}`);
    const key = `${player.league}:${player.id}`;
    if (seen.has(key)) errors.push(`duplicate player: ${key}`);
    seen.add(key);
    counts.set(player.league, (counts.get(player.league) || 0) + 1);
  });
  expected.forEach((league) => { if (!counts.has(league)) errors.push(`empty player roster: ${league}`); });
  return errors;
}

if (require.main === module) {
  const directory = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../player-directory.json"), "utf8"));
  const errors = validate(directory);
  if (errors.length) { errors.forEach((error) => console.error(`- ${error}`)); process.exitCode = 1; }
  else console.log(`Player directory validation passed for ${directory.players.length} players.`);
}

module.exports = { validate };
