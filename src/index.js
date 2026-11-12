require("dotenv").config();
const { Octokit } = require("@octokit/rest");
const { render } = require("./renderers/markdown");
const { updateReadme, updateReadmeLocal } = require("./updater");
const { LEAGUE_BY_KEY } = require("./config/leagues");
const { validateInputs } = require("./validation");
const { writeStepSummary, writeActionOutputs } = require("./action-summary");
const { compactMarkdown } = require("./compact");

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
  PLAYER: playerName,
  LINK: linkInput,
  RECENT_GAMES: recentGamesInput,
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

// Adapters fetch five results, so five is the ceiling; asking for fewer is
// honoured by trimming before the board is rendered.
const MAX_RECENT_GAMES = 5;

// Trims the adapter's list to the requested count. Adapters fetch at most
// MAX_RECENT_GAMES results, so this only ever shortens the list.
function trimRecentGames(games, count) {
  return Array.isArray(games) ? games.slice(0, count) : games;
}

function parseRecentGames(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return MAX_RECENT_GAMES;
  const count = Number(raw);
  if (!Number.isInteger(count) || count < 1 || count > MAX_RECENT_GAMES) {
    throw new Error(`RECENT_GAMES must be a whole number from 1 to ${MAX_RECENT_GAMES}; received "${value}"`);
  }
  return count;
}

function buildBadge(sportName, abbreviations) {
  // Badges are built from the abbreviations the adapters resolved, not from a
  // pattern match over the rendered markdown. Scraping `(XXX)` only recognised
  // two or three UPPERCASE letters, and roughly a third of the leagues' real
  // abbreviations are longer (PAOK, FC GOA, VALLEY, ASTM), so those boards
  // silently fell back to the raw input and a renamed abbreviation could never
  // reach the badge. The rendered `team.abbreviation` is authoritative.
  const lines = [`<p align="center">`];
  for (const abbr of abbreviations) {
    lines.push(
      `<img src="https://img.shields.io/badge/${encodeURIComponent(sportName.toUpperCase())}-${encodeURIComponent(abbr)}-orange?style=flat" />`
    );
  }
  lines.push("</p>");
  return lines.join("\n");
}

// Read once at import time, but report a bad value as a one-line message: a
// typo in a workflow input used to surface as a Node stack trace in the job log.
function parseRuntimeOptions() {
  try {
    return {
      isDryRun: parseDryRun(process.env.DRY_RUN),
      isCompact: parseCompact(process.env.COMPACT),
      isBadge: parseBoolean(badgeMode, "BADGE"),
      recentGameCount: parseRecentGames(recentGamesInput),
    };
  } catch (error) {
    console.error(error.message);
    process.exit(1);
    return {};
  }
}

const { isDryRun, isCompact, isBadge, recentGameCount } = parseRuntimeOptions();

async function main() {
  const sportName = (sport || "nba").toLowerCase();

  // Check the allowlist before requiring the adapter: the adapter path is
  // built from user input, so requiring first would execute any file the
  // input points at (e.g. SPORT=../scripts/check-changelog would run that
  // script's top-level main(), including its git fetch). scripts/doctor.js
  // already does it in this order.
  const league = LEAGUE_BY_KEY[sportName];
  if (!league) {
    console.error(`Unsupported sport: "${sportName}". Check the Supported Sports table for available options.`);
    process.exit(1);
    return;
  }

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
      player: playerName,
      teamsCount: teams.length,
      link: linkInput,
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
    return;
  }

  const generatedAt = new Date().toISOString();
  const defaultEmoji = LEAGUE_BY_KEY[sportName]?.emoji || "🏀";
  const blocks = [];
  const renderedAbbrs = [];

  for (const team of teams) {
    let data;
    if (isDemo) {
      data = adapter.getDemoData(team, playerName);
      if (!data || !data.team) {
        console.error(`[DEMO] No demo data for ${sportName.toUpperCase()} ${entity} "${team}".`);
        process.exit(1);
      }
      console.log(`[DEMO] Using sample data for ${data.team.full_name}`);
    } else {
      data = await adapter.fetchData(team);
      if (!data) {
        console.error(`Could not fetch ${entity} data for ${sportName.toUpperCase()} ${entity} "${team}". If the abbreviation is right, ESPN is likely refusing the request (HTTP 403 — bot-gating); the board keeps the last good version, and npm run doctor -- --demo previews it from sample data.`);
        process.exit(1);
      }
      if (playerName) {
        try {
          data.spotlight = await adapter.fetchPlayerSpotlight(team, playerName);
        } catch (error) {
          console.error(error.message);
          process.exit(1);
        }
      }
    }

    const emoji = adapter.TEAM_EMOJI[data.team.abbreviation] || defaultEmoji;
    const teamLogoUrl = adapter.getLogoUrl(data.team.abbreviation);
    const logoUrl = teamLogoUrl || LEAGUE_BY_KEY[sportName]?.logo?.light || "";
    const renderData = {
      ...data,
      emoji,
      logoUrl,
      link: linkInput,
      // Adapters fetch up to five results; the action's `recent_games` input
      // only ever trims that list, so the board never claims a count the feed
      // cannot supply.
      recentGames: trimRecentGames(data.recentGames, recentGameCount),
    };

    const rendered = render(sportName, renderData, { title, compact: isCompact });
    blocks.push((isCompact ? compactMarkdown(rendered) : rendered).trimEnd());
    renderedAbbrs.push(data.team.abbreviation || team);
  }

  const joined = blocks.join("\n\n---\n\n");
  const content = isBadge
    ? buildBadge(sportName, renderedAbbrs)
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

module.exports = { main, parseDryRun, parseCompact, parseBoolean, parseTeams, parseRecentGames, trimRecentGames, compactMarkdown, buildBadge };
