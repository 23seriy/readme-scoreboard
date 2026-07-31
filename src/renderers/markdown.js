function generateBarChart(percent, size) {
  const syms = "░▏▎▍▌▋▊▉█";
  const frac = Math.floor((size * 8 * percent) / 100);
  const barsFull = Math.floor(frac / 8);
  if (barsFull >= size) {
    return syms.substring(8, 9).repeat(size);
  }
  const semi = frac % 8;
  return [syms.substring(8, 9).repeat(barsFull), syms.substring(semi, semi + 1)]
    .join("")
    .padEnd(size, syms.substring(0, 1));
}

function formatGameResult(game, teamId) {
  const isHome = game.home_team.id === teamId;
  const teamScore = isHome ? game.home_team_score : game.visitor_team_score;
  const oppScore = isHome ? game.visitor_team_score : game.home_team_score;
  const opponent = isHome ? game.visitor_team : game.home_team;
  const won = teamScore > oppScore;
  const prefix = isHome ? "vs" : "@";
  const result = won ? "W" : "L";
  const dateStr = new Date(game.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${result === "W" ? "✅" : "❌"} ${result} ${String(teamScore).padStart(3)}-${String(oppScore).padEnd(3)} ${prefix} ${opponent.abbreviation.padEnd(3)} (${dateStr})`;
}

function renderNba(data) {
  const { team, recentGames, record, emoji, logoUrl } = data;
  const lines = [];

  // Team logo
  lines.push(`<img src="${logoUrl}" width="60" align="right" />`);
  lines.push("");

  // Header
  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  lines.push(`${team.conference} Conference · ${team.division} Division`);
  lines.push("");

  // Season record
  const winPct =
    record.wins + record.losses > 0
      ? ((record.wins / (record.wins + record.losses)) * 100).toFixed(1)
      : "0.0";

  if (record.wins + record.losses > 0) {
    lines.push(
      `📊 ${record.season}-${record.season + 1} Record: ${record.wins}W - ${record.losses}L (${winPct}%)`
    );
    lines.push(`   ${generateBarChart(parseFloat(winPct), 25)}`);
    lines.push("");
  }

  // Recent games
  if (recentGames.length > 0) {
    lines.push("**📅 Recent Games:**");
    lines.push("```");
    for (const game of recentGames) {
      lines.push(formatGameResult(game, team.id));
    }
    lines.push("```");
  } else {
    lines.push("📅 No recent games found");
  }

  return lines.join("\n");
}

function formatMlbGameResult(game) {
  const prefix = game.isHome ? "vs" : "@";
  const result = game.won ? "W" : "L";
  const dateStr = new Date(game.date + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${game.won ? "✅" : "❌"} ${result} ${String(game.teamScore).padStart(2)}-${String(game.oppScore).padEnd(2)} ${prefix} ${game.oppAbbr.padEnd(3)} (${dateStr})`;
}

function renderMlb(data) {
  const { team, recentGames, record, emoji, logoUrl } = data;
  const lines = [];

  // Team logo
  lines.push(`<img src="${logoUrl}" width="60" align="right" />`);
  lines.push("");

  // Header
  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  lines.push(`${team.league} · ${team.division}`);
  lines.push("");

  // Season record
  const totalGames = record.wins + record.losses;
  const winPct = totalGames > 0
    ? ((record.wins / totalGames) * 100).toFixed(1)
    : "0.0";

  if (totalGames > 0) {
    lines.push(
      `📊 ${record.season} Record: ${record.wins}W - ${record.losses}L (${winPct}%)`
    );
    lines.push(`   ${generateBarChart(parseFloat(winPct), 25)}`);
    lines.push("");
  }

  // Recent games
  if (recentGames.length > 0) {
    lines.push("**📅 Recent Games:**");
    lines.push("```");
    for (const game of recentGames) {
      lines.push(formatMlbGameResult(game));
    }
    lines.push("```");
  } else {
    lines.push("📅 No recent games found");
  }

  return lines.join("\n");
}

function formatNflGameResult(game) {
  const prefix = game.isHome ? "vs" : "@";
  const result = game.won ? "W" : "L";
  const dateStr = new Date(game.date + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${game.won ? "✅" : "❌"} ${result} ${String(game.teamScore).padStart(2)}-${String(game.oppScore).padEnd(2)} ${prefix} ${game.oppAbbr.padEnd(3)} (${dateStr})`;
}

function renderNfl(data) {
  const { team, recentGames, record, emoji, logoUrl } = data;
  const lines = [];

  // Team logo
  lines.push(`<img src="${logoUrl}" width="60" align="right" />`);
  lines.push("");

  // Header
  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  lines.push(`${team.conference} · ${team.division}`);
  lines.push("");

  // Season record
  const totalGames = record.wins + record.losses;
  const winPct = totalGames > 0
    ? ((record.wins / totalGames) * 100).toFixed(1)
    : "0.0";

  if (totalGames > 0) {
    lines.push(
      `📊 ${record.season} Season: ${record.wins}W - ${record.losses}L (${winPct}%)`
    );
    lines.push(`   ${generateBarChart(parseFloat(winPct), 25)}`);
    lines.push("");
  }

  // Recent games
  if (recentGames.length > 0) {
    lines.push("**📅 Recent Games:**");
    lines.push("```");
    for (const game of recentGames) {
      lines.push(formatNflGameResult(game));
    }
    lines.push("```");
  } else {
    lines.push("📅 No recent games found");
  }

  return lines.join("\n");
}

function render(sport, data) {
  switch (sport) {
    case "nba":
      return renderNba(data);
    case "mlb":
      return renderMlb(data);
    case "nfl":
      return renderNfl(data);
    default:
      throw new Error(`Unsupported sport: ${sport}. Available: nba, mlb, nfl`);
  }
}

module.exports = { render };
