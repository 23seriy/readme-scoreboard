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
  const checks = await Promise.all(buildEndpointList().map(async ({ key, name, url }) => {
    const startedAt = Date.now();
    try {
      const response = await request(url, { timeout: 10000 });
      if (response.status && response.status >= 400) throw new Error(`HTTP ${response.status}`);
      return { key, name, durationMs: Date.now() - startedAt, failure: null };
    } catch (error) {
      return { key, name, durationMs: Date.now() - startedAt, failure: `${name}: ${error.message}` };
    }
  }));
  const failures = checks.map(({ failure }) => failure).filter(Boolean);

  return {
    checked: LEAGUES.length,
    failures,
    results: failures.length === 0 ? "all healthy" : "one or more endpoints unavailable",
    timings: Object.fromEntries(checks.map(({ key, durationMs }) => [key, durationMs])),
  };
}

if (require.main === module) {
  checkApiHealth().then((result) => {
    if (result.failures.length > 0) {
      console.error(`API health check failed for ${result.failures.length} of ${result.checked} endpoints:`);
      result.failures.forEach((failure) => console.error(`- ${failure}`));
      console.error(`Slowest response: ${Math.max(...Object.values(result.timings))} ms`);
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
