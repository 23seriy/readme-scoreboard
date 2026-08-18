const BaseEspnLeagueAdapter = require("./base-espn-league");

class NcaawAdapter extends BaseEspnLeagueAdapter {
  SPORT = "basketball";
  LEAGUE_SLUG = "womens-college-basketball";
  LEAGUE_NAME = "NCAA Women's Basketball";
  TEAM_IDS = { UCONN: 41, SC: 2579, ND: 275, TENN: 2633 };
  TEAM_EMOJI = { UCONN: "🐺", SC: "🐔", ND: "☘️", TENN: "🟠" };
  DEMO_TEAMS = {
    UCONN: { id: 41, abbreviation: "UCONN", name: "Huskies", full_name: "UConn Huskies", conference: "Big East", division: "" },
    SC: { id: 2579, abbreviation: "SC", name: "Gamecocks", full_name: "South Carolina Gamecocks", conference: "SEC", division: "" },
  };
}

module.exports = new NcaawAdapter();
