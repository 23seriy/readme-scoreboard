const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");
const { render } = require("../src/renderers/markdown");

// Representative examples with demo teams so the showcase is reproducible
// without a live API call. Each entry uses the league's own demo data.
const EXAMPLES = [
  { key: "nba", team: "LAL", note: "A live mid-season board with record and recent results." },
  { key: "epl", team: "ARS", note: "A top-flight soccer board." },
  { key: "nfl", team: "BUF", note: "An American football board." },
  { key: "nhl", team: "NYR", note: "An NHL board." },
  { key: "mls", team: "ATL", note: "A Major League Soccer board." },
];

function compactMarkdown(content) {
  return content
    .replace(/^<img[^>]+>\n?/gm, "")
    .replace(/\n\*\*📅 Recent Games:\*\*\n```[\s\S]*?```\n?/g, "\n");
}

function renderExample({ key, team, compact = false }) {
  const league = LEAGUES.find((entry) => entry.key === key);
  const adapter = require(`../src/adapters/${key}`);
  const data = adapter.getDemoData(team);
  if (!data || !data.team) {
    throw new Error(`No demo data for ${key}/${team}`);
  }
  const abbr = (data.team.abbreviation || team).toUpperCase();
  const emoji = adapter.TEAM_EMOJI?.[abbr] || league.emoji;
  const logoUrl = adapter.getLogoUrl ? adapter.getLogoUrl(abbr) : null;
  const rendered = render(key, { ...data, emoji, logoUrl });
  return compact ? compactMarkdown(rendered) : rendered;
}

function main() {
  const examplesDir = path.resolve(__dirname, "../examples");
  fs.mkdirSync(examplesDir, { recursive: true });

  const index = [
    "# Examples",
    "",
    "These are the rendered outputs readme-scoreboard writes between your markers.",
    "Each file below is actual action output — open it to see the live-markdown preview.",
    "Run `npm run examples:generate` to refresh these from the current demo data.",
    "",
  ];

  for (const example of EXAMPLES) {
    const body = renderExample(example);
    const slug = `${example.key}-${example.team.toLowerCase()}`;
    const file = `${slug}.md`;
    fs.writeFileSync(path.join(examplesDir, file), `${body}\n`);
    index.push(`## ${example.key.toUpperCase()} — ${example.team}`, "", example.note, "", `[View rendered output →](${file})`, "");
  }

  // Add a compact-mode sample so users can see the smaller output.
  const compactBody = renderExample({ key: "nba", team: "BOS", compact: true });
  fs.writeFileSync(path.join(examplesDir, "compact.md"), `${compactBody}\n`);
  index.push(
    "## Compact mode",
    "",
    "The `compact: true` input produces a smaller block without team logos or recent-game details.",
    "",
    "[View rendered output →](compact.md)",
    "",
  );

  fs.writeFileSync(path.join(examplesDir, "README.md"), `${index.join("\n")}\n`);
  console.log(`Generated ${EXAMPLES.length + 1} examples into ${examplesDir}`);
}

if (require.main === module) main();

module.exports = { EXAMPLES, renderExample };
