// Season windows: [activeStartMonth, activeEndMonth] (1-indexed, inclusive)
// "active" means regular season or playoffs are ongoing
const { LEAGUES: LEAGUE_REGISTRY } = require("../config/leagues");
const { utcParts } = require("../clock");

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
  // The dated window (`fallback`) travels with the month/day window because the
  // status line prefers it — see seasonStatusLine.
  SEASON_WINDOWS[entry.key] = { ...entry.seasonWindow, fallback: entry.fallback?.[0] };
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
  // Individual sports (tennis, F1) track players rather than teams, so the
  // default heading reads "Player" instead of "Team". A league may name the
  // noun outright where neither fits (UFC fields fighters).
  const entityLabel = league?.entityLabel || (league?.entity === "player" ? "Player" : "Team");
  const label = title || `My Favourite ${logo.alt} ${entityLabel}`;
  const heading = endpoint
    ? `## [${mark}${label}](${endpoint})`
    : `## ${mark}${label}`;
  return [heading, ""];
}

function isSeasonActive(sport) {
  const window = SEASON_WINDOWS[sport];
  if (!window) return true;
  // UTC, so the season boundary lands at the same instant on every host.
  const { month: m, day: d } = utcParts();
  // Prefer the DATED window's start, exactly as seasonStatusLine does. The
  // month/day is a rounded guess and disagrees for 15 of 43 leagues, so reading
  // it here made a season look underway weeks before its first fixture: the
  // A-League's guess says July 1 while its opener is October 16, so every
  // A-League and ISL board claimed "🟢 Season in progress" through the whole
  // off-season. Only the month/day remains for the wrap-around end comparison,
  // because no dated end is stored.
  const dated = /^\d{4}-\d{2}-\d{2}$/.test(String(window.fallback || ""))
    ? String(window.fallback)
    : null;
  const startMonth = dated ? Number(dated.slice(5, 7)) : window.start[0];
  const startDay = dated ? Number(dated.slice(8, 10)) : window.start[1];
  const [em, ed] = window.end;
  const after = m > startMonth || (m === startMonth && d >= startDay);
  const before = m < em || (m === em && d <= ed);
  // Handle wrap-around seasons (NFL: Sep–Feb crosses year boundary)
  if (startMonth > em) return after || before;
  return after && before;
}

function seasonStatusLine(sport) {
  if (isSeasonActive(sport)) return "🟢 Season in progress";
  const window = SEASON_WINDOWS[sport] || {};
  const { year: utcYear } = utcParts();
  const today = new Date().toISOString().slice(0, 10);
  const [sm, sd] = window.start || [];
  const pad = (n) => String(n).padStart(2, "0");
  // Prefer the DATED window. The registry keeps both a month/day (`start`) and a
  // real `fallback` date, and they disagree for most leagues because the
  // month/day is a rounded guess: the NBA's said October 1 while its own dated
  // window — and its opener — is October 20. Only the dated one is trustworthy,
  // so the day comes from it whenever it exists.
  const dated = /^\d{4}-\d{2}-\d{2}$/.test(String(window.fallback || ""))
    ? String(window.fallback)
    : null;
  let nextStart = null;
  if (dated && window.nextStartYear) {
    nextStart = `${window.nextStartYear}-${dated.slice(5)}`;
  } else if (dated) {
    // Already behind us this year? The next edition starts on the same day next
    // year, which is the arithmetic the month-only version kept getting wrong.
    nextStart = dated > today ? dated : `${Number(dated.slice(0, 4)) + 1}-${dated.slice(5)}`;
  } else if (sm && sd) {
    const { month: m, day: d } = utcParts();
    const startPassed = m > sm || (m === sm && d > sd);
    const nextYear = window.nextStartYear ?? (startPassed ? utcYear + 1 : utcYear);
    nextStart = `${nextYear}-${pad(sm)}-${pad(sd)}`;
  }
  const year = nextStart ? nextStart.slice(0, 4) : (utcYear + 1);
  const when = nextStart
    ? formatDate(nextStart, { month: "long", day: "numeric" })
    : window.nextLabel || "soon";
  return `🔴 Off-season · Next season starts ${when}${nextStart ? `, ${year}` : ` ${year}`}`;
}

// Optional richer stats rendered as their own row after the season line.
// Adapters may supply `standing` and `nextGame`; lines are omitted when absent
// so existing boards are unchanged for leagues that don't provide them yet. A
// leading blank line separates them from the conference/season paragraph so
// they render as a distinct, clearly visible row instead of wrapping awkwardly
// into the season status. The last-five `form` line is intentionally not
// rendered here: the Recent Games list already shows the W/L/D sequence, so a
// separate 🔥 Form line is redundant.
function extraTeamLines(data) {
  const lines = [];
  const { standing, nextGame } = data || {};

  if (standing && standing.position) {
    // Some standings come from the last COMPLETED season — the NHL reports no
    // in-season standing off-season, so its board would otherwise present a
    // final table as a live position. Naming the season keeps that honest, and
    // is omitted for leagues whose standing is current.
    const scope = standing.season ? ` (${standing.season})` : "";
    lines.push(`🏅 Standing${scope}: ${standing.label ? `${standing.label} · ` : ""}${standing.position}`);
  }

  if (nextGame && nextGame.opponent) {
    // Each row needs a blank line before it, not just a line break. GitHub
    // renders a single "\n" as a soft break, so standing and next game were
    // joined into one wrapped paragraph on the profile even though they are
    // separate array entries here. A blank line between them is what makes
    // them two rows.
    if (lines.length) lines.push("");
    // Format in the SPORT's timezone, not the viewer's. A fixture is an
    // instant, and an evening kick-off in the Americas lands on the next UTC
    // day: Palmeiras v Bahia is 2026-10-09T00:30Z, which is the evening of
    // October 8 in Brazil. Without an explicit zone this printed "Oct 9" on a
    // UTC machine and "Oct 8" on a Brazilian one, so the same board showed two
    // different dates depending on who generated it. Soccer dates are
    // generated in UTC elsewhere in this file, so a soccer board stays
    // internally consistent.
    const when = nextGame.date
      ? formatDate(nextGame.date, {
          month: "short",
          day: "numeric",
          timeZone: nextGame.timeZone || "UTC",
        })
      : "next";
    const place = nextGame.isHome !== false ? "vs" : "@";
    lines.push(`📅 Next: ${place} ${nextGame.opponent} (${when})`);
  }

  return lines.length ? ["", ...lines] : lines;
}

/**
 * Player spotlight heading, optionally with the athlete's headshot.
 *
 * The headshot is rendered as its own right-floated image, matching how the
 * team logo sits beside the team heading. It is entirely optional: adapters
 * that can't supply an athlete id omit `headshotUrl`, and the heading falls
 * back to the plain bold text so nothing changes for those leagues.
 */
function pushSpotlightHeading(lines, emoji, spotlight) {
  lines.push(`**${emoji} Player Spotlight: ${spotlight.name}**`);
  pushSpotlightHeadshot(lines, spotlight);
}

// The image is emitted on its own line directly after the heading. It is
// deliberately not emitted in compact mode (compactMarkdown strips every
// `<img>` line anyway), so compact boards stay text-only.
//
// Sized by HEIGHT, not width. Each league serves its headshots at a different
// aspect ratio — ESPN's are 600x436 landscape, MLB's are 213x320 portrait and
// the NHL's are 336x336 square — so constraining the width alone makes the
// rendered heights differ wildly (72x52, 72x108, 72x72). Constraining the
// height instead gives every sport the same vertical footprint, which is what
// makes the boards look consistent beside each other. The width is then free
// to follow the natural aspect ratio, and `align="right"` floats the image so
// the differing widths don't disturb the text.
function pushSpotlightHeadshot(lines, spotlight) {
  if (!spotlight.headshotUrl) return;
  lines.push(
    `<img src="${spotlight.headshotUrl}" alt="${spotlight.name} headshot" height="72" align="right" />`
  );
}

// The timezone each sport's games are PLAYED in, used to render a game date.
//
// A game is an instant, and these leagues play in the evening: ESPN reports the
// Lakers' 2026-05-11 game as `2026-05-12T02:30Z`, because 7:30pm in Los Angeles
// is already the next day in UTC. Formatting that instant in the viewer's zone
// therefore printed May 12 on a UTC machine and May 11 in New York — the same
// board showing two different dates. That is how this surfaced: regenerating
// the example boards on CI (UTC) produced eight files that differed from the
// same command run locally (EDT), so the "boards are current" gate went red on
// a timezone difference rather than on a code change.
//
// The zone is the one the league's own schedule is published in, so the board
// agrees with the fixture list a fan would read.
const SPORT_TIMEZONES = {
  nba: "America/New_York",
  wnba: "America/New_York",
  ncaab: "America/New_York",
  ncaaw: "America/New_York",
  ncaaf: "America/New_York",
  ncaa_hockey: "America/New_York",
  nfl: "America/New_York",
  mlb: "America/New_York",
  nhl: "America/New_York",
  mls: "America/New_York",
  gleague: "America/New_York",
  // European, Mexican and South American leagues also kick off in the evening
  // locally, so the same boundary applies to their dates.
  epl: "Europe/London",
  ucl: "Europe/London",
  uel: "Europe/London",
  scottish: "Europe/London",
  laliga: "Europe/Madrid",
  seriea: "Europe/Rome",
  bundesliga: "Europe/Berlin",
  ligue1: "Europe/Paris",
  eredivisie: "Europe/Amsterdam",
  primeiraliga: "Europe/Lisbon",
  belgian: "Europe/Brussels",
  austria: "Europe/Vienna",
  greek: "Europe/Athens",
  denmark: "Europe/Copenhagen",
  norway: "Europe/Oslo",
  sweden: "Europe/Stockholm",
  brasileirao: "America/Sao_Paulo",
  argentina: "America/Argentina/Buenos_Aires",
  ligamx: "America/Mexico_City",
};

// Render a game, fixture or result date in the zone that sport plays in, falling
// back to UTC for any league without an entry (lacrosse-style events, UFC cards,
// motorsport sessions and tennis matches are quoted in UTC by convention).
function formatSportDate(sport, value, options = {}) {
  return formatDate(value, {
    ...options,
    timeZone: SPORT_TIMEZONES[sport] || "UTC",
  });
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

function formatGameResult(game, teamId, sport) {
  const isHome = game.home_team.id === teamId;
  const teamScore = isHome ? game.home_team_score : game.visitor_team_score;
  const oppScore = isHome ? game.visitor_team_score : game.home_team_score;
  const opponent = isHome ? game.visitor_team : game.home_team;
  const won = teamScore > oppScore;
  const prefix = isHome ? "vs" : "@";
  const result = won ? "W" : "L";
  const dateStr = formatSportDate(sport, game.date, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const tag = game.gameType === 3 || game.postseason ? " [Playoffs]" : "";

  return `${result === "W" ? "✅" : "❌"} ${result} ${String(teamScore).padStart(3)}-${String(oppScore).padEnd(3)} ${prefix} ${opponent.abbreviation.padEnd(3)} (${dateStr})${tag}`;
}

function renderNba(data, sport = "nba", title, compact = false) {
  const { team, recentGames, record, emoji, logoUrl, spotlight } = data;
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
  lines.push(...extraTeamLines(data));
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
      lines.push(formatGameResult(game, team.id, sport));
    }
    lines.push("```");
  } else {
    lines.push("📅 No recent games found");
  }

  if (spotlight) {
    lines.push("");
    if (compact) {
      const { points, rebounds, assists } = spotlight.season;
      lines.push(`${emoji} ${spotlight.name} · ${points.toFixed(1)} PPG · ${rebounds.toFixed(1)} RPG · ${assists.toFixed(1)} APG`);
    } else {
      pushSpotlightHeading(lines, emoji, spotlight);
      const { points, rebounds, assists } = spotlight.season;
      lines.push(`${points.toFixed(1)} PPG · ${rebounds.toFixed(1)} RPG · ${assists.toFixed(1)} APG`);
      if (spotlight.lastGame) {
        const { points: gp, rebounds: gr, assists: ga, minutes: gm, date: gdate, opponent: gopp } = spotlight.lastGame;
        let detail = `${gp} PTS · ${gr} REB · ${ga} AST · ${gm} MIN`;
        if (gopp) {
          // Render the date in the game's timezone so a late-night game doesn't
          // shift a day. NBA games are given as UTC instants; interpreting them
          // in US Eastern time shows the actual calendar day the game was played.
          const when = gdate
            ? formatDate(gdate, { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" })
            : "";
          detail += ` vs ${gopp}${when ? ` (${when})` : ""}`;
        }
        lines.push("");
        lines.push("**📅 Last Game:**");
        lines.push("```");
        lines.push(detail);
        lines.push("```");
      }
    }
  }

  return lines.join("\n");
}

// Football spotlight: the headline stats depend on the player's position group
// (passing for a QB, rushing for a back, receiving for a receiver).
function renderNflSpotlight(lines, spotlight, emoji, compact) {
  const { season = {}, lastGame, position } = spotlight;
  const stat = (value) => (value == null ? 0 : value);
  if (compact) {
    if (position === "QB") {
      lines.push(`${emoji} ${spotlight.name} · ${stat(season.passingYards)} PASS YDS · ${stat(season.passingTouchdowns)} PASS TD`);
    } else if (position === "RB") {
      lines.push(`${emoji} ${spotlight.name} · ${stat(season.rushingYards)} RUSH YDS · ${stat(season.rushingTouchdowns)} RUSH TD`);
    } else {
      lines.push(`${emoji} ${spotlight.name} · ${stat(season.receptions)} REC · ${stat(season.receivingYards)} REC YDS`);
    }
    return;
  }
  lines.push(`**${emoji} Player Spotlight: ${spotlight.name}**`);
  pushSpotlightHeadshot(lines, spotlight);
  if (position === "QB") {
    lines.push(`${stat(season.passingYards)} PASS YDS · ${stat(season.passingTouchdowns)} PASS TD · ${stat(season.rushingYards)} RUSH YDS`);
  } else if (position === "RB") {
    lines.push(`${stat(season.rushingYards)} RUSH YDS · ${stat(season.rushingTouchdowns)} RUSH TD · ${stat(season.receptions)} REC`);
  } else {
    lines.push(`${stat(season.receptions)} REC · ${stat(season.receivingYards)} REC YDS · ${stat(season.receivingTouchdowns)} REC TD`);
  }
  if (lastGame) {
    const parts = [];
    if (lastGame.passingYards != null) parts.push(`${lastGame.passingYards} PASS YDS`);
    if (lastGame.passingTouchdowns != null) parts.push(`${lastGame.passingTouchdowns} PASS TD`);
    if (lastGame.rushingYards != null) parts.push(`${lastGame.rushingYards} RUSH YDS`);
    if (lastGame.receptions != null) parts.push(`${lastGame.receptions} REC`);
    if (lastGame.receivingYards != null) parts.push(`${lastGame.receivingYards} REC YDS`);
    let detail = parts.length > 0 ? parts.join(" · ") : "No stats recorded";
    if (lastGame.opponent) {
      const when = lastGame.date
        ? formatDate(lastGame.date, { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" })
        : "";
      detail += ` vs ${lastGame.opponent}${when ? ` (${when})` : ""}`;
    }
    lines.push("");
    lines.push("**📅 Last Game:**");
    lines.push("```");
    lines.push(detail);
    lines.push("```");
  }
}

// Hockey spotlight: goalies get saves/save percentage, skaters get G/A/P.
function renderNhlSpotlight(lines, spotlight, emoji, compact) {
  const { season = {}, lastGame } = spotlight;
  const stat = (value) => (value == null ? 0 : value);
  const isGoalie = season.isGoalie;
  if (isGoalie) {
    const svPct = season.savePercentage ? season.savePercentage.toFixed(3).replace(/^0/, "") : ".000";
    const gaa = season.goalsAgainstAverage ? season.goalsAgainstAverage.toFixed(2) : "0.00";
    if (compact) {
      lines.push(`${emoji} ${spotlight.name} · ${stat(season.wins)} W · ${gaa} GAA · ${svPct} SV%`);
    } else {
      pushSpotlightHeading(lines, emoji, spotlight);
      lines.push(`${stat(season.wins)} W · ${gaa} GAA · ${svPct} SV%`);
    }
  } else if (compact) {
    lines.push(`${emoji} ${spotlight.name} · ${stat(season.goals)} G · ${stat(season.assists)} A · ${stat(season.points)} PTS`);
  } else {
    pushSpotlightHeading(lines, emoji, spotlight);
    lines.push(`${stat(season.goals)} G · ${stat(season.assists)} A · ${stat(season.points)} PTS`);
  }
  if (lastGame && !compact) {
    let detail = isGoalie
      ? `${stat(lastGame.saves)} SV · ${stat(lastGame.shotsAgainst)} SA`
      : `${stat(lastGame.goals)} G · ${stat(lastGame.assists)} A · ${stat(lastGame.points)} P`;
    if (lastGame.opponent) {
      const when = lastGame.date
        ? formatDate(lastGame.date, { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" })
        : "";
      detail += ` vs ${lastGame.opponent}${when ? ` (${when})` : ""}`;
    }
    lines.push("");
    lines.push("**📅 Last Game:**");
    lines.push("```");
    lines.push(detail);
    lines.push("```");
  }
}

function formatMlbGameResult(game, teamId, sport) {
  const isHome = game.home_team.id === teamId;
  const teamScore = isHome ? game.home_team_score : game.visitor_team_score;
  const oppScore = isHome ? game.visitor_team_score : game.home_team_score;
  const opponent = isHome ? game.visitor_team : game.home_team;
  const won = teamScore > oppScore;
  const prefix = isHome ? "vs" : "@";
  const result = won ? "W" : "L";
  const dateStr = formatSportDate(sport, game.date, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const tag = game.gameType !== "R" && game.gameType !== undefined ? " [Playoffs]" : "";
  return `${won ? "✅" : "❌"} ${result} ${String(teamScore).padStart(2)}-${String(oppScore).padEnd(2)} ${prefix} ${opponent.abbreviation.padEnd(3)} (${dateStr})${tag}`;
}

function renderMlb(data, title) {
  const { team, recentGames, record, emoji, logoUrl, spotlight } = data;
  const lines = [];

  lines.push(...headingLines("mlb", title));
  lines.push(`<img src="${logoUrl}" alt="${team.full_name} logo" width="72" align="right" />`);
  lines.push("");

  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  lines.push(`${team.league} · ${team.division}`);
  lines.push(seasonStatusLine("mlb"));
  lines.push(...extraTeamLines(data));
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
      // renderMlb is MLB-specific and takes no `sport` argument, so the key is
      // passed literally.
      lines.push(formatMlbGameResult(game, team.id, "mlb"));
    }
    lines.push("```");
  } else {
    lines.push("📅 No recent games found");
  }

  if (spotlight) {
    lines.push("");
    const { avg, homeRuns, rbi } = spotlight.season;
    pushSpotlightHeading(lines, emoji, spotlight);
    const battingAvg = avg ? avg.toFixed(3).replace(/^0/, "") : ".000";
    lines.push(`${battingAvg} AVG · ${homeRuns} HR · ${rbi} RBI`);
    if (spotlight.lastGame) {
      const { hits, homeRuns: hr, rbi: lastRbi, avg: lastAvg, date: gdate, opponent: gopp } = spotlight.lastGame;
      const lastAvgStr = lastAvg ? lastAvg.toFixed(3).replace(/^0/, "") : ".000";
      let detail = `${hits} H · ${hr} HR · ${lastRbi} RBI · ${lastAvgStr} AVG`;
      if (gopp) {
        // Render the date in Eastern time so a late-night game doesn't shift a
        // day. MLB game dates are calendar dates in the MLB Stats API, while
        // demo data uses full ISO timestamps, so both shapes are handled.
        const when = gdate ? formatCalendarDate(gdate, "mlb") : "";
        detail += ` vs ${gopp}${when ? ` (${when})` : ""}`;
      }
      lines.push("");
      lines.push("**📅 Last Game:**");
      lines.push("```");
      lines.push(detail);
      lines.push("```");
    }
  }

  return lines.join("\n");
}

// Render a game date as "Jan 3, 2026". The live feeds return calendar dates
// ("2026-09-15") while demo data carries full ISO timestamps, so a bare date is
// anchored to midday to stop a UTC parse shifting it to the previous day.
/**
 * Format a date for a board.
 *
 * A calendar date — a demo clock value or a schedule date that ESPN publishes as
 * plain YYYY-MM-DD, with no time and no zone — must read the same on every
 * machine and in every zone: 2026-01-03 means the 3rd. Parsing it as an instant
 * and rendering it through the machine's zone is what made the committed example
 * boards differ by a day between a laptop and a CI runner, and the same mistake
 * rendered live schedule dates a day early on any machine west of UTC.
 *
 * Full instants are real moments, so they keep their existing handling and are
 * formatted in the zone the caller asks for.
 */
function formatDate(value, options) {
  if (!value) return "";
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T00:00:00Z`)
      .toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
  }
  return new Date(raw).toLocaleDateString("en-US", options);
}

function formatCalendarDate(value, sport) {
  const options = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  // When a sport is supplied the date is a real instant from a live feed, so it
  // must be quoted in that sport's zone rather than the host's. Without one the
  // value is a bare calendar date and formatDate already pins it to UTC.
  return sport
    ? formatSportDate(sport, value, options)
    : formatDate(value, options);
}

function formatNflGameResult(game, sport = "nfl") {
  const prefix = game.isHome ? "vs" : "@";
  const result = game.won ? "W" : "L";
  // ESPN reports kick-off as a UTC instant, so the zone must be explicit or a
  // Saturday-night game reads as Sunday on a host east of the US.
  const dateStr = formatCalendarDate(game.date, sport);

  const tag = game.gameType === 3 ? " [Playoffs]" : "";
  return `${game.won ? "✅" : "❌"} ${result} ${String(game.teamScore).padStart(2)}-${String(game.oppScore).padEnd(2)} ${prefix} ${game.oppAbbr.padEnd(3)} (${dateStr})${tag}`;
}

function renderNfl(data, sport = "nfl", title, compact = false) {
  const { team, recentGames, record, emoji, logoUrl, spotlight } = data;
  const lines = [];

  lines.push(...headingLines(sport, title));
  lines.push(`<img src="${logoUrl}" alt="${team.full_name} logo" width="72" align="right" />`);
  lines.push("");

  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  // College conferences have no divisions, so the separator is omitted rather
  // than left dangling.
  lines.push(team.division ? `${team.conference} · ${team.division}` : team.conference);
  lines.push(seasonStatusLine(sport));
  lines.push(...extraTeamLines(data));
  lines.push("");

  // Some feeds publish only a win count (college football's conference
  // standings have no loss or games-played figure at all). A null `losses`
  // means "unknown", so state the wins without inventing a record or a
  // percentage that would always read 100%.
  const lossesKnown = record.losses !== null && record.losses !== undefined;
  const totalGames = lossesKnown ? record.wins + record.losses : record.wins;
  const winPct = lossesKnown && totalGames > 0
    ? ((record.wins / totalGames) * 100).toFixed(1)
    : null;

  if (totalGames > 0) {
    lines.push(
      lossesKnown
        ? `📊 ${record.season} Season: ${record.wins}W - ${record.losses}L (${winPct}%)`
        : `📊 ${record.season} Season: ${record.wins}W`
    );
    if (winPct !== null) lines.push(`   ${generateBarChart(parseFloat(winPct), 25)}`);
    lines.push("");
  }

  if (recentGames.length > 0) {
    lines.push("**📅 Recent Games:**");
    lines.push("```");
    for (const game of recentGames) {
      lines.push(formatNflGameResult(game, sport));
    }
    lines.push("```");
  } else {
    lines.push("📅 No recent games found");
  }

  if (spotlight) {
    lines.push("");
    renderNflSpotlight(lines, spotlight, emoji, compact);
  }

  return lines.join("\n");
}

function renderNhl(data, sport = "nhl", title, compact = false) {
  const { team, recentGames, record, emoji, logoUrl, spotlight } = data;
  const lines = [];

  lines.push(...headingLines(sport, title));
  lines.push(`<img src="${logoUrl}" alt="${team.full_name} logo" width="72" align="right" />`);
  lines.push("");

  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  lines.push(team.division
    ? `${team.conference} Conference · ${team.division} Division`
    : `${team.conference} Conference`);
  lines.push(seasonStatusLine(sport));
  lines.push(...extraTeamLines(data));
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
      lines.push(formatGameResult(game, team.id, sport));
    }
    lines.push("```");
  } else {
    lines.push("📅 No recent games found");
  }

  if (spotlight) {
    lines.push("");
    renderNhlSpotlight(lines, spotlight, emoji, compact);
  }

  return lines.join("\n");
}

function formatMlsGameResult(game, sport = "mls") {
  const prefix = game.isHome ? "vs" : "@";
  const result = game.won ? "W" : game.drew ? "D" : "L";
  const icon = game.won ? "✅" : game.drew ? "🟡" : "❌";
  const dateStr = formatSportDate(sport, game.date, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${icon} ${result} ${String(game.teamScore)}-${String(game.oppScore)} ${prefix} ${(game.oppAbbr || "???").padEnd(5)} (${dateStr})`;
}

function renderSoccer(data, sport = "mls", fallbackLabel = "MLS", title, compact = false) {
  const { team, recentGames, record, emoji, logoUrl, spotlight } = data;
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
  lines.push(...extraTeamLines(data));
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
      lines.push(formatMlsGameResult(game, sport));
    }
    lines.push("```");
  } else {
    lines.push("📅 No recent games found");
  }

  if (spotlight) {
    lines.push("");
    renderSoccerSpotlight(lines, spotlight, emoji, compact);
  }

  return lines.join("\n");
}

// Soccer spotlight: season totals derived from the game log, since ESPN has no
// season-stats endpoint for soccer athletes.
function renderSoccerSpotlight(lines, spotlight, emoji, compact) {
  const { season = {}, lastGame } = spotlight;
  const stat = (value) => (value == null ? 0 : value);
  const appearances = stat(season.appearances);
  const goals = stat(season.goals);
  const assists = stat(season.assists);
  if (compact) {
    lines.push(`${emoji} ${spotlight.name} · ${appearances} APP · ${goals} G · ${assists} A`);
    return;
  }
  pushSpotlightHeading(lines, emoji, spotlight);
  lines.push(`${appearances} APP · ${goals} G · ${assists} A`);
  if (lastGame) {
    const parts = [];
    if (lastGame.goals != null) parts.push(`${lastGame.goals} G`);
    if (lastGame.assists != null) parts.push(`${lastGame.assists} A`);
    let detail = parts.length > 0 ? parts.join(" · ") : "No stats recorded";
    if (lastGame.opponent) {
      const when = lastGame.date
        ? formatDate(lastGame.date, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
        : "";
      detail += ` vs ${lastGame.opponent}${when ? ` (${when})` : ""}`;
    }
    lines.push("");
    lines.push("**📅 Last Game:**");
    lines.push("```");
    lines.push(detail);
    lines.push("```");
  }
}

// Formula 1 has no team-level game results on the public API, so the board
// shows the constructor, its championship position, and points instead.
function renderF1(data, title) {
  const { team, record, emoji, logoUrl, standing } = data;
  const lines = [];

  lines.push(...headingLines("f1", title));
  if (logoUrl) {
    lines.push(`<img src="${logoUrl}" alt="${team.full_name} logo" width="72" align="right" />`);
    lines.push("");
  }
  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  lines.push("Formula 1 · Constructor Championship");
  lines.push(seasonStatusLine("f1"));
  lines.push("");

  if (standing && standing.position) {
    lines.push(`🏆 Championship position: ${standing.position}`);
  }
  if (record.points !== undefined) {
    lines.push(`📍 Points: ${record.points}`);
  }
  if ((record.wins || 0) + (record.losses || 0) > 0) {
    lines.push(`📊 Races: ${record.wins + record.losses}`);
  }
  lines.push("");

  return lines.join("\n");
}

// Motorsport series that rank drivers (NASCAR, IndyCar) publish one standings
// table and no per-race results, so the board mirrors the F1 constructor board:
// the driver, championship position, and points.
function renderDriverStanding(sport, label, data, title) {
  const { team, record, emoji, standing } = data;
  const lines = [];

  lines.push(...headingLines(sport, title));
  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  lines.push(`${label} · Driver Championship`);
  lines.push(seasonStatusLine(sport));
  lines.push("");

  if (standing && standing.position) {
    lines.push(`🏆 Championship position: ${standing.position}`);
  }
  if (record.points !== undefined) {
    lines.push(`📍 Points: ${record.points}`);
  }
  lines.push("");

  return lines.join("\n");
}

// Mixed martial arts has no standings and no scores, so a fighter's board is the
// career record plus the fights either side of today. ESPN's MMA feed reports a
// lifetime W-L-D rather than a per-season one, so the record is labelled
// accordingly — calling it a season record would be a lie the data does not
// support.
function renderUfc(data, title) {
  const { team, record, emoji, logoUrl, recentGames, nextGame } = data;
  const lines = [];

  lines.push(...headingLines("ufc", title));
  if (logoUrl) {
    lines.push(`<img src="${logoUrl}" alt="UFC logo" width="72" align="right" />`);
    lines.push("");
  }
  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  // The division the fighter last competed in, read from the bout itself.
  if (team.conference) lines.push(team.conference);
  lines.push(seasonStatusLine("ufc"));
  lines.push("");

  const bouts = record.wins + record.losses + record.draws;
  if (bouts > 0) {
    const draws = record.draws ? ` - ${record.draws}D` : "";
    lines.push(`🥊 Career record: ${record.wins}W - ${record.losses}L${draws}`);
    lines.push(`   ${generateBarChart((record.wins / bouts) * 100, 25)}`);
    lines.push("");
  }

  // ESPN leaves the country blank for some fighters, so a missing flag drops
  // out of the line rather than rendering as a placeholder glyph.
  const named = (flag, text) => (flag ? `${flag} ${text}` : text);

  if (nextGame) {
    lines.push("**📅 Next Fight:**");
    lines.push("```");
    lines.push(`${named(nextGame.opponentFlag, `vs ${nextGame.opponentName} (${nextGame.opponent})`)} — ${formatCalendarDate(nextGame.date, "ufc")}`);
    const where = [nextGame.event, nextGame.venue].filter(Boolean).join(" · ");
    if (where) lines.push(where);
    lines.push("```");
    lines.push("");
  } else {
    lines.push("📅 No fight announced");
    lines.push("");
  }

  if (recentGames.length > 0) {
    lines.push("**📅 Recent Fights:**");
    lines.push("```");
    for (const fight of recentGames) {
      const icon = fight.drew ? "🟡" : fight.won ? "✅" : "❌";
      const result = fight.drew ? "D" : fight.won ? "W" : "L";
      const round = fight.round ? ` (R${fight.round})` : "";
      lines.push(
        `${icon} ${result}${round} vs ${named(fight.opponentFlag, fight.opponent)} — ${formatCalendarDate(fight.date, "ufc")}`,
      );
    }
    lines.push("```");
  } else {
    lines.push("📅 No completed fights found");
  }

  return lines.join("\n");
}

// Tennis is an individual sport: a board shows a single ranked player's world
// ranking, ranking points, movement, and most recent match result. ATP and WTA
// share this same shape, differing only in league key and tour label.
function renderTennisPlayer(sport, tourLabel, data, title) {
  const { team, emoji, logoUrl, standing, previousRank, trend, lastMatch } = data;
  const lines = [];

  lines.push(...headingLines(sport, title));
  if (logoUrl) {
    lines.push(`<img src="${logoUrl}" alt="${team.full_name} logo" width="72" align="right" />`);
    lines.push("");
  }
  lines.push(`### ${emoji} ${team.full_name} (${team.abbreviation})`);
  lines.push(`${tourLabel} · World Ranking`);
  lines.push("");

  // World ranking and movement form a compact meta line, mirroring the
  // single status line used by team boards (e.g. MLB's season/standing/next).
  // Ranking POINTS are deliberately omitted: ESPN re-posts them as tournaments
  // progress, so a committed board carrying them is stale within days and the
  // "example boards are current" CI gate can never stay green. Rank and
  // movement are stable, so they carry the information.
  const meta = [];
  if (standing && standing.position) meta.push(`🏆 World No. ${standing.position}`);
  if (previousRank !== undefined && trend) {
    const arrow = trend === "-" ? "—" : trend === "up" || trend === "+" ? "▲" : "▼";
    meta.push(`📈 Movement: ${arrow} (was No. ${previousRank})`);
  }
  if (meta.length) lines.push(meta.join(" · "));

  // The latest match is rendered in its own labeled fenced block, mirroring the
  // way team boards present their Recent Games list. Using a code block gives it
  // a visually distinct section (and a blank line before the label) so the
  // result isn't merged into the ranking meta line by the markdown renderer.
  // Set scores are interleaved as player-vs-opponent per set, e.g. 6-7, 7-6, 6-3, 6-4.
  if (lastMatch && lastMatch.opponent) {
    const icon = lastMatch.won ? "✅" : "❌";
    const result = lastMatch.won ? "W" : "L";
    // Tennis has no home venue, so a match date is quoted in UTC by convention.
    // Passing the zone explicitly keeps the board identical on every host:
    // without it an instant like 2026-09-30T04:00Z renders Sep 30 on UTC but
    // Sep 29 on US Eastern machines.
    const when = lastMatch.date
      ? formatDate(lastMatch.date, {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        })
      : "";
    let setsText = "";
    const [playerSets, oppSets] = lastMatch.sets || [];
    if (playerSets?.length && oppSets?.length) {
      setsText = ` ${playerSets.map((s, i) => `${s}-${oppSets[i] ?? "-"}`).join(", ")}`;
    }
    lines.push("");
    lines.push("**📅 Last Match:**");
    lines.push("```");
    lines.push(`${icon} ${result} vs ${lastMatch.opponent} (${when})${setsText}`);
    lines.push("```");
  }
  lines.push("");

  return lines.join("\n");
}

function renderAtp(data, title) {
  return renderTennisPlayer("atp", "ATP", data, title);
}

function renderWta(data, title) {
  return renderTennisPlayer("wta", "WTA", data, title);
}

function render(sport, data, options = {}) {
  const title = options.title;
  const compact = options.compact || false;
  switch (sport) {
    case "nba":
      return renderNba(data, "nba", title, compact);
    case "wnba":
      return renderNba(data, "wnba", title, compact);
    case "gleague":
      return renderNba(data, "gleague", title, compact);
    case "ncaab":
      return renderNba(data, "ncaab", title, compact);
    case "ncaaw":
      return renderNba(data, "ncaaw", title, compact);
    case "mlb":
      return renderMlb(data, title);
    case "nfl":
      return renderNfl(data, "nfl", title, compact);
    case "ncaaf":
      return renderNfl(data, "ncaaf", title, compact);
    case "nhl":
      return renderNhl(data, "nhl", title, compact);
    case "ncaa_hockey":
      return renderNhl(data, "ncaa_hockey", title, compact);
    case "mls":
      return renderSoccer(data, "mls", "MLS", title, compact);
    case "epl":
      return renderSoccer(data, "epl", "Premier League", title, compact);
    case "laliga":
      return renderSoccer(data, "laliga", "La Liga", title, compact);
    case "bundesliga":
      return renderSoccer(data, "bundesliga", "Bundesliga", title, compact);
    case "seriea":
      return renderSoccer(data, "seriea", "Serie A", title, compact);
    case "ligue1":
      return renderSoccer(data, "ligue1", "Ligue 1", title, compact);
    case "primeiraliga":
      return renderSoccer(data, "primeiraliga", "Primeira Liga", title, compact);
    case "eredivisie":
      return renderSoccer(data, "eredivisie", "Eredivisie", title, compact);
    case "ligamx":
      return renderSoccer(data, "ligamx", "Liga MX", title, compact);
    case "brasileirao":
      return renderSoccer(data, "brasileirao", "Série A", title, compact);
    case "nwsl":
      return renderSoccer(data, "nwsl", "NWSL", title, compact);
    case "saudipro":
      return renderSoccer(data, "saudipro", "Saudi Pro League", title, compact);
    case "j1":
      return renderSoccer(data, "j1", "J1 League", title, compact);
    case "scottish":
      return renderSoccer(data, "scottish", "Scottish Premiership", title, compact);
    case "belgian":
      return renderSoccer(data, "belgian", "Belgian Pro League", title, compact);
    case "ucl":
      return renderSoccer(data, "ucl", "UEFA Champions League", title, compact);
    case "uel":
      return renderSoccer(data, "uel", "UEFA Europa League", title, compact);
    case "worldcup":
      return renderSoccer(data, "worldcup", "FIFA World Cup", title, compact);
    case "ufc":
      return renderUfc(data, title);
    case "argentina":
      return renderSoccer(data, "argentina", "Argentine Primera", title, compact);
    case "aleague":
      return renderSoccer(data, "aleague", "A-League Men", title, compact);
    case "isl":
      return renderSoccer(data, "isl", "Indian Super League", title, compact);
    case "csl":
      return renderSoccer(data, "csl", "Chinese Super League", title, compact);
    case "greek":
      return renderSoccer(data, "greek", "Super League", title, compact);
    case "austria":
      return renderSoccer(data, "austria", "Bundesliga", title, compact);
    case "denmark":
      return renderSoccer(data, "denmark", "Superliga", title, compact);
    case "norway":
      return renderSoccer(data, "norway", "Eliteserien", title, compact);
    case "sweden":
      return renderSoccer(data, "sweden", "Allsvenskan", title, compact);
    case "f1":
      return renderF1(data, title);
    case "atp":
      return renderAtp(data, title);
    case "wta":
      return renderWta(data, title);
    case "nascar":
      return renderDriverStanding("nascar", "NASCAR Cup Series", data, title);
    case "indycar":
      return renderDriverStanding("indycar", "IndyCar Series", data, title);
    default:
      throw new Error(`Unsupported sport: ${sport}. Available: nba, mlb, nfl, nhl, mls, epl, laliga, bundesliga, seriea, ligue1, primeiraliga, eredivisie, wnba, ligamx, brasileirao, nwsl, saudipro, j1, scottish, belgian, ucl, uel, gleague, argentina, aleague, isl, csl, greek, austria, denmark, norway, sweden, f1, atp, wta, nascar, indycar`);
  }
}

module.exports = { render };
