const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  BAH: "🔵", BOT: "⭐", BRA: "🐂", CAM: "🐓", CAP: "🦅",
  CFC: "🟢", CHA: "🌲", COR: "⚫", CRU: "🦊", FLA: "🔴",
  FLU: "🍅", GRE: "🔷", INT: "🔴", MIR: "🟡", PAL: "🟩",
  REMO: "🦁", SAN: "🐋", SAO: "🔺", VAS: "⚓", VIT: "🦁",
};

// ESPN team IDs — sourced from ESPN's Brasileirão standings API (authoritative).
const TEAM_IDS = {
  BAH: 9967, BOT: 6086, BRA: 6079, CAM: 7632, CAP: 3458,
  CFC: 3456, CHA: 9318, COR: 874, CRU: 2022, FLA: 819,
  FLU: 3445, GRE: 6273, INT: 1936, MIR: 9169, PAL: 2029,
  REMO: 4936, SAN: 2674, SAO: 2026, VAS: 3454, VIT: 3457,
};

const DEMO_TEAMS = {
  PAL: { id: 2029, abbreviation: "PAL", name: "Palmeiras", full_name: "Palmeiras", conference: "Série A", division: "" },
  FLA: { id: 819, abbreviation: "FLA", name: "Flamengo", full_name: "Flamengo", conference: "Série A", division: "" },
  COR: { id: 874, abbreviation: "COR", name: "Corinthians", full_name: "Corinthians", conference: "Série A", division: "" },
};

class BrasileiraoAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "bra.1";
  LEAGUE_NAME = "Brasileirão";
  // The Brasileirão runs Jan–December, so a season sits inside one calendar
  // year rather than crossing it like the European leagues.
  SEASON_SPANS_YEARS = false;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;

  // ESPN labels this league's standings group with just the year ("2026"),
  // unlike other leagues which give a descriptive name. `standingsLabel` in the
  // base class replaces a season-only label with the league name, so the label
  // reads "Brasileirão" here rather than the bare year. That used to be handled
  // by an override that blanked the year and relied on the renderer's
  // `fallbackLabel`; naming it at the source means the value the adapter
  // reports is the one that gets printed.
}

module.exports = new BrasileiraoAdapter();
