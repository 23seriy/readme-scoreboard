const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  AUS: "🟣", GRA: "🔴", HAR: "🔵", LAS: "⚫", RAP: "🟢",
  SCR: "🟡", SJR: "⚪", SLZ: "🔴", STG: "⚫", WOL: "🔵",
  WST: "🔷", ALU: "🟤",
};

// ESPN team IDs — sourced from ESPN's Bundesliga standings API (authoritative).
// Two Vienna clubs share ESPN's "VIE" abbreviation, so distinct keys are used
// here: AUS (Austria Vienna) and RAP (Rapid Vienna).
const TEAM_IDS = {
  ALU: 21540, AUS: 1382, GRA: 21846, HAR: 6907, LAS: 4411,
  RAP: 519, SCR: 4405, SJR: 3759, SLZ: 2790, STG: 3746,
  WOL: 13294, WST: 18794,
};

const DEMO_TEAMS = {
  SLZ: { id: 2790, abbreviation: "SLZ", name: "RB Salzburg", full_name: "RB Salzburg", conference: "Bundesliga", division: "" },
  STG: { id: 3746, abbreviation: "STG", name: "Sturm Graz", full_name: "SK Sturm Graz", conference: "Bundesliga", division: "" },
  RAP: { id: 519, abbreviation: "RAP", name: "Rapid Vienna", full_name: "Rapid Vienna", conference: "Bundesliga", division: "" },
};

class AustrianBundesligaAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "aut.1";
  LEAGUE_NAME = "Bundesliga";
  // Runs Aug–May, so a season crosses the new year.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new AustrianBundesligaAdapter();
