const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  AJA: "🔴", AZ: "🧀", EXC: "🔴", FEY: "⚓", FOR: "🟡",
  GAE: "🦅", GRO: "🟢", HEE: "💙", HER: "⚫", NAC: "🟡",
  NEC: "🔴", PEC: "🔵", PSV: "🔴", SPA: "⚪", TEL: "⚪",
  TWE: "🔴", UTR: "🔴", VOL: "🟠",
};

// ESPN team IDs — sourced from ESPN's Eredivisie standings API (authoritative).
const TEAM_IDS = {
  AJA: 139, AZ: 140, EXC: 2566, FEY: 142, FOR: 143,
  GAE: 3706, GRO: 145, HEE: 146, HER: 3708, NAC: 141,
  NEC: 147, PEC: 2565, PSV: 148, SPA: 151, TEL: 3735,
  TWE: 152, UTR: 153, VOL: 2727,
};

const DEMO_TEAMS = {
  AJA: { id: 139, abbreviation: "AJA", name: "Ajax", full_name: "Ajax Amsterdam", conference: "Eredivisie", division: "" },
  PSV: { id: 148, abbreviation: "PSV", name: "PSV", full_name: "PSV Eindhoven", conference: "Eredivisie", division: "" },
  FEY: { id: 142, abbreviation: "FEY", name: "Feyenoord", full_name: "Feyenoord Rotterdam", conference: "Eredivisie", division: "" },
};

class EredivisieAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "ned.1";
  LEAGUE_NAME = "Eredivisie";
  // The Eredivisie runs Aug–May, so a season crosses the new year.
  SEASON_SPANS_YEARS = true;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new EredivisieAdapter();
