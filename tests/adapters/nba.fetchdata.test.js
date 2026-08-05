const axios = require("axios");
const adapter = require("../../src/adapters/nba");

jest.mock("axios");

function makeTeamResponse(id = 13, name = "Lakers", displayName = "Los Angeles Lakers") {
  return { data: { team: { id, name, displayName } } };
}

function makeStandingsResponse(abbr, wins, losses, conference = "Western Conference", division = "Pacific Division") {
  return {
    data: {
      children: [{
        name: conference,
        children: [{
          name: division,
          standings: {
            entries: [{
              team: { abbreviation: abbr },
              stats: [
                { name: "wins", value: wins },
                { name: "losses", value: losses },
              ],
            }],
          },
        }],
      }],
    },
  };
}

function makeScheduleResponse(events) {
  return { data: { events } };
}

function makeEvent({ teamAbbr, oppAbbr, teamScore, oppScore, isHome = true, completed = true, date = "2026-04-10T00:00:00Z" }) {
  const teamComp = { homeAway: isHome ? "home" : "away", team: { abbreviation: teamAbbr }, score: { value: teamScore } };
  const oppComp = { homeAway: isHome ? "away" : "home", team: { abbreviation: oppAbbr }, score: { value: oppScore } };
  return {
    date,
    competitions: [{ status: { type: { completed } }, competitors: [teamComp, oppComp] }],
  };
}

beforeEach(() => jest.clearAllMocks());

describe("NbaAdapter — ESPN abbreviation mapping", () => {
  it("maps GSW to GS for ESPN", () => expect(adapter.ESPN_ABBR["GSW"]).toBe("GS"));
  it("maps NOP to NO for ESPN", () => expect(adapter.ESPN_ABBR["NOP"]).toBe("NO"));
  it("maps NYK to NY for ESPN", () => expect(adapter.ESPN_ABBR["NYK"]).toBe("NY"));
  it("maps SAS to SA for ESPN", () => expect(adapter.ESPN_ABBR["SAS"]).toBe("SA"));
  it("maps UTA to UTAH for ESPN", () => expect(adapter.ESPN_ABBR["UTA"]).toBe("UTAH"));
  it("maps WAS to WSH for ESPN", () => expect(adapter.ESPN_ABBR["WAS"]).toBe("WSH"));
});

describe("NbaAdapter — ESPN team IDs", () => {
  it("maps LAL to ESPN id 13", () => expect(adapter.ESPN_TEAM_IDS["LAL"]).toBe(13));
  it("maps BOS to ESPN id 2", () => expect(adapter.ESPN_TEAM_IDS["BOS"]).toBe(2));
  it("maps GSW to ESPN id 9", () => expect(adapter.ESPN_TEAM_IDS["GSW"]).toBe(9));
});

describe("NbaAdapter — NBA CDN TEAM_IDS (for logo URLs)", () => {
  it("LAL has NBA CDN id", () => expect(adapter.TEAM_IDS["LAL"]).toBe(1610612747));
  it("BOS has NBA CDN id", () => expect(adapter.TEAM_IDS["BOS"]).toBe(1610612738));
});

describe("NbaAdapter — fetchData", () => {
  it("returns team name and conference from ESPN", async () => {
    axios.get
      .mockResolvedValueOnce(makeTeamResponse(13, "Lakers", "Los Angeles Lakers"))
      .mockResolvedValueOnce(makeStandingsResponse("LAL", 50, 32, "Western Conference", "Pacific Division"))
      .mockResolvedValueOnce(makeScheduleResponse([]))
      .mockResolvedValueOnce(makeScheduleResponse([]));
    const result = await adapter.fetchData("LAL");
    expect(result.team.full_name).toBe("Los Angeles Lakers");
    expect(result.team.conference).toBe("Western");
    expect(result.team.division).toBe("Pacific");
  });

  it("returns W/L record from standings", async () => {
    axios.get
      .mockResolvedValueOnce(makeTeamResponse())
      .mockResolvedValueOnce(makeStandingsResponse("LAL", 50, 32))
      .mockResolvedValueOnce(makeScheduleResponse([]))
      .mockResolvedValueOnce(makeScheduleResponse([]));
    const result = await adapter.fetchData("LAL");
    expect(result.record.wins).toBe(50);
    expect(result.record.losses).toBe(32);
  });

  it("marks playoff games with postseason: true", async () => {
    axios.get
      .mockResolvedValueOnce(makeTeamResponse())
      .mockResolvedValueOnce(makeStandingsResponse("LAL", 50, 32))
      .mockResolvedValueOnce(makeScheduleResponse([]))
      .mockResolvedValueOnce(makeScheduleResponse([
        makeEvent({ teamAbbr: "LAL", oppAbbr: "GSW", teamScore: 110, oppScore: 98, isHome: true }),
      ]));
    const result = await adapter.fetchData("LAL");
    expect(result.recentGames[0].postseason).toBe(true);
  });

  it("marks regular season games with postseason: false", async () => {
    axios.get
      .mockResolvedValueOnce(makeTeamResponse())
      .mockResolvedValueOnce(makeStandingsResponse("LAL", 50, 32))
      .mockResolvedValueOnce(makeScheduleResponse([
        makeEvent({ teamAbbr: "LAL", oppAbbr: "BOS", teamScore: 105, oppScore: 100, isHome: false }),
      ]))
      .mockResolvedValueOnce(makeScheduleResponse([]));
    const result = await adapter.fetchData("LAL");
    expect(result.recentGames[0].postseason).toBe(false);
  });

  it("excludes incomplete games", async () => {
    axios.get
      .mockResolvedValueOnce(makeTeamResponse())
      .mockResolvedValueOnce(makeStandingsResponse("LAL", 50, 32))
      .mockResolvedValueOnce(makeScheduleResponse([
        makeEvent({ teamAbbr: "LAL", oppAbbr: "BOS", teamScore: 110, oppScore: 105, completed: true }),
        makeEvent({ teamAbbr: "LAL", oppAbbr: "CHI", teamScore: 0, oppScore: 0, completed: false }),
      ]))
      .mockResolvedValueOnce(makeScheduleResponse([]));
    const result = await adapter.fetchData("LAL");
    expect(result.recentGames.length).toBe(1);
  });

  it("returns most recent 5 games sorted by date descending", async () => {
    const dates = ["2026-03-01", "2026-03-05", "2026-03-10", "2026-03-15", "2026-03-20", "2026-03-25"];
    axios.get
      .mockResolvedValueOnce(makeTeamResponse())
      .mockResolvedValueOnce(makeStandingsResponse("LAL", 50, 32))
      .mockResolvedValueOnce(makeScheduleResponse(
        dates.map((d) => makeEvent({ teamAbbr: "LAL", oppAbbr: "BOS", teamScore: 110, oppScore: 100, date: `${d}T00:00:00Z` }))
      ))
      .mockResolvedValueOnce(makeScheduleResponse([]));
    const result = await adapter.fetchData("LAL");
    expect(result.recentGames.length).toBe(5);
    expect(result.recentGames[0].date).toContain("2026-03-25");
    expect(result.recentGames[4].date).toContain("2026-03-05");
  });

  it("correctly sets home_team and visitor_team scores when LAL is home", async () => {
    axios.get
      .mockResolvedValueOnce(makeTeamResponse())
      .mockResolvedValueOnce(makeStandingsResponse("LAL", 50, 32))
      .mockResolvedValueOnce(makeScheduleResponse([
        makeEvent({ teamAbbr: "LAL", oppAbbr: "BOS", teamScore: 115, oppScore: 108, isHome: true }),
      ]))
      .mockResolvedValueOnce(makeScheduleResponse([]));
    const result = await adapter.fetchData("LAL");
    const game = result.recentGames[0];
    expect(game.home_team.abbreviation).toBe("LAL");
    expect(game.home_team_score).toBe(115);
    expect(game.visitor_team_score).toBe(108);
  });

  it("correctly sets home_team and visitor_team scores when LAL is away", async () => {
    axios.get
      .mockResolvedValueOnce(makeTeamResponse())
      .mockResolvedValueOnce(makeStandingsResponse("LAL", 50, 32))
      .mockResolvedValueOnce(makeScheduleResponse([
        makeEvent({ teamAbbr: "LAL", oppAbbr: "BOS", teamScore: 120, oppScore: 115, isHome: false }),
      ]))
      .mockResolvedValueOnce(makeScheduleResponse([]));
    const result = await adapter.fetchData("LAL");
    const game = result.recentGames[0];
    expect(game.visitor_team.abbreviation).toBe("LAL");
    expect(game.visitor_team_score).toBe(120);
    expect(game.home_team_score).toBe(115);
  });

  it("returns null when team abbreviation is unknown", async () => {
    axios.get.mockRejectedValue(new Error("404"));
    const result = await adapter.fetchData("ZZZ");
    expect(result).toBeNull();
  });
});