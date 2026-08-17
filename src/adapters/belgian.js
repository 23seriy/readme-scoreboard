const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = { BRU: "🔵", AND: "🟣", GEN: "🔵", ANT: "🔴" };
const TEAM_IDS = {};
const DEMO_TEAMS = {
  BRU: { id: 570, abbreviation: "BRU", name: "Club Brugge", full_name: "Club Brugge", conference: "Belgian Pro League", division: "" },
  AND: { id: 740, abbreviation: "AND", name: "Anderlecht", full_name: "Anderlecht", conference: "Belgian Pro League", division: "" },
};

class BelgianAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "bel.1";
  LEAGUE_NAME = "Belgian Pro League";
  SEASON_SPANS_YEARS = true;
  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new BelgianAdapter();
