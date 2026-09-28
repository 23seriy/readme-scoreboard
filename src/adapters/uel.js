const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = { MUN: "😈", TOT: "🐓", ROM: "🐺", POR: "🔵⚪" };
const TEAM_IDS = { MUN: 360, TOT: 367, LIV: 364 };
const DEMO_TEAMS = {
  MUN: { id: 360, abbreviation: "MUN", name: "Manchester United", full_name: "Manchester United", conference: "UEFA Europa League", division: "" },
  TOT: { id: 367, abbreviation: "TOT", name: "Tottenham Hotspur", full_name: "Tottenham Hotspur", conference: "UEFA Europa League", division: "" },
  LIV: { id: 364, abbreviation: "LIV", name: "Liverpool", full_name: "Liverpool", conference: "UEFA Europa League", division: "" },
};

class UelAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "uefa.europa";
  LEAGUE_NAME = "UEFA Europa League";
  SEASON_SPANS_YEARS = true;
  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new UelAdapter();
