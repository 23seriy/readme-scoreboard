const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  ARS: "🔴", AVL: "🦁", BHA: "🕊️", BOU: "🍒", BRE: "🐝",
  BUR: "🔥", CHE: "🔵", CRY: "🦅", EVE: "🍬", FUL: "⚪",
  LEE: "🦚", LIV: "🔴", MAN: "😈", MNC: "🩵", NEW: "🐦",
  NFO: "🌳", SUN: "🐈", TOT: "🐓", WHU: "⚒️", WOL: "🐺",
};

// ESPN team IDs — sourced from ESPN's Premier League standings API (authoritative).
const TEAM_IDS = {
  ARS: 359, AVL: 362, BHA: 331, BOU: 349, BRE: 337,
  BUR: 379, CHE: 363, CRY: 384, EVE: 368, FUL: 370,
  LEE: 357, LIV: 364, MAN: 360, MNC: 382, NEW: 361,
  NFO: 393, SUN: 366, TOT: 367, WHU: 371, WOL: 380,
};

const DEMO_TEAMS = {
  LIV: { id: 364, abbreviation: "LIV", name: "Liverpool", full_name: "Liverpool", conference: "Premier League", division: "" },
  ARS: { id: 359, abbreviation: "ARS", name: "Arsenal", full_name: "Arsenal", conference: "Premier League", division: "" },
  MNC: { id: 382, abbreviation: "MNC", name: "Man City", full_name: "Manchester City", conference: "Premier League", division: "" },
};

class EplAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "eng.1";
  LEAGUE_NAME = "Premier League";
  // The Premier League runs Aug–May, so a season crosses the new year.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new EplAdapter();