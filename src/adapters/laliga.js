const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  ALA: "🔵", ATH: "🦁", ATM: "🐻", BAR: "🔵", BET: "💚",
  CEL: "🌊", ELC: "🌴", ESP: "🐦", GET: "🔷", GIR: "🔴",
  LEV: "🐸", MLL: "🏝️", OSA: "🔴", OVI: "🔵", RAY: "⚡",
  RMA: "👑", RSO: "🔵", SEV: "🔴", VAL: "🦇", VIL: "🟡",
};

// ESPN team IDs — sourced from ESPN's La Liga standings API (authoritative).
const TEAM_IDS = {
  ALA: 96, ATH: 93, ATM: 1068, BAR: 83, BET: 244,
  CEL: 85, ELC: 3751, ESP: 88, GET: 2922, GIR: 9812,
  LEV: 1538, MLL: 84, OSA: 97, OVI: 92, RAY: 101,
  RMA: 86, RSO: 89, SEV: 243, VAL: 94, VIL: 102,
};

const DEMO_TEAMS = {
  RMA: { id: 86, abbreviation: "RMA", name: "Real Madrid", full_name: "Real Madrid", conference: "La Liga", division: "" },
  BAR: { id: 83, abbreviation: "BAR", name: "Barcelona", full_name: "Barcelona", conference: "La Liga", division: "" },
  ATM: { id: 1068, abbreviation: "ATM", name: "Atlético Madrid", full_name: "Atlético Madrid", conference: "La Liga", division: "" },
};

class LaLigaAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "esp.1";
  LEAGUE_NAME = "La Liga";
  // La Liga runs Aug–May, so a season crosses the new year.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new LaLigaAdapter();