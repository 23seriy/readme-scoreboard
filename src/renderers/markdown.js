// Season windows: [activeStartMonth, activeEndMonth] (1-indexed, inclusive)
// "active" means regular season or playoffs are ongoing
const SEASON_WINDOWS = {
  nba: { start: [10, 1], end: [6, 30], nextLabel: "October" },
  mlb: { start: [3, 20], end: [11, 10], nextLabel: "late March" },
  nfl: { start: [9, 1], end: [2, 15], nextLabel: "September" },
  nhl: { start: [10, 1], end: [6, 30], nextLabel: "October" },
  mls: { start: [2, 20], end: [12, 10], nextLabel: "late February" },
  epl: { start: [8, 10], end: [5, 25], nextLabel: "August" },
  laliga: { start: [8, 15], end: [5, 25], nextLabel: "August" },
};

function isSeasonActive(sport) {
  const window = SEASON_WINDOWS[sport];
  if (!window) return true;
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const [sm, sd] = window.start;
  const [em, ed] = window.end;
  const after = m > sm || (m === sm && d >= sd);
  const before = m < em || (m === em && d <= ed);
  // Handle wrap-around seasons (NFL: Sep–Feb crosses year boundary)
  if (sm > em) return after || before;
  return after && before;
}

function seasonStatusLine(sport) {
  if (isSeasonActive(sport)) return "🟢 Season in progress";
  const window = SEASON_WINDOWS[sport] || {};
  const now = new Date();
  const year = now.getFullYear();
  const [sm, sd] = window.start || [];
  // If this year's start date has already passed, the next one is next year.
  // Compare the full date: on Aug 8 a season starting Aug 10 is still this year.
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const startPassed = sm && (m > sm || (m === sm && d > sd));
  const nextYear = startPassed ? year + 1 : year;
  return `🔴 Off-season · Next season starts ${window.nextLabel || "soon"} ${nextYear}`;
}

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
    year: "numeric",
  });
  const tag = game.gameType === 3 || game.postseason ? " [Playoffs]" : "";

  return `${result === "W" ? "✅" : "❌"} ${result} ${String(teamScore).padStart(3)}-${String(oppScore).padEnd(3)} ${prefix} ${opponent.abbreviation.padEnd(3)} (${dateStr})${tag}`;
}

function renderNba(data) {
  const { team, recentGames, record, emoji, logoUrl } = data;
  const lines = [];

  lines.push(`<img src="${logoUrl}" width="72" align="right" />`);
  lines.push("");

  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  lines.push(`${team.conference} Conference · ${team.division} Division`);
  lines.push(seasonStatusLine("nba"));
  lines.push("");

  const winPct =
    record.wins + record.losses > 0
      ? ((record.wins / (record.wins + record.losses)) * 100).toFixed(1)
      : "0.0";

  if (record.wins + record.losses > 0) {
    lines.push(
      `📊 ${record.season - 1}-${record.season} Record: ${record.wins}W - ${record.losses}L (${winPct}%)`
    );
    lines.push(`   ${generateBarChart(parseFloat(winPct), 25)}`);
    lines.push("");
  }

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

function formatMlbGameResult(game, teamId) {
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
    year: "numeric",
  });

  const tag = game.gameType !== "R" && game.gameType !== undefined ? " [Playoffs]" : "";
  return `${won ? "✅" : "❌"} ${result} ${String(teamScore).padStart(2)}-${String(oppScore).padEnd(2)} ${prefix} ${opponent.abbreviation.padEnd(3)} (${dateStr})${tag}`;
}

function renderMlb(data) {
  const { team, recentGames, record, emoji, logoUrl } = data;
  const lines = [];

  lines.push(`<img src="${logoUrl}" width="72" align="right" />`);
  lines.push("");

  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  lines.push(`${team.league} · ${team.division}`);
  lines.push(seasonStatusLine("mlb"));
  lines.push("");

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

  if (recentGames.length > 0) {
    lines.push("**📅 Recent Games:**");
    lines.push("```");
    for (const game of recentGames) {
      lines.push(formatMlbGameResult(game, team.id));
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
    year: "numeric",
  });

  const tag = game.gameType === 3 ? " [Playoffs]" : "";
  return `${game.won ? "✅" : "❌"} ${result} ${String(game.teamScore).padStart(2)}-${String(game.oppScore).padEnd(2)} ${prefix} ${game.oppAbbr.padEnd(3)} (${dateStr})${tag}`;
}

function renderNfl(data) {
  const { team, recentGames, record, emoji, logoUrl } = data;
  const lines = [];

  lines.push(`<img src="${logoUrl}" width="72" align="right" />`);
  lines.push("");

  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  lines.push(`${team.conference} · ${team.division}`);
  lines.push(seasonStatusLine("nfl"));
  lines.push("");

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

function renderNhl(data) {
  const { team, recentGames, record, emoji, logoUrl } = data;
  const lines = [];

  lines.push(`<img src="${logoUrl}" width="72" align="right" />`);
  lines.push("");

  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  lines.push(`${team.conference} Conference · ${team.division} Division`);
  lines.push(seasonStatusLine("nhl"));
  lines.push("");

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

function formatMlsGameResult(game) {
  const prefix = game.isHome ? "vs" : "@";
  const result = game.won ? "W" : game.drew ? "D" : "L";
  const icon = game.won ? "✅" : game.drew ? "🟡" : "❌";
  const dateStr = new Date(game.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${icon} ${result} ${String(game.teamScore)}-${String(game.oppScore)} ${prefix} ${(game.oppAbbr || "???").padEnd(5)} (${dateStr})`;
}

function renderSoccer(data, sport = "mls", fallbackLabel = "MLS") {
  const { team, recentGames, record, emoji, logoUrl } = data;
  const lines = [];

  lines.push(`<img src="${logoUrl}" width="72" align="right" />`);
  lines.push("");

  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  // MLS splits into conferences; single-table leagues report their own
  // name here, which should be shown as-is.
  const group = team.conference;
  let confLabel = fallbackLabel;
  if (group) {
    const isConference = group.toLowerCase().includes("conference");
    const isEasternWestern = /^(eastern|western)$/i.test(group.trim());
    confLabel = isConference || !isEasternWestern ? group : `${group} Conference`;
  }
  lines.push(`${confLabel}`);
  lines.push(seasonStatusLine(sport));
  lines.push("");

  const totalGames = record.wins + record.losses + record.draws;
  const pts = record.wins * 3 + record.draws;
  if (totalGames > 0) {
    lines.push(`📊 ${record.season} Record: ${record.wins}W - ${record.losses}L - ${record.draws}D  (${pts} pts)`);
    const winPct = ((record.wins + record.draws * 0.5) / totalGames) * 100;
    lines.push(`   ${generateBarChart(winPct, 25)}`);
    lines.push("");
  }

  if (recentGames.length > 0) {
    lines.push("**📅 Recent Games:**");
    lines.push("```");
    for (const game of recentGames) {
      lines.push(formatMlsGameResult(game));
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
    case "nhl":
      return renderNhl(data);
    case "mls":
      return renderSoccer(data, "mls", "MLS");
    case "epl":
      return renderSoccer(data, "epl", "Premier League");
    case "laliga":
      return renderSoccer(data, "laliga", "La Liga");
    default:
      throw new Error(`Unsupported sport: ${sport}. Available: nba, mlb, nfl, nhl, mls, epl, laliga`);
  }
}

module.exports = { render };
