const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  ALDO: "🔴", ARGJ: "🔥", CAT: "🔵", BAN: "🟢", BAR: "🔴",
  BEL: "🔵", CABJ: "🔵", CTR: "🔴", DYJ: "🟡", RIE: "⚡",
  EST: "🔴", AAE: "⚫", GMZ: "🔵", GLP: "⚪", HUR: "🔴",
  IND: "🔴", RIV: "⚪", IACC: "🔴", LAN: "🔴", NOB: "🔴",
  PLA: "🟤", RAC: "🔵", ROS: "🟡", SLO: "🔴", SARM: "🟢",
  TALL: "🔵", TIG: "🔵", USF: "🔴", VEL: "🔵",
};

// ESPN team IDs — sourced from ESPN's Argentine Primera standings API.
// Note: ESPN uses the `RIV` abbreviation for both Independiente Rivadavia (9744)
// and River Plate (16); River Plate is the canonical `RIV` mapping here.
const TEAM_IDS = {
  ALDO: 9739, ARGJ: 3, CAT: 9785, BAN: 235, BAR: 10060,
  BEL: 4, CABJ: 5, CTR: 11989, DYJ: 8950, RIE: 17702,
  EST: 8, AAE: 19685, GMZ: 11972, GLP: 9, HUR: 10,
  IND: 11, RIV: 16, IACC: 2975, LAN: 12, NOB: 14,
  PLA: 7764, RAC: 15, ROS: 17, SLO: 18, SARM: 10158,
  TALL: 19, TIG: 7767, USF: 20, VEL: 21,
};

const DEMO_TEAMS = {
  RIV: { id: 16, abbreviation: "RIV", name: "River Plate", full_name: "River Plate", conference: "Argentine Primera", division: "" },
  CABJ: { id: 5, abbreviation: "CABJ", name: "Boca Juniors", full_name: "Boca Juniors", conference: "Argentine Primera", division: "" },
  RAC: { id: 15, abbreviation: "RAC", name: "Racing Club", full_name: "Racing Club", conference: "Argentine Primera", division: "" },
};

class ArgentinianAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "arg.1";
  LEAGUE_NAME = "Argentine Primera";
  // The Argentine season runs Feb–Dec within a single calendar year.
  SEASON_SPANS_YEARS = false;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new ArgentinianAdapter();
