require("dotenv").config();
const { Octokit } = require("@octokit/rest");
const { render } = require("./renderers/markdown");
const { updateReadme, updateReadmeLocal } = require("./updater");
const { LEAGUE_BY_KEY } = require("./config/leagues");
const { validateInputs } = require("./validation");
const { writeStepSummary, writeActionOutputs } = require("./action-summary");

const {
  GH_TOKEN: githubToken,
  SPORT: sport = "nba",
  TEAM: teamAbbr,
  TEAMS: teamsList,
  ENTITY: entityInput,
  TARGET_REPO: targetRepo,
  GITHUB_WORKSPACE: githubWorkspace,
  MARKER: markerName,
  TITLE: title,
  BADGE: badgeMode,
} = process.env;

const isDemo = process.argv.includes("--demo");

function parseDryRun(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["", "false", "0", "no"].includes(normalized)) return false;
  throw new Error(`DRY_RUN must be true or false; received "${value}"`);
}

function parseCompact(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["", "false", "0", "no"].includes(normalized)) return false;
  throw new Error(`COMPACT must be true or false; received "${value}"`);
}

function parseBoolean(value, label = "BADGE") {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["", "false", "0", "no"].includes(normalized)) return false;
  throw new Error(`${label} must be true or false; received "${value}"`);
}

function parseTeams(list, fallback) {
  const values = (list || "").split(",").map((item) => item.trim()).filter(Boolean);
  return values.length > 0 ? values.map((item) => item.toUpperCase()) : [fallback.toUpperCase()];
}

function parseEntity(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized || ["team", "player"].includes(normalized)) return normalized || null;
  throw new Error(`ENTITY must be "team" or "player"; received "${value}"`);
}

function compactMarkdown(content) {
  return content
    .replace(/^<img[^>]+>\n?/gm, "")
    .replace(/\n\*\*📅 Recent Games:\*\*\n```[\s\S]*?```\n?/g, "\n");
}

function buildBadge(sportName, teams, blocks) {
  const lines = [`<p align="center">`];
  teams.forEach((team, index) => {
    const match = blocks[index]?.match(/\(([A-Z]{2,3})\)/);
    const abbr = match ? match[1] : team;
    lines.push(
      `<img src="https://img.shields.io/badge/${encodeURIComponent(sportName.toUpperCase())}-${encodeURIComponent(abbr)}-orange?style=flat" />`
    );
  });
  lines.push("</p>");
  return lines.join("\n");
}

const isDryRun = parseDryRun(process.env.DRY_RUN);
const isCompact = parseCompact(process.env.COMPACT);
const isBadge = parseBoolean(badgeMode, "BADGE");

async function main() {
  const sportName = (sport || "nba").toLowerCase();

  // Load the sport adapter
  let adapter;
  try {
    adapter = require(`./adapters/${sportName}`);
  } catch {
    console.error(`Unsupported sport: "${sportName}". Check the Supported Sports table for available options.`);
    process.exit(1);
    return;
  }

  // Entity type: explicit `entity` input, else inferred from the league's registry
  // entry. Team sports default to "team"; individual sports (tennis, F1) to "player".
  const league = LEAGUE_BY_KEY[sportName];
  const entity = parseEntity(entityInput) || league?.entity || "team";

  const teams = parseTeams(teamsList, teamAbbr || (isDemo ? "LAL" : ""));
  if (teams.length === 0 || !teams[0]) {
    console.error("TEAM environment variable is required. Set the team/player abbreviation, or run with --demo for a preview.");
    process.exit(1);
  }

  console.log(`🏆 ${isDemo ? "[DEMO] " : ""}readme-scoreboard — ${sportName.toUpperCase()} · ${teams.join(", ")} (${entity})`);

  try {
    validateInputs({
      sport: sportName,
      team: teams[0],
      entity,
      isDemo,
      targetRepo,
      adapter,
      supportedSports: Object.keys(LEAGUE_BY_KEY),
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
    return;
  }

  const generatedAt = new Date().toISOString();
  const defaultEmoji = LEAGUE_BY_KEY[sportName]?.emoji || "🏀";
  const blocks = [];

  for (const team of teams) {
    let data;
    if (isDemo) {
      data = adapter.getDemoData(team);
      if (!data || !data.team) {
        console.error(`[DEMO] No demo data for ${sportName.toUpperCase()} ${entity} "${team}".`);
        process.exit(1);
      }
      console.log(`[DEMO] Using sample data for ${data.team.full_name}`);
    } else {
      data = await adapter.fetchData(team);
      if (!data) {
        console.error(`Could not fetch ${entity} data for ${sportName.toUpperCase()} ${entity} "${team}". Check the abbreviation in the Supported Sports section, then try npm run doctor -- --demo.`);
        process.exit(1);
      }
    }

    const emoji = adapter.TEAM_EMOJI[data.team.abbreviation] || defaultEmoji;
    const teamLogoUrl = adapter.getLogoUrl(data.team.abbreviation);
    const logoUrl = teamLogoUrl || LEAGUE_BY_KEY[sportName]?.logo?.light || "";
    const renderData = { ...data, emoji, logoUrl };

    const rendered = render(sportName, renderData, { title });
    blocks.push((isCompact ? compactMarkdown(rendered) : rendered).trimEnd());
  }

  const joined = blocks.join("\n\n---\n\n");
  const content = isBadge
    ? buildBadge(sportName, teams, blocks)
    : `${joined}\n\n_Last updated: ${generatedAt}_`;

  console.log("\n--- Preview ---");
  console.log(content);
  console.log("--- End Preview ---\n");

  // Update profile README (skip in demo and dry-run modes)
  const mode = isDemo ? "preview" : isDryRun ? "dry-run" : "live";
  let updated = false;
  let summaryResult;
  let summaryDestination = targetRepo;
  if (isDemo || isDryRun) {
    const modeLabel = isDemo ? "preview" : "dry run";
    console.log(`⚠️  Skipping README update (${modeLabel} only)`);
    summaryResult = `⏭️ README update skipped (${modeLabel} only)`;
  } else if (githubToken) {
    // Use the GitHub API whenever a token is available. GitHub Actions always
    // sets GITHUB_WORKSPACE, even when no repository has been checked out.
    const octokit = new Octokit({ auth: githubToken });

    let repo = targetRepo;
    if (!repo) {
      const { data: user } = await octokit.users.getAuthenticated();
      repo = `${user.login}/${user.login}`;
      console.log(`ℹ️  No TARGET_REPO set, using profile repo: ${repo}`);
    }

    updated = Boolean(await updateReadme(octokit, repo, content, markerName));
    summaryDestination = repo;
    summaryResult = updated ? "✅ README updated" : "ℹ️ README unchanged";
  } else if (githubWorkspace) {
    // Running locally inside a checked-out repository — write to disk.
    updated = Boolean(updateReadmeLocal(githubWorkspace, content, markerName));
    summaryResult = updated ? "✅ README updated locally" : "ℹ️ README unchanged locally";
  } else {
    console.log("⚠️  Skipping README update (no GITHUB_WORKSPACE or GH_TOKEN)");
    summaryResult = "⏭️ README update skipped (no destination configured)";
  }

  const dataSource = adapter.DATA_SOURCE || (LEAGUE_BY_KEY[sportName]?.endpointOverride ? "official league API" : "ESPN public API");

  writeStepSummary({
    sport: sportName,
    leagueName: LEAGUE_BY_KEY[sportName]?.name,
    team: teams.join(", "),
    mode,
    result: summaryResult,
    targetRepo: summaryDestination,
    dataSource,
    generatedAt,
    staleDataProtected: true,
  });
  writeActionOutputs({ updated, mode, targetRepo: summaryDestination });
}

if (require.main === module) {
  main();
}

module.exports = { main, parseDryRun, parseCompact, parseBoolean, parseTeams, compactMarkdown, buildBadge };
