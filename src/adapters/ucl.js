const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = { RMA: "👑", BAR: "🔵🔴", LIV: "🔴", ARS: "🔴", PSG: "🔵🔴" };
const TEAM_IDS = { RMA: 86, BAR: 83, LIV: 364, ARS: 359, PSG: 160 };
const DEMO_TEAMS = {
  RMA: { id: 86, abbreviation: "RMA", name: "Real Madrid", full_name: "Real Madrid", conference: "UEFA Champions League", division: "" },
  LIV: { id: 364, abbreviation: "LIV", name: "Liverpool", full_name: "Liverpool", conference: "UEFA Champions League", division: "" },
  ARS: { id: 359, abbreviation: "ARS", name: "Arsenal", full_name: "Arsenal", conference: "UEFA Champions League", division: "" },
};

class UclAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "uefa.champions";
  LEAGUE_NAME = "UEFA Champions League";
  SEASON_SPANS_YEARS = true;
  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new UclAdapter();
