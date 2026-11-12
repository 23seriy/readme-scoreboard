const BaseEspnLeagueAdapter = require("./base-espn-league");

class NcaawAdapter extends BaseEspnLeagueAdapter {
  SPORT = "basketball";
  LEAGUE_SLUG = "womens-college-basketball";
  LEAGUE_NAME = "NCAA Women's Basketball";
  // ESPN ids, verified against the team-detail endpoint. ND was listed as
  // 275, which is Wisconsin's id — Notre Dame is 87. A wrong id here breaks
  // ND boards (the base adapter fetches by this id) and collides with
  // Wisconsin's row in the generated team directory.
  TEAM_IDS = { UCONN: 41, SC: 2579, ND: 87, TENN: 2633 };
  TEAM_EMOJI = { UCONN: "🐺", SC: "🐔", ND: "☘️", TENN: "🟠" };
  DEMO_TEAMS = {
    UCONN: { id: 41, abbreviation: "UCONN", name: "Huskies", full_name: "UConn Huskies", conference: "Big East", division: "" },
    SC: { id: 2579, abbreviation: "SC", name: "Gamecocks", full_name: "South Carolina Gamecocks", conference: "SEC", division: "" },
  };
}

module.exports = new NcaawAdapter();
