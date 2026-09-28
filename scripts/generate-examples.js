const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");
const { render } = require("../src/renderers/markdown");
const { compactMarkdown } = require("../src/compact");

// Representative examples built from LIVE league APIs, so the committed boards
// show what the action actually writes rather than a synthetic approximation.
// They used to come from each adapter's `getDemoData`, which is deterministic
// and offline — good properties, but they made the gallery a fiction: the
// college-football board showed an 18-6 record and a 14-2 score in a sport
// where 2 points cannot be scored, and the tennis boards named athletes who had
// left their club.
//
// `npm run examples:generate -- --demo` still renders the offline samples, for
// use when there is no network or when a stable fixture is wanted.
//
// The set covers every sport category so the gallery demonstrates the range of
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
  { key: "nascar", team: "HAM", entity: "player", note: "A NASCAR Cup Series driver's championship position and points (entity: player)." },
  { key: "indycar", team: "PAL", entity: "player", note: "An IndyCar Series driver's championship position and points (entity: player)." },
];

// Player-spotlight examples: the same board as above plus a Player Spotlight
// block for one athlete on the roster. One entry per league that supports the
// `player:` input, so the gallery proves the feature for each adapter.
// Soccer is represented by several leagues because their stat totals all come
// from the shared base-class game-log aggregation.
//
// A name here must resolve live, because the board is generated from the
// league's current roster. `npm run smoke:demo` checks the offline samples
// instead, so a roster move shows up here rather than silently in a fixture.
const PLAYER_SPOTLIGHT_EXAMPLES = [
  { key: "nba", team: "LAL", player: "Luka Doncic" },
  { key: "wnba", team: "MIN", player: "Napheesa Collier" },
  { key: "ncaab", team: "ARIZ", player: "Dwayne Aristode" },
  { key: "ncaaw", team: "UCONN", player: "KK Arnold" },
  { key: "mlb", team: "TOR", player: "Vladimir Guerrero Jr." },
  { key: "nfl", team: "KC", player: "Patrick Mahomes" },
  // Panarin left the Rangers, so the board is generated from the live roster
  // and this must be a current player or generation fails.
  { key: "nhl", team: "NYR", player: "Mika Zibanejad" },
  { key: "epl", team: "ARS", player: "Bukayo Saka" },
  // Accents must match ESPN's spelling exactly: the roster lookup is by name,
  // so "Kylian Mbappe" does not find "Kylian Mbappé".
  { key: "laliga", team: "RMA", player: "Kylian Mbappé" },
  { key: "mls", team: "ATL", player: "Miguel Almirón" },
  { key: "ucl", team: "RMA", player: "Vinícius Júnior" },
];

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

/**
 * Fetch the data for one example, live by default.
 *
 * Mirrors the enrichment `src/index.js` performs so the committed board is the
 * same string the action writes: adapter emoji, then the team logo, then the
 * league logo as a last resort. Skipping that here would produce boards that
 * differ from the action's own output in ways the gallery would not reveal.
 */
async function loadData({ key, team, player }, options = {}) {
  const adapter = require(`../src/adapters/${key}`);
  if (options.demo) {
    const demoData = adapter.getDemoData(team, player);
    if (!demoData || !demoData.team) throw new Error(`No demo data for ${key}/${team}`);
    return demoData;
  }
  const data = await adapter.fetchData(team);
  if (!data || !data.team) {
    throw new Error(`No live data for ${key}/${team}. Check the abbreviation is in TEAM_IDS.`);
  }
  if (player) {
    data.spotlight = await adapter.fetchPlayerSpotlight(team, player);
  }
  return data;
}

async function renderExample(example, options) {
  const { key, team, compact = false, title, badge = false } = example;
  const league = LEAGUES.find((entry) => entry.key === key);
  const adapter = require(`../src/adapters/${key}`);
  const data = await loadData(example, options);
  const abbr = (data.team.abbreviation || team).toUpperCase();
  const emoji = adapter.TEAM_EMOJI?.[abbr] || league.emoji;
  const teamLogoUrl = adapter.getLogoUrl ? adapter.getLogoUrl(abbr) : null;
  const logoUrl = teamLogoUrl || league.logo?.light || "";
  if (badge) {
    return renderBadge(league.name, [abbr]);
  }
  const rendered = render(key, { ...data, emoji, logoUrl }, { title, compact });
  return compact ? compactMarkdown(rendered) : rendered;
}

/**
 * Render one example from its OFFLINE sample data, synchronously.
 *
 * `renderExample` is async and hits the network by default, so it cannot be
 * used to render a stable fixture. This keeps the deterministic path available
 * — `tests/adapters/demo-consistency.test.js` hashes every board across five
 * timezones, which only means something if the content is fixed. Passing the
 * async function where a string is expected does NOT fail loudly: it hashes
 * "[object Promise]" for every entry and the test passes without checking
 * anything.
 */
function renderDemoExample(example) {
  const { key, team, compact = false, title, badge = false, player } = example;
  const league = LEAGUES.find((entry) => entry.key === key);
  const adapter = require(`../src/adapters/${key}`);
  const data = adapter.getDemoData(team, player);
  if (!data || !data.team) throw new Error(`No demo data for ${key}/${team}`);
  const abbr = (data.team.abbreviation || team).toUpperCase();
  const emoji = adapter.TEAM_EMOJI?.[abbr] || league.emoji;
  const logoUrl = (adapter.getLogoUrl ? adapter.getLogoUrl(abbr) : null) || league.logo?.light || "";
  if (badge) return renderBadge(league.name, [abbr]);
  const rendered = render(key, { ...data, emoji, logoUrl }, { title, compact });
  return compact ? compactMarkdown(rendered) : rendered;
}

async function main() {
  const examplesDir = path.resolve(__dirname, "../examples");
  fs.mkdirSync(examplesDir, { recursive: true });

  // Live by default. `--demo` renders the offline samples instead, which is
  // what a network-less or rate-limited environment wants, and what the
  // byte-stability check in `tests/adapters/demo-consistency.test.js` covers.
  const demo = process.argv.includes("--demo");
  const options = { demo };

  const index = [
    "# Examples",
    "",
    "These are the rendered outputs readme-scoreboard writes between your markers.",
    demo
      ? "Each file below is generated from the action's OFFLINE SAMPLE DATA, so the figures are illustrative rather than real."
      : "Each file below is generated from the leagues' LIVE APIs, so the figures are real as of the date at the end of each board.",
    "Run `npm run examples:generate` to refresh them. Add `-- --demo` for the offline samples.",
    "",
    "## Boards by sport",
    "",
  ];

  for (const example of EXAMPLES) {
    const body = await renderExample(example, options);
    const slug = `${example.key}-${example.team.toLowerCase()}`;
    const file = `${slug}.md`;
    fs.writeFileSync(path.join(examplesDir, file), `${body}\n`);
    const entityLabel = example.entity === "player" ? "player" : "team";
    index.push(`### ${example.key.toUpperCase()} — ${example.team} (${entityLabel})`, "", example.note, "", `[View rendered output →](${file})`, "");
  }

  // Option demonstrations: title, multi-team, compact, and badge.
  const customTitleBody = await renderExample({ key: "nba", team: "BOS", title: "My Boston Celtics" }, options);
  fs.writeFileSync(path.join(examplesDir, "custom-title.md"), `${customTitleBody}\n`);
  index.push(
    "## Custom title",
    "",
    "The `title:` input replaces the default `My Favourite <League> Team` heading.",
    "",
    "[View rendered output →](custom-title.md)",
    "",
  );

  const multiTeamBody = (
    await Promise.all(
      ["nba", "mlb", "epl"].map(async (key) => {
        const body = await renderExample({ key, team: EXAMPLES.find((e) => e.key === key).team }, options);
        // Drop the leading `<picture>` logo heading so the three boards read as
        // one document rather than repeating the section header each time.
        return body.split("\n").slice(1).join("\n");
      })
    )
  ).join("\n\n");
  fs.writeFileSync(path.join(examplesDir, "multi-team.md"), `${multiTeamBody}\n`);
  index.push(
    "## Multi-team",
    "",
    "The `teams:` input renders several boards in one run, each with its own section.",
    "",
    "[View rendered output →](multi-team.md)",
    "",
  );

  const compactBody = await renderExample({ key: "nba", team: "BOS", compact: true }, options);
  fs.writeFileSync(path.join(examplesDir, "compact.md"), `${compactBody}\n`);
  index.push(
    "## Compact mode",
    "",
    "The `compact: true` input produces a smaller block without team logos or recent-game details.",
    "",
    "[View rendered output →](compact.md)",
    "",
  );

  const badgeBody = await renderExample({ key: "epl", team: "ARS", badge: true }, options);
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
    const body = await renderExample({ key: example.key, team: example.team, player: example.player }, options);
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
  console.log(
    `Generated ${EXAMPLES.length + 4 + PLAYER_SPOTLIGHT_EXAMPLES.length} examples into ${examplesDir}${demo ? " (offline samples)" : " (live data)"}`
  );
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Could not generate the examples: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { EXAMPLES, PLAYER_SPOTLIGHT_EXAMPLES, renderBadge, renderExample, renderDemoExample };
