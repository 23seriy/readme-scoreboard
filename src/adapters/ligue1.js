const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  ANG: "⚫", AUX: "🌿", BRE: "🏴", HAC: "⚓", LILL: "🐕",
  LOR: "🐟", LYON: "🦁", METZ: "🐉", MON: "🔴", NAN: "🟡",
  NICE: "🦅", OLM: "⛵", PAR: "🗼", PSG: "🗼", RCL: "⛏️",
  REN: "🦊", STR: "🔵", TOU: "🟣",
};

// ESPN team IDs — sourced from ESPN's Ligue 1 standings API (authoritative).
const TEAM_IDS = {
  ANG: 7868, AUX: 172, BRE: 6997, HAC: 3236, LILL: 166,
  LOR: 273, LYON: 167, METZ: 177, MON: 174, NAN: 165,
  NICE: 2502, OLM: 176, PAR: 6851, PSG: 160, RCL: 175,
  REN: 169, STR: 180, TOU: 179,
};

const DEMO_TEAMS = {
  PSG: { id: 160, abbreviation: "PSG", name: "Paris Saint-Germain", full_name: "Paris Saint-Germain", conference: "Ligue 1", division: "" },
  OLM: { id: 176, abbreviation: "OLM", name: "Marseille", full_name: "Marseille", conference: "Ligue 1", division: "" },
  MON: { id: 174, abbreviation: "MON", name: "AS Monaco", full_name: "AS Monaco", conference: "Ligue 1", division: "" },
};

class Ligue1Adapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "fra.1";
  LEAGUE_NAME = "Ligue 1";
  // Ligue 1 runs Aug–May, so a season crosses the new year.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new Ligue1Adapter();