const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");
const directory = require("../team-directory.json");

const categories = Object.fromEntries(LEAGUES.map(({ key, category }) => [key, category]));
const groups = new Map();
LEAGUES.forEach((league) => groups.set(`${league.category}|${league.name}`, []));
directory.teams.forEach((team) => {
  const group = `${categories[team.league] || "Other"}|${team.leagueName}`;
  if (!groups.has(group)) groups.set(group, []);
  groups.get(group).push(team);
});

const lines = ["# Team Directory", "", "Generated from the adapter registries. Use the abbreviation in the `team` input.", ""];
for (const [group, teams] of groups) {
  const [category, leagueName] = group.split("|");
  lines.push(`## ${leagueName}`, "", `**${category}**`, "", "| Team | Abbreviation | ID |", "|------|--------------|----|");
  teams.sort((a, b) => a.abbreviation.localeCompare(b.abbreviation)).forEach((team) => {
    lines.push(`| ${team.name || "—"} | \`${team.abbreviation}\` | ${team.id} |`);
  });
  lines.push("");
}

fs.writeFileSync(path.resolve(__dirname, "../TEAM_DIRECTORY.md"), `${lines.join("\n")}\n`);
