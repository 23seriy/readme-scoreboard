const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");

function validate(directory) {
  const errors = [];
  if (!directory || !Array.isArray(directory.teams)) return ["teams must be an array"];
  const expected = new Set(LEAGUES.filter(({ key }) => {
    const adapter = require(`../src/adapters/${key}`);
    return Object.keys(adapter.ESPN_TEAM_IDS || adapter.TEAM_IDS || {}).length > 0;
  }).map(({ key }) => key));
  const seen = new Set();
  const counts = new Map();
  directory.teams.forEach((team) => {
    if (!expected.has(team.league)) errors.push(`unsupported league: ${team.league}`);
    if (!team.abbreviation || !Number.isFinite(Number(team.id))) errors.push(`invalid team entry: ${JSON.stringify(team)}`);
    const key = `${team.league}:${team.abbreviation}`;
    if (seen.has(key)) errors.push(`duplicate team: ${key}`);
    seen.add(key);
    counts.set(team.league, (counts.get(team.league) || 0) + 1);
  });
  expected.forEach((league) => { if (!counts.has(league)) errors.push(`empty roster: ${league}`); });
  return errors;
}

if (require.main === module) {
  const directory = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../team-directory.json"), "utf8"));
  const errors = validate(directory);
  if (errors.length) { errors.forEach((error) => console.error(`- ${error}`)); process.exitCode = 1; }
  else console.log(`Team directory validation passed for ${directory.teams.length} teams.`);
}

module.exports = { validate };
