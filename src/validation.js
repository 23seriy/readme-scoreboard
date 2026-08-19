function supportedTeams(adapter, isDemo) {
  const source = isDemo ? adapter.DEMO_TEAMS : (adapter.TEAM_IDS || adapter.ESPN_TEAM_IDS);
  return source ? Object.keys(source).sort() : [];
}

function validateInputs({ sport, team, isDemo, targetRepo, adapter, supportedSports }) {
  if (!supportedSports.includes(sport)) {
    throw new Error(`Unsupported sport: "${sport}". Available adapters: ${supportedSports.join(", ")}`);
  }

  const teams = supportedTeams(adapter, isDemo);
  if (teams.length > 0 && !teams.includes(team)) {
    const mode = isDemo ? "demo team" : "team";
    throw new Error(`Unknown ${sport} ${mode} abbreviation "${team}". Try one of: ${teams.slice(0, 8).join(", ")}${teams.length > 8 ? ", ..." : ""}`);
  }

  if (targetRepo && !/^[^/\s]+\/[^/\s]+$/.test(targetRepo)) {
    throw new Error(`TARGET_REPO must use the owner/repository format; received "${targetRepo}"`);
  }
}

module.exports = { supportedTeams, validateInputs };
