// Season windows: [activeStartMonth, activeEndMonth] (1-indexed, inclusive)
// "active" means regular season or playoffs are ongoing
const { LEAGUES: LEAGUE_REGISTRY } = require("../config/leagues");

const SEASON_WINDOWS = {
  nba: { start: [10, 1], end: [6, 30], nextLabel: "October" },
  mlb: { start: [3, 20], end: [11, 10], nextLabel: "late March" },
  nfl: { start: [9, 1], end: [2, 15], nextLabel: "September" },
  nhl: { start: [10, 1], end: [6, 30], nextLabel: "October" },
  mls: { start: [2, 20], end: [12, 10], nextLabel: "late February" },
  epl: { start: [8, 10], end: [5, 25], nextLabel: "August" },
  laliga: { start: [8, 15], end: [5, 25], nextLabel: "August" },
  bundesliga: { start: [8, 28], end: [5, 20], nextLabel: "August" },
  seriea: { start: [8, 22], end: [5, 25], nextLabel: "August" },
  ligue1: { start: [8, 23], end: [5, 20], nextLabel: "August" },
  primeiraliga: { start: [8, 9], end: [5, 20], nextLabel: "August" },
  eredivisie: { start: [8, 7], end: [5, 20], nextLabel: "August" },
  wnba: { start: [5, 1], end: [10, 20], nextLabel: "May" },
  gleague: { start: [11, 1], end: [4, 15], nextLabel: "November" },
  // Liga MX plays two tournaments a year — Apertura (Jul–Dec) and Clausura
  // (Jan–May) — so the only real gap is the June break.
  ligamx: { start: [7, 16], end: [5, 31], nextLabel: "July" },
  brasileirao: { start: [1, 28], end: [12, 2], nextLabel: "January" },
  nwsl: { start: [3, 13], end: [11, 1], nextLabel: "March" },
  saudipro: { start: [8, 13], end: [5, 29], nextLabel: "August" },
  j1: { start: [8, 7], end: [6, 6], nextLabel: "August" },
  scottish: { start: [7, 31], end: [5, 16], nextLabel: "July" },
  belgian: { start: [8, 7], end: [5, 23], nextLabel: "August" },
  ucl: { start: [7, 1], end: [6, 30], nextLabel: "July" },
  uel: { start: [7, 1], end: [6, 30], nextLabel: "July" },
  ncaab: { start: [11, 1], end: [4, 15], nextLabel: "November" },
  ncaaw: { start: [11, 1], end: [4, 15], nextLabel: "November" },
  ncaaf: { start: [8, 24], end: [1, 20], nextLabel: "August" },
  ncaa_hockey: { start: [10, 1], end: [4, 15], nextLabel: "October" },
};

// League logos on ESPN's free CDN. Several marks are single-colour on
// transparent (the Premier League wordmark is dark purple, the MLS crest has a
// white half), so each needs both variants to stay readable in either theme.
const LEAGUE_LOGOS = {
  nba: { light: "https://a.espncdn.com/i/teamlogos/leagues/500/nba.png", dark: "https://a.espncdn.com/i/teamlogos/leagues/500-dark/nba.png", alt: "NBA" },
  mlb: { light: "https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png", dark: "https://a.espncdn.com/i/teamlogos/leagues/500-dark/mlb.png", alt: "MLB" },
  nfl: { light: "https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png", dark: "https://a.espncdn.com/i/teamlogos/leagues/500-dark/nfl.png", alt: "NFL" },
  nhl: { light: "https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png", dark: "https://a.espncdn.com/i/teamlogos/leagues/500-dark/nhl.png", alt: "NHL" },
  mls: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/19.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/19.png", alt: "MLS" },
  epl: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/23.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/23.png", alt: "Premier League" },
  laliga: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/15.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/15.png", alt: "La Liga" },
  bundesliga: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/10.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/10.png", alt: "Bundesliga" },
  seriea: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/12.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/12.png", alt: "Serie A" },
  ligue1: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/9.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/9.png", alt: "Ligue 1" },
  primeiraliga: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/14.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/14.png", alt: "Primeira Liga" },
  eredivisie: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/11.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/11.png", alt: "Eredivisie" },
  wnba: { light: "https://a.espncdn.com/i/teamlogos/leagues/500/wnba.png", dark: "https://a.espncdn.com/i/teamlogos/leagues/500-dark/wnba.png", alt: "WNBA" },
  gleague: { light: "https://a.espncdn.com/i/teamlogos/leagues/500/nba_gleague.png", dark: "https://a.espncdn.com/i/teamlogos/leagues/500-dark/nba_gleague.png", alt: "NBA G League" },
  ligamx: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/22.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/22.png", alt: "Liga MX" },
  brasileirao: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/85.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/85.png", alt: "Brasileirão" },
  nwsl: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/2323.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2323.png", alt: "NWSL" },
  saudipro: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/2488.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2488.png", alt: "Saudi Pro League" },
  j1: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/2199.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2199.png", alt: "J1 League" },
  scottish: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/45.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/45.png", alt: "Scottish Premiership" },
  belgian: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/6.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/6.png", alt: "Belgian Pro League" },
  ucl: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/2.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2.png", alt: "UEFA Champions League" },
  uel: { light: "https://a.espncdn.com/i/leaguelogos/soccer/500/2310.png", dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2310.png", alt: "UEFA Europa League" },
  ncaab: { light: "https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png", dark: "https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png", alt: "NCAA Men's Basketball" },
  ncaaw: { light: "https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png", dark: "https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png", alt: "NCAA Women's Basketball" },
  ncaaf: { light: "https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-football-college.png", dark: "https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-football-college.png", alt: "College Football" },
  ncaa_hockey: { light: "https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-hockey.png", dark: "https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-hockey.png", alt: "NCAA Men's Ice Hockey" },
};

// The registry is authoritative; these assignments preserve the renderer's
// existing lookup shape while keeping all league metadata in one place.
LEAGUE_REGISTRY.forEach((entry) => {
  SEASON_WINDOWS[entry.key] = entry.seasonWindow;
  LEAGUE_LOGOS[entry.key] = { ...entry.logo, alt: entry.name };
});

/**
 * Section heading rendered inside the marker block, so the whole section is
 * generated rather than half-authored by hand. Placing it inside the markers
 * means it survives every run — a heading written above them would be outside
 * the tool's reach, and one written inside by hand would be overwritten.
 */
function headingLines(sport, title) {
  const logo = LEAGUE_LOGOS[sport];
  if (!logo) return [];
  const mark = `<picture><source media="(prefers-color-scheme: dark)" srcset="${logo.dark}"><img src="${logo.light}" alt="${logo.alt}" height="28" align="top"></picture> `;
  const league = LEAGUE_REGISTRY.find((entry) => entry.key === sport);
  const endpoint = league?.endpointOverride?.match(/\((https:\/\/[^)]+)\)/)?.[1]
    || (league?.endpoint ? `https://site.api.espn.com/apis/site/v2/sports/${league.endpoint}/teams` : null);
  const label = title || `My Favourite ${logo.alt} Team`;
  const heading = endpoint
    ? `## [${mark}${label}](${endpoint})`
    : `## ${mark}${label}`;
  return [heading, ""];
}

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

function renderNba(data, sport = "nba", title) {
  const { team, recentGames, record, emoji, logoUrl } = data;
  const lines = [];

  lines.push(...headingLines(sport, title));
  lines.push(`<img src="${logoUrl}" alt="${team.full_name} logo" width="72" align="right" />`);
  lines.push("");

  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  // The WNBA has conferences but no divisions, so the division half is omitted
  // rather than rendered as a dangling separator.
  lines.push(
    team.division
      ? `${team.conference} Conference · ${team.division} Division`
      : `${team.conference} Conference`
  );
  lines.push(seasonStatusLine(sport));
  lines.push("");

  const winPct =
    record.wins + record.losses > 0
      ? ((record.wins / (record.wins + record.losses)) * 100).toFixed(1)
      : "0.0";

  if (record.wins + record.losses > 0) {
    // The NBA season crosses the new year, so ESPN's end-year is shown as a
    // span. The WNBA plays May–October, so its season is a single year.
    const seasonLabel = sport === "wnba"
      ? `${record.season}`
      : `${record.season - 1}-${record.season}`;
    lines.push(
      `📊 ${seasonLabel} Record: ${record.wins}W - ${record.losses}L (${winPct}%)`
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

function renderMlb(data, title) {
  const { team, recentGames, record, emoji, logoUrl } = data;
  const lines = [];

  lines.push(...headingLines("mlb", title));
  lines.push(`<img src="${logoUrl}" alt="${team.full_name} logo" width="72" align="right" />`);
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

function renderNfl(data, sport = "nfl", title) {
  const { team, recentGames, record, emoji, logoUrl } = data;
  const lines = [];

  lines.push(...headingLines(sport, title));
  lines.push(`<img src="${logoUrl}" alt="${team.full_name} logo" width="72" align="right" />`);
  lines.push("");

  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  lines.push(`${team.conference} · ${team.division}`);
  lines.push(seasonStatusLine(sport));
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

function renderNhl(data, sport = "nhl", title) {
  const { team, recentGames, record, emoji, logoUrl } = data;
  const lines = [];

  lines.push(...headingLines(sport, title));
  lines.push(`<img src="${logoUrl}" alt="${team.full_name} logo" width="72" align="right" />`);
  lines.push("");

  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  lines.push(team.division
    ? `${team.conference} Conference · ${team.division} Division`
    : `${team.conference} Conference`);
  lines.push(seasonStatusLine(sport));
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

function renderSoccer(data, sport = "mls", fallbackLabel = "MLS", title) {
  const { team, recentGames, record, emoji, logoUrl } = data;
  const lines = [];

  lines.push(...headingLines(sport, title));
  lines.push(`<img src="${logoUrl}" alt="${team.full_name} logo" width="72" align="right" />`);
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

function render(sport, data, options = {}) {
  const title = options.title;
  switch (sport) {
    case "nba":
      return renderNba(data, "nba", title);
    case "wnba":
      return renderNba(data, "wnba", title);
    case "gleague":
      return renderNba(data, "gleague", title);
    case "ncaab":
      return renderNba(data, "ncaab", title);
    case "ncaaw":
      return renderNba(data, "ncaaw", title);
    case "mlb":
      return renderMlb(data, title);
    case "nfl":
      return renderNfl(data, "nfl", title);
    case "ncaaf":
      return renderNfl(data, "ncaaf", title);
    case "nhl":
      return renderNhl(data, "nhl", title);
    case "ncaa_hockey":
      return renderNhl(data, "ncaa_hockey", title);
    case "mls":
      return renderSoccer(data, "mls", "MLS", title);
    case "epl":
      return renderSoccer(data, "epl", "Premier League", title);
    case "laliga":
      return renderSoccer(data, "laliga", "La Liga", title);
    case "bundesliga":
      return renderSoccer(data, "bundesliga", "Bundesliga", title);
    case "seriea":
      return renderSoccer(data, "seriea", "Serie A", title);
    case "ligue1":
      return renderSoccer(data, "ligue1", "Ligue 1", title);
    case "primeiraliga":
      return renderSoccer(data, "primeiraliga", "Primeira Liga", title);
    case "eredivisie":
      return renderSoccer(data, "eredivisie", "Eredivisie", title);
    case "ligamx":
      return renderSoccer(data, "ligamx", "Liga MX", title);
    case "brasileirao":
      return renderSoccer(data, "brasileirao", "Série A", title);
    case "nwsl":
      return renderSoccer(data, "nwsl", "NWSL", title);
    case "saudipro":
      return renderSoccer(data, "saudipro", "Saudi Pro League", title);
    case "j1":
      return renderSoccer(data, "j1", "J1 League", title);
    case "scottish":
      return renderSoccer(data, "scottish", "Scottish Premiership", title);
    case "belgian":
      return renderSoccer(data, "belgian", "Belgian Pro League", title);
    case "ucl":
      return renderSoccer(data, "ucl", "UEFA Champions League", title);
    case "uel":
      return renderSoccer(data, "uel", "UEFA Europa League", title);
    default:
      throw new Error(`Unsupported sport: ${sport}. Available: nba, mlb, nfl, nhl, mls, epl, laliga, bundesliga, seriea, ligue1, primeiraliga, eredivisie, wnba, ligamx, brasileirao, nwsl, saudipro, j1, scottish, belgian, ucl, uel, gleague`);
  }
}

module.exports = { render };
