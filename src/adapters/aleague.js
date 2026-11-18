const BaseSoccerAdapter = require("./base-soccer");

// ESPN spells five clubs differently from the abbreviations this adapter
// originally shipped (Adelaide ADE -> ADL, Auckland AFC -> AUC, Brisbane
// BRR -> BRI, Melbourne City MCY -> MBC, Melbourne Victory MVC -> MBV).
// Standings match on the live abbreviation, so keeping the old keys left the
// board with no record and a null logo.
const TEAM_EMOJI = {
  ADL: "🔴", AUC: "⚫", BRI: "🟠", CCM: "🟡", MAC: "🔵",
  MBC: "🔵", MBV: "🔵", NEW: "🔵", PER: "🟣", SYD: "☁️",
  WEL: "🟡", WSW: "🔴",
};

const TEAM_IDS = {
  ADL: 5321, AUC: 22344, BRI: 5326, CCM: 5325, MAC: 19340,
  MBC: 11143, MBV: 5328, NEW: 5323, PER: 5322, SYD: 5327,
  WEL: 8352, WSW: 13696,
};

const DEMO_TEAMS = {
  SYD: { id: 5327, abbreviation: "SYD", name: "Sydney FC", full_name: "Sydney FC", conference: "A-League Men", division: "" },
  MBC: { id: 11143, abbreviation: "MBC", name: "Melbourne City", full_name: "Melbourne City FC", conference: "A-League Men", division: "" },
  MBV: { id: 5328, abbreviation: "MBV", name: "Melbourne Victory", full_name: "Melbourne Victory", conference: "A-League Men", division: "" },
};

class ALeagueAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "aus.1";
  LEAGUE_NAME = "A-League Men";
  // Runs July-May, so a season spans two calendar years.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new ALeagueAdapter();
