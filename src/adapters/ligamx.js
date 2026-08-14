const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  AME: "🦅", ASL: "⚔️", ATS: "🦊", CAZ: "🚂", GDL: "🐐",
  JUA: "🐴", LEO: "🦁", MAZ: "🦈", MTY: "⛰️", NCX: "⚡",
  PAC: "🐻", PUE: "🍬", QRO: "🐓", SAN: "⚓", TIJ: "🐕",
  TOL: "🦂", UANL: "🐯", UNAM: "🐾",
};

// ESPN team IDs — sourced from ESPN's Liga MX standings API (authoritative).
const TEAM_IDS = {
  AME: 227, ASL: 15720, ATS: 216, CAZ: 218, GDL: 219,
  JUA: 17851, LEO: 228, MAZ: 20702, MTY: 220, NCX: 229,
  PAC: 234, PUE: 231, QRO: 222, SAN: 225, TIJ: 10125,
  TOL: 223, UANL: 232, UNAM: 233,
};

const DEMO_TEAMS = {
  AME: { id: 227, abbreviation: "AME", name: "América", full_name: "América", conference: "Liga MX", division: "" },
  GDL: { id: 219, abbreviation: "GDL", name: "Guadalajara", full_name: "Guadalajara", conference: "Liga MX", division: "" },
  CAZ: { id: 218, abbreviation: "CAZ", name: "Cruz Azul", full_name: "Cruz Azul", conference: "Liga MX", division: "" },
};

class LigaMxAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "mex.1";
  LEAGUE_NAME = "Liga MX";
  // Liga MX splits the year into two short tournaments — Apertura (Jul–Dec)
  // and Clausura (Jan–May) — so a season label stays within one calendar year
  // rather than spanning two like the European leagues.
  SEASON_SPANS_YEARS = false;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new LigaMxAdapter();
