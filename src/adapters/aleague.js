const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  ADE: "🔴", AFC: "⚫", BRR: "🟠", CCM: "🟡", MAC: "🔵",
  MCY: "🔵", MVC: "🔵", NEW: "🔵", PER: "🟣", SYD: "☁️",
  WEL: "🟡", WSW: "🔴",
};

const TEAM_IDS = {
  ADE: 5321, AFC: 22344, BRR: 5326, CCM: 5325, MAC: 19340,
  MCY: 11143, MVC: 5328, NEW: 5323, PER: 5322, SYD: 5327,
  WEL: 8352, WSW: 13696,
};

const DEMO_TEAMS = {
  SYD: { id: 5327, abbreviation: "SYD", name: "Sydney FC", full_name: "Sydney FC", conference: "A-League Men", division: "" },
  MCY: { id: 11143, abbreviation: "MCY", name: "Melbourne City", full_name: "Melbourne City FC", conference: "A-League Men", division: "" },
  MVC: { id: 5328, abbreviation: "MVC", name: "Melbourne Victory", full_name: "Melbourne Victory", conference: "A-League Men", division: "" },
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
