const BaseEspnLeagueAdapter = require("./base-espn-league");

class NcaaHockeyAdapter extends BaseEspnLeagueAdapter {
  SPORT = "hockey";
  LEAGUE_SLUG = "mens-college-hockey";
  LEAGUE_NAME = "NCAA Men's Ice Hockey";
  TEAM_IDS = { BC: 103, MICH: 130, UND: 155, BU: 104 };
  TEAM_EMOJI = { BC: "🦅", MICH: "〽️", UND: "🟢", BU: "🔴" };
  DEMO_TEAMS = {
    BC: { id: 103, abbreviation: "BC", name: "Eagles", full_name: "Boston College Eagles", conference: "Hockey East", division: "" },
    MICH: { id: 130, abbreviation: "MICH", name: "Wolverines", full_name: "Michigan Wolverines", conference: "Big Ten", division: "" },
  };
}

module.exports = new NcaaHockeyAdapter();
