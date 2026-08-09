const axios = require("axios");
const BaseFreeApiAdapter = require("./base-free-api");

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1";
const ESPN_BASE_V2 = "https://site.api.espn.com/apis/v2/sports/soccer/usa.1";

const TEAM_EMOJI = {
  ATL: "🦅", ATX: "🌵", CHI: "🔥", CIN: "🔵", CLB: "⚓",
  CLT: "👑", COL: "🏔️", DAL: "🌟", DC: "🦅", HOU: "🚀",
  LA: "⭐", LAFC: "🖤", MIA: "🦩", MIN: "🌲", MTL: "⚜️",
  NE: "🔵", NSH: "🎸", NYC: "🗽", ORL: "🏰", PHI: "🔔",
  POR: "🌹", RBNY: "🔴", RSL: "👑", SD: "🌊", SEA: "🪝",
  SJ: "🌊", SKC: "🔵", STL: "⚽", TOR: "🍁", VAN: "🐋",
};

// ESPN team IDs — sourced from ESPN's MLS standings API (authoritative).
const TEAM_IDS = {
  ATL: 18418, ATX: 20906, CHI: 182, CIN: 18267, CLB: 183,
  CLT: 21300, COL: 184, DAL: 185, DC: 193, HOU: 6077,
  LA: 187, LAFC: 18966, MIA: 20232, MIN: 17362, MTL: 9720,
  NE: 189, NSH: 18986, NYC: 17606, ORL: 12011, PHI: 10739,
  POR: 9723, RBNY: 190, RSL: 4771, SD: 22529, SEA: 9726,
  SJ: 191, SKC: 186, STL: 21812, TOR: 7318, VAN: 9727,
};

const DEMO_TEAMS = {
  MIA: { id: 20232, abbreviation: "MIA", name: "Inter Miami CF", full_name: "Inter Miami CF", conference: "Eastern", division: "" },
  LAFC: { id: 18966, abbreviation: "LAFC", name: "LAFC", full_name: "Los Angeles FC", conference: "Western", division: "" },
  ATL: { id: 18418, abbreviation: "ATL", name: "Atlanta United", full_name: "Atlanta United FC", conference: "Eastern", division: "" },
};

class MlsAdapter extends BaseFreeApiAdapter {
  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;

  getLogoUrl(abbr) {
    const id = TEAM_IDS[abbr.toUpperCase()];
    return id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png` : null;
  }

  async fetchTeam(abbr) {
    try {
      const upper = abbr.toUpperCase();
      const { data } = await axios.get(`${ESPN_BASE}/teams/${this.TEAM_IDS[upper] || upper}`);
      const team = data.team;
      if (!team) return null;
      return {
        id: team.id,
        abbreviation: team.abbreviation,
        name: team.name,
        full_name: team.displayName,
        conference: "",
        division: "",
      };
    } catch (error) {
      console.error(`Failed to fetch MLS team: ${error.message}`);
      return null;
    }
  }

  async fetchConferenceRecord(teamAbbr) {
    try {
      const upper = teamAbbr.toUpperCase();
      const { data } = await axios.get(`${ESPN_BASE_V2}/standings?season=${new Date().getFullYear()}`);
      for (const conf of (data.children || [])) {
        const entries = conf.standings?.entries || [];
        const entry = entries.find((e) => e.team?.abbreviation?.toUpperCase() === upper);
        if (entry) {
          const stats = (entry.stats || []).reduce((acc, s) => { acc[s.name] = s.value; return acc; }, {});
          return {
            conference: conf.name || "",
            wins: stats.wins || 0,
            losses: stats.losses || 0,
            draws: stats.ties || 0,
            season: new Date().getFullYear(),
          };
        }
      }
      return { conference: "", wins: 0, losses: 0, draws: 0, season: new Date().getFullYear() };
    } catch (error) {
      console.error(`Failed to fetch MLS standings: ${error.message}`);
      return { conference: "", wins: 0, losses: 0, draws: 0, season: new Date().getFullYear() };
    }
  }

  async fetchData(teamAbbr) {
    try {
      const team = await this.fetchTeamByAbbr(teamAbbr);
      if (!team) return null;

      const [confRecord, schedData] = await Promise.all([
        this.fetchConferenceRecord(teamAbbr),
        axios.get(`${ESPN_BASE}/teams/${team.id}/schedule?season=${new Date().getFullYear()}`),
      ]);

      team.conference = confRecord.conference;

      const events = schedData.data.events || [];
      const recentGames = events
        .filter((e) => e.competitions?.[0]?.status?.type?.completed)
        .map((e) => {
          const comp = e.competitions[0];
          const teamComp = comp.competitors.find((c) => String(c.team?.id) === String(team.id));
          const oppComp = comp.competitors.find((c) => String(c.team?.id) !== String(team.id));
          if (!teamComp || !oppComp) return null;
          const teamScore = teamComp.score?.value ?? 0;
          const oppScore = oppComp.score?.value ?? 0;
          return {
            date: e.date,
            gameType: "R",
            home_team: {
              id: comp.competitors.find((c) => c.homeAway === "home")?.team?.id,
              abbreviation: comp.competitors.find((c) => c.homeAway === "home")?.team?.abbreviation,
            },
            visitor_team: {
              id: comp.competitors.find((c) => c.homeAway === "away")?.team?.id,
              abbreviation: comp.competitors.find((c) => c.homeAway === "away")?.team?.abbreviation,
            },
            home_team_score: comp.competitors.find((c) => c.homeAway === "home")?.score?.value ?? 0,
            visitor_team_score: comp.competitors.find((c) => c.homeAway === "away")?.score?.value ?? 0,
            status: "Final",
            // Soccer-specific
            isHome: teamComp.homeAway === "home",
            teamScore,
            oppScore,
            oppAbbr: oppComp.team?.abbreviation,
            won: teamScore > oppScore,
            drew: teamScore === oppScore,
          };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      const record = {
        wins: confRecord.wins,
        losses: confRecord.losses,
        draws: confRecord.draws,
        season: confRecord.season,
      };

      return { team, record, recentGames };
    } catch (error) {
      console.error(`Failed to fetch MLS data: ${error.message}`);
      return null;
    }
  }

  parseGameResponse() { return []; }
  parseTeamResponse() { return null; }
  getGamesUrl() { return ""; }
}

module.exports = new MlsAdapter();
