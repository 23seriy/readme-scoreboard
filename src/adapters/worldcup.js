const BaseSoccerAdapter = require("./base-soccer");

// Country flags. Every one of the 48 qualified nations is listed so a board
// works for any team, not just the usual suspects. England and Scotland are
// subdivisions, which Unicode encodes as a tag sequence rather than a
// regional-indicator pair — written out as escapes because the glyphs are
// invisible in source.
const ENG_FLAG = "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}";
const SCO_FLAG = "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}";

const TEAM_EMOJI = {
  ALG: "🇩🇿", ARG: "🇦🇷", AUS: "🇦🇺", AUT: "🇦🇹", BEL: "🇧🇪", BIH: "🇧🇦",
  BRA: "🇧🇷", CAN: "🇨🇦", CIV: "🇨🇮", COD: "🇨🇩", COL: "🇨🇴", CPV: "🇨🇻",
  CRO: "🇭🇷", CUW: "🇨🇼", CZE: "🇨🇿", ECU: "🇪🇨", EGY: "🇪🇬", ENG: ENG_FLAG,
  ESP: "🇪🇸", FRA: "🇫🇷", GER: "🇩🇪", GHA: "🇬🇭", HAI: "🇭🇹", IRN: "🇮🇷",
  IRQ: "🇮🇶", JOR: "🇯🇴", JPN: "🇯🇵", KOR: "🇰🇷", KSA: "🇸🇦", MAR: "🇲🇦",
  MEX: "🇲🇽", NED: "🇳🇱", NOR: "🇳🇴", NZL: "🇳🇿", PAN: "🇵🇦", PAR: "🇵🇾",
  POR: "🇵🇹", QAT: "🇶🇦", RSA: "🇿🇦", SCO: SCO_FLAG, SEN: "🇸🇳", SUI: "🇨🇭",
  SWE: "🇸🇪", TUN: "🇹🇳", TUR: "🇹🇷", URU: "🇺🇾", USA: "🇺🇸", UZB: "🇺🇿",
};

// ESPN team IDs — sourced from ESPN's World Cup teams API (authoritative).
const TEAM_IDS = {
  ALG: 624, ARG: 202, AUS: 628, AUT: 474, BEL: 459, BIH: 452,
  BRA: 205, CAN: 206, CIV: 4789, COD: 2850, COL: 208, CPV: 2597,
  CRO: 477, CUW: 11678, CZE: 450, ECU: 209, EGY: 2620, ENG: 448,
  ESP: 164, FRA: 478, GER: 481, GHA: 4469, HAI: 2654, IRN: 469,
  IRQ: 4375, JOR: 2917, JPN: 627, KOR: 451, KSA: 655, MAR: 2869,
  MEX: 203, NED: 449, NOR: 464, NZL: 2666, PAN: 2659, PAR: 210,
  POR: 482, QAT: 4398, RSA: 467, SCO: 580, SEN: 654, SUI: 475,
  SWE: 466, TUN: 659, TUR: 465, URU: 212, USA: 660, UZB: 2570,
};

const DEMO_TEAMS = {
  ARG: { id: 202, abbreviation: "ARG", name: "Argentina", full_name: "Argentina", conference: "FIFA World Cup", division: "" },
  BRA: { id: 205, abbreviation: "BRA", name: "Brazil", full_name: "Brazil", conference: "FIFA World Cup", division: "" },
  ENG: { id: 448, abbreviation: "ENG", name: "England", full_name: "England", conference: "FIFA World Cup", division: "" },
};

class WorldCupAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "fifa.world";
  LEAGUE_NAME = "FIFA World Cup";
  // The tournament is a June–July event, so it never crosses a new year. This
  // flag is on for a different reason: it makes Jan–Jun resolve to the previous
  // year, which keeps the most recent edition on the board from January until
  // the next June instead of rendering an empty board for a year with no
  // tournament.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
  // Demo opponents must be nations, not the shared pool of club sides.
  DEMO_OPPONENT_POOL = Object.keys(TEAM_IDS);
}

module.exports = new WorldCupAdapter();
