// team-directory.json is the generated source of truth for which
// abbreviations a league has (2,360 teams). The adapters' TEAM_IDS tables
// are demo-sized — belgian ships an empty one, scottish only CEL/RAN of 12
// clubs, the NCAA leagues 4 each out of hundreds — so validating against
// them alone rejects real teams users took from the README's own directory.
// The allowed set is therefore the union of the directory (for the league)
// and the adapter's tables. The union never rejects something the adapter
// can fetch, and it preserves validation for the leagues with no directory
// entries at all (atp, wta, nascar, indycar and ufc track players, drivers
// and fighters rather than teams, so their TEAM_IDS are the only list).
const { teams: DIRECTORY_TEAMS } = require("../team-directory.json");

const DIRECTORY_BY_LEAGUE = new Map();
for (const entry of DIRECTORY_TEAMS) {
  if (!entry || typeof entry.abbreviation !== "string") continue;
  if (!DIRECTORY_BY_LEAGUE.has(entry.league)) DIRECTORY_BY_LEAGUE.set(entry.league, new Map());
  const byAbbreviation = DIRECTORY_BY_LEAGUE.get(entry.league);
  if (!byAbbreviation.has(entry.abbreviation)) byAbbreviation.set(entry.abbreviation, entry.name || null);
}

function directoryTeams(sport) {
  const byAbbreviation = DIRECTORY_BY_LEAGUE.get(sport);
  return byAbbreviation ? [...byAbbreviation.keys()].sort() : [];
}

function directoryTeamName(sport, abbreviation) {
  return DIRECTORY_BY_LEAGUE.get(sport)?.get(abbreviation) ?? null;
}

function adapterTeams(adapter, isDemo) {
  if (isDemo) {
    return adapter.DEMO_TEAMS ? Object.keys(adapter.DEMO_TEAMS).sort() : [];
  }
  return [...new Set([
    ...Object.keys(adapter.TEAM_IDS || {}),
    ...Object.keys(adapter.ESPN_TEAM_IDS || {}),
  ])].sort();
}

function supportedTeams(adapter, isDemo, sport) {
  const fromAdapter = adapterTeams(adapter, isDemo);
  if (isDemo || !sport) return fromAdapter;
  return [...new Set([...fromAdapter, ...directoryTeams(sport)])].sort();
}

function teamLabel(adapter, abbreviation, isDemo, sport) {
  if (!isDemo && sport) {
    const name = directoryTeamName(sport, abbreviation);
    if (name) return name;
  }
  const source = isDemo ? adapter.DEMO_TEAMS : (adapter.ESPN_TEAM_IDS || adapter.TEAM_IDS);
  const entry = source?.[abbreviation] || adapter.TEAM_IDS?.[abbreviation];
  return entry && typeof entry === "object" ? entry.full_name || entry.name : null;
}

function validateInputs({ sport, team, entity = "team", isDemo, targetRepo, adapter, supportedSports, player, teamsCount = 1, link }) {
  if (!supportedSports.includes(sport)) {
    throw new Error(`Unsupported sport: "${sport}". Available adapters: ${supportedSports.join(", ")}`);
  }

  if (link && !/^https?:\/\/[^\s]+$/i.test(String(link).trim())) {
    throw new Error(`link: must be an http(s) URL; received "${link}"`);
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
    //   - ufc            same reason: the board is already one fighter's
    //                    record and schedule, and ESPN publishes no MMA
    //                    headshots or season stats to add to it.
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

  const teams = supportedTeams(adapter, isDemo, sport);
  if (teams.length > 0 && !teams.includes(team)) {
    const label = entity === "player"
      ? "player abbreviation"
      : isDemo ? "demo team abbreviation" : "team abbreviation";
    // Show the adapter's own teams first — they are the league's headline
    // teams — then the directory-only ones, so the message stays short and
    // recognisable instead of opening with the alphabetically first rows.
    const fromAdapter = adapterTeams(adapter, isDemo);
    const ordered = [...fromAdapter, ...teams.filter((abbr) => !fromAdapter.includes(abbr))];
    const examples = ordered.slice(0, 8).map((abbr) => {
      const val = teamLabel(adapter, abbr, isDemo, sport);
      return val ? `${abbr} (${val})` : abbr;
    });
    throw new Error(`Unknown ${sport} ${label} "${team}". Try one of: ${examples.join(", ")}${teams.length > 8 ? ", ..." : ""}`);
  }

  if (targetRepo && !/^[^/\s]+\/[^/\s]+$/.test(targetRepo)) {
    throw new Error(`TARGET_REPO must use the owner/repository format; received "${targetRepo}"`);
  }
}

module.exports = { supportedTeams, teamLabel, validateInputs };
