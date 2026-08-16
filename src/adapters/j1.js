const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  AVF: "🐝", CER: "🌸", GAM: "🔵", JEF: "🟡", KAN: "🦌",
  KAW: "🐬", KRE: "☀️", KYO: "🟣", MITO: "🔵", NAG: "🐨",
  OKA: "🔴", SAN: "🟣", SHI: "🟠", TOK: "🔵", TYKV: "🟢",
  URA: "🔴", VVN: "🔵", VIS: "⚓", YOK: "🔵", ZEL: "🟢",
};

// ESPN team IDs — sourced from ESPN's J1 League teams endpoint.
const TEAM_IDS = {
  AVF: 7107, CER: 7109, GAM: 7102, JEF: 7111,
  KAN: 7115, KAW: 7112, KRE: 7476, KYO: 21361, MITO: 131701,
  NAG: 7108, OKA: 22522, SAN: 7114, SHI: 7104, TOK: 3384,
  TYKV: 3393, URA: 3385, VVN: 19001, VIS: 7477, YOK: 7116, ZEL: 22167,
};

const DEMO_TEAMS = {
  KAW: { id: 7112, abbreviation: "KAW", name: "Kawasaki Frontale", full_name: "Kawasaki Frontale", conference: "J1 League", division: "" },
  URA: { id: 3385, abbreviation: "URA", name: "Urawa Red Diamonds", full_name: "Urawa Red Diamonds", conference: "J1 League", division: "" },
  VIS: { id: 7477, abbreviation: "VIS", name: "Vissel Kobe", full_name: "Vissel Kobe", conference: "J1 League", division: "" },
};

class J1Adapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "jpn.1";
  LEAGUE_NAME = "J1 League";
  // J1 moves to an August–May calendar beginning with the 2026/27 season.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new J1Adapter();
