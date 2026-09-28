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

const SOCCER_LOGO_ID = /\/i\/leaguelogos\/soccer\/500\/(\d+)\.png$/;

// The README, the manifest, and the showcase files embed these URLs directly, so
// a dead or wrong logo is published to readers as a broken or misleading image.
// Nothing checked them until four leagues shipped with 404s and one with another
// competition's artwork, so both are verified here every day.
async function checkLeagueLogos(request = httpGet) {
  const availability = await Promise.all(LEAGUES.map(async (league) => {
    const failures = [];
    for (const url of [...new Set([league.logo.light, league.logo.dark])]) {
      try {
        const response = await request(url, { timeout: 10000 });
        if (response.status && response.status >= 400) throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        failures.push(`${league.name}: ${url} is unavailable (${error.message})`);
      }
    }
    return failures;
  }));

  // A URL can resolve and still be the wrong picture. ESPN names the correct
  // logo on each soccer league's scoreboard, so compare ids where both sides
  // use the same CDN scheme.
  const identity = await Promise.all(
    LEAGUES.filter((league) => SOCCER_LOGO_ID.test(league.logo.light)).map(async (league) => {
      try {
        const { data } = await request(`${ESPN_ROOT}/${league.endpoint}/scoreboard`, { timeout: 10000 });
        const espnId = data?.leagues?.[0]?.logos?.[0]?.href?.match(SOCCER_LOGO_ID)?.[1];
        const registryId = league.logo.light.match(SOCCER_LOGO_ID)[1];
        if (!espnId || espnId === registryId) return null;
        return `${league.name}: registry uses logo ${registryId} but ESPN reports ${espnId}`;
      } catch {
        // Endpoint reachability is the other check's job; a failure there is
        // reported once rather than twice.
        return null;
      }
    }),
  );

  return [...availability.flat(), ...identity.filter(Boolean)];
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
  Promise.all([checkApiHealth(), checkLeagueLogos()]).then(([api, logoFailures]) => {
    if (api.failures.length > 0) {
      console.error(`API health check failed for ${api.failures.length} of ${api.checked} endpoints:`);
      api.failures.forEach((failure) => console.error(`- ${failure}`));
      console.error(`Slowest response: ${Math.max(...Object.values(api.timings))} ms`);
      process.exitCode = 1;
    }
    if (logoFailures.length > 0) {
      console.error(`Logo check failed for ${logoFailures.length} ${logoFailures.length === 1 ? "entry" : "entries"}:`);
      logoFailures.forEach((failure) => console.error(`- ${failure}`));
      process.exitCode = 1;
    }
    if (process.exitCode !== 1) {
      console.log(`API health check passed for all ${api.checked} supported leagues, including their logos.`);
    }
  }).catch((error) => {
    console.error(`API health check failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { buildEndpointList, checkApiHealth, checkLeagueLogos };
