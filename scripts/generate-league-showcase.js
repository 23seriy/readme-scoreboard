const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");
const { render } = require("../src/renderers/markdown");
const directory = require("../team-directory.json");

// One combined file per league (not per sport category) showing every
// rendering option: default board, custom title, compact mode, and badge
// mode, all built from live API data. Regenerate with `npm run
// leagues:showcase`; the daily workflow re-runs this and opens a PR when
// live data has moved the output.
//
// IMPORTANT: whenever a new league is added to src/config/leagues.js, run
// `npm run leagues:showcase` (or let the daily workflow pick it up) so this
// gallery covers it too.

function compactMarkdown(content) {
  return content
    .replace(/^<img[^>]+>\n?/gm, "")
    .replace(/\n\*\*📅 Recent Games:\*\*\n```[\s\S]*?```\n?/g, "\n");
}

function renderBadge(sportName, abbr) {
  return [
    `<p align="center">`,
    `<img src="https://img.shields.io/badge/${encodeURIComponent(sportName.toUpperCase())}-${encodeURIComponent(abbr)}-orange?style=flat" />`,
    `</p>`,
  ].join("\n");
}

function pickDemoTeam(league) {
  const fromDirectory = directory.teams.find((t) => t.league === league.key);
  if (fromDirectory) return fromDirectory.abbreviation;
  const adapter = require(`../src/adapters/${league.key}`);
  const fallback = Object.keys(adapter.DEMO_TEAMS || {})[0];
  if (!fallback) throw new Error(`No demo team available for league ${league.key}`);
  return fallback;
}

async function buildLeagueShowcase(league) {
  const adapter = require(`../src/adapters/${league.key}`);
  const abbr = pickDemoTeam(league);

  let data;
  try {
    data = await adapter.fetchData(abbr);
  } catch (error) {
    console.warn(`⚠️  Live fetch failed for ${league.key}/${abbr}, falling back to demo data: ${error.message}`);
  }
  if (!data || !data.team) {
    data = adapter.getDemoData(abbr);
  }
  if (!data || !data.team) {
    throw new Error(`No data available for ${league.key}/${abbr}`);
  }

  const resolvedAbbr = (data.team.abbreviation || abbr).toUpperCase();
  const emoji = adapter.TEAM_EMOJI?.[resolvedAbbr] || league.emoji;
  const logoUrl = adapter.getLogoUrl ? adapter.getLogoUrl(resolvedAbbr) : null;
  const renderData = { ...data, emoji, logoUrl };

  const defaultBoard = render(league.key, renderData, {});
  const customTitleBoard = render(league.key, renderData, { title: `My ${data.team.full_name || resolvedAbbr}` });
  const compactBoard = compactMarkdown(defaultBoard);
  const badgeBoard = renderBadge(league.name, resolvedAbbr);

  const entityLabel = league.entity === "player" ? "player" : "team";

  return [
    `# ${league.name} (${league.key})`,
    "",
    `${entityLabel[0].toUpperCase()}${entityLabel.slice(1)}: **${resolvedAbbr}** · Category: ${league.category} · Data source: ${adapter.DATA_SOURCE || (league.endpointOverride ? "official league API" : "ESPN public API")}`,
    "",
    "## Default",
    "",
    defaultBoard,
    "",
    "## Custom title",
    "",
    "The `title:` input replaces the default heading.",
    "",
    customTitleBoard,
    "",
    "## Compact mode",
    "",
    "The `compact: true` input drops the logo and recent-game details.",
    "",
    compactBoard,
    "",
    "## Badge mode",
    "",
    "The `badge: true` input renders a shields-style badge instead of a full board.",
    "",
    badgeBoard,
    "",
  ].join("\n");
}

async function main() {
  const showcaseDir = path.resolve(__dirname, "../examples/leagues");
  fs.mkdirSync(showcaseDir, { recursive: true });

  const index = [
    "# League Showcase",
    "",
    "One file per supported league, generated from live API data, demonstrating",
    "every rendering option (default, custom title, compact, badge) so you can",
    "review and verify output before wiring up a real workflow.",
    "",
    "Run `npm run leagues:showcase` to refresh these. A daily workflow also runs",
    "this automatically and opens a PR when live data changes the output.",
    "",
    "**Whenever a new league is added to `src/config/leagues.js`, regenerate this",
    "gallery** so the new league gets its own showcase file.",
    "",
    "## Leagues",
    "",
  ];

  for (const league of LEAGUES) {
    const body = await buildLeagueShowcase(league);
    const file = `${league.key}.md`;
    fs.writeFileSync(path.join(showcaseDir, file), `${body}\n`);
    index.push(`- [${league.name}](${file}) — ${league.category}`);
  }

  fs.writeFileSync(path.join(showcaseDir, "README.md"), `${index.join("\n")}\n`);
  console.log(`Generated ${LEAGUES.length} league showcase files into ${showcaseDir}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { buildLeagueShowcase, renderBadge, compactMarkdown };
