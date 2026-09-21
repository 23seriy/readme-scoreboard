const axios = require("axios");
const adapter = require("../../src/adapters/ncaab");

jest.mock("axios");

// The four college leagues inherit fetchTeam/fetchData from BaseEspnLeagueAdapter
// rather than defining their own, so these tests cover the shared code path that
// every one of them depends on.
const TEAM = { id: 12, abbreviation: "ARIZ", name: "Arizona", displayName: "Arizona Wildcats" };
const originalTeamIds = { ...adapter.TEAM_IDS };

let errorSpy;

beforeEach(() => {
  jest.clearAllMocks();
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  // fetchTeam caches discovered ids on the instance, which is a module singleton.
  Object.keys(adapter.TEAM_IDS).forEach((key) => delete adapter.TEAM_IDS[key]);
  Object.assign(adapter.TEAM_IDS, originalTeamIds);
  errorSpy.mockRestore();
});

describe("BaseEspnLeagueAdapter — fetchTeam", () => {
  it("uses the configured team id instead of searching the directory", async () => {
    axios.get.mockResolvedValueOnce({ data: { team: TEAM } });

    const team = await adapter.fetchTeam("ARIZ");

    expect(axios.get.mock.calls[0][0]).toContain("/teams/12");
    expect(team).toMatchObject({
      id: 12,
      abbreviation: "ARIZ",
      name: "Arizona",
      full_name: "Arizona Wildcats",
      conference: "",
      division: "",
    });
  });

  it("searches the full directory for an unconfigured team and caches what it finds", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        sports: [{
          leagues: [{
            teams: [{ team: { id: 150, abbreviation: "DUKE", name: "Duke", displayName: "Duke Blue Devils" } }],
          }],
        }],
      },
    });

    const team = await adapter.fetchTeam("DUKE");

    expect(axios.get.mock.calls[0][0]).toContain("/teams?limit=1000");
    expect(team.id).toBe(150);
    expect(adapter.TEAM_IDS.DUKE).toBe(150);

    // The second lookup should take the cheap single-team route.
    axios.get.mockResolvedValueOnce({ data: { team: { id: 150, abbreviation: "DUKE", name: "Duke", displayName: "Duke Blue Devils" } } });
    await adapter.fetchTeam("DUKE");

    expect(axios.get.mock.calls[1][0]).toContain("/teams/150");
  });

  it("returns null when the abbreviation is not in the directory", async () => {
    axios.get.mockResolvedValueOnce({ data: { teams: [{ abbreviation: "SOMEONE_ELSE" }] } });

    await expect(adapter.fetchTeam("NOPE")).resolves.toBeNull();
  });

  it("returns null and reports why when the request fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("503 Service Unavailable"));

    await expect(adapter.fetchTeam("ARIZ")).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("NCAA Men's Basketball"));
  });
});

describe("BaseEspnLeagueAdapter — fetchData", () => {
  const standings = {
    children: [{
      name: "Pac-12",
      standings: {
        entries: [{
          team: { abbreviation: "ARIZ" },
          stats: [{ name: "wins", value: 20 }, { name: "losses", value: 8 }],
        }],
      },
    }],
  };

  it("assembles the record, standing, and schedule from the two upstream feeds", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { team: TEAM } })
      .mockResolvedValueOnce({ data: standings })
      .mockResolvedValueOnce({ data: { events: [] } });

    const data = await adapter.fetchData("ARIZ");

    expect(data.team.id).toBe(12);
    expect(data.team.conference).toBe("Pac-12");
    expect(data.record).toMatchObject({ wins: 20, losses: 8, conference: "Pac-12", position: 1 });
    expect(data.standing).toEqual({ position: 1, label: "Pac-12" });
    expect(data.recentGames).toEqual([]);
    expect(data.form).toEqual([]);
    expect(data.nextGame).toBeNull();
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  it("returns null without fetching standings when the team is unknown", async () => {
    axios.get.mockResolvedValueOnce({ data: { teams: [] } });

    await expect(adapter.fetchData("NOPE")).resolves.toBeNull();
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("returns null and reports why when a standings or schedule request fails", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { team: TEAM } })
      .mockRejectedValueOnce(new Error("500 Internal Server Error"));

    await expect(adapter.fetchData("ARIZ")).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("NCAA Men's Basketball"));
  });
});
