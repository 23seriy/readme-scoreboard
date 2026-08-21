const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");
const directory = require("../team-directory.json");

const lines = ["# League Workflow Examples", "", "Copy a step below into your workflow. Add a matching marker pair to your README first.", ""];
LEAGUES.forEach((league) => {
  const team = directory.teams.find(({ league: key }) => key === league.key);
  const fallback = team || { abbreviation: Object.keys(require(`../src/adapters/${league.key}`).DEMO_TEAMS || {})[0] };
  if (!fallback.abbreviation) return;
  lines.push(`## ${league.name}`, "", "```yaml", "- uses: 23seriy/readme-scoreboard@v1", "  with:", "    gh_token: ${{ secrets.GH_TOKEN }}", "    target_repo: ${{ github.repository }}", `    sport: ${league.key}`, `    team: ${fallback.abbreviation}`, `    marker: readme-scoreboard-${league.key}`, "```", "");
});

fs.writeFileSync(path.resolve(__dirname, "../LEAGUE_WORKFLOW_EXAMPLES.md"), `${lines.join("\n")}\n`);
