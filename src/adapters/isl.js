const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  BFC: "🔵", CFC: "🔷", GOA: "🟠", ITKA: "🔴", JFC: "🔴",
  KER: "🟡", MOH: "⚫", MBSG: "🟢", MCFC: "🌆", NEU: "🟠",
  OFC: "🔴", PFC: "🟡", EBEN: "🔴", SCD: "🔵",
};

const TEAM_IDS = {
  BFC: 18851, CFC: 18000, GOA: 18003, ITKA: 22069, JFC: 18850,
  KER: 17997, MOH: 20842, MBSG: 20774, MCFC: 18002, NEU: 18004,
  OFC: 17998, PFC: 18894, EBEN: 8897, SCD: 131703,
};

const DEMO_TEAMS = {
  BFC: { id: 18851, abbreviation: "BFC", name: "Bengaluru FC", full_name: "Bengaluru FC", conference: "Indian Super League", division: "" },
  MBSG: { id: 20774, abbreviation: "MBSG", name: "Mohun Bagan Super Giant", full_name: "Mohun Bagan Super Giant", conference: "Indian Super League", division: "" },
  KER: { id: 17997, abbreviation: "KER", name: "Kerala Blasters", full_name: "Kerala Blasters FC", conference: "Indian Super League", division: "" },
};

class IslAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "ind.1";
  LEAGUE_NAME = "Indian Super League";
  // Runs September-July, so a season spans two calendar years.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new IslAdapter();
