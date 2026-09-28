const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  AAL: "🔵", BODO: "🟡", FRE: "🔴", HAM: "🔵", IKS: "🟡",
  KFUM: "⚪", KRI: "🔵", LIL: "🟡", MOL: "🔵", ROS: "⚪",
  SAN: "🔵", SAR: "🔷", SKBR: "🔴", TRO: "🔵", VAL: "🔴",
  VIK: "🔵",
};

// ESPN team IDs — sourced from ESPN's Eliteserien standings API (authoritative).
const TEAM_IDS = {
  AAL: 3278, BODO: 2980, FRE: 3039, HAM: 21380, IKS: 6750,
  KFUM: 22165, KRI: 6672, LIL: 987, MOL: 2715, ROS: 438,
  SAN: 3279, SAR: 5002, SKBR: 620, TRO: 5270, VAL: 2791,
  VIK: 510,
};

const DEMO_TEAMS = {
  BODO: { id: 2980, abbreviation: "BODO", name: "Bodo/Glimt", full_name: "Bodo/Glimt", conference: "Eliteserien", division: "" },
  ROS: { id: 438, abbreviation: "ROS", name: "Rosenborg", full_name: "Rosenborg", conference: "Eliteserien", division: "" },
  MOL: { id: 2715, abbreviation: "MOL", name: "Molde", full_name: "Molde", conference: "Eliteserien", division: "" },
};

class NorwegianEliteserienAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "nor.1";
  LEAGUE_NAME = "Eliteserien";
  // Norway plays a spring–autumn season inside a single calendar year, so this
  // is left at the base default (false).
  SEASON_SPANS_YEARS = false;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new NorwegianEliteserienAdapter();
