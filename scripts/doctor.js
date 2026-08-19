const { LEAGUE_BY_KEY } = require("../src/config/leagues");
const { validateInputs } = require("../src/validation");

function inspectConfig(environment = process.env) {
  const errors = [];
  const warnings = [];
  const sport = (environment.SPORT || "nba").toLowerCase();
  const team = (environment.TEAM || "").toUpperCase();
  const isDemo = environment.DEMO === true || environment.DEMO === "true";
  const targetRepo = environment.TARGET_REPO || "";

  if (!environment.GH_TOKEN && !environment.GITHUB_WORKSPACE && !isDemo) {
    warnings.push("GH_TOKEN is not set; README updates will be skipped outside a checked-out workspace.");
  }
  if (!team && !isDemo) errors.push("TEAM is required (or set DEMO=true for a preview).");
  if (environment.MARKER && !/^[A-Za-z0-9._-]+$/.test(environment.MARKER)) {
    errors.push("MARKER may contain only letters, numbers, dots, underscores, and hyphens.");
  }

  if (targetRepo && !/^[^/\s]+\/[^/\s]+$/.test(targetRepo)) {
    errors.push(`TARGET_REPO must use the owner/repository format; received "${targetRepo}"`);
  }

  const adapter = LEAGUE_BY_KEY[sport] ? require(`../src/adapters/${sport}`) : null;
  if (!adapter) {
    errors.push(`Unsupported sport: "${sport}". Available adapters: ${Object.keys(LEAGUE_BY_KEY).join(", ")}`);
  } else if (team) {
    try {
      validateInputs({ sport, team, isDemo, targetRepo, adapter, supportedSports: Object.keys(LEAGUE_BY_KEY) });
    } catch (error) {
      errors.push(error.message);
    }
  }

  return { errors, warnings };
}

function main() {
  const result = inspectConfig({ ...process.env, DEMO: process.argv.includes("--demo") || process.env.DEMO });
  result.warnings.forEach((warning) => console.warn(`⚠️  ${warning}`));
  result.errors.forEach((error) => console.error(`❌ ${error}`));
  if (result.errors.length > 0) {
    process.exitCode = 1;
    return;
  }
  console.log("✅ Configuration looks valid. No API requests were made.");
}

if (require.main === module) main();

module.exports = { inspectConfig };
