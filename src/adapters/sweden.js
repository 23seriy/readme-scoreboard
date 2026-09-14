const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  AIK: "🟡", BKH: "🟡", BRO: "🔴", DEG: "🔵", DJU: "🔵",
  ELF: "🟡", GAIS: "🟢", GOT: "🔵", HAM: "🟢", HBK: "🔵",
  KFF: "🔴", MAL: "🔵", MJA: "🟡", ORG: "🔴", SIR: "🔵",
  VAS: "🟢",
};

// ESPN team IDs — sourced from ESPN's Allsvenskan standings API
// (authoritative). Örgryte's key is ASCII so it can be typed as a `team:` input.
const TEAM_IDS = {
  AIK: 994, BKH: 7834, BRO: 8221, DEG: 20856, DJU: 2339,
  ELF: 529, GAIS: 8222, GOT: 2556, HAM: 2495, HBK: 3017,
  KFF: 3052, MAL: 2720, MJA: 20301, ORG: 131552, SIR: 8547,
  VAS: 22163,
};

const DEMO_TEAMS = {
  MAL: { id: 2720, abbreviation: "MAL", name: "Malmö FF", full_name: "Malmö FF", conference: "Allsvenskan", division: "" },
  AIK: { id: 994, abbreviation: "AIK", name: "AIK", full_name: "AIK", conference: "Allsvenskan", division: "" },
  DJU: { id: 2339, abbreviation: "DJU", name: "Djurgården", full_name: "Djurgården", conference: "Allsvenskan", division: "" },
};

class SwedishAllsvenskanAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "swe.1";
  LEAGUE_NAME = "Allsvenskan";
  // Sweden plays a spring–autumn season inside a single calendar year.
  SEASON_SPANS_YEARS = false;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new SwedishAllsvenskanAdapter();
