const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  ATA: "🐝", BOL: "🔴", CAG: "🏝️", COMO: "🌊", CRE: "🎻",
  FIO: "💜", GEN: "🚢", INT: "🐍", JUV: "🦓", LAZ: "🦅",
  LEC: "🐺", MIL: "😈", NAP: "🌋", PAR: "🟡", PIS: "🗼",
  ROMA: "🐺", SAS: "⚫", TOR: "🐂", UDI: "🦓", VER: "🟡",
};

// ESPN team IDs — sourced from ESPN's Serie A standings API (authoritative).
const TEAM_IDS = {
  ATA: 105, BOL: 107, CAG: 2925, COMO: 2572, CRE: 4050,
  FIO: 109, GEN: 3263, INT: 110, JUV: 111, LAZ: 112,
  LEC: 113, MIL: 103, NAP: 114, PAR: 115, PIS: 3956,
  ROMA: 104, SAS: 3997, TOR: 239, UDI: 118, VER: 119,
};

const DEMO_TEAMS = {
  INT: { id: 110, abbreviation: "INT", name: "Internazionale", full_name: "Internazionale", conference: "Serie A", division: "" },
  JUV: { id: 111, abbreviation: "JUV", name: "Juventus", full_name: "Juventus", conference: "Serie A", division: "" },
  MIL: { id: 103, abbreviation: "MIL", name: "AC Milan", full_name: "AC Milan", conference: "Serie A", division: "" },
};

class SerieAAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "ita.1";
  LEAGUE_NAME = "Serie A";
  // Serie A runs Aug–May, so a season crosses the new year.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new SerieAAdapter();