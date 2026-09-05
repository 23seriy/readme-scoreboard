const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  BG: "🔵", CHE: "🔴", CHO: "🟡", DYI: "⚫", HEN: "🔴",
  LIA: "🟣", QIN: "🔴", QWC: "🔵", SHT: "🔵", SIPG: "🔴",
  SHE: "🔵", SHX: "🟠", TIG: "🐯", WTT: "🟡", YUN: "🟢",
  ZHE: "🔵",
};

const TEAM_IDS = {
  BG: 2052, CHE: 21355, CHO: 131704, DYI: 22537, HEN: 8240,
  LIA: 131705, QIN: 21910, QWC: 22198, SHT: 7521, SIPG: 15515,
  SHE: 977, SHX: 22199, TIG: 8239, WTT: 21506, YUN: 22536,
  ZHE: 18203,
};

const DEMO_TEAMS = {
  BG: { id: 2052, abbreviation: "BG", name: "Beijing Guoan", full_name: "Beijing Guoan", conference: "Chinese Super League", division: "" },
  SIPG: { id: 15515, abbreviation: "SIPG", name: "Shanghai Port", full_name: "Shanghai Port", conference: "Chinese Super League", division: "" },
  SHT: { id: 7521, abbreviation: "SHT", name: "Shandong Taishan", full_name: "Shandong Taishan", conference: "Chinese Super League", division: "" },
};

class CslAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "chn.1";
  LEAGUE_NAME = "Chinese Super League";
  // Runs within one calendar year (Jan-Dec).
  SEASON_SPANS_YEARS = false;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new CslAdapter();
