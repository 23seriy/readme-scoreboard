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
    //   - atp, wta       already render as a single player board
    //                    (entity: player), so a spotlight inside one is
    //                    redundant.
    //   - f1             renders a constructor board from a teams endpoint and
    //                    has no athlete roster, so there is no player to
    //                    spotlight.
    //   - ncaaf, gleague, ncaa_hockey
    //                    ESPN publishes no athlete stats for these at all: the
    //                    splits endpoint 404s, the ncaaf and gleague game logs
    //                    come back empty, and ncaa_hockey's gamelog 404s.
    //
    // ncaab and ncaaw used to be on this list. They aren't any more: ESPN now
    // serves the same splits payload and game log the NBA uses (re-verified
    // against the live endpoints), so `player:` works there too. If a league's
    // upstream data changes, re-check the endpoints — these exclusions are
    // verified against the live APIs, not assumed.
    const PLAYER_SPOTLIGHT_SPORTS = [
      // Dedicated per-athlete stat APIs. The WNBA and college basketball share
      // the NBA's athlete endpoint shape (avgPoints/avgRebounds/avgAssists plus
      // a game log).
      "nba", "wnba", "ncaab", "ncaaw", "mlb", "nfl", "nhl",
      // Soccer — season totals are summed from the game log, which every
      // league publishes.
      "mls", "epl", "laliga", "bundesliga", "seriea", "ligue1",
      "primeiraliga", "eredivisie", "ligamx", "brasileirao", "nwsl",
      "saudipro", "j1", "scottish", "belgian", "ucl", "uel",
      "argentina", "aleague", "isl", "csl", "greek", "austria",
      "denmark", "norway", "sweden", "worldcup",
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
