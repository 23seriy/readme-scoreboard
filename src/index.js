require("dotenv").config();
const { Octokit } = require("@octokit/rest");
const { render } = require("./renderers/markdown");
const { updateReadme } = require("./updater");

const {
  GH_TOKEN: githubToken,
  BDL_API_KEY: apiKey,
  SPORT: sport = "nba",
  TEAM: teamAbbr,
  TARGET_REPO: targetRepo,
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
    console.error(`Unsupported sport: "${sportName}". Available adapters: nba`);
    process.exit(1);
  }

  // Fetch data (live or demo)
  let data;
  if (isDemo) {
    data = adapter.getDemoData(team);
    console.log(`[DEMO] Using sample data for ${data.team.full_name}`);
  } else {
    if (!apiKey) {
      console.error("BDL_API_KEY environment variable is required for live mode");
      process.exit(1);
    }
    data = await adapter.fetchData(team, apiKey);
    if (!data) {
      console.error("Could not fetch team data. Check your TEAM abbreviation.");
      process.exit(1);
    }
  }

  // Add sport-specific metadata for the renderer
  const emoji = adapter.TEAM_EMOJI[data.team.abbreviation] || "🏀";
  const nbaId = adapter.TEAM_IDS[data.team.abbreviation] || 0;
  const logoUrl = `https://cdn.nba.com/logos/nba/${nbaId}/global/L/logo.svg`;

  const renderData = { ...data, emoji, logoUrl };

  // Render markdown
  const content = render(sportName, renderData);

  console.log("\n--- Preview ---");
  console.log(content);
  console.log("--- End Preview ---\n");

  // Update profile README (skip in demo mode or if no token)
  if (githubToken && !isDemo) {
    const octokit = new Octokit({ auth: `token ${githubToken}` });

    // Resolve target repo (default: authenticated user's profile repo)
    let repo = targetRepo;
    if (!repo) {
      const { data: user } = await octokit.users.getAuthenticated();
      repo = `${user.login}/${user.login}`;
      console.log(`ℹ️  No TARGET_REPO set, using profile repo: ${repo}`);
    }

    await updateReadme(octokit, repo, content);
  } else {
    console.log("⚠️  Skipping README update (preview only)");
  }
}

(async () => {
  await main();
})();
