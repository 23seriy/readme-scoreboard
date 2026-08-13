const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  ALV: "🔴", AVS: "🟡", CDN: "⚫", CDSC: "🌋", CDT: "🟢",
  CPAC: "🔵", EPF: "🟡", EST: "🔴", FCA: "🟡", FCF: "⚪",
  FCP: "🐉", GVFC: "🔴", MFC: "🟢", RAFC: "🟢", SCB: "🔴",
  SCP: "🦁", SLB: "🦅", VSC: "⚪",
};

// ESPN team IDs — sourced from ESPN's Primeira Liga standings API (authoritative).
const TEAM_IDS = {
  ALV: 21613, AVS: 22064, CDN: 3472, CDSC: 12215, CDT: 12706,
  CPAC: 21581, EPF: 12216, EST: 21610, FCA: 15784, FCF: 12698,
  FCP: 437, GVFC: 3699, MFC: 3696, RAFC: 3822, SCB: 2994,
  SCP: 2250, SLB: 1929, VSC: 5309,
};

const DEMO_TEAMS = {
  SLB: { id: 1929, abbreviation: "SLB", name: "Benfica", full_name: "Benfica", conference: "Primeira Liga", division: "" },
  FCP: { id: 437, abbreviation: "FCP", name: "FC Porto", full_name: "FC Porto", conference: "Primeira Liga", division: "" },
  SCP: { id: 2250, abbreviation: "SCP", name: "Sporting CP", full_name: "Sporting CP", conference: "Primeira Liga", division: "" },
};

class PrimeiraLigaAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "por.1";
  LEAGUE_NAME = "Primeira Liga";
  // The Primeira Liga runs Aug–May, so a season crosses the new year.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new PrimeiraLigaAdapter();
