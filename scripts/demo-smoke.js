const { LEAGUES } = require("../src/config/leagues");
const { render } = require("../src/renderers/markdown");

function runSmokeChecks() {
  const failures = [];

  for (const league of LEAGUES) {
    try {
      const adapter = require(`../src/adapters/${league.key}`);
      const demoTeams = adapter.DEMO_TEAMS || {};
      const abbreviation = Object.keys(demoTeams)[0];

      if (!abbreviation) {
        throw new Error("no demo team configured");
      }

      const data = adapter.getDemoData(abbreviation);
      if (!data?.team || !Array.isArray(data.recentGames)) {
        throw new Error("demo data is missing a team or recent games");
      }

      const teamAbbreviation = (data.team.abbreviation || abbreviation).toUpperCase();
      const content = render(league.key, {
        ...data,
        emoji: adapter.TEAM_EMOJI?.[teamAbbreviation] || league.emoji,
        logoUrl: adapter.getLogoUrl(teamAbbreviation),
      });

      if (!content || !content.includes(teamAbbreviation)) {
        throw new Error("renderer did not include the demo team abbreviation");
      }

      console.log(`✓ ${league.key} (${teamAbbreviation})`);
    } catch (error) {
      failures.push(`${league.key}: ${error.message}`);
    }
  }

  try {
    const nbaAdapter = require("../src/adapters/nba");
    const demo = nbaAdapter.getDemoData("LAL", "Luka Doncic");
    const spotlight = demo?.spotlight;
    const seasonOk = spotlight?.season
      && typeof spotlight.season.points === "number"
      && typeof spotlight.season.rebounds === "number"
      && typeof spotlight.season.assists === "number";
    const lastGameOk = spotlight?.lastGame === null || typeof spotlight?.lastGame === "object";

    if (!spotlight || !spotlight.name || !seasonOk || !lastGameOk) {
      throw new Error("nba getDemoData(\"LAL\", \"Luka Doncic\") did not return a well-formed spotlight");
    }

    console.log("✓ nba player spotlight (Luka Doncic)");
  } catch (error) {
    failures.push(`nba player spotlight: ${error.message}`);
  }

  try {
    const mlbAdapter = require("../src/adapters/mlb");
    const demo = mlbAdapter.getDemoData("TOR", "Vladimir Guerrero Jr.");
    const spotlight = demo?.spotlight;
    const seasonOk = spotlight?.season
      && typeof spotlight.season.avg === "number"
      && typeof spotlight.season.homeRuns === "number"
      && typeof spotlight.season.rbi === "number";
    const lastGameOk = spotlight?.lastGame === null || typeof spotlight?.lastGame === "object";

    if (!spotlight || !spotlight.name || !seasonOk || !lastGameOk) {
      throw new Error("mlb getDemoData(\"TOR\", \"Vladimir Guerrero Jr.\") did not return a well-formed spotlight");
    }

    console.log("✓ mlb player spotlight (Vladimir Guerrero Jr.)");
  } catch (error) {
    failures.push(`mlb player spotlight: ${error.message}`);
  }

  try {
    const nflAdapter = require("../src/adapters/nfl");
    const demo = nflAdapter.getDemoData("KC", "Patrick Mahomes");
    const spotlight = demo?.spotlight;
    const seasonOk = spotlight?.season
      && typeof spotlight.season.passingYards === "number"
      && typeof spotlight.season.passingTouchdowns === "number";
    const lastGameOk = spotlight?.lastGame === null || typeof spotlight?.lastGame === "object";

    if (!spotlight || !spotlight.name || !seasonOk || !lastGameOk) {
      throw new Error("nfl getDemoData(\"KC\", \"Patrick Mahomes\") did not return a well-formed spotlight");
    }

    console.log("✓ nfl player spotlight (Patrick Mahomes)");
  } catch (error) {
    failures.push(`nfl player spotlight: ${error.message}`);
  }

  try {
    const nhlAdapter = require("../src/adapters/nhl");
    const demo = nhlAdapter.getDemoData("NYR", "Artemi Panarin");
    const spotlight = demo?.spotlight;
    const seasonOk = spotlight?.season
      && typeof spotlight.season.goals === "number"
      && typeof spotlight.season.assists === "number"
      && typeof spotlight.season.points === "number";
    const lastGameOk = spotlight?.lastGame === null || typeof spotlight?.lastGame === "object";

    if (!spotlight || !spotlight.name || !seasonOk || !lastGameOk) {
      throw new Error("nhl getDemoData(\"NYR\", \"Artemi Panarin\") did not return a well-formed spotlight");
    }

    console.log("✓ nhl player spotlight (Artemi Panarin)");
  } catch (error) {
    failures.push(`nhl player spotlight: ${error.message}`);
  }

  if (failures.length > 0) {
    throw new Error(`Demo smoke checks failed:\n- ${failures.join("\n- ")}`);
  }

  return { checked: LEAGUES.length, failures: [] };
}

if (require.main === module) {
  try {
    const result = runSmokeChecks();
    console.log(`Demo smoke checks passed for ${result.checked} supported leagues.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { runSmokeChecks };
