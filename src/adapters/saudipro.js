const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  ABH: "🟠", AHL: "🟢", ALF: "🟣", DIR: "🔵", ETT: "🟢",
  FAT: "🟢", FAY: "🟠", HAZ: "🟡", HIL: "🔵", ITT: "🟡",
  KHA: "🟠", KHO: "🟣", NEOM: "🔵", NSR: "🟡", QAD: "🔴",
  RIY: "🔴", SHA: "⚪", TAA: "🟡",
};

// ESPN team IDs — sourced from ESPN's Saudi Pro League teams endpoint.
const TEAM_IDS = {
  ABH: 21833, AHL: 8346, ALF: 21446, DIR: 131746, ETT: 8363,
  FAT: 13033, FAY: 21827, HAZ: 21964, HIL: 929, ITT: 2276,
  KHA: 21829, KHO: 22028, NEOM: 130899, NSR: 817, QAD: 22022,
  RIY: 21965, SHA: 793, TAA: 18459,
};

const DEMO_TEAMS = {
  HIL: { id: 929, abbreviation: "HIL", name: "Al Hilal", full_name: "Al Hilal", conference: "Saudi Pro League", division: "" },
  NSR: { id: 817, abbreviation: "NSR", name: "Al Nassr", full_name: "Al Nassr", conference: "Saudi Pro League", division: "" },
  AHL: { id: 8346, abbreviation: "AHL", name: "Al Ahli", full_name: "Al Ahli", conference: "Saudi Pro League", division: "" },
};

class SaudiProAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "ksa.1";
  LEAGUE_NAME = "Saudi Pro League";
  // The Saudi Pro League runs August–May, crossing the new year.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  TEAM_LOGO_OVERRIDES = {
    DIR: "https://commons.wikimedia.org/wiki/Special:FilePath/%D8%B4%D8%B9%D8%A7%D8%B1_%D9%86%D8%A7%D8%AF%D9%8A_%D8%A7%D9%84%D8%AF%D8%B1%D8%B9%D9%8A%D8%A9.png?width=64",
    ALF: "https://commons.wikimedia.org/wiki/Special:FilePath/%D8%B4%D8%B9%D8%A7%D8%B1_%D9%81%D8%B1%D9%8A%D9%82_%D8%A7%D9%84%D9%81%D9%8A%D8%B5%D9%84%D9%8A.png?width=64",
  };
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new SaudiProAdapter();
