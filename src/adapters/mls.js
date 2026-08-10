const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  ATL: "🦅", ATX: "🌵", CHI: "🔥", CIN: "🔵", CLB: "⚓",
  CLT: "👑", COL: "🏔️", DAL: "🌟", DC: "🦅", HOU: "🚀",
  LA: "⭐", LAFC: "🖤", MIA: "🦩", MIN: "🌲", MTL: "⚜️",
  NE: "🔵", NSH: "🎸", NYC: "🗽", ORL: "🏰", PHI: "🔔",
  POR: "🌹", RBNY: "🔴", RSL: "👑", SD: "🌊", SEA: "🪝",
  SJ: "🌊", SKC: "🔵", STL: "⚽", TOR: "🍁", VAN: "🐋",
};

// ESPN team IDs — sourced from ESPN's MLS standings API (authoritative).
const TEAM_IDS = {
  ATL: 18418, ATX: 20906, CHI: 182, CIN: 18267, CLB: 183,
  CLT: 21300, COL: 184, DAL: 185, DC: 193, HOU: 6077,
  LA: 187, LAFC: 18966, MIA: 20232, MIN: 17362, MTL: 9720,
  NE: 189, NSH: 18986, NYC: 17606, ORL: 12011, PHI: 10739,
  POR: 9723, RBNY: 190, RSL: 4771, SD: 22529, SEA: 9726,
  SJ: 191, SKC: 186, STL: 21812, TOR: 7318, VAN: 9727,
};

const DEMO_TEAMS = {
  MIA: { id: 20232, abbreviation: "MIA", name: "Inter Miami CF", full_name: "Inter Miami CF", conference: "Eastern", division: "" },
  LAFC: { id: 18966, abbreviation: "LAFC", name: "LAFC", full_name: "Los Angeles FC", conference: "Western", division: "" },
  ATL: { id: 18418, abbreviation: "ATL", name: "Atlanta United", full_name: "Atlanta United FC", conference: "Eastern", division: "" },
};

class MlsAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "usa.1";
  LEAGUE_NAME = "MLS";
  // MLS runs Feb–Dec, so a season sits inside one calendar year.
  SEASON_SPANS_YEARS = false;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new MlsAdapter();