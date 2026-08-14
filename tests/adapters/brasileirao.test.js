const axios = require("axios");
const brasileirao = require("../../src/adapters/brasileirao");
const ligamx = require("../../src/adapters/ligamx");
const seriea = require("../../src/adapters/seriea");
const epl = require("../../src/adapters/epl");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("BrasileiraoAdapter — league config", () => {
  it("points at ESPN's Brasileirão slug", () => {
    expect(brasileirao.LEAGUE_SLUG).toBe("bra.1");
    expect(brasileirao.baseUrl).toContain("/soccer/bra.1");
    expect(brasileirao.baseUrlV2).toContain("/soccer/bra.1");
  });

  it("has all 20 clubs", () => {
    expect(Object.keys(brasileirao.TEAM_IDS).length).toBe(20);
  });

  it("assigns every club a distinct ESPN id", () => {
    const ids = Object.values(brasileirao.TEAM_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every club an emoji", () => {
    Object.keys(brasileirao.TEAM_IDS).forEach((abbr) => {
      expect(brasileirao.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("uses ESPN's authoritative ids", () => {
    expect(brasileirao.TEAM_IDS.PAL).toBe(2029);
    expect(brasileirao.TEAM_IDS.FLA).toBe(819);
    expect(brasileirao.TEAM_IDS.COR).toBe(874);
    expect(brasileirao.TEAM_IDS.CRU).toBe(2022);
  });

  it("never produces a placeholder logo id", () => {
    Object.keys(brasileirao.TEAM_IDS).forEach((abbr) => {
      const url = brasileirao.getLogoUrl(abbr);
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toMatch(/\/0\.png$/);
    });
  });

  it("does not span calendar years — the season runs Mar–Dec", () => {
    expect(brasileirao.SEASON_SPANS_YEARS).toBe(false);
    expect(epl.SEASON_SPANS_YEARS).toBe(true);
  });
});

describe("BrasileiraoAdapter — abbreviations that collide with other leagues", () => {
  it("INT resolves to Internacional, not Internazionale (Serie A)", () => {
    expect(brasileirao.TEAM_IDS.INT).toBe(1936);
    expect(seriea.TEAM_IDS.INT).toBe(110);
    expect(brasileirao.TEAM_IDS.INT).not.toBe(seriea.TEAM_IDS.INT);
  });

  it("SAN resolves to Santos, not Santos Laguna (Liga MX)", () => {
    expect(brasileirao.TEAM_IDS.SAN).toBe(2674);
    expect(ligamx.TEAM_IDS.SAN).toBe(225);
    expect(brasileirao.TEAM_IDS.SAN).not.toBe(ligamx.TEAM_IDS.SAN);
  });
});

describe("BrasileiraoAdapter — season year (single calendar year)", () => {
  const seasonFor = (year, monthIndex, day = 15) => {
    jest.useFakeTimers().setSystemTime(new Date(year, monthIndex, day));
    const season = brasileirao.getSeasonYear();
    jest.useRealTimers();
    return season;
  };

  it("mid-season (August) is the current year", () => {
    expect(seasonFor(2026, 7)).toBe(2026);
  });

  it("February is still the current year, not the previous one", () => {
    // An Aug–May league would map February back a year. This must not.
    expect(seasonFor(2026, 1)).toBe(2026);
  });

  it("December is the current year", () => {
    expect(seasonFor(2026, 11)).toBe(2026);
  });
});

describe("BrasileiraoAdapter — fetchData", () => {
  const teamResponse = { data: { team: { id: 2029, abbreviation: "PAL", name: "Palmeiras", displayName: "Palmeiras" } } };

  const standings = (groupName) => ({
    data: {
      children: [{
        name: groupName,
        standings: {
          entries: [{
            team: { abbreviation: "PAL" },
            stats: [
              { name: "wins", value: 14 },
              { name: "losses", value: 2 },
              { name: "ties", value: 6 },
            ],
          }],
        },
      }],
    },
  });

  function fixture({ teamScore, oppScore, isHome = true, completed = true, date = "2026-08-09T20:00:00Z" }) {
    const mine = { homeAway: isHome ? "home" : "away", team: { id: 2029, abbreviation: "PAL" }, score: { value: teamScore } };
    const theirs = { homeAway: isHome ? "away" : "home", team: { id: 819, abbreviation: "FLA" }, score: { value: oppScore } };
    return { date, competitions: [{ status: { type: { completed } }, competitors: [mine, theirs] }] };
  }

  it("returns W/L/D from standings", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standings("2026"))
      .mockResolvedValueOnce({ data: { events: [] } });
    const result = await brasileirao.fetchData("PAL");
    expect(result.record.wins).toBe(14);
    expect(result.record.losses).toBe(2);
    expect(result.record.draws).toBe(6);
  });

  it("drops ESPN's bare-year group label so the renderer shows the league name", async () => {
    // ESPN labels this league's standings group "2026" rather than giving it a
    // descriptive name; the year already appears in the record line.
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standings("2026"))
      .mockResolvedValueOnce({ data: { events: [] } });
    const { team } = await brasileirao.fetchData("PAL");
    expect(team.conference).toBe("");
  });

  it("keeps a descriptive group label if ESPN ever provides one", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standings("Brazilian Serie A"))
      .mockResolvedValueOnce({ data: { events: [] } });
    const { team } = await brasileirao.fetchData("PAL");
    expect(team.conference).toBe("Brazilian Serie A");
  });

  it("a full 20-team season totals 38 matches", async () => {
    const full = standings("2025");
    full.data.children[0].standings.entries[0].stats = [
      { name: "wins", value: 20 }, { name: "losses", value: 8 }, { name: "ties", value: 10 },
    ];
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(full)
      .mockResolvedValueOnce({ data: { events: [] } });
    const { record } = await brasileirao.fetchData("PAL");
    expect(record.wins + record.losses + record.draws).toBe(38);
  });

  it("flags a draw rather than a win or loss", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standings("2026"))
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 0, oppScore: 0 })] } });
    const game = (await brasileirao.fetchData("PAL")).recentGames[0];
    expect(game.drew).toBe(true);
    expect(game.won).toBe(false);
  });

  it("tracks scores correctly for an away fixture", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standings("2026"))
      .mockResolvedValueOnce({ data: { events: [fixture({ teamScore: 4, oppScore: 0, isHome: false })] } });
    const game = (await brasileirao.fetchData("PAL")).recentGames[0];
    expect(game.isHome).toBe(false);
    expect(game.teamScore).toBe(4);
    expect(game.visitor_team_score).toBe(4);
    expect(game.home_team_score).toBe(0);
  });

  it("excludes fixtures that have not been played", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standings("2026"))
      .mockResolvedValueOnce({ data: { events: [
        fixture({ teamScore: 3, oppScore: 1, completed: true }),
        fixture({ teamScore: 0, oppScore: 0, completed: false }),
      ] } });
    expect((await brasileirao.fetchData("PAL")).recentGames.length).toBe(1);
  });

  it("returns at most 5 fixtures, newest first", async () => {
    const dates = ["2026-07-05", "2026-07-12", "2026-07-19", "2026-07-26", "2026-08-02", "2026-08-09"];
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(standings("2026"))
      .mockResolvedValueOnce({ data: { events: dates.map((d) => fixture({ teamScore: 2, oppScore: 0, date: `${d}T20:00:00Z` })) } });
    const games = (await brasileirao.fetchData("PAL")).recentGames;
    expect(games.length).toBe(5);
    expect(games[0].date).toContain("2026-08-09");
    expect(games[4].date).toContain("2026-07-12");
  });

  it("returns null when the club is unknown", async () => {
    axios.get.mockRejectedValue(new Error("404"));
    expect(await brasileirao.fetchData("ZZZ")).toBeNull();
  });
});

describe("BrasileiraoAdapter — demo data", () => {
  it("includes the soccer-specific fields the renderer needs", () => {
    const demo = brasileirao.getDemoData("PAL");
    expect(demo).not.toBeNull();
    demo.recentGames.forEach((g) => {
      expect(typeof g.teamScore).toBe("number");
      expect(typeof g.oppScore).toBe("number");
      expect(typeof g.oppAbbr).toBe("string");
      expect(typeof g.drew).toBe("boolean");
    });
  });

  it("returns null for an unknown club", () => {
    expect(brasileirao.getDemoData("ZZZ")).toBeNull();
  });
});
