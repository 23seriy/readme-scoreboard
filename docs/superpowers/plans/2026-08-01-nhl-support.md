# NHL Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add NHL support to readme-scoreboard by creating a reusable base adapter for free APIs (MLB, NHL) and implementing the NHL adapter using NHL.com Stats API.

**Architecture:** Create `base-free-api.js` containing shared logic for free, unauthenticated APIs (season detection, date-based game lookback, pagination). Both MLB and NHL adapters extend this base class, implementing only sport-specific API endpoints and response parsing. NHL uses the NHL.com Stats API with no authentication required.

**Tech Stack:** Node.js, axios (existing), NHL.com Stats API (https://statsapi.web.nhl.com/api/v1)

## Global Constraints

- **Node version:** No new ES features beyond what's currently used (async/await, arrow functions OK)
- **Dependencies:** No new npm packages; use existing axios dependency
- **Breaking changes:** None; NBA and NFL adapters remain unchanged
- **Code style:** Follow existing patterns in MLB/NFL adapters (naming, error handling, comment style)
- **API stability:** NHL Stats API is public and stable; handle errors gracefully

---

## Task 1: Create Base Free API Adapter

**Files:**
- Create: `src/adapters/base-free-api.js`
- Test: `tests/adapters/base-free-api.test.js`

**Interfaces:**
- Produces: `class BaseFreeApiAdapter` with methods:
  - `fetchData(teamAbbr, apiKey)` → `{ team, record, recentGames }`
  - `getDemoData(teamAbbr)` → `{ team, record, recentGames }`
  - Protected: `getSeasonYear()` → number
  - Protected: `fetchTeamByAbbr(abbr)` → team object
  - Protected: `fetchRecentGames(teamId, count)` → array of games
  - Protected: `fetchSeasonRecord(teamId)` → `{ wins, losses, season }`
  - Abstract: `fetchTeam(abbr)` (must be overridden)
  - Abstract: `getGamesUrl(teamId, fromDate, toDate)` (must be overridden)
  - Abstract: `parseGameResponse(data)` (must be overridden)
  - Abstract: `parseTeamResponse(data)` (must be overridden)

- [ ] **Step 1: Create base-free-api.js file**

Create `/Users/solshanetski/src/readme-scoreboard/src/adapters/base-free-api.js`:

```javascript
const axios = require("axios");

class BaseFreeApiAdapter {
  constructor() {
    if (this.constructor === BaseFreeApiAdapter) {
      throw new Error("BaseFreeApiAdapter is abstract and cannot be instantiated directly");
    }
  }

  async fetchData(teamAbbr, apiKey) {
    try {
      const team = await this.fetchTeamByAbbr(teamAbbr);
      if (!team) return null;

      const record = await this.fetchSeasonRecord(team.id);
      const recentGames = await this.fetchRecentGames(team.id, 5);

      return {
        team,
        record,
        recentGames,
      };
    } catch (error) {
      console.error(`Failed to fetch data: ${error.message}`);
      return null;
    }
  }

  getDemoData(teamAbbr) {
    const team = this.DEMO_TEAMS[teamAbbr.toUpperCase()];
    if (!team) return null;

    return {
      team,
      record: { wins: 42, losses: 28, season: this.getSeasonYear() },
      recentGames: [
        {
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          home_team: { id: 1, abbreviation: "OPP" },
          visitor_team: { id: team.id, abbreviation: team.abbreviation },
          home_team_score: 3,
          visitor_team_score: 2,
          status: "Final",
        },
        {
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          home_team: { id: team.id, abbreviation: team.abbreviation },
          visitor_team: { id: 2, abbreviation: "OPP" },
          home_team_score: 4,
          visitor_team_score: 1,
          status: "Final",
        },
      ],
    };
  }

  getSeasonYear() {
    const now = new Date();
    const month = now.getMonth() + 1;
    return month >= 10 ? now.getFullYear() : now.getFullYear() - 1;
  }

  async fetchTeamByAbbr(abbr) {
    try {
      const team = await this.fetchTeam(abbr);
      if (!team) {
        console.error(`Team ${abbr} not found`);
        return null;
      }
      return team;
    } catch (error) {
      console.error(`Failed to fetch team: ${error.message}`);
      return null;
    }
  }

  async fetchRecentGames(teamId, count = 5) {
    try {
      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 180);

      const url = this.getGamesUrl(teamId, pastDate, today);
      const { data } = await axios.get(url);

      const games = this.parseGameResponse(data);
      if (!games) return [];

      return games
        .filter((g) => g.status === "Final")
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, count);
    } catch (error) {
      console.error(`Failed to fetch games: ${error.message}`);
      return [];
    }
  }

  async fetchSeasonRecord(teamId) {
    try {
      const season = this.getSeasonYear();
      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 180);

      const url = this.getGamesUrl(teamId, pastDate, today);
      const { data } = await axios.get(url);

      const games = this.parseGameResponse(data);
      if (!games || games.length === 0) {
        return { wins: 0, losses: 0, season };
      }

      let wins = 0;
      let losses = 0;

      for (const game of games) {
        if (game.status !== "Final") continue;

        const isHome = game.home_team.id === teamId;
        const teamScore = isHome ? game.home_team_score : game.visitor_team_score;
        const oppScore = isHome ? game.visitor_team_score : game.home_team_score;

        if (teamScore > oppScore) {
          wins++;
        } else {
          losses++;
        }
      }

      return { wins, losses, season };
    } catch (error) {
      console.error(`Failed to fetch season record: ${error.message}`);
      return { wins: 0, losses: 0, season: this.getSeasonYear() };
    }
  }

  // Abstract methods - must be implemented by subclasses
  async fetchTeam(abbr) {
    throw new Error("fetchTeam() must be implemented by subclass");
  }

  getGamesUrl(teamId, fromDate, toDate) {
    throw new Error("getGamesUrl() must be implemented by subclass");
  }

  parseGameResponse(data) {
    throw new Error("parseGameResponse() must be implemented by subclass");
  }

  parseTeamResponse(data) {
    throw new Error("parseTeamResponse() must be implemented by subclass");
  }

  // Properties that subclasses must define
  TEAM_EMOJI = {};
  TEAM_IDS = {};
  DEMO_TEAMS = {};
}

module.exports = BaseFreeApiAdapter;
```

- [ ] **Step 2: Create test file with basic tests**

Create `/Users/solshanetski/src/readme-scoreboard/tests/adapters/base-free-api.test.js`:

```javascript
const BaseFreeApiAdapter = require("../../src/adapters/base-free-api");

describe("BaseFreeApiAdapter", () => {
  it("should throw when instantiated directly", () => {
    expect(() => new BaseFreeApiAdapter()).toThrow(
      "BaseFreeApiAdapter is abstract and cannot be instantiated directly"
    );
  });

  it("should calculate season year correctly for months 1-9", () => {
    const mockAdapter = createMockAdapter();
    const originalDate = Date;
    const mockDate = new Date("2026-05-15");
    global.Date = class extends originalDate {
      constructor(...args) {
        super(...args);
      }
      static now() {
        return mockDate.getTime();
      }
    };
    global.Date.prototype = originalDate.prototype;

    expect(mockAdapter.getSeasonYear()).toBe(2025);

    global.Date = originalDate;
  });

  it("should calculate season year correctly for months 10-12", () => {
    const mockAdapter = createMockAdapter();
    const originalDate = Date;
    const mockDate = new Date("2026-10-15");
    global.Date = class extends originalDate {
      constructor(...args) {
        super(...args);
      }
      static now() {
        return mockDate.getTime();
      }
    };
    global.Date.prototype = originalDate.prototype;

    expect(mockAdapter.getSeasonYear()).toBe(2026);

    global.Date = originalDate;
  });

  it("should return demo data for valid team", () => {
    const mockAdapter = createMockAdapter();
    const demoData = mockAdapter.getDemoData("TEST");

    expect(demoData).toHaveProperty("team");
    expect(demoData).toHaveProperty("record");
    expect(demoData).toHaveProperty("recentGames");
    expect(demoData.recentGames.length).toBe(2);
  });

  it("should return null for unknown demo team", () => {
    const mockAdapter = createMockAdapter();
    const demoData = mockAdapter.getDemoData("UNKNOWN");
    expect(demoData).toBeNull();
  });
});

function createMockAdapter() {
  class MockAdapter extends BaseFreeApiAdapter {
    TEAM_EMOJI = { TEST: "🏒" };
    TEAM_IDS = { TEST: 1 };
    DEMO_TEAMS = {
      TEST: {
        id: 1,
        abbreviation: "TEST",
        name: "Test Team",
        full_name: "Test Team Full",
        division: "Test Division",
        conference: "Test Conference",
      },
    };

    async fetchTeam(abbr) {
      return this.DEMO_TEAMS[abbr.toUpperCase()] || null;
    }

    getGamesUrl(teamId, fromDate, toDate) {
      return `https://api.example.com/games`;
    }

    parseGameResponse(data) {
      return [];
    }

    parseTeamResponse(data) {
      return null;
    }
  }

  return new MockAdapter();
}
```

- [ ] **Step 3: Run tests to verify they pass**

```bash
npm test -- tests/adapters/base-free-api.test.js
```

Expected: All tests pass (2 passing)

- [ ] **Step 4: Commit**

```bash
git add src/adapters/base-free-api.js tests/adapters/base-free-api.test.js
git commit -m "feat: create BaseFreeApiAdapter base class for free APIs

- Provides shared logic for season detection, date lookback, pagination
- Abstract methods for subclasses to implement: fetchTeam, getGamesUrl, parseGameResponse, parseTeamResponse
- Implements fetchData() which orchestrates team fetch, record fetch, recent games fetch
- Implements getDemoData() for demo mode
- Includes unit tests for abstract instantiation and season year calculation"
```

---

## Task 2: Implement NHL Adapter

**Files:**
- Create: `src/adapters/nhl.js`
- Test: `tests/adapters/nhl.test.js`

**Interfaces:**
- Consumes: `BaseFreeApiAdapter` from Task 1
- Produces: NHL adapter module exporting:
  - `fetchData(teamAbbr, apiKey)` → `{ team, record, recentGames }`
  - `getDemoData(teamAbbr)` → `{ team, record, recentGames }`
  - `TEAM_EMOJI` → object mapping abbreviations to emojis
  - `TEAM_IDS` → object mapping abbreviations to NHL API team IDs

- [ ] **Step 1: Create nhl.js adapter**

Create `/Users/solshanetski/src/readme-scoreboard/src/adapters/nhl.js`:

```javascript
const axios = require("axios");
const BaseFreeApiAdapter = require("./base-free-api");

const NHL_BASE = "https://statsapi.web.nhl.com/api/v1";

const TEAM_EMOJI = {
  ANA: "🦆", ARI: "🐺", BOS: "🐻", BUF: "🦬", CAR: "🐱",
  CBJ: "🔵", CGY: "🔥", CHI: "🐂", COL: "🏔️", DAL: "⭐",
  DET: "🐙", EDM: "🧡", FLA: "🐆", LAK: "👑", MIN: "🐺",
  MTL: "🔴", NJD: "😈", NSH: "⚡", NYI: "🗽", NYR: "🦢",
  OTT: "🦴", PHI: "🔔", PHX: "🔥", PIT: "🐧", SJS: "🦈",
  STL: "🦁", TBL: "⚡", TOR: "🍁", VAN: "🐋", VGK: "🏆",
  WPG: "⚪", WSH: "🧙",
};

const TEAM_IDS = {
  ANA: 24, ARI: 53, BOS: 6, BUF: 7, CAR: 12, CBJ: 29, CGY: 20, CHI: 16,
  COL: 21, DAL: 25, DET: 17, EDM: 22, FLA: 13, LAK: 26, MIN: 30, MTL: 8,
  NJD: 1, NSH: 18, NYI: 2, NYR: 3, OTT: 9, PHI: 4, PHX: 55, PIT: 5,
  SJS: 28, STL: 19, TBL: 14, TOR: 10, VAN: 23, VGK: 54, WPG: 52, WSH: 15,
};

const DEMO_TEAMS = {
  NYR: {
    id: 3,
    abbreviation: "NYR",
    name: "Rangers",
    full_name: "New York Rangers",
    conference: "Eastern",
    division: "Metropolitan",
  },
  LAK: {
    id: 26,
    abbreviation: "LAK",
    name: "Kings",
    full_name: "Los Angeles Kings",
    conference: "Western",
    division: "Pacific",
  },
  TOR: {
    id: 10,
    abbreviation: "TOR",
    name: "Maple Leafs",
    full_name: "Toronto Maple Leafs",
    conference: "Eastern",
    division: "Atlantic",
  },
  DET: {
    id: 17,
    abbreviation: "DET",
    name: "Red Wings",
    full_name: "Detroit Red Wings",
    conference: "Eastern",
    division: "Atlantic",
  },
  BOS: {
    id: 6,
    abbreviation: "BOS",
    name: "Bruins",
    full_name: "Boston Bruins",
    conference: "Eastern",
    division: "Atlantic",
  },
  EDM: {
    id: 22,
    abbreviation: "EDM",
    name: "Oilers",
    full_name: "Edmonton Oilers",
    conference: "Western",
    division: "Pacific",
  },
};

class NhlAdapter extends BaseFreeApiAdapter {
  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;

  async fetchTeam(abbr) {
    try {
      const { data } = await axios.get(`${NHL_BASE}/teams`);
      const team = data.teams.find(
        (t) => t.abbreviation.toUpperCase() === abbr.toUpperCase()
      );
      if (!team) return null;

      return {
        id: team.id,
        abbreviation: team.abbreviation,
        name: team.teamName,
        full_name: team.name,
        conference: team.conference.name,
        division: team.division.name,
      };
    } catch (error) {
      console.error(`Failed to fetch NHL team: ${error.message}`);
      return null;
    }
  }

  getGamesUrl(teamId, fromDate, toDate) {
    const from = fromDate.toISOString().split("T")[0];
    const to = toDate.toISOString().split("T")[0];
    return `${NHL_BASE}/teams/${teamId}/schedule?startDate=${from}&endDate=${to}`;
  }

  parseGameResponse(data) {
    if (!data.games || !Array.isArray(data.games)) return [];
    return data.games.map((game) => ({
      date: game.gameDateTime,
      home_team: {
        id: game.teams.home.team.id,
        abbreviation: game.teams.home.team.abbreviation,
      },
      visitor_team: {
        id: game.teams.away.team.id,
        abbreviation: game.teams.away.team.abbreviation,
      },
      home_team_score: game.teams.home.score || 0,
      visitor_team_score: game.teams.away.score || 0,
      status: game.status === "Final" ? "Final" : game.status,
    }));
  }

  parseTeamResponse(data) {
    if (!data.teams || data.teams.length === 0) return null;
    const team = data.teams[0];
    return {
      id: team.id,
      abbreviation: team.abbreviation,
      name: team.teamName,
      full_name: team.name,
      conference: team.conference.name,
      division: team.division.name,
    };
  }
}

module.exports = new NhlAdapter();
```

- [ ] **Step 2: Create NHL adapter tests**

Create `/Users/solshanetski/src/readme-scoreboard/tests/adapters/nhl.test.js`:

```javascript
const nhlAdapter = require("../../src/adapters/nhl");

describe("NHL Adapter", () => {
  it("should have all 32 NHL teams in TEAM_EMOJI", () => {
    const teams = Object.keys(nhlAdapter.TEAM_EMOJI);
    expect(teams.length).toBe(32);
    expect(teams).toContain("NYR");
    expect(teams).toContain("LAK");
    expect(teams).toContain("TOR");
  });

  it("should have all 32 NHL teams in TEAM_IDS", () => {
    const teams = Object.keys(nhlAdapter.TEAM_IDS);
    expect(teams.length).toBe(32);
    expect(nhlAdapter.TEAM_IDS.NYR).toBe(3);
    expect(nhlAdapter.TEAM_IDS.LAK).toBe(26);
  });

  it("should have matching abbreviations between TEAM_EMOJI and TEAM_IDS", () => {
    const emojiTeams = Object.keys(nhlAdapter.TEAM_EMOJI).sort();
    const idTeams = Object.keys(nhlAdapter.TEAM_IDS).sort();
    expect(emojiTeams).toEqual(idTeams);
  });

  it("should return demo data for valid NHL team", () => {
    const demoData = nhlAdapter.getDemoData("NYR");
    expect(demoData.team.abbreviation).toBe("NYR");
    expect(demoData.team.full_name).toBe("New York Rangers");
    expect(demoData.record.wins).toBe(42);
    expect(demoData.record.losses).toBe(28);
    expect(demoData.recentGames.length).toBe(2);
  });

  it("should parse game response correctly", () => {
    const mockData = {
      games: [
        {
          gameDateTime: "2026-01-15T20:00:00Z",
          status: "Final",
          teams: {
            home: {
              team: { id: 3, abbreviation: "NYR" },
              score: 3,
            },
            away: {
              team: { id: 26, abbreviation: "LAK" },
              score: 2,
            },
          },
        },
      ],
    };

    const games = nhlAdapter.parseGameResponse(mockData);
    expect(games.length).toBe(1);
    expect(games[0].home_team.abbreviation).toBe("NYR");
    expect(games[0].visitor_team.abbreviation).toBe("LAK");
    expect(games[0].home_team_score).toBe(3);
    expect(games[0].visitor_team_score).toBe(2);
  });

  it("should build correct games URL", () => {
    const from = new Date("2026-01-01");
    const to = new Date("2026-01-31");
    const url = nhlAdapter.getGamesUrl(3, from, to);

    expect(url).toContain("teams/3/schedule");
    expect(url).toContain("startDate=2026-01-01");
    expect(url).toContain("endDate=2026-01-31");
  });

  it("should return null for unknown team abbreviation in demo mode", () => {
    const demoData = nhlAdapter.getDemoData("UNKNOWN");
    expect(demoData).toBeNull();
  });
});
```

- [ ] **Step 3: Run NHL adapter tests**

```bash
npm test -- tests/adapters/nhl.test.js
```

Expected: All tests pass (7 passing)

- [ ] **Step 4: Commit**

```bash
git add src/adapters/nhl.js tests/adapters/nhl.test.js
git commit -m "feat: create NHL adapter using NHL.com Stats API

- Extends BaseFreeApiAdapter for free API integration
- Supports all 32 NHL teams with team emojis and IDs
- Fetches team info, season record, and recent games from statsapi.web.nhl.com
- Handles NHL-specific response parsing for games and teams
- Includes 6 sample teams for demo mode
- Full test coverage for response parsing, URL generation, and demo data"
```

---

## Task 3: Refactor MLB Adapter to Extend Base Class

**Files:**
- Modify: `src/adapters/mlb.js`
- Modify: `tests/adapters/mlb.test.js` (verify no regression)

**Interfaces:**
- Consumes: `BaseFreeApiAdapter` from Task 1
- Produces: MLB adapter with same external interface as before (no breaking changes)
  - `fetchData(teamAbbr, apiKey)` → `{ team, record, recentGames }`
  - `getDemoData(teamAbbr)` → `{ team, record, recentGames }`
  - Same TEAM_EMOJI, TEAM_IDS, DEMO_TEAMS

- [ ] **Step 1: Read current MLB adapter to understand structure**

Read the existing MLB adapter to identify:
- Which functions can be extracted (date logic, filtering)
- Which functions are MLB-specific
- How to map to abstract methods

- [ ] **Step 2: Update MLB adapter to extend BaseFreeApiAdapter**

Modify `/Users/solshanetski/src/readme-scoreboard/src/adapters/mlb.js` - replace the entire file with:

```javascript
const axios = require("axios");
const BaseFreeApiAdapter = require("./base-free-api");

const MLB_BASE = "https://statsapi.mlb.com/api/v1";

const TEAM_EMOJI = {
  ATH: "🐘", AZ: "🐍", BAL: "🐦", BOS: "🧦", CHC: "🐻",
  CWS: "⚫", CIN: "🔴", CLE: "⚔️", COL: "🏔️", DET: "🐯",
  HOU: "🚀", KC: "👑", LAA: "😇", LAD: "💙", MIA: "🐬",
  MIL: "🍺", MIN: "🎯", NYM: "🍎", NYY: "⚾", PHI: "🔔",
  PIT: "🏴", SD: "🤎", SF: "🧡", SEA: "🧭", STL: "🐦",
  TB: "😈", TEX: "🤠", TOR: "🐦", WSH: "🇺🇸",
};

const TEAM_IDS = {
  ATH: 133, AZ: 109, BAL: 110, BOS: 111, CHC: 112,
  CWS: 145, CIN: 113, CLE: 114, COL: 115, DET: 116,
  HOU: 117, KC: 118, LAA: 108, LAD: 119, MIA: 146,
  MIL: 158, MIN: 142, NYM: 121, NYY: 147, PHI: 143,
  PIT: 134, SD: 135, SF: 137, SEA: 136, STL: 138,
  TB: 139, TEX: 140, TOR: 141, WSH: 120,
};

const DIVISION_NAMES = {
  200: "AL West", 201: "AL East", 202: "AL Central",
  203: "NL West", 204: "NL East", 205: "NL Central",
};

const LEAGUE_NAMES = {
  103: "American League",
  104: "National League",
};

const DEMO_TEAMS = {
  NYY: { id: 147, abbreviation: "NYY", name: "Yankees", full_name: "New York Yankees", league: "American League", division: "AL East" },
  LAD: { id: 119, abbreviation: "LAD", name: "Dodgers", full_name: "Los Angeles Dodgers", league: "National League", division: "NL West" },
  BOS: { id: 111, abbreviation: "BOS", name: "Red Sox", full_name: "Boston Red Sox", league: "American League", division: "AL East" },
  CHC: { id: 112, abbreviation: "CHC", name: "Cubs", full_name: "Chicago Cubs", league: "National League", division: "NL Central" },
  HOU: { id: 117, abbreviation: "HOU", name: "Astros", full_name: "Houston Astros", league: "American League", division: "AL West" },
};

class MlbAdapter extends BaseFreeApiAdapter {
  TEAM_EMOJI = TEAM_EMOJI;
  TEAM_IDS = TEAM_IDS;
  DEMO_TEAMS = DEMO_TEAMS;

  getSeasonYear() {
    const now = new Date();
    return now.getFullYear();
  }

  async fetchTeam(abbr) {
    try {
      const { data } = await axios.get(`${MLB_BASE}/teams`, {
        params: { sportId: 1 },
      });
      const team = data.teams.find(
        (t) => t.abbreviation.toUpperCase() === abbr.toUpperCase()
      );
      if (!team) {
        console.error(`MLB team ${abbr} not found`);
        return null;
      }

      const leagueName = LEAGUE_NAMES[team.league.id] || team.league.name;
      const divisionName = DIVISION_NAMES[team.division.id] || team.division.name;

      return {
        id: team.id,
        abbreviation: team.abbreviation,
        name: team.teamName,
        full_name: team.name,
        league: leagueName,
        division: divisionName,
      };
    } catch (error) {
      console.error(`Failed to fetch MLB team: ${error.message}`);
      return null;
    }
  }

  getGamesUrl(teamId, fromDate, toDate) {
    const from = fromDate.toISOString().split("T")[0];
    const to = toDate.toISOString().split("T")[0];
    return `${MLB_BASE}/teams/${teamId}/schedule?startDate=${from}&endDate=${to}`;
  }

  parseGameResponse(data) {
    if (!data.games || !Array.isArray(data.games)) return [];
    return data.games.map((game) => ({
      date: game.gameDateTime,
      home_team: {
        id: game.teams.home.team.id,
        abbreviation: game.teams.home.team.abbreviation,
      },
      visitor_team: {
        id: game.teams.away.team.id,
        abbreviation: game.teams.away.team.abbreviation,
      },
      home_team_score: game.teams.home.score || 0,
      visitor_team_score: game.teams.away.score || 0,
      status: game.status,
    }));
  }

  parseTeamResponse(data) {
    if (!data.teams || data.teams.length === 0) return null;
    const team = data.teams[0];
    return {
      id: team.id,
      abbreviation: team.abbreviation,
      name: team.teamName,
      full_name: team.name,
      league: LEAGUE_NAMES[team.league.id] || team.league.name,
      division: DIVISION_NAMES[team.division.id] || team.division.name,
    };
  }
}

module.exports = new MlbAdapter();
```

- [ ] **Step 3: Run existing MLB tests to verify no regression**

```bash
npm test -- tests/adapters/mlb.test.js
```

Expected: All existing tests pass (no new failures)

- [ ] **Step 4: Commit**

```bash
git add src/adapters/mlb.js
git commit -m "refactor: extend MLB adapter from BaseFreeApiAdapter

- Remove duplicated date logic and game filtering (now in base class)
- Implement sport-specific abstract methods: fetchTeam, getGamesUrl, parseGameResponse, parseTeamResponse
- Maintain identical public interface and behavior
- All existing tests pass with no regression"
```

---

## Task 4: Update Markdown Renderer with NHL Support

**Files:**
- Modify: `src/renderers/markdown.js`
- Test: `tests/renderers/markdown.test.js` (verify NHL rendering)

**Interfaces:**
- Consumes: NHL adapter from Task 2
- Produces: `renderNhl(data)` function that returns formatted Markdown string matching existing sport formats

- [ ] **Step 1: Read existing markdown renderer to understand pattern**

Read `src/renderers/markdown.js` to identify:
- How `renderMlb()` is structured
- How to structure `renderNhl()` identically
- Where to add the NHL case to the main switch statement

- [ ] **Step 2: Add renderNhl function to markdown.js**

Modify `/Users/solshanetski/src/readme-scoreboard/src/renderers/markdown.js` by adding this function before the main export:

```javascript
function renderNhl(data) {
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
    lines.push("");
  }

  return lines.join("\n");
}
```

- [ ] **Step 3: Add NHL case to main export switch statement**

In the same file, find the main switch statement (in the module.exports or main function) and add:

```javascript
case "nhl":
  return renderNhl(data);
```

This should be alongside the existing `case "nba"`, `case "mlb"`, `case "nfl"` statements.

- [ ] **Step 4: Create/update renderer tests for NHL**

Update or create `/Users/solshanetski/src/readme-scoreboard/tests/renderers/markdown.test.js` with:

```javascript
const { renderNhl } = require("../../src/renderers/markdown");

describe("NHL Markdown Renderer", () => {
  it("should render NHL team data correctly", () => {
    const data = {
      team: {
        id: 3,
        full_name: "New York Rangers",
        abbreviation: "NYR",
        conference: "Eastern",
        division: "Metropolitan",
      },
      record: {
        wins: 42,
        losses: 28,
        season: 2025,
      },
      recentGames: [
        {
          date: "2026-01-15T20:00:00Z",
          home_team: { id: 3, abbreviation: "NYR" },
          visitor_team: { id: 26, abbreviation: "LAK" },
          home_team_score: 3,
          visitor_team_score: 2,
          status: "Final",
        },
      ],
      emoji: "🦢",
      logoUrl: "https://example.com/logo.svg",
    };

    const result = renderNhl(data);

    expect(result).toContain("New York Rangers");
    expect(result).toContain("NYR");
    expect(result).toContain("Eastern Conference");
    expect(result).toContain("Metropolitan Division");
    expect(result).toContain("42W - 28L");
    expect(result).toContain("Recent Games");
    expect(result).toContain("LAK");
  });

  it("should handle teams with no recent games", () => {
    const data = {
      team: {
        id: 3,
        full_name: "New York Rangers",
        abbreviation: "NYR",
        conference: "Eastern",
        division: "Metropolitan",
      },
      record: {
        wins: 0,
        losses: 0,
        season: 2025,
      },
      recentGames: [],
      emoji: "🦢",
      logoUrl: "https://example.com/logo.svg",
    };

    const result = renderNhl(data);

    expect(result).toContain("New York Rangers");
    expect(result).not.toContain("Recent Games");
  });

  it("should format win percentage correctly", () => {
    const data = {
      team: {
        id: 3,
        full_name: "New York Rangers",
        abbreviation: "NYR",
        conference: "Eastern",
        division: "Metropolitan",
      },
      record: {
        wins: 40,
        losses: 30,
        season: 2025,
      },
      recentGames: [],
      emoji: "🦢",
      logoUrl: "https://example.com/logo.svg",
    };

    const result = renderNhl(data);

    expect(result).toContain("40W - 30L (57.1%)");
  });
});
```

- [ ] **Step 5: Run renderer tests**

```bash
npm test -- tests/renderers/markdown.test.js
```

Expected: All tests pass including new NHL tests

- [ ] **Step 6: Commit**

```bash
git add src/renderers/markdown.js tests/renderers/markdown.test.js
git commit -m "feat: add NHL rendering support to markdown renderer

- Implement renderNhl() function matching existing sport format
- Display team name, conference, division, season record, win percentage, and recent games
- Add NHL case to main switch statement in renderer
- Include comprehensive tests for NHL rendering with various data scenarios"
```

---

## Task 5: Update README with NHL Teams and Documentation

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: NHL team data (TEAM_EMOJI, TEAM_IDS from nhl.js)
- Produces: Updated README with NHL section

- [ ] **Step 1: Read current README to understand structure**

Identify where to insert:
- NHL status in "Supported Sports" table
- NHL team abbreviations table (32 teams)
- NHL workflow example

- [ ] **Step 2: Update "Supported Sports" table**

Change this line in the README:

```
| 🏒 NHL | 🔜 Coming soon | — | — |
```

To:

```
| 🏒 NHL | ✅ Available | [NHL.com Stats API](https://statsapi.web.nhl.com/api/v1/) | **Not needed** |
```

- [ ] **Step 3: Add NHL workflow example to Quick Start**

After the NFL Example section, add:

```markdown
#### NHL Example (no `BDL_API_KEY` needed)

```yaml
      - uses: 23seriy/readme-scoreboard@main
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
          SPORT: nhl
          TEAM: NYR
```
```

- [ ] **Step 4: Add NHL Teams table**

Add after the NFL Teams section:

```markdown
---

## 🏒 NHL Team Abbreviations

<span style="font-size: 0.85em;">

### Eastern Conference

#### Atlantic Division
| | Team | Abbr | | | Team | Abbr |
|---|------|------|-|---|------|------|
| <img src="https://www.nhl.com/nhl/v2/logos/teams/6.svg" width="20"> | Boston Bruins | BOS | | <img src="https://www.nhl.com/nhl/v2/logos/teams/10.svg" width="20"> | Toronto Maple Leafs | TOR |
| <img src="https://www.nhl.com/nhl/v2/logos/teams/9.svg" width="20"> | Buffalo Sabres | BUF | | <img src="https://www.nhl.com/nhl/v2/logos/teams/17.svg" width="20"> | Detroit Red Wings | DET |
| <img src="https://www.nhl.com/nhl/v2/logos/teams/12.svg" width="20"> | Carolina Hurricanes | CAR | | <img src="https://www.nhl.com/nhl/v2/logos/teams/15.svg" width="20"> | Washington Capitals | WSH |
| <img src="https://www.nhl.com/nhl/v2/logos/teams/13.svg" width="20"> | Florida Panthers | FLA | | <img src="https://www.nhl.com/nhl/v2/logos/teams/7.svg" width="20"> | New York Islanders | NYI |
| <img src="https://www.nhl.com/nhl/v2/logos/teams/8.svg" width="20"> | Montreal Canadiens | MTL | | <img src="https://www.nhl.com/nhl/v2/logos/teams/3.svg" width="20"> | New York Rangers | NYR |

#### Metropolitan Division
| | Team | Abbr | | | Team | Abbr |
|---|------|------|-|---|------|------|
| <img src="https://www.nhl.com/nhl/v2/logos/teams/5.svg" width="20"> | Pittsburgh Penguins | PIT | | <img src="https://www.nhl.com/nhl/v2/logos/teams/29.svg" width="20"> | Columbus Blue Jackets | CBJ |
| <img src="https://www.nhl.com/nhl/v2/logos/teams/1.svg" width="20"> | New Jersey Devils | NJD | | <img src="https://www.nhl.com/nhl/v2/logos/teams/18.svg" width="20"> | Nashville Predators | NSH |
| <img src="https://www.nhl.com/nhl/v2/logos/teams/4.svg" width="20"> | Philadelphia Flyers | PHI |

### Western Conference

#### Central Division
| | Team | Abbr | | | Team | Abbr |
|---|------|------|-|---|------|------|
| <img src="https://www.nhl.com/nhl/v2/logos/teams/25.svg" width="20"> | Dallas Stars | DAL | | <img src="https://www.nhl.com/nhl/v2/logos/teams/19.svg" width="20"> | St. Louis Blues | STL |
| <img src="https://www.nhl.com/nhl/v2/logos/teams/16.svg" width="20"> | Chicago Blackhawks | CHI | | <img src="https://www.nhl.com/nhl/v2/logos/teams/20.svg" width="20"> | Calgary Flames | CGY |
| <img src="https://www.nhl.com/nhl/v2/logos/teams/21.svg" width="20"> | Colorado Avalanche | COL | | <img src="https://www.nhl.com/nhl/v2/logos/teams/52.svg" width="20"> | Winnipeg Jets | WPG |

#### Pacific Division
| | Team | Abbr | | | Team | Abbr |
|---|------|------|-|---|------|------|
| <img src="https://www.nhl.com/nhl/v2/logos/teams/22.svg" width="20"> | Edmonton Oilers | EDM | | <img src="https://www.nhl.com/nhl/v2/logos/teams/54.svg" width="20"> | Vegas Golden Knights | VGK |
| <img src="https://www.nhl.com/nhl/v2/logos/teams/23.svg" width="20"> | Vancouver Canucks | VAN | | <img src="https://www.nhl.com/nhl/v2/logos/teams/53.svg" width="20"> | Arizona Coyotes | ARI |
| <img src="https://www.nhl.com/nhl/v2/logos/teams/26.svg" width="20"> | Los Angeles Kings | LAK | | <img src="https://www.nhl.com/nhl/v2/logos/teams/28.svg" width="20"> | San Jose Sharks | SJS |
| <img src="https://www.nhl.com/nhl/v2/logos/teams/24.svg" width="20"> | Anaheim Ducks | ANA | | <img src="https://www.nhl.com/nhl/v2/logos/teams/55.svg" width="20"> | Seattle Kraken | SEA |

</span>
```

- [ ] **Step 5: Update project description**

Change the first line from:

```
Currently supports **NBA**, **MLB**, and **NFL** with more sports coming soon (NHL, soccer, etc.)
```

To:

```
Currently supports **NBA**, **MLB**, **NFL**, and **NHL** with more sports coming soon (soccer, etc.)
```

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "docs: add NHL support documentation

- Update supported sports table to mark NHL as available
- Add NHL team abbreviations table (32 teams across 4 divisions)
- Add NHL workflow example to quick start guide
- Update project description to include NHL"
```

---

## Task 6: Run Full Test Suite and Demo Mode

**Files:**
- No new files; testing all existing functionality

**Interfaces:**
- Verifies all adapters work correctly with their abstract methods
- Confirms demo mode works for all sports

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: All tests pass (including new NHL tests, MLB regression tests, base adapter tests)

- [ ] **Step 2: Test demo mode for all sports**

```bash
# Test MLB
SPORT=mlb TEAM=NYY node src/index.js --demo

# Test NHL
SPORT=nhl TEAM=NYR node src/index.js --demo

# Test NBA (verify unchanged)
SPORT=nba TEAM=LAL node src/index.js --demo

# Test NFL (verify unchanged)
SPORT=nfl TEAM=KC node src/index.js --demo
```

Expected: All four sports display correctly with team info, record, and recent games

- [ ] **Step 3: Test NHL with a different team**

```bash
SPORT=nhl TEAM=LAK node src/index.js --demo
SPORT=nhl TEAM=TOR node src/index.js --demo
```

Expected: Different teams display correctly with their respective logos, emojis, and divisions

- [ ] **Step 4: Verify output format matches existing sports**

Compare visual output of NHL with MLB/NFL. Check:
- Team logo appears right-aligned
- Team name, abbreviation, division, conference display correctly
- Season record shows wins, losses, percentage with progress bar
- Recent games show W/L, scores, opponent abbreviation, date

- [ ] **Step 5: Create final commit with all testing complete**

```bash
git add -A
git commit -m "test: verify full test suite and demo mode for all sports

- All unit tests pass (base-free-api, NHL, MLB regression, renderers)
- Demo mode works for NBA, MLB, NFL, NHL
- NHL output format matches existing sports
- MLB adapter behaves identically after refactoring"
```

---

## Task 7: Documentation and Polish

**Files:**
- No code changes; final verification

**Interfaces:**
- Verifies implementation against original spec
- Ensures code quality and documentation completeness

- [ ] **Step 1: Verify all 32 NHL teams are in TEAM_EMOJI and TEAM_IDS**

```bash
node -e "const nhl = require('./src/adapters/nhl'); console.log('TEAM_EMOJI count:', Object.keys(nhl.TEAM_EMOJI).length); console.log('TEAM_IDS count:', Object.keys(nhl.TEAM_IDS).length);"
```

Expected: Both output 32

- [ ] **Step 2: Verify no API keys required for NHL**

Check that `src/index.js` does not require any API key validation for NHL sport

Expected: NHL works without `BDL_API_KEY` or other keys

- [ ] **Step 3: Verify off-season handling works**

The 180-day lookback in base class should automatically handle off-season:
- When calling in June (off-season), it looks back 180 days to December (previous season)
- Recent games returned are from previous season

This is handled automatically by the base class `fetchRecentGames()` method.

- [ ] **Step 4: Create summary of changes**

Create a summary of what was implemented:
- ✅ Created `BaseFreeApiAdapter` for shared free-API logic
- ✅ Created `NHL` adapter supporting all 32 teams
- ✅ Refactored `MLB` adapter to extend base class (no behavior changes)
- ✅ Added `renderNhl()` to markdown renderer
- ✅ Updated README with NHL teams and examples
- ✅ All tests pass; no regressions
- ✅ Demo mode works for all sports

- [ ] **Step 5: Final commit**

```bash
git log --oneline -7
```

Expected output showing 7 commits from this implementation:
1. feat: create BaseFreeApiAdapter base class...
2. feat: create NHL adapter using NHL.com Stats API...
3. refactor: extend MLB adapter from BaseFreeApiAdapter...
4. feat: add NHL rendering support to markdown renderer...
5. docs: add NHL support documentation...
6. test: verify full test suite and demo mode...
7. Any additional cleanup commits

---

## Success Criteria Checklist

Before considering this complete, verify:

- [ ] All 32 NHL teams supported with correct abbreviations and emojis
- [ ] NHL output format matches existing sports (team info, division, record, games)
- [ ] No API key required for NHL
- [ ] Off-season behavior works (180-day lookback)
- [ ] Demo mode works for NHL and all existing sports
- [ ] MLB adapter refactored without behavior changes (regression tests pass)
- [ ] Base class properly abstracts shared logic
- [ ] README updated with NHL documentation and examples
- [ ] All tests pass
- [ ] Code follows existing patterns and style
- [ ] No breaking changes to existing sports

---

## Implementation Notes

**Key Design Decisions:**
- NHL season year calculated as previous year for months 1-9 (off-season), current year for months 10-12 (regular season)
- 180-day lookback window naturally handles off-season by pulling previous season games
- Game status filtering on "Final" prevents incomplete/in-progress games from showing
- TEAM_IDS mapping allows easy lookup of NHL.com team IDs for API calls

**Testing Strategy:**
- Unit tests verify base class methods and abstract method handling
- Integration tests verify NHL and MLB adapters fetch correct data
- Regression tests ensure MLB behavior unchanged after refactoring
- Demo tests verify all sports display without API calls

**Future Extensions:**
- Soccer/other sports can extend `BaseFreeApiAdapter` with just 4 abstract methods
- No changes to base class needed for new sports
- Renderer pattern makes adding new `renderSport()` functions straightforward
