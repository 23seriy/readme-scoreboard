const epl = require("../../src/adapters/epl");
const ncaab = require("../../src/adapters/ncaab");

function makeEvent({ completed = true, homeId = 1, awayId = 2, homeScore = 2, awayScore = 1, date = "2026-08-01T00:00:00Z" }) {
  return {
    date,
    competitions: [{
      status: { type: { completed } },
      competitors: [
        { team: { id: homeId, abbreviation: "HOM" }, homeAway: "home", score: { value: homeScore } },
        { team: { id: awayId, abbreviation: "AWY" }, homeAway: "away", score: { value: awayScore } },
      ],
    }],
  };
}

describe("base adapter richer stats", () => {
  it("parseForm returns last five results as W/L/D", () => {
    const events = [
      makeEvent({ teamId: 1, homeScore: 3, awayScore: 1, date: "2026-08-05T00:00:00Z" }),
      makeEvent({ teamId: 1, homeScore: 1, awayScore: 1, date: "2026-08-04T00:00:00Z" }),
      makeEvent({ teamId: 1, homeScore: 0, awayScore: 2, date: "2026-08-03T00:00:00Z" }),
      makeEvent({ teamId: 1, homeScore: 2, awayScore: 0, date: "2026-08-02T00:00:00Z" }),
    ];
    const adapter = epl;
    expect(adapter.parseForm(events, 1)).toEqual(["W", "D", "L", "W"]);
  });

  it("parseForm skips incomplete games", () => {
    const events = [
      makeEvent({ completed: true, teamId: 1, homeScore: 2, awayScore: 0, date: "2026-08-05T00:00:00Z" }),
      makeEvent({ completed: false, teamId: 1, homeScore: 0, awayScore: 0, date: "2026-08-06T00:00:00Z" }),
    ];
    const adapter = epl;
    expect(adapter.parseForm(events, 1)).toEqual(["W"]);
  });

  it("parseNextGame returns the first upcoming fixture", () => {
    const events = [
      makeEvent({ completed: false, teamId: 1, homeId: 1, awayId: 2, date: "2026-08-10T00:00:00Z" }),
      makeEvent({ completed: false, teamId: 1, homeId: 2, awayId: 1, date: "2026-08-08T00:00:00Z" }),
      makeEvent({ completed: true, teamId: 1, date: "2026-08-01T00:00:00Z" }),
    ];
    const adapter = epl;
    const next = adapter.parseNextGame(events, 1);
    expect(next.date).toContain("2026-08-08");
    expect(next.isHome).toBe(false);
  });

  it("parseNextGame returns null when there is no upcoming fixture", () => {
    const adapter = epl;
    expect(adapter.parseNextGame([], 1)).toBeNull();
  });

  it("ESPN base adapter computes position from standings entries", () => {
    const adapter = ncaab;
    const record = adapter.findRecord({
      children: [{ name: "Big 12", standings: { entries: [
        { team: { abbreviation: "A" }, stats: [{ name: "wins", value: 20 }, { name: "losses", value: 5 }] },
        { team: { abbreviation: "B" }, stats: [{ name: "wins", value: 18 }, { name: "losses", value: 7 }] },
      ] } }],
    }, "B", 2026);
    expect(record.position).toBe(2);
    expect(record.conference).toBe("Big 12");
  });
});
