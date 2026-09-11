const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");
const { render } = require("../src/renderers/markdown");

// Representative examples with demo teams so the showcase is reproducible
// without a live API call. Each entry uses the league's own demo data. The
// set covers every sport category so the gallery demonstrates the range of
// supported boards (basketball, baseball, football, hockey, soccer, college,
// and racing).
const EXAMPLES = [
  { key: "nba", team: "LAL", note: "A live mid-season basketball board with record and recent results." },
  { key: "mlb", team: "NYY", note: "A baseball board." },
  { key: "nfl", team: "BUF", note: "An American football board." },
  { key: "nhl", team: "NYR", note: "An NHL board." },
  { key: "epl", team: "ARS", note: "A top-flight soccer board." },
  { key: "mls", team: "ATL", note: "A Major League Soccer board." },
  { key: "ucl", team: "RMA", note: "A UEFA Champions League board." },
  { key: "ncaaf", team: "ALA", note: "A college football board." },
  { key: "f1", team: "LP", entity: "player", note: "A Formula 1 constructor board (entity: player)." },
  { key: "atp", team: "SIN", entity: "player", note: "A tennis board tracking an individual player (entity: player) — world ranking and last match." },
  { key: "wta", team: "SAB", entity: "player", note: "A women's tennis board tracking an individual player (entity: player) — world ranking and last match." },
];

// Player-spotlight examples: the same board as above plus a Player Spotlight
// block for one athlete on the roster. One entry per league that supports the
// `player:` input, so the gallery proves the feature for each adapter.
// Soccer is represented by several leagues because their stat totals all come
// from the shared base-class game-log aggregation.
const PLAYER_SPOTLIGHT_EXAMPLES = [
  { key: "nba", team: "LAL", player: "Luka Doncic" },
  { key: "mlb", team: "TOR", player: "Vladimir Guerrero Jr." },
  { key: "nfl", team: "KC", player: "Patrick Mahomes" },
  { key: "nhl", team: "NYR", player: "Artemi Panarin" },
  { key: "epl", team: "ARS", player: "Bukayo Saka" },
  { key: "laliga", team: "RMA", player: "Kylian Mbappe" },
  { key: "mls", team: "ATL", player: "Miguel Almiron" },
  { key: "ucl", team: "RMA", player: "Vinicius Junior" },
];

function compactMarkdown(content) {
  return content
    .replace(/^<img[^>]+>\n?/gm, "")
    .replace(/\n\*\*📅 Recent Games:\*\*\n```[\s\S]*?```\n?/g, "\n");
}

// Turn a player name into a filename-safe slug, dropping accents and punctuation
// so "Vladimir Guerrero Jr." becomes "vladimir-guerrero-jr".
function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Build the shields-style badge block the `badge: true` input produces.
function renderBadge(sportName, teams) {
  const lines = [`<p align="center">`];
  teams.forEach((abbr) => {
    lines.push(
      `<img src="https://img.shields.io/badge/${encodeURIComponent(sportName.toUpperCase())}-${encodeURIComponent(abbr)}-orange?style=flat" />`
    );
  });
  lines.push("</p>");
  return lines.join("\n");
}

function renderExample({ key, team, compact = false, title, badge = false, player }) {
  const league = LEAGUES.find((entry) => entry.key === key);
  const adapter = require(`../src/adapters/${key}`);
  const data = adapter.getDemoData(team, player);
  if (!data || !data.team) {
    throw new Error(`No demo data for ${key}/${team}`);
  }
  const abbr = (data.team.abbreviation || team).toUpperCase();
  const emoji = adapter.TEAM_EMOJI?.[abbr] || league.emoji;
  const logoUrl = adapter.getLogoUrl ? adapter.getLogoUrl(abbr) : null;
  if (badge) {
    return renderBadge(league.name, [abbr]);
  }
  const rendered = render(key, { ...data, emoji, logoUrl }, { title, compact });
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
    "## Boards by sport",
    "",
  ];

  for (const example of EXAMPLES) {
    const body = renderExample(example);
    const slug = `${example.key}-${example.team.toLowerCase()}`;
    const file = `${slug}.md`;
    fs.writeFileSync(path.join(examplesDir, file), `${body}\n`);
    const entityLabel = example.entity === "player" ? "player" : "team";
    index.push(`### ${example.key.toUpperCase()} — ${example.team} (${entityLabel})`, "", example.note, "", `[View rendered output →](${file})`, "");
  }

  // Option demonstrations: title, multi-team, compact, and badge.
  const customTitleBody = renderExample({ key: "nba", team: "BOS", title: "My Boston Celtics" });
  fs.writeFileSync(path.join(examplesDir, "custom-title.md"), `${customTitleBody}\n`);
  index.push(
    "## Custom title",
    "",
    "The `title:` input replaces the default `My Favourite <League> Team` heading.",
    "",
    "[View rendered output →](custom-title.md)",
    "",
  );

  const multiTeamBody = ["nba", "mlb", "epl"]
    .map((key) => renderExample({ key, team: EXAMPLES.find((e) => e.key === key).team }).split("\n").slice(1).join("\n"))
    .join("\n\n");
  fs.writeFileSync(path.join(examplesDir, "multi-team.md"), `${multiTeamBody}\n`);
  index.push(
    "## Multi-team",
    "",
    "The `teams:` input renders several boards in one run, each with its own section.",
    "",
    "[View rendered output →](multi-team.md)",
    "",
  );

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

  const badgeBody = renderExample({ key: "epl", team: "ARS", badge: true });
  fs.writeFileSync(path.join(examplesDir, "badge.md"), `${badgeBody}\n`);
  index.push(
    "## Badge mode",
    "",
    "The `badge: true` input renders compact shields-style badges instead of a full board.",
    "",
    "[View rendered output →](badge.md)",
    "",
  );

  // Player spotlight: one example per league that supports the `player:` input.
  index.push(
    "## Player spotlight",
    "",
    "The `player:` input adds a Player Spotlight block for one athlete on the board's roster,",
    "with their season headline stats and most recent game.",
    "Supported for NBA, MLB, NFL, NHL, and every soccer league.",
    "The name must match the roster's exact spelling, including accents.",
    "",
  );
  for (const example of PLAYER_SPOTLIGHT_EXAMPLES) {
    const body = renderExample({ key: example.key, team: example.team, player: example.player });
    const file = `${example.key}-${example.team.toLowerCase()}-${slugify(example.player)}.md`;
    fs.writeFileSync(path.join(examplesDir, file), `${body}\n`);
    index.push(
      `### ${example.key.toUpperCase()} — ${example.player}`,
      "",
      `\`player: ${example.player}\` on \`team: ${example.team}\`.`,
      "",
      `[View rendered output →](${file})`,
      "",
    );
  }

  fs.writeFileSync(path.join(examplesDir, "README.md"), `${index.join("\n")}\n`);
  console.log(`Generated ${EXAMPLES.length + 4 + PLAYER_SPOTLIGHT_EXAMPLES.length} examples into ${examplesDir}`);
}

if (require.main === module) main();

module.exports = { EXAMPLES, PLAYER_SPOTLIGHT_EXAMPLES, renderBadge, renderExample };
