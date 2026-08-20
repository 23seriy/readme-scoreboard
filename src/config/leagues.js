const ESPN_CDN = "https://a.espncdn.com";

function league({ key, name, category, endpoint, renderer, emoji, light, dark, start, end, nextLabel, fallback, endpointOverride }) {
  return {
    key,
    name,
    category,
    endpoint,
    endpointOverride,
    renderer,
    emoji,
    logo: { light, dark },
    seasonWindow: { start, end, nextLabel },
    fallback,
  };
}

const LEAGUES = [
  league({ key: "nba", name: "NBA", category: "Basketball", endpoint: "basketball/nba", renderer: "nba", emoji: "🏀", light: `${ESPN_CDN}/i/teamlogos/leagues/500/nba.png`, dark: `${ESPN_CDN}/i/teamlogos/leagues/500-dark/nba.png`, start: [10, 1], end: [6, 30], nextLabel: "October", fallback: ["2026-09-30", "2027-06-26"] }),
  league({ key: "mlb", name: "MLB", category: "Baseball", endpoint: "baseball/mlb", renderer: "mlb", emoji: "⚾", light: `${ESPN_CDN}/i/teamlogos/leagues/500/mlb.png`, dark: `${ESPN_CDN}/i/teamlogos/leagues/500-dark/mlb.png`, start: [3, 20], end: [11, 10], nextLabel: "late March", fallback: ["2026-02-19", "2026-11-12"], endpointOverride: "[MLB Stats API](https://statsapi.mlb.com/api/v1/teams?sportId=1)" }),
  league({ key: "nfl", name: "NFL", category: "Football", endpoint: "football/nfl", renderer: "nfl", emoji: "🏈", light: `${ESPN_CDN}/i/teamlogos/leagues/500/nfl.png`, dark: `${ESPN_CDN}/i/teamlogos/leagues/500-dark/nfl.png`, start: [9, 1], end: [2, 15], nextLabel: "September", fallback: ["2026-08-06", "2027-02-16"] }),
  league({ key: "nhl", name: "NHL", category: "Hockey", endpoint: "hockey/nhl", renderer: "nhl", emoji: "🏒", light: `${ESPN_CDN}/i/teamlogos/leagues/500/nhl.png`, dark: `${ESPN_CDN}/i/teamlogos/leagues/500-dark/nhl.png`, start: [10, 1], end: [6, 30], nextLabel: "October", fallback: ["2026-09-15", "2027-07-01"], endpointOverride: "[NHL Web API](https://api-web.nhle.com/v1/standings/now)" }),
  league({ key: "mls", name: "MLS", category: "Soccer", endpoint: "soccer/usa.1", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/19.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/19.png`, start: [2, 20], end: [12, 10], nextLabel: "late February", fallback: ["2026-01-01", "2026-12-31"] }),
  league({ key: "epl", name: "Premier League", category: "Soccer", endpoint: "soccer/eng.1", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/23.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/23.png`, start: [8, 10], end: [5, 25], nextLabel: "August", fallback: ["2026-06-01", "2027-06-01"] }),
  league({ key: "laliga", name: "La Liga", category: "Soccer", endpoint: "soccer/esp.1", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/15.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/15.png`, start: [8, 15], end: [5, 25], nextLabel: "August", fallback: ["2026-06-01", "2027-06-01"] }),
  league({ key: "bundesliga", name: "Bundesliga", category: "Soccer", endpoint: "soccer/ger.1", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/10.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/10.png`, start: [8, 20], end: [5, 20], nextLabel: "August", fallback: ["2026-07-01", "2027-07-01"] }),
  league({ key: "seriea", name: "Serie A", category: "Soccer", endpoint: "soccer/ita.1", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/12.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/12.png`, start: [8, 20], end: [5, 25], nextLabel: "August", fallback: ["2026-06-05", "2027-07-01"] }),
  league({ key: "ligue1", name: "Ligue 1", category: "Soccer", endpoint: "soccer/fra.1", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/9.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/9.png`, start: [8, 15], end: [5, 20], nextLabel: "August", fallback: ["2026-06-01", "2027-06-01"] }),
  league({ key: "primeiraliga", name: "Primeira Liga", category: "Soccer", endpoint: "soccer/por.1", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/14.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/14.png`, start: [8, 8], end: [5, 20], nextLabel: "August", fallback: ["2026-07-01", "2027-07-01"] }),
  league({ key: "eredivisie", name: "Eredivisie", category: "Soccer", endpoint: "soccer/ned.1", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/11.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/11.png`, start: [8, 8], end: [5, 20], nextLabel: "August", fallback: ["2026-06-01", "2027-06-01"] }),
  league({ key: "wnba", name: "WNBA", category: "Basketball", endpoint: "basketball/wnba", renderer: "nba", emoji: "🏀", light: `${ESPN_CDN}/i/teamlogos/leagues/500/wnba.png`, dark: `${ESPN_CDN}/i/teamlogos/leagues/500-dark/wnba.png`, start: [5, 1], end: [10, 20], nextLabel: "May", fallback: ["2026-04-03", "2026-10-20"] }),
  league({ key: "ligamx", name: "Liga MX", category: "Soccer", endpoint: "soccer/mex.1", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/22.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/22.png`, start: [7, 1], end: [5, 31], nextLabel: "July", fallback: ["2026-06-01", "2027-06-01"] }),
  league({ key: "brasileirao", name: "Brasileirão", category: "Soccer", endpoint: "soccer/bra.1", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/85.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/85.png`, start: [3, 25], end: [12, 15], nextLabel: "late March", fallback: ["2026-01-01", "2026-12-31"] }),
  league({ key: "nwsl", name: "NWSL", category: "Soccer", endpoint: "soccer/usa.nwsl", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/2323.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/2323.png`, start: [3, 10], end: [11, 30], nextLabel: "March", fallback: ["2026-01-01", "2026-12-31"] }),
  league({ key: "saudipro", name: "Saudi Pro League", category: "Soccer", endpoint: "soccer/ksa.1", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/2488.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/2488.png`, start: [8, 1], end: [5, 31], nextLabel: "August", fallback: ["2026-07-01", "2027-07-01"] }),
  league({ key: "j1", name: "J1 League", category: "Soccer", endpoint: "soccer/jpn.1", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/2199.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/2199.png`, start: [8, 1], end: [5, 31], nextLabel: "August", fallback: ["2026-01-01", "2027-07-01"] }),
  league({ key: "scottish", name: "Scottish Premiership", category: "Soccer", endpoint: "soccer/sco.1", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/45.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/45.png`, start: [8, 1], end: [5, 31], nextLabel: "August", fallback: ["2026-06-01", "2027-06-01"] }),
  league({ key: "belgian", name: "Belgian Pro League", category: "Soccer", endpoint: "soccer/bel.1", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/6.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/6.png`, start: [7, 25], end: [5, 31], nextLabel: "July", fallback: ["2026-07-01", "2027-07-01"] }),
  league({ key: "ucl", name: "UEFA Champions League", category: "Soccer", endpoint: "soccer/uefa.champions", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/2.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/2.png`, start: [7, 1], end: [6, 30], nextLabel: "July", fallback: ["2026-07-01", "2027-07-01"] }),
  league({ key: "uel", name: "UEFA Europa League", category: "Soccer", endpoint: "soccer/uefa.europa", renderer: "soccer", emoji: "⚽", light: `${ESPN_CDN}/i/leaguelogos/soccer/500/2310.png`, dark: `${ESPN_CDN}/i/leaguelogos/soccer/500-dark/2310.png`, start: [7, 1], end: [6, 30], nextLabel: "July", fallback: ["2026-08-27", "2027-07-01"] }),
  league({ key: "gleague", name: "NBA G League", category: "Basketball", endpoint: "basketball/nba-development", renderer: "nba", emoji: "🏀", light: `${ESPN_CDN}/i/teamlogos/leagues/500/nba_gleague.png`, dark: `${ESPN_CDN}/i/teamlogos/leagues/500-dark/nba_gleague.png`, start: [11, 1], end: [4, 15], nextLabel: "November", fallback: ["2025-09-01", "2026-05-01"] }),
  league({ key: "ncaab", name: "NCAA Men's Basketball", category: "Basketball", endpoint: "basketball/mens-college-basketball", renderer: "nba", emoji: "🏀", light: `${ESPN_CDN}/redesign/assets/img/icons/ESPN-icon-basketball.png`, dark: `${ESPN_CDN}/redesign/assets/img/icons/ESPN-icon-basketball.png`, start: [11, 1], end: [4, 15], nextLabel: "November", fallback: ["2026-11-02", "2027-04-07"] }),
  league({ key: "ncaaw", name: "NCAA Women's Basketball", category: "Basketball", endpoint: "basketball/womens-college-basketball", renderer: "nba", emoji: "🏀", light: `${ESPN_CDN}/redesign/assets/img/icons/ESPN-icon-basketball.png`, dark: `${ESPN_CDN}/redesign/assets/img/icons/ESPN-icon-basketball.png`, start: [11, 1], end: [4, 15], nextLabel: "November", fallback: ["2026-11-02", "2027-04-07"] }),
  league({ key: "ncaaf", name: "College Football", category: "Football", endpoint: "football/college-football", renderer: "nfl", emoji: "🏈", light: `${ESPN_CDN}/redesign/assets/img/icons/ESPN-icon-football-college.png`, dark: `${ESPN_CDN}/redesign/assets/img/icons/ESPN-icon-football-college.png`, start: [8, 24], end: [1, 20], nextLabel: "August", fallback: ["2026-08-27", "2027-01-28"] }),
  league({ key: "ncaa_hockey", name: "NCAA Men's Ice Hockey", category: "Hockey", endpoint: "hockey/mens-college-hockey", renderer: "nhl", emoji: "🏒", light: `${ESPN_CDN}/redesign/assets/img/icons/ESPN-icon-hockey.png`, dark: `${ESPN_CDN}/redesign/assets/img/icons/ESPN-icon-hockey.png`, start: [10, 1], end: [4, 15], nextLabel: "October", fallback: ["2026-09-01", "2027-05-01"] }),
];

const LEAGUE_BY_KEY = Object.fromEntries(LEAGUES.map((entry) => [entry.key, entry]));

module.exports = { LEAGUES, LEAGUE_BY_KEY };
