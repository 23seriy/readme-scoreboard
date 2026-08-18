require("dotenv").config();
const { Octokit } = require("@octokit/rest");
const { render } = require("./renderers/markdown");
const { updateReadme, updateReadmeLocal } = require("./updater");

const {
  GH_TOKEN: githubToken,
  SPORT: sport = "nba",
  TEAM: teamAbbr,
  TARGET_REPO: targetRepo,
  GITHUB_WORKSPACE: githubWorkspace,
  MARKER: markerName,
} = process.env;

const isDemo = process.argv.includes("--demo");

async function main() {
  if (!teamAbbr && !isDemo) {
    console.error("TEAM environment variable is required (or use --demo)");
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
    console.error(`Unsupported sport: "${sportName}". Available adapters: nba, mlb, nfl, nhl, mls, epl, laliga, bundesliga, seriea, ligue1, primeiraliga, eredivisie, wnba, ligamx, brasileirao, nwsl, saudipro, j1, scottish, belgian, ucl, uel, gleague, ncaab, ncaaw, ncaaf, ncaa_hockey`);
    process.exit(1);
  }

  // Fetch data (live or demo)
  let data;
  if (isDemo) {
    data = adapter.getDemoData(team);
    console.log(`[DEMO] Using sample data for ${data.team.full_name}`);
  } else {
    data = await adapter.fetchData(team);
    if (!data) {
      console.error("Could not fetch team data. Check your TEAM abbreviation.");
      process.exit(1);
    }
  }

  // Add sport-specific metadata for the renderer
  const SPORT_EMOJI = { mlb: "⚾", nfl: "🏈", nhl: "🏒", mls: "⚽", epl: "⚽", laliga: "⚽", bundesliga: "⚽", seriea: "⚽", ligue1: "⚽", primeiraliga: "⚽", eredivisie: "⚽", wnba: "🏀", ligamx: "⚽", brasileirao: "⚽", nwsl: "⚽", saudipro: "⚽", j1: "⚽", scottish: "⚽", belgian: "⚽", ucl: "⚽", uel: "⚽", gleague: "🏀", ncaab: "🏀", ncaaw: "🏀", ncaaf: "🏈", ncaa_hockey: "🏒" };
  const defaultEmoji = SPORT_EMOJI[sportName] || "🏀";
  const emoji = adapter.TEAM_EMOJI[data.team.abbreviation] || defaultEmoji;
  const logoUrl = adapter.getLogoUrl(data.team.abbreviation);

  const renderData = { ...data, emoji, logoUrl };

  // Render markdown
  const content = render(sportName, renderData);

  console.log("\n--- Preview ---");
  console.log(content);
  console.log("--- End Preview ---\n");

  // Update profile README (skip in demo mode)
  if (isDemo) {
    console.log("⚠️  Skipping README update (preview only)");
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

    await updateReadme(octokit, repo, content, markerName);
  } else if (githubWorkspace) {
    // Running locally inside a checked-out repository — write to disk.
    updateReadmeLocal(githubWorkspace, content, markerName);
  } else {
    console.log("⚠️  Skipping README update (no GITHUB_WORKSPACE or GH_TOKEN)");
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
