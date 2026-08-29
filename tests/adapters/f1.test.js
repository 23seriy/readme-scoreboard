const axios = require("axios");
const f1 = require("../../src/adapters/f1");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("F1Adapter — league config", () => {
  it("has all 11 constructors", () => {
    expect(Object.keys(f1.TEAM_IDS).length).toBe(11);
  });

  it("gives every constructor an emoji", () => {
    Object.keys(f1.TEAM_IDS).forEach((abbr) => {
      expect(f1.TEAM_EMOJI[abbr]).toBeDefined();
    });
  });

  it("returns an https logo URL for every constructor", () => {
    Object.keys(f1.TEAM_IDS).forEach((abbr) => {
      expect(f1.getLogoUrl(abbr)).toMatch(/^https:\/\//);
    });
  });
});

describe("F1Adapter — fetchData", () => {
  const teamResponse = { data: { team: { id: "106893", displayName: "Mercedes", name: "Mercedes" } } };
  const constructorGroup = {
    data: {
      children: [
        { name: "Driver Standings", standings: { entries: [{ athlete: { abbreviation: "ANT" } }] } },
        {
          name: "Constructor Standings",
          standings: {
            entries: [
              { team: { abbreviation: "LP", displayName: "Mercedes" }, stats: [{ name: "rank", value: 1 }, { name: "points", value: 425 }] },
              { team: { abbreviation: "GL", displayName: "Red Bull" }, stats: [{ name: "rank", value: 2 }, { name: "points", value: 380 }] },
            ],
          },
        },
      ],
    },
  };

  it("returns the constructor, championship position, and points", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(constructorGroup);

    const result = await f1.fetchData("LP");
    expect(result.team.abbreviation).toBe("LP");
    expect(result.team.full_name).toBe("Mercedes");
    expect(result.standing.position).toBe(1);
    expect(result.record.points).toBe(425);
  });

  it("has no recent games, since F1 exposes no team-level results", async () => {
    axios.get
      .mockResolvedValueOnce(teamResponse)
      .mockResolvedValueOnce(constructorGroup);

    const result = await f1.fetchData("LP");
    expect(result.recentGames).toEqual([]);
  });

  it("returns null for an unknown constructor", async () => {
    expect(await f1.fetchData("ZZZ")).toBeNull();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("returns null when the API fails", async () => {
    axios.get.mockRejectedValue(new Error("500"));
    expect(await f1.fetchData("LP")).toBeNull();
  });
});

describe("F1Adapter — demo data", () => {
  it("includes the fields the renderer needs", () => {
    const demo = f1.getDemoData("LP");
    expect(demo).not.toBeNull();
    expect(demo.record.points).toBeGreaterThan(0);
    expect(demo.standing.position).toBeTruthy();
    expect(Array.isArray(demo.recentGames)).toBe(true);
  });

  it("falls back to a default constructor for unknown demo teams", () => {
    const demo = f1.getDemoData("ZZZ");
    expect(demo).not.toBeNull();
    expect(demo.team.abbreviation).toBeTruthy();
  });
});
