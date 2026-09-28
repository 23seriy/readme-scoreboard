const { get: httpGet } = require("../http");

const ESPN_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Accept": "application/json",
  "Origin": "https://www.espn.com",
  "Referer": "https://www.espn.com/",
};

// Fixed season for sample boards so generated examples don't drift.
const DEMO_SEASON = 2026;

// Shared implementation for motorsport series that rank *drivers* rather than
// teams: NASCAR and IndyCar. ESPN exposes one standings group whose entries are
// `{ athlete, stats }` with `rank` and `championshipPts`, so both series need the
// same logic and differ only in their series key, labels and roster.
class BaseRacingDriverAdapter {
  getSeasonYear() {
    return new Date().getFullYear();
  }

  // Motorsport drivers have no club crest and ESPN serves no driver headshot
  // path for these series, so the board falls back to the series logo — the same
  // approach the F1 constructor adapter takes.
  getLogoUrl() {
    return this.LOGO_URL;
  }

  async fetchStanding(abbr) {
    const upper = abbr.toUpperCase();
    const driver = this.PLAYER_IDS[upper];
    if (!driver) return null;
    const season = this.getSeasonYear();
    try {
      const { data } = await httpGet(
        `https://site.api.espn.com/apis/v2/sports/racing/${this.SERIES}/standings?season=${season}`,
        { headers: ESPN_HEADERS },
      );
      const entries = (data.children || [])
        .flatMap((group) => group.standings?.entries || []);
      const index = entries.findIndex((entry) => String(entry.athlete?.id) === String(driver.id));
      // A driver absent from the standings has no position to report yet, which
      // is normal early in a season. Rather than printing zeroes, report the
      // points ESPN does hold (usually 0) and no position.
      if (index === -1) {
        return { position: null, points: 0, season, name: driver.full_name };
      }
      const stats = Object.fromEntries((entries[index].stats || []).map((s) => [s.name, s.value]));
      return {
        position: stats.rank ?? index + 1,
        points: stats.championshipPts || 0,
        season,
        name: entries[index].athlete?.displayName || driver.full_name,
      };
    } catch (error) {
      console.error(`Failed to fetch ${this.LEAGUE_NAME} standings: ${error.message}`);
      return null;
    }
  }

  async fetchData(abbr) {
    const upper = abbr.toUpperCase();
    const configured = this.PLAYER_IDS[upper];
    const standing = await this.fetchStanding(upper);
    if (!configured || !standing) return null;
    return {
      team: {
        id: configured.id,
        abbreviation: upper,
        name: configured.name,
        full_name: standing.name || configured.full_name,
        conference: this.SERIES_LABEL,
        division: "",
      },
      record: { wins: 0, losses: 0, points: standing.points, season: standing.season },
      // ESPN publishes no per-driver race log on this endpoint, so the board is
      // standings-only: championship position and points.
      recentGames: [],
      standing: standing.position
        ? { position: standing.position, label: "Driver Championship" }
        : null,
    };
  }

  // Deterministic sample board: the named driver in the sample roster is
  // positioned and scored from its own order, so repeated runs and the generated
  // examples stay byte-identical.
  getDemoData(abbr) {
    const upper = (abbr || "").toUpperCase();
    const key = this.DEMO_TEAMS[upper] ? upper : Object.keys(this.DEMO_TEAMS)[0];
    const team = this.DEMO_TEAMS[key];
    const position = Object.keys(this.DEMO_TEAMS).indexOf(key) + 1;
    return {
      team,
      record: { wins: 0, losses: 0, points: this.DEMO_POINTS[key], season: DEMO_SEASON },
      recentGames: [],
      standing: { position, label: "Driver Championship" },
    };
  }
}

module.exports = BaseRacingDriverAdapter;
