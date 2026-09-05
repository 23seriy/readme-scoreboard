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
    const PLAYER_SPOTLIGHT_SPORTS = ["nba"];
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
