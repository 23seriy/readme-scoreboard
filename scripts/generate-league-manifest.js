const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");

const manifest = {
  generatedFrom: "src/config/leagues.js",
  leagues: LEAGUES.map(({ key, name, category, endpoint, renderer, emoji, logo, seasonWindow, fallback, endpointOverride }) => ({
    key,
    name,
    category,
    endpoint,
    apiSource: endpointOverride ? "official league API" : "ESPN public API",
    teamEndpoint: endpointOverride?.match(/\((https:\/\/[^)]+)\)/)?.[1]
      || `https://site.api.espn.com/apis/site/v2/sports/${endpoint}/teams`,
    renderer,
    emoji,
    logo,
    seasonWindow,
    fallback,
    ...(endpointOverride ? { endpointOverride } : {}),
  })),
};

fs.writeFileSync(
  path.resolve(__dirname, "../supported-leagues.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
