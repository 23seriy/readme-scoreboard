const BaseEspnLeagueAdapter = require("./base-espn-league");

class NcaabAdapter extends BaseEspnLeagueAdapter {
  SPORT = "basketball";
  LEAGUE_SLUG = "mens-college-basketball";
  LEAGUE_NAME = "NCAA Men's Basketball";
  TEAM_IDS = { ARIZ: 12, ARK: 8, ASU: 9, AUB: 2 };
  TEAM_EMOJI = { ARIZ: "🐻", ARK: "🐗", ASU: "😈", AUB: "🦅" };
  DEMO_TEAMS = {
    ARIZ: { id: 12, abbreviation: "ARIZ", name: "Wildcats", full_name: "Arizona Wildcats", conference: "Big 12", division: "" },
    ARK: { id: 8, abbreviation: "ARK", name: "Razorbacks", full_name: "Arkansas Razorbacks", conference: "SEC", division: "" },
  };
}

module.exports = new NcaabAdapter();
