const BaseRacingDriverAdapter = require("./base-racing-driver");

// NASCAR Cup Series. Like the tennis leagues, a "team" input is a single
// athlete: the driver. Abbreviations are derived from the surname (with an
// initial-prefixed fallback where two drivers would collide), because ESPN does
// not publish its own driver abbreviations.
//
// Roster is the top 30 of the championship standings as of the adapter's last
// refresh. Ricky Stenhouse Jr. is `STE` rather than a suffix-derived code so the
// abbreviation stays guessable.
const PLAYER_IDS = {
  HAM: { id: "747", name: "Denny Hamlin", full_name: "Denny Hamlin" },
  LAR: { id: "4539", name: "Kyle Larson", full_name: "Kyle Larson" },
  BEL: { id: "4700", name: "Christopher Bell", full_name: "Christopher Bell" },
  BLA: { id: "4531", name: "Ryan Blaney", full_name: "Ryan Blaney" },
  RED: { id: "4577", name: "Tyler Reddick", full_name: "Tyler Reddick" },
  GIB: { id: "5651", name: "Ty Gibbs", full_name: "Ty Gibbs" },
  LOG: { id: "4319", name: "Joey Logano", full_name: "Joey Logano" },
  BRI: { id: "4773", name: "Chase Briscoe", full_name: "Chase Briscoe" },
  HOC: { id: "5610", name: "Carson Hocevar", full_name: "Carson Hocevar" },
  WAL: { id: "4534", name: "Bubba Wallace", full_name: "Bubba Wallace" },
  ELL: { id: "4574", name: "Chase Elliott", full_name: "Chase Elliott" },
  CIN: { id: "4718", name: "Austin Cindric", full_name: "Austin Cindric" },
  BUE: { id: "4480", name: "Chris Buescher", full_name: "Chris Buescher" },
  PRE: { id: "4585", name: "Ryan Preece", full_name: "Ryan Preece" },
  BYR: { id: "4721", name: "William Byron", full_name: "William Byron" },
  SUA: { id: "4645", name: "Daniel Suarez", full_name: "Daniel Suarez" },
  GIS: { id: "5772", name: "Shane van Gisbergen", full_name: "Shane van Gisbergen" },
  KES: { id: "626", name: "Brad Keselowski", full_name: "Brad Keselowski" },
  CHA: { id: "4495", name: "Ross Chastain", full_name: "Ross Chastain" },
  MCD: { id: "4729", name: "Michael McDowell", full_name: "Michael McDowell" },
  JON: { id: "4777", name: "Erik Jones", full_name: "Erik Jones" },
  GIL: { id: "4782", name: "Todd Gilliland", full_name: "Todd Gilliland" },
  ALL: { id: "805", name: "AJ Allmendinger", full_name: "AJ Allmendinger" },
  DIL: { id: "4332", name: "Austin Dillon", full_name: "Austin Dillon" },
  SMI: { id: "5558", name: "Zane Smith", full_name: "Zane Smith" },
  BER: { id: "4656", name: "Josh Berry", full_name: "Josh Berry" },
  BOW: { id: "4555", name: "Alex Bowman", full_name: "Alex Bowman" },
  NEM: { id: "4612", name: "John Hunter Nemechek", full_name: "John Hunter Nemechek" },
  STE: { id: "4351", name: "Ricky Stenhouse Jr.", full_name: "Ricky Stenhouse Jr." },
  HER: { id: "5555", name: "Riley Herbst", full_name: "Riley Herbst" },
};

class NascarAdapter extends BaseRacingDriverAdapter {
  SERIES = "nascar-premier";
  SERIES_LABEL = "NASCAR Cup Series";
  LEAGUE_NAME = "NASCAR Cup Series";
  LOGO_URL = "https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-NASCAR.png";
  PLAYER_IDS = PLAYER_IDS;
  // Live validation and the player directory read TEAM_IDS/TEAM_EMOJI, the same
  // surface the team-based adapters expose.
  TEAM_IDS = PLAYER_IDS;
  TEAM_EMOJI = Object.fromEntries(Object.keys(PLAYER_IDS).map((key) => [key, "🏁"]));
  DEMO_TEAMS = {
    HAM: { id: "747", abbreviation: "HAM", name: "Denny Hamlin", full_name: "Denny Hamlin", conference: "NASCAR Cup Series", division: "" },
    LAR: { id: "4539", abbreviation: "LAR", name: "Kyle Larson", full_name: "Kyle Larson", conference: "NASCAR Cup Series", division: "" },
    BEL: { id: "4700", abbreviation: "BEL", name: "Christopher Bell", full_name: "Christopher Bell", conference: "NASCAR Cup Series", division: "" },
  };
  DEMO_POINTS = { HAM: 2168, LAR: 2140, BEL: 2098 };
}

module.exports = new NascarAdapter();
