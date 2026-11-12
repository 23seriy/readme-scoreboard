const { validate: validateTeams } = require("../../scripts/validate-team-directory");
const { validate: validatePlayers } = require("../../scripts/validate-player-directory");

describe("validate-team-directory name checks", () => {
  const base = (teams) => ({ teams });

  it("rejects a row whose name is just its abbreviation (PR #512 CON regression)", () => {
    const errors = validateTeams(base([
      { league: "wnba", leagueName: "WNBA", abbreviation: "CON", name: "CON", id: 18 },
    ]));
    expect(errors).toEqual(
      expect.arrayContaining([expect.stringContaining("name is just the abbreviation")]),
    );
  });

  it("rejects a row with a missing or blank name", () => {
    const errors = validateTeams(base([
      { league: "wnba", leagueName: "WNBA", abbreviation: "CON", name: "", id: 18 },
      { league: "wnba", leagueName: "WNBA", abbreviation: "NY", name: null, id: 9 },
    ]));
    expect(errors.filter((e) => e.includes("missing team name"))).toHaveLength(2);
  });

  it("allows the allowlisted clubs whose real name is their initials", () => {
    const errors = validateTeams(base([
      { league: "mls", leagueName: "MLS", abbreviation: "LAFC", name: "LAFC", id: 18966 },
      { league: "greek", leagueName: "Super League Greece", abbreviation: "PAOK", name: "PAOK", id: 605 },
      { league: "denmark", leagueName: "Danish Superliga", abbreviation: "AGF", name: "AGF", id: 7853 },
      { league: "sweden", leagueName: "Allsvenskan", abbreviation: "AIK", name: "AIK", id: 994 },
      { league: "sweden", leagueName: "Allsvenskan", abbreviation: "GAIS", name: "GAIS", id: 8222 },
      { league: "primeiraliga", leagueName: "Primeira Liga", abbreviation: "AVS", name: "AVS", id: 22064 },
    ]));
    expect(errors.filter((e) => e.includes("abbreviation"))).toEqual([]);
  });

  it("still allows a shared abbreviation when the names are real", () => {
    // Two Vienna clubs share ESPN's "VIE" but the directory disambiguates
    // them as AUS/RAP with real names.
    const errors = validateTeams(base([
      { league: "austria", leagueName: "Austrian Bundesliga", abbreviation: "AUS", name: "Austria Vienna", id: 1382 },
      { league: "austria", leagueName: "Austrian Bundesliga", abbreviation: "RAP", name: "Rapid Vienna", id: 519 },
    ]));
    expect(errors.filter((e) => e.includes("abbreviation"))).toEqual([]);
  });
});

describe("validate-player-directory name checks", () => {
  const base = (players) => ({ players });

  it("rejects a player whose name is just its abbreviation", () => {
    const errors = validatePlayers(base([
      { league: "atp", leagueName: "ATP", abbreviation: "ALC", name: "ALC", id: 1 },
    ]));
    expect(errors).toEqual(
      expect.arrayContaining([expect.stringContaining("player name is just the abbreviation")]),
    );
  });

  it("rejects a player with a missing name", () => {
    const errors = validatePlayers(base([
      { league: "atp", leagueName: "ATP", abbreviation: "ALC", name: "", id: 1 },
    ]));
    expect(errors).toEqual(
      expect.arrayContaining([expect.stringContaining("missing player name")]),
    );
  });
});
