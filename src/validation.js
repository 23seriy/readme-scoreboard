function supportedTeams(adapter, isDemo) {
  const source = isDemo ? adapter.DEMO_TEAMS : (adapter.TEAM_IDS || adapter.ESPN_TEAM_IDS);
  return source ? Object.keys(source).sort() : [];
}

function teamLabel(adapter, abbreviation, isDemo) {
  const source = isDemo ? adapter.DEMO_TEAMS : (adapter.ESPN_TEAM_IDS || adapter.TEAM_IDS);
  const entry = source?.[abbreviation] || adapter.TEAM_IDS?.[abbreviation];
  return entry && typeof entry === "object" ? entry.full_name || entry.name : null;
}

function validateInputs({ sport, team, entity = "team", isDemo, targetRepo, adapter, supportedSports, player, teamsCount = 1 }) {
  if (!supportedSports.includes(sport)) {
    throw new Error(`Unsupported sport: "${sport}". Available adapters: ${supportedSports.join(", ")}`);
  }

  if (player) {
    if (teamsCount > 1) {
      throw new Error("player: is not supported together with teams: (multiple boards). Use a single team: instead.");
    }
    // Leagues whose adapter implements fetchPlayerSpotlight. Each needs a
    // roster endpoint to resolve the name plus per-athlete stats or game-log
    // data. Excluded on purpose, with the reason:
    //   - f1, atp, wta   already render as a single player board
    //                    (entity: player), so a spotlight inside one is
    //                    redundant.
    //   - wnba, ncaab, ncaaw
    //                    ESPN answers the athlete stats endpoint with 200 but
    //                    an empty values array, and the game log is empty too
    //                    (verified for A'ja Wilson, a multi-time MVP). Every
    //                    spotlight would render zeroes.
    //   - ncaaf, gleague, ncaa_hockey
    //                    ESPN publishes no athlete stats for these at all.
    const PLAYER_SPOTLIGHT_SPORTS = [
      // Dedicated per-athlete stat APIs.
      "nba", "mlb", "nfl", "nhl",
      // Soccer — season totals are summed from the game log, which every
      // league publishes.
      "mls", "epl", "laliga", "bundesliga", "seriea", "ligue1",
      "primeiraliga", "eredivisie", "ligamx", "brasileirao", "nwsl",
      "saudipro", "j1", "scottish", "belgian", "ucl", "uel",
      "argentina", "aleague", "isl", "csl",
    ];
    if (!PLAYER_SPOTLIGHT_SPORTS.includes(sport)) {
      throw new Error(`player: is not yet supported for sport "${sport}". Currently supported: ${PLAYER_SPOTLIGHT_SPORTS.join(", ")}.`);
    }
  }

  const teams = supportedTeams(adapter, isDemo);
  if (teams.length > 0 && !teams.includes(team)) {
    const label = entity === "player"
      ? "player abbreviation"
      : isDemo ? "demo team abbreviation" : "team abbreviation";
    const examples = teams.slice(0, 8).map((abbr) => {
      const val = teamLabel(adapter, abbr, isDemo);
      return val ? `${abbr} (${val})` : abbr;
    });
    throw new Error(`Unknown ${sport} ${label} "${team}". Try one of: ${examples.join(", ")}${teams.length > 8 ? ", ..." : ""}`);
  }

  if (targetRepo && !/^[^/\s]+\/[^/\s]+$/.test(targetRepo)) {
    throw new Error(`TARGET_REPO must use the owner/repository format; received "${targetRepo}"`);
  }
}

module.exports = { supportedTeams, teamLabel, validateInputs };
