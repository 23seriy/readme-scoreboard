const { LEAGUES } = require("../src/config/leagues");
const { get: httpGet } = require("../src/http");

const ESPN_ROOT = "https://site.api.espn.com/apis/site/v2/sports";

function endpointFromOverride(override) {
  const match = override?.match(/\((https:\/\/[^)]+)\)/);
  return match?.[1];
}

function buildEndpointList() {
  return LEAGUES.map((league) => ({
    key: league.key,
    name: league.name,
    url: endpointFromOverride(league.endpointOverride)
      || `${ESPN_ROOT}/${league.endpoint}/teams`,
  }));
}

async function checkApiHealth(request = httpGet) {
  const results = await Promise.all(buildEndpointList().map(async ({ name, url }) => {
    try {
      const response = await request(url, { timeout: 10000 });
      if (response.status && response.status >= 400) throw new Error(`HTTP ${response.status}`);
      return null;
    } catch (error) {
      return `${name}: ${error.message}`;
    }
  }));

  return {
    checked: LEAGUES.length,
    failures: results.filter(Boolean),
  };
}

if (require.main === module) {
  checkApiHealth().then((result) => {
    if (result.failures.length > 0) {
      console.error(`API health check failed for ${result.failures.length} of ${result.checked} endpoints:`);
      result.failures.forEach((failure) => console.error(`- ${failure}`));
      process.exitCode = 1;
      return;
    }
    console.log(`API health check passed for all ${result.checked} supported leagues.`);
  }).catch((error) => {
    console.error(`API health check failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { buildEndpointList, checkApiHealth };
