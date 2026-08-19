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
