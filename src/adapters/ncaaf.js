const BaseEspnLeagueAdapter = require("./base-espn-league");

class NcaafAdapter extends BaseEspnLeagueAdapter {
  SPORT = "football";
  LEAGUE_SLUG = "college-football";
  LEAGUE_NAME = "NCAA - Football";
  TEAM_IDS = { ALA: 333, UGA: 61, OSU: 194, MICH: 130 };
  TEAM_EMOJI = { ALA: "🐘", UGA: "🐶", OSU: "🌰", MICH: "〽️" };
  DEMO_TEAMS = {
    ALA: { id: 333, abbreviation: "ALA", name: "Crimson Tide", full_name: "Alabama Crimson Tide", conference: "SEC", division: "" },
    UGA: { id: 61, abbreviation: "UGA", name: "Bulldogs", full_name: "Georgia Bulldogs", conference: "SEC", division: "" },
  };
}

module.exports = new NcaafAdapter();
