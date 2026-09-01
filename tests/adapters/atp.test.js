const axios = require("axios");
const atp = require("../../src/adapters/atp");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("ATPAdapter — league config", () => {
  it("carries the ranked-player roster", () => {
    expect(Object.keys(atp.TEAM_IDS).length).toBeGreaterThanOrEqual(10);
    expect(atp.TEAM_IDS.SIN.id).toBe("3623");
    expect(atp.TEAM_IDS.ALC.id).toBe("3782");
  });

  it("gives every player an emoji", () => {
    Object.keys(atp.TEAM_IDS).forEach((abbr) => {
      expect(atp.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("returns an https logo URL", () => {
    expect(atp.getLogoUrl("SIN")).toMatch(/^https:\/\//);
  });
});

describe("ATPAdapter — fetchData", () => {
  const rankingsResponse = {
    data: {
      rankings: [
        {
          ranks: [
            { current: 1, previous: 1, points: 12800, trend: "-", athlete: { id: "3623", displayName: "Jannik Sinner" } },
            { current: 3, previous: 4, points: 7160, trend: "up", athlete: { id: "3782", displayName: "Carlos Alcaraz" } },
          ],
        },
      ],
    },
  };
  const compsResponse = {
    data: {
      items: [{ $ref: "https://sports.core.api.espn.com/v2/sports/tennis/leagues/atp/events/1/competitions/2" }],
    },
  };
  const competitionResponse = {
    data: {
      date: "2026-07-12T15:05:00Z",
      competitors: [
        { id: "3623", name: "Jannik Sinner", winner: true, linescores: { $ref: "https://x/linescores/1" } },
        { id: "2375", name: "Alexander Zverev", winner: false, linescores: { $ref: "https://x/linescores/2" } },
      ],
    },
  };
  const linescoresResponse = (values) => ({ data: { items: values.map((v) => ({ value: v })) } });

  it("returns the player, world ranking, and points", async () => {
    axios.get
      .mockResolvedValueOnce(rankingsResponse)
      .mockResolvedValueOnce(compsResponse)
      .mockResolvedValueOnce(competitionResponse)
      .mockResolvedValueOnce(linescoresResponse([6, 7, 6, 6]))
      .mockResolvedValueOnce(linescoresResponse([7, 6, 3, 4]));

    const result = await atp.fetchData("SIN");
    expect(result.team.abbreviation).toBe("SIN");
    expect(result.team.full_name).toBe("Jannik Sinner");
    expect(result.standing.position).toBe(1);
    expect(result.rankPoints).toBe(12800);
  });

  it("includes the player's latest match result", async () => {
    axios.get
      .mockResolvedValueOnce(rankingsResponse)
      .mockResolvedValueOnce(compsResponse)
      .mockResolvedValueOnce(competitionResponse)
      .mockResolvedValueOnce(linescoresResponse([6, 7, 6, 6]))
      .mockResolvedValueOnce(linescoresResponse([7, 6, 3, 4]));

    const result = await atp.fetchData("SIN");
    expect(result.lastMatch).toEqual({
      opponent: "Alexander Zverev",
      won: true,
      date: "2026-07-12T15:05:00Z",
      sets: [[6, 7, 6, 6], [7, 6, 3, 4]],
    });
  });

  it("returns null for an unknown player", async () => {
    const result = await atp.fetchData("ZZZ");
    expect(result).toBeNull();
  });
});

describe("ATPAdapter — demo data", () => {
  it("includes the fields the renderer needs", () => {
    const demo = atp.getDemoData("SIN");
    expect(demo).not.toBeNull();
    expect(demo.team.full_name).toBe("Jannik Sinner");
    expect(demo.standing.position).toBeGreaterThan(0);
    expect(demo.rankPoints).toBeGreaterThan(0);
    expect(demo.lastMatch.opponent).toBeTruthy();
    expect(demo.lastMatch.won).toBe(true);
    expect(Array.isArray(demo.recentGames)).toBe(true);
  });

  it("returns null for an unknown player", () => {
    expect(atp.getDemoData("ZZZ")).toBeNull();
  });
});
