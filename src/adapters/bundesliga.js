const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  B04: "💊", BMG: "🐴", DOR: "🐝", FCA: "🌲", FCU: "🧱",
  HDH: "🔵", HSV: "⏱️", KOE: "🐐", M05: "🎭", MUN: "🔴",
  RBL: "🐂", SCF: "🌲", SGE: "🦅", STP: "🏴", SVW: "🟢",
  TSG: "🔵", VFB: "🐎", WOB: "🐺",
};

// ESPN team IDs — sourced from ESPN's Bundesliga standings API (authoritative).
const TEAM_IDS = {
  B04: 131, BMG: 268, DOR: 124, FCA: 3841, FCU: 598,
  HDH: 6418, HSV: 127, KOE: 122, M05: 2950, MUN: 132,
  RBL: 11420, SCF: 126, SGE: 125, STP: 270, SVW: 137,
  TSG: 7911, VFB: 134, WOB: 138,
};

const DEMO_TEAMS = {
  MUN: { id: 132, abbreviation: "MUN", name: "Bayern Munich", full_name: "Bayern Munich", conference: "Bundesliga", division: "" },
  DOR: { id: 124, abbreviation: "DOR", name: "Borussia Dortmund", full_name: "Borussia Dortmund", conference: "Bundesliga", division: "" },
  B04: { id: 131, abbreviation: "B04", name: "Bayer Leverkusen", full_name: "Bayer Leverkusen", conference: "Bundesliga", division: "" },
};

class BundesligaAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "ger.1";
  LEAGUE_NAME = "Bundesliga";
  // The Bundesliga runs Aug–May, so a season crosses the new year.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new BundesligaAdapter();