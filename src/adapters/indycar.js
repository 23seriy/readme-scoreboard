const BaseRacingDriverAdapter = require("./base-racing-driver");

// IndyCar Series. Same shape as NASCAR: the "team" input is a driver, and the
// board shows championship position and points. Abbreviations are surname-derived
// for the same reason — ESPN publishes no driver abbreviations.
//
// Roster is the top 30 of the championship standings as of the adapter's last
// refresh. Accented names are stored ASCII so they can be typed in a workflow.
const PLAYER_IDS = {
  PAL: { id: "5632", name: "Alex Palou", full_name: "Alex Palou" },
  KIR: { id: "5704", name: "Kyle Kirkwood", full_name: "Kyle Kirkwood" },
  LUN: { id: "5691", name: "Christian Lundgaard", full_name: "Christian Lundgaard" },
  OWA: { id: "5581", name: "Pato O'Ward", full_name: "Pato O'Ward" },
  MAL: { id: "5706", name: "David Malukas", full_name: "David Malukas" },
  MCL: { id: "5648", name: "Scott McLaughlin", full_name: "Scott McLaughlin" },
  ERI: { id: "4622", name: "Marcus Ericsson", full_name: "Marcus Ericsson" },
  NEW: { id: "4526", name: "Josef Newgarden", full_name: "Josef Newgarden" },
  ROS: { id: "5590", name: "Felix Rosenqvist", full_name: "Felix Rosenqvist" },
  VEE: { id: "5634", name: "Rinus VeeKay", full_name: "Rinus VeeKay" },
  POW: { id: "810", name: "Will Power", full_name: "Will Power" },
  DIX: { id: "518", name: "Scott Dixon", full_name: "Scott Dixon" },
  SIM: { id: "5798", name: "Kyffin Simpson", full_name: "Kyffin Simpson" },
  ARM: { id: "5753", name: "Marcus Armstrong", full_name: "Marcus Armstrong" },
  ARO: { id: "4667", name: "Alexander Rossi", full_name: "Alexander Rossi" },
  RAH: { id: "872", name: "Graham Rahal", full_name: "Graham Rahal" },
  FER: { id: "5553", name: "Santino Ferrucci", full_name: "Santino Ferrucci" },
  FOS: { id: "5842", name: "Louis Foster", full_name: "Louis Foster" },
  GRO: { id: "4374", name: "Romain Grosjean", full_name: "Romain Grosjean" },
  SIE: { id: "5810", name: "Nolan Siegel", full_name: "Nolan Siegel" },
  RAS: { id: "5797", name: "Christian Rasmussen", full_name: "Christian Rasmussen" },
  HAU: { id: "5766", name: "Dennis Hauger", full_name: "Dennis Hauger" },
  SCH: { id: "5654", name: "Mick Schumacher", full_name: "Mick Schumacher" },
  COL: { id: "5880", name: "Caio Collet", full_name: "Caio Collet" },
  ROB: { id: "5750", name: "Sting Ray Robb", full_name: "Sting Ray Robb" },
  DAL: { id: "4580", name: "Conor Daly", full_name: "Conor Daly" },
  SAT: { id: "432", name: "Takuma Sato", full_name: "Takuma Sato" },
  HAR: { id: "4781", name: "Jack Harvey", full_name: "Jack Harvey" },
  ABE: { id: "5836", name: "Jacob Abel", full_name: "Jacob Abel" },
  CAS: { id: "33", name: "Helio Castroneves", full_name: "Helio Castroneves" },
};

class IndycarAdapter extends BaseRacingDriverAdapter {
  SERIES = "irl";
  SERIES_LABEL = "IndyCar Series";
  LEAGUE_NAME = "IndyCar Series";
  LOGO_URL = "https://a.espncdn.com/combiner/i?img=/i/espn/teamlogos/500/indycar_series.png";
  PLAYER_IDS = PLAYER_IDS;
  TEAM_IDS = PLAYER_IDS;
  TEAM_EMOJI = Object.fromEntries(Object.keys(PLAYER_IDS).map((key) => [key, "🏁"]));
  DEMO_TEAMS = {
    PAL: { id: "5632", abbreviation: "PAL", name: "Alex Palou", full_name: "Alex Palou", conference: "IndyCar Series", division: "" },
    KIR: { id: "5704", abbreviation: "KIR", name: "Kyle Kirkwood", full_name: "Kyle Kirkwood", conference: "IndyCar Series", division: "" },
    LUN: { id: "5691", abbreviation: "LUN", name: "Christian Lundgaard", full_name: "Christian Lundgaard", conference: "IndyCar Series", division: "" },
  };
  DEMO_POINTS = { PAL: 631, KIR: 594, LUN: 570 };
}

module.exports = new IndycarAdapter();
