const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");

// Clubs whose real name genuinely is their initials, verified against
// ESPN's displayName for each (the live roster and the team-detail endpoint
// both report the abbreviation as the name). These are the only rows allowed
// to have name === abbreviation; anything else is a generator failure that
// must fail validation rather than ship (see the PR #512 "CON" regression).
//   PAOK   PAOK FC (Thessaloniki)
//   AGF    Aarhus Gymnastikforening — branded AGF
//   AIK    Allmänna Idrottsklubben — branded AIK
//   GAIS   Göteborgs Atlet- och Idrottssällskap — branded GAIS
//   AVS    AVS Futebol SAD — branded AVS
const NAME_EQUALS_ABBREVIATION_ALLOWLIST = new Set([
  "greek:PAOK",
  "denmark:AGF",
  "sweden:AIK",
  "sweden:GAIS",
  "primeiraliga:AVS",
]);

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
    if (typeof team.name !== "string" || team.name.trim().length === 0) {
      errors.push(`missing team name: ${JSON.stringify(team)}`);
    } else if (team.name === team.abbreviation
      && !NAME_EQUALS_ABBREVIATION_ALLOWLIST.has(`${team.league}:${team.abbreviation}`)) {
      errors.push(`team name is just the abbreviation: ${JSON.stringify(team)}`);
    }
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

module.exports = { validate, NAME_EQUALS_ABBREVIATION_ALLOWLIST };
