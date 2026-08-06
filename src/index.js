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
    console.error(`Unsupported sport: "${sportName}". Available adapters: nba, mlb, nfl, nhl, mls`);
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
  const defaultEmoji = sportName === "mlb" ? "⚾" : sportName === "nfl" ? "🏈" : sportName === "mls" ? "⚽" : "🏀";
  const emoji = adapter.TEAM_EMOJI[data.team.abbreviation] || defaultEmoji;
  const teamIdForLogo = adapter.TEAM_IDS[data.team.abbreviation] || 0;
  let logoUrl;
  if (sportName === "mlb") {
    logoUrl = `https://www.mlbstatic.com/team-logos/${teamIdForLogo}.svg`;
  } else if (sportName === "nfl") {
    logoUrl = `https://a.espncdn.com/i/teamlogos/nfl/500/${data.team.abbreviation.toLowerCase()}.png`;
  } else if (sportName === "nhl") {
    logoUrl = `https://assets.nhle.com/logos/nhl/svg/${data.team.abbreviation}_dark.svg`;
  } else if (sportName === "mls") {
    logoUrl = `https://a.espncdn.com/i/teamlogos/soccer/500/${teamIdForLogo}.png`;
  } else {
    logoUrl = `https://cdn.nba.com/logos/nba/${teamIdForLogo}/global/L/logo.svg`;
  }

  const renderData = { ...data, emoji, logoUrl };

  // Render markdown
  const content = render(sportName, renderData);

  console.log("\n--- Preview ---");
  console.log(content);
  console.log("--- End Preview ---\n");

  // Update profile README (skip in demo mode)
  if (isDemo) {
    console.log("⚠️  Skipping README update (preview only)");
  } else if (githubWorkspace) {
    // Running inside a checked-out repo (composite action) — write to disk
    updateReadmeLocal(githubWorkspace, content, markerName);
  } else if (githubToken) {
    // Running standalone — use GitHub API
    const octokit = new Octokit({ auth: githubToken });

    let repo = targetRepo;
    if (!repo) {
      const { data: user } = await octokit.users.getAuthenticated();
      repo = `${user.login}/${user.login}`;
      console.log(`ℹ️  No TARGET_REPO set, using profile repo: ${repo}`);
    }

    await updateReadme(octokit, repo, content, markerName);
  } else {
    console.log("⚠️  Skipping README update (no GITHUB_WORKSPACE or GH_TOKEN)");
  }
}

(async () => {
  await main();
})();
