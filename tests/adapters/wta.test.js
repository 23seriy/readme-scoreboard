const axios = require("axios");
const wta = require("../../src/adapters/wta");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("WTAAdapter — league config", () => {
  it("carries the ranked-player roster", () => {
    expect(Object.keys(wta.TEAM_IDS).length).toBeGreaterThanOrEqual(10);
    expect(wta.TEAM_IDS.SAB.id).toBe("3038");
    expect(wta.TEAM_IDS.GAU.id).toBe("3626");
  });

  it("gives every player an emoji", () => {
    Object.keys(wta.TEAM_IDS).forEach((abbr) => {
      expect(wta.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("returns an https logo URL", () => {
    expect(wta.getLogoUrl("SAB")).toMatch(/^https:\/\//);
  });
});

describe("WTAAdapter — fetchData", () => {
  const rankingsResponse = {
    data: {
      rankings: [
        {
          ranks: [
            { current: 1, previous: 1, points: 8575, trend: "-", athlete: { id: "3038", displayName: "Aryna Sabalenka" } },
            { current: 4, previous: 5, points: 6704, trend: "up", athlete: { id: "3626", displayName: "Coco Gauff" } },
          ],
        },
      ],
    },
  };
  const compsResponse = {
    data: {
      items: [{ $ref: "https://sports.core.api.espn.com/v2/sports/tennis/leagues/wta/events/1/competitions/2" }],
    },
  };
  const competitionResponse = {
    data: {
      date: "2026-08-30T15:05:00Z",
      competitors: [
        { id: "3038", name: "Aryna Sabalenka", winner: true, linescores: { $ref: "https://x/linescores/1" } },
        { id: "3126", name: "Elena Rybakina", winner: false, linescores: { $ref: "https://x/linescores/2" } },
      ],
    },
  };
  const linescoresResponse = (values) => ({ data: { items: values.map((v) => ({ value: v })) } });

  it("returns the player, world ranking, and points", async () => {
    axios.get
      .mockResolvedValueOnce(rankingsResponse)
      .mockResolvedValueOnce(compsResponse)
      .mockResolvedValueOnce(competitionResponse)
      .mockResolvedValueOnce(linescoresResponse([6, 4, 6]))
      .mockResolvedValueOnce(linescoresResponse([3, 6, 2]));

    const result = await wta.fetchData("SAB");
    expect(result.team.abbreviation).toBe("SAB");
    expect(result.team.full_name).toBe("Aryna Sabalenka");
    expect(result.standing.position).toBe(1);
    expect(result.rankPoints).toBe(8575);
  });

  it("includes the player's latest match result", async () => {
    axios.get
      .mockResolvedValueOnce(rankingsResponse)
      .mockResolvedValueOnce(compsResponse)
      .mockResolvedValueOnce(competitionResponse)
      .mockResolvedValueOnce(linescoresResponse([6, 4, 6]))
      .mockResolvedValueOnce(linescoresResponse([3, 6, 2]));

    const result = await wta.fetchData("SAB");
    expect(result.lastMatch).toEqual({
      opponent: "Elena Rybakina",
      won: true,
      date: "2026-08-30T15:05:00Z",
      sets: [[6, 4, 6], [3, 6, 2]],
    });
  });

  it("does not treat a scheduled (upcoming) match as a played result", async () => {
    // ESPN exposes the player's most recent competition, which can be an
    // upcoming match with no winner yet. It must not be shown as a result.
    const scheduledCompetitionResponse = {
      data: {
        date: "2026-09-08T15:30Z",
        status: {
          $ref: "https://sports.core.api.espn.com/v2/sports/tennis/leagues/wta/events/189-2026/competitions/182533/status?lang=en&region=us",
        },
        competitors: [
          { id: "3038", name: "Aryna Sabalenka", winner: undefined, linescores: { $ref: "https://x/linescores/1" } },
          { id: "6970", name: "Linda Noskova", winner: undefined, linescores: { $ref: "https://x/linescores/2" } },
        ],
      },
    };
    const scheduledStatusResponse = {
      data: {
        type: { id: "1", name: "STATUS_SCHEDULED", state: "pre", completed: false, description: "Scheduled" },
      },
    };

    axios.get
      .mockResolvedValueOnce(rankingsResponse)
      .mockResolvedValueOnce(compsResponse)
      .mockResolvedValueOnce(scheduledCompetitionResponse)
      .mockResolvedValueOnce(scheduledStatusResponse);

    const result = await wta.fetchData("SAB");
    expect(result.lastMatch).toBeNull();
  });

  it("picks a completed match even when a scheduled match appears first in the list", async () => {
    const compsResponseMultiple = {
      data: {
        items: [
          { $ref: "https://sports.core.api.espn.com/v2/sports/tennis/leagues/wta/events/189-2026/competitions/182533" },
          { $ref: "https://sports.core.api.espn.com/v2/sports/tennis/leagues/wta/events/1/competitions/2" },
        ],
      },
    };
    const scheduledCompetitionResponse = {
      data: {
        date: "2026-09-08T15:30Z",
        status: { $ref: "https://sports.core.api.espn.com/v2/sports/tennis/leagues/wta/events/189-2026/competitions/182533/status" },
        competitors: [
          { id: "3038", name: "Aryna Sabalenka", winner: undefined, linescores: { $ref: "https://x/linescores/1" } },
          { id: "6970", name: "Linda Noskova", winner: undefined, linescores: { $ref: "https://x/linescores/2" } },
        ],
      },
    };
    const scheduledStatusResponse = {
      data: { type: { id: "1", name: "STATUS_SCHEDULED", state: "pre", completed: false, description: "Scheduled" } },
    };
    const completedCompetitionResponse = {
      data: {
        date: "2026-09-06T18:00Z",
        status: { $ref: "https://sports.core.api.espn.com/v2/sports/tennis/leagues/wta/events/1/competitions/2/status" },
        competitors: [
          { id: "3038", name: "Aryna Sabalenka", winner: true, linescores: { $ref: "https://x/linescores/1" } },
          { id: "999", name: "Taylor Townsend", winner: false, linescores: { $ref: "https://x/linescores/2" } },
        ],
      },
    };
    const completedStatusResponse = {
      data: { type: { id: "3", name: "STATUS_FINAL", state: "post", completed: true, description: "Final" } },
    };

    axios.get
      .mockResolvedValueOnce(rankingsResponse)
      .mockResolvedValueOnce(compsResponseMultiple)
      // scheduled match (skipped)
      .mockResolvedValueOnce(scheduledCompetitionResponse)
      .mockResolvedValueOnce(scheduledStatusResponse)
      // completed match (picked)
      .mockResolvedValueOnce(completedCompetitionResponse)
      .mockResolvedValueOnce(completedStatusResponse)
      // linescores for the completed match
      .mockResolvedValueOnce(linescoresResponse([6, 4]))
      .mockResolvedValueOnce(linescoresResponse([3, 6]));

    const result = await wta.fetchData("SAB");
    expect(result.lastMatch).toEqual({
      opponent: "Taylor Townsend",
      won: true,
      date: "2026-09-06T18:00Z",
      sets: [[6, 4], [3, 6]],
    });
  });

  it("returns null for an unknown player", async () => {
    const result = await wta.fetchData("ZZZ");
    expect(result).toBeNull();
  });
});

describe("WTAAdapter — demo data", () => {
  it("includes the fields the renderer needs", () => {
    const demo = wta.getDemoData("SAB");
    expect(demo).not.toBeNull();
    expect(demo.team.full_name).toBe("Aryna Sabalenka");
    expect(demo.standing.position).toBeGreaterThan(0);
    expect(demo.rankPoints).toBeGreaterThan(0);
    expect(demo.lastMatch.opponent).toBeTruthy();
    expect(demo.lastMatch.won).toBe(true);
    expect(Array.isArray(demo.recentGames)).toBe(true);
  });

  it("returns null for an unknown player", () => {
    expect(wta.getDemoData("ZZZ")).toBeNull();
  });
});
