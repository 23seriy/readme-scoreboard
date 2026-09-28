const BaseSoccerAdapter = require("./base-soccer");

const TEAM_EMOJI = {
  BAY: "🌉", BOS: "🍀", CHI: "⭐", DEN: "🏔️", GFC: "🦇",
  HOU: "💨", KC: "🌊", LA: "😇", LOU: "🐎", NC: "⚖️",
  ORL: "🦁", POR: "🌹", SD: "🌊", SEA: "🌧️", UTA: "👑",
  WAS: "🕊️",
};

// ESPN team IDs — sourced from ESPN's NWSL standings API (authoritative).
// Boston and Denver are 2026 expansion clubs, which is why their ids sit far
// outside the range of the founding sides.
const TEAM_IDS = {
  BAY: 22187, BOS: 131562, CHI: 15360, DEN: 131563, GFC: 15364,
  HOU: 17346, KC: 20907, LA: 21422, LOU: 20905, NC: 15366,
  ORL: 18206, POR: 15362, SD: 21423, SEA: 15363, UTA: 19141,
  WAS: 15365,
};

const DEMO_TEAMS = {
  GFC: { id: 15364, abbreviation: "GFC", name: "Gotham FC", full_name: "Gotham FC", conference: "NWSL", division: "" },
  POR: { id: 15362, abbreviation: "POR", name: "Portland Thorns", full_name: "Portland Thorns FC", conference: "NWSL", division: "" },
  KC: { id: 20907, abbreviation: "KC", name: "Kansas City Current", full_name: "Kansas City Current", conference: "NWSL", division: "" },
};

class NwslAdapter extends BaseSoccerAdapter {
  LEAGUE_SLUG = "usa.nwsl";
  LEAGUE_NAME = "NWSL";
  // The NWSL runs March–November, so a season sits inside one calendar year.
  SEASON_SPANS_YEARS = false;

  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;
}

module.exports = new NwslAdapter();
