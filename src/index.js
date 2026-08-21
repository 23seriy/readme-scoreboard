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
  TARGET_REPO: targetRepo,
  GITHUB_WORKSPACE: githubWorkspace,
  MARKER: markerName,
} = process.env;

const isDemo = process.argv.includes("--demo");

function parseDryRun(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["", "false", "0", "no"].includes(normalized)) return false;
  throw new Error(`DRY_RUN must be true or false; received "${value}"`);
}

const isDryRun = parseDryRun(process.env.DRY_RUN);

async function main() {
  if (!teamAbbr && !isDemo) {
    console.error("TEAM environment variable is required. Set the team abbreviation, or run with --demo for a preview.");
    process.exit(1);
  }

  const sportName = (sport || "nba").toLowerCase();
  const team = (teamAbbr || "LAL").toUpperCase();

  console.log(`🏆 ${isDemo ? "[DEMO] " : ""}readme-scoreboard — ${sportName.toUpperCase()} · ${team}`);

  // Load the sport adapter
  let adapter;
  try {
    adapter = require(`./adapters/${sportName}`);
  } catch {
    console.error(`Unsupported sport: "${sportName}". Check the Supported Sports table for available options.`);
    process.exit(1);
    return;
  }

  try {
    validateInputs({
      sport: sportName,
      team,
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

  // Fetch data (live or demo)
  let data;
  if (isDemo) {
    data = adapter.getDemoData(team);
    console.log(`[DEMO] Using sample data for ${data.team.full_name}`);
  } else {
    data = await adapter.fetchData(team);
    if (!data) {
      console.error(`Could not fetch team data for ${sportName.toUpperCase()} team "${team}". Check the abbreviation in the Supported Sports section, then try npm run doctor -- --demo.`);
      process.exit(1);
    }
  }

  // Add sport-specific metadata for the renderer
  const defaultEmoji = LEAGUE_BY_KEY[sportName]?.emoji || "🏀";
  const emoji = adapter.TEAM_EMOJI[data.team.abbreviation] || defaultEmoji;
  const teamLogoUrl = adapter.getLogoUrl(data.team.abbreviation);
  const logoUrl = teamLogoUrl || LEAGUE_BY_KEY[sportName]?.logo?.light || "";
  const generatedAt = new Date().toISOString();
  const dataSource = adapter.DATA_SOURCE || (LEAGUE_BY_KEY[sportName]?.endpointOverride ? "official league API" : "ESPN public API");

  const renderData = { ...data, emoji, logoUrl };

  // Render markdown
  const content = `${render(sportName, renderData).trimEnd()}\n\n_Last updated: ${generatedAt}_`;

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

  writeStepSummary({
    sport: sportName,
    leagueName: LEAGUE_BY_KEY[sportName]?.name,
    team,
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

module.exports = { main, parseDryRun };
