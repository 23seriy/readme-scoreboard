const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");

function validate(directory) {
  const errors = [];
  if (!directory || !Array.isArray(directory.teams)) return ["teams must be an array"];
  // Every supported league must have a roster in the directory. Some leagues
  // (e.g. Belgian Pro League) have no static TEAM_IDS and rely on live roster
  // lookup, but the generated directory still includes them.
  const expected = new Set(LEAGUES.filter((league) => league.entity !== "player").map(({ key }) => key));
  const seen = new Set();
  const counts = new Map();
  directory.teams.forEach((team) => {
    if (!expected.has(team.league)) errors.push(`unsupported league: ${team.league}`);
    if (!team.abbreviation || !Number.isFinite(Number(team.id))) errors.push(`invalid team entry: ${JSON.stringify(team)}`);
    // Abbreviations can legitimately collide within a league (e.g. two clubs
    // share `CEL` or `RIV`), so the uniqueness key includes the team id.
    const key = `${team.league}:${team.id}`;
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
