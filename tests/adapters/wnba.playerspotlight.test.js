const axios = require("axios");
const adapter = require("../../src/adapters/wnba");
const { render } = require("../../src/renderers/markdown");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

function makeRosterResponse(athletes) {
  return { data: { athletes } };
}

function makeSplitsResponse(names, stats) {
  return { data: { names, splitCategories: [{ splits: [{ stats }] }] } };
}

function makeGamelogResponse(names, stats, eventId = "401857189") {
  return {
    data: {
      names,
      seasonTypes: [{ categories: [{ events: [{ eventId, stats }] }] }],
    },
  };
}

function makeSummaryResponse(opponentAbbr = "CON", opponentName = "Connecticut Sun") {
  return {
    data: {
      header: {
        competitions: [
          {
            date: "2026-08-31T00:30Z",
            competitors: [
              { team: { abbreviation: "DAL", displayName: "Dallas Wings" } },
              { team: { abbreviation: opponentAbbr, displayName: opponentName } },
            ],
          },
        ],
      },
    },
  };
}

describe("WnbaAdapter — fetchTeamRoster", () => {
  it("returns the roster as id/fullName/position triples", async () => {
    axios.get.mockResolvedValueOnce(makeRosterResponse([
      { id: "4433730", fullName: "Paige Bueckers", position: { abbreviation: "G" } },
      { id: "3917450", fullName: "Napheesa Collier", position: { abbreviation: "F" } },
    ]));

    const roster = await adapter.fetchTeamRoster("DAL");
    expect(roster).toEqual([
      { id: "4433730", fullName: "Paige Bueckers", position: "G" },
      { id: "3917450", fullName: "Napheesa Collier", position: "F" },
    ]);
  });

  it("returns an empty array when the request fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("network error"));
    expect(await adapter.fetchTeamRoster("MIN")).toEqual([]);
  });

  it("returns an empty array for an unknown team abbreviation", async () => {
    expect(await adapter.fetchTeamRoster("ZZZ")).toEqual([]);
    expect(axios.get).not.toHaveBeenCalled();
  });
});

describe("WnbaAdapter — findPlayerOnRoster", () => {
  const roster = [
    { id: "1", fullName: "Paige Bueckers", position: "G" },
    { id: "2", fullName: "A'ja Wilson", position: "C" },
  ];

  it("matches a name case-insensitively", () => {
    expect(adapter.findPlayerOnRoster(roster, "paige bueckers").id).toBe("1");
  });

  it("returns null when the player is not on the roster", () => {
    expect(adapter.findPlayerOnRoster(roster, "Nobody Here")).toBeNull();
  });
});

describe("WnbaAdapter — headshot URLs", () => {
  it("builds a headshot URL from the athlete id", () => {
    expect(adapter.getPlayerHeadshotUrl("4433730")).toBe(
      "https://a.espncdn.com/i/headshots/wnba/players/full/4433730.png"
    );
  });

  it("returns null without an id, so the renderer omits the image", () => {
    expect(adapter.getPlayerHeadshotUrl(null)).toBeNull();
    expect(adapter.getPlayerHeadshotUrl("")).toBeNull();
  });
});

describe("WnbaAdapter — fetchPlayerSeasonAverages", () => {
  it("reads avgPoints/avgRebounds/avgAssists from the splits payload", async () => {
    axios.get.mockResolvedValueOnce(makeSplitsResponse(
      ["gamesPlayed", "avgPoints", "avgRebounds", "avgAssists"],
      ["38", "20.5", "4.1", "5.9"],
    ));

    expect(await adapter.fetchPlayerSeasonAverages("4433730")).toEqual({
      points: 20.5, rebounds: 4.1, assists: 5.9,
    });
  });

  it("returns null when a required average is missing", async () => {
    axios.get.mockResolvedValueOnce(makeSplitsResponse(
      ["avgPoints", "avgRebounds"],
      ["20.5", "4.1"],
    ));
    expect(await adapter.fetchPlayerSeasonAverages("4433730")).toBeNull();
  });

  it("returns null when the request fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("network error"));
    expect(await adapter.fetchPlayerSeasonAverages("4433730")).toBeNull();
  });
});

describe("WnbaAdapter — fetchPlayerLastGame", () => {
  it("returns the most recent game's box score plus opponent and date", async () => {
    axios.get
      .mockResolvedValueOnce(makeGamelogResponse(
        ["minutes", "points", "totalRebounds", "assists"],
        ["25", "15", "2", "6"],
      ))
      .mockResolvedValueOnce(makeSummaryResponse());

    const game = await adapter.fetchPlayerLastGame("4433730", "DAL");
    expect(game).toEqual({
      points: 15, rebounds: 2, assists: 6, minutes: 25,
      date: "2026-08-31T00:30Z", opponent: "Connecticut Sun",
    });
  });

  it("still returns the stat line when the summary lookup fails", async () => {
    axios.get
      .mockResolvedValueOnce(makeGamelogResponse(
        ["minutes", "points", "totalRebounds", "assists"],
        ["25", "15", "2", "6"],
      ))
      .mockRejectedValueOnce(new Error("summary down"));

    const game = await adapter.fetchPlayerLastGame("4433730", "DAL");
    expect(game.points).toBe(15);
    expect(game.opponent).toBeUndefined();
  });

  it("returns null when the game log is empty", async () => {
    axios.get.mockResolvedValueOnce({ data: { names: [], seasonTypes: [] } });
    expect(await adapter.fetchPlayerLastGame("4433730", "DAL")).toBeNull();
  });
});

describe("WnbaAdapter — fetchPlayerSpotlight", () => {
  it("returns the player's name, season averages, last game, and headshot", async () => {
    axios.get
      .mockResolvedValueOnce(makeRosterResponse([
        { id: "4433730", fullName: "Paige Bueckers", position: { abbreviation: "G" } },
      ]))
      .mockResolvedValueOnce(makeSplitsResponse(
        ["avgPoints", "avgRebounds", "avgAssists"],
        ["20.5", "4.1", "5.9"],
      ))
      .mockResolvedValueOnce(makeGamelogResponse(
        ["minutes", "points", "totalRebounds", "assists"],
        ["25", "15", "2", "6"],
      ))
      .mockResolvedValueOnce(makeSummaryResponse());

    const result = await adapter.fetchPlayerSpotlight("DAL", "Paige Bueckers");
    expect(result.name).toBe("Paige Bueckers");
    expect(result.position).toBe("G");
    expect(result.season).toEqual({ points: 20.5, rebounds: 4.1, assists: 5.9 });
    expect(result.lastGame.points).toBe(15);
    expect(result.headshotUrl).toBe(
      "https://a.espncdn.com/i/headshots/wnba/players/full/4433730.png"
    );
  });

  it("falls back to zeroed averages when the splits fetch fails", async () => {
    axios.get
      .mockResolvedValueOnce(makeRosterResponse([
        { id: "4433730", fullName: "Paige Bueckers", position: { abbreviation: "G" } },
      ]))
      .mockRejectedValueOnce(new Error("stats down"))
      .mockResolvedValueOnce(makeGamelogResponse(
        ["minutes", "points", "totalRebounds", "assists"],
        ["25", "15", "2", "6"],
      ))
      .mockResolvedValueOnce(makeSummaryResponse());

    const result = await adapter.fetchPlayerSpotlight("DAL", "Paige Bueckers");
    expect(result.season).toEqual({ points: 0, rebounds: 0, assists: 0 });
    expect(result.lastGame.points).toBe(15);
  });

  it("throws a descriptive error listing roster names when the player isn't found", async () => {
    axios.get.mockResolvedValueOnce(makeRosterResponse([
      { id: "1", fullName: "Napheesa Collier", position: { abbreviation: "F" } },
      { id: "2", fullName: "Kayla McBride", position: { abbreviation: "G" } },
    ]));

    await expect(adapter.fetchPlayerSpotlight("MIN", "Nobody Here"))
      .rejects.toThrow(/Unknown player "Nobody Here" on MIN/);
  });
});

describe("WnbaAdapter — demo spotlight", () => {
  it("returns a spotlight for a named demo player", () => {
    const demo = adapter.getDemoData("MIN", "Napheesa Collier");
    expect(demo.spotlight.name).toBe("Napheesa Collier");
    expect(demo.spotlight.season.points).toBeGreaterThan(0);
    expect(demo.spotlight.lastGame.points).toBeGreaterThan(0);
  });

  it("builds the demo headshot from the player's real ESPN athlete id", () => {
    const demo = adapter.getDemoData("DAL", "Paige Bueckers");
    expect(demo.spotlight.headshotUrl).toBe(
      "https://a.espncdn.com/i/headshots/wnba/players/full/4433730.png"
    );
  });

  it("ties the demo last game to the team board's most recent result", () => {
    // The spotlight must agree with the Recent Games list rather than showing
    // its own opponent or date.
    const demo = adapter.getDemoData("MIN", "Napheesa Collier");
    const last = demo.recentGames[0];
    const expectedOpp = last.visitor_team.abbreviation === "MIN"
      ? last.home_team.abbreviation
      : last.visitor_team.abbreviation;
    expect(demo.spotlight.lastGame.opponent).toBe(expectedOpp);
    expect(demo.spotlight.lastGame.date).toBe(last.date);
  });

  it("omits the spotlight when no player is given", () => {
    expect(adapter.getDemoData("MIN").spotlight).toBeNull();
  });

  it("returns null for an unknown demo team", () => {
    expect(adapter.getDemoData("ZZZ", "Someone")).toBeNull();
  });

  it("returns a distinct spotlight per demo player", () => {
    const collier = adapter.getDemoData("MIN", "Napheesa Collier").spotlight;
    const mcbride = adapter.getDemoData("MIN", "Kayla McBride").spotlight;
    expect(collier.name).not.toBe(mcbride.name);
    expect(collier.season.points).not.toBe(mcbride.season.points);
  });
});

describe("WNBA — rendered board", () => {
  it("renders the spotlight and its headshot on the WNBA board", () => {
    const data = adapter.getDemoData("MIN", "Napheesa Collier");
    data.emoji = adapter.TEAM_EMOJI.MIN;
    data.logoUrl = adapter.getLogoUrl("MIN");

    const output = render("wnba", data, {});
    expect(output).toContain("My Favourite WNBA Team");
    expect(output).toContain("Player Spotlight: Napheesa Collier");
    expect(output).toContain("PPG · ");
    expect(output).toContain("headshot");
    // The WNBA plays a single calendar-year season, unlike the NBA's span.
    expect(output).toContain("2026 Record:");
    expect(output).not.toContain("2025-2026 Record:");
  });
});
