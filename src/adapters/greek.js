const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  AEK: "🟡", ARI: "⚫", AST: "🔵", ATRO: "🔴", IRAK: "⚪",
  KAL: "🟢", KIF: "🔷", LEV: "🔶", OFI: "⚫", OLY: "🔴",
  PAN: "🟡", PAO: "🟢", PAOK: "⚫", VOL: "🔵",
};

// ESPN team IDs — sourced from ESPN's Super League standings API (authoritative).
const TEAM_IDS = {
  AEK: 887, ARI: 11553, AST: 8354, ATRO: 6790, IRAK: 2575,
  KAL: 132429, KIF: 21969, LEV: 5276, OFI: 1010, OLY: 435,
  PAN: 11431, PAO: 443, PAOK: 605, VOL: 20043,
};

const DEMO_TEAMS = {
  OLY: { id: 435, abbreviation: "OLY", name: "Olympiacos", full_name: "Olympiacos", conference: "Super League", division: "" },
  PAO: { id: 443, abbreviation: "PAO", name: "Panathinaikos", full_name: "Panathinaikos", conference: "Super League", division: "" },
  AEK: { id: 887, abbreviation: "AEK", name: "AEK Athens", full_name: "AEK Athens", conference: "Super League", division: "" },
};

class GreekSuperLeagueAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "gre.1";
  LEAGUE_NAME = "Super League";
  // The Greek Super League runs Aug–May, so a season crosses the new year.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new GreekSuperLeagueAdapter();
