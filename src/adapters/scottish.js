const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = { CEL: "🍀", RAN: "🔵", ABD: "🔴", HIB: "🟢" };
const TEAM_IDS = { CEL: 256, RAN: 257 };
const DEMO_TEAMS = {
  CEL: { id: 256, abbreviation: "CEL", name: "Celtic", full_name: "Celtic", conference: "Scottish Premiership", division: "" },
  RAN: { id: 257, abbreviation: "RAN", name: "Rangers", full_name: "Rangers", conference: "Scottish Premiership", division: "" },
};

class ScottishAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "sco.1";
  LEAGUE_NAME = "Scottish Premiership";
  SEASON_SPANS_YEARS = true;
  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new ScottishAdapter();
