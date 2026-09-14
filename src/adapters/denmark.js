const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  ACH: "🟡", AGF: "⚪", BRO: "🔵", FCN: "🔴", KBH: "⚪",
  LBK: "🔵", MID: "⚫", OBK: "🔵", RAN: "🔷", SIF: "🔴",
  SON: "🟡", VIB: "🟢",
};

// ESPN team IDs — sourced from ESPN's Superliga standings API (authoritative).
const TEAM_IDS = {
  ACH: 3585, AGF: 7853, BRO: 575, FCN: 3101, KBH: 909,
  LBK: 7860, MID: 572, OBK: 11550, RAN: 3132, SIF: 607,
  SON: 8118, VIB: 3153,
};

const DEMO_TEAMS = {
  KBH: { id: 909, abbreviation: "KBH", name: "F.C. København", full_name: "F.C. København", conference: "Superliga", division: "" },
  MID: { id: 572, abbreviation: "MID", name: "FC Midtjylland", full_name: "FC Midtjylland", conference: "Superliga", division: "" },
  BRO: { id: 575, abbreviation: "BRO", name: "Brøndby IF", full_name: "Brøndby IF", conference: "Superliga", division: "" },
};

class DanishSuperligaAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "den.1";
  LEAGUE_NAME = "Superliga";
  // Runs Jul–May, so a season crosses the new year.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new DanishSuperligaAdapter();
