const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");
const directory = require("../player-directory.json");

const categories = Object.fromEntries(LEAGUES.map(({ key, category }) => [key, category]));
const groups = new Map();
directory.players.forEach((player) => {
  const group = `${categories[player.league] || "Other"}|${player.leagueName}`;
  if (!groups.has(group)) groups.set(group, []);
  groups.get(group).push(player);
});

const lines = ["# Player Directory", "", "Generated from the adapter registries. Use the abbreviation in the `team` input (with `entity: player`).", ""];
for (const [group, players] of groups) {
  const [category, leagueName] = group.split("|");
  lines.push(`## ${leagueName}`, "", `**${category}**`, "", "| Player | Abbreviation | ID |", "|--------|--------------|----|");
  players.sort((a, b) => a.abbreviation.localeCompare(b.abbreviation)).forEach((player) => {
    lines.push(`| ${player.name || "—"} | \`${player.abbreviation}\` | ${player.id} |`);
  });
  lines.push("");
}

fs.writeFileSync(path.resolve(__dirname, "../PLAYER_DIRECTORY.md"), `${lines.join("\n")}\n`);
