jest.mock("../../src/http", () => ({ get: jest.fn() }));

const { get: httpGet } = require("../../src/http");
const adapter = require("../../src/adapters/ufc");

// ESPN exposes one calendar year of cards per query, so these tests pin the
// request shape and the season walk-back that fills in a thin fight history.

function card({ date, shortName, fights }) {
  return {
    date,
    shortName,
    name: shortName,
    competitions: fights.map((fight) => ({
      type: { abbreviation: "Featherweight" },
      venue: { fullName: "Test Arena" },
      status: { type: { completed: fight.completed !== false }, period: 3 },
      competitors: fight.athletes.map((athlete) => ({
        winner: athlete.winner === true,
        athlete: { fullName: athlete.name, flag: { href: "https://a.espncdn.com/i/teamlogos/countries/500/usa.png" } },
        records: [{ name: "overall", summary: athlete.record || "20-0-0" }],
      })),
    })),
  };
}

const FIGHT_2026 = card({
  date: "2026-03-21T21:00Z",
  shortName: "UFC Fight Night",
  fights: [{ athletes: [{ name: "Movsar Evloev", winner: true }, { name: "Lerone Murphy" }] }],
});
const FIGHT_2025 = card({
  date: "2025-11-08T21:00Z",
  shortName: "UFC 322",
  fights: [{ athletes: [{ name: "Movsar Evloev", winner: true }, { name: "Diego Lopes" }] }],
});

const eventsFor = (year) => {
  const bodies = {
    2026: [FIGHT_2026, card({
      date: "2026-10-24T21:00Z",
      shortName: "UFC 333",
      fights: [{ athletes: [{ name: "Movsar Evloev" }, { name: "Alexander Volkanovski" }], completed: false }],
    })],
    2025: [FIGHT_2025],
  };
  return Promise.resolve({ data: { events: bodies[year] || [] } });
};

describe("UFC adapter — card fetching", () => {
  beforeEach(() => jest.clearAllMocks());

  it("asks the scoreboard for one calendar year", async () => {
    httpGet.mockImplementation((url) => eventsFor(Number(url.match(/dates=(\d+)/)[1])));
    const cards = await adapter.fetchCards(2026);
    expect(httpGet).toHaveBeenCalledWith(
      expect.stringContaining("/site/v2/sports/mma/ufc/scoreboard?dates=2026"),
    );
    expect(cards).toHaveLength(2);
  });

  it("reports a failed season rather than throwing", async () => {
    const errors = jest.spyOn(console, "error").mockImplementation(() => {});
    httpGet.mockRejectedValue(new Error("upstream 500"));
    expect(await adapter.fetchCards(2026)).toEqual([]);
    expect(errors).toHaveBeenCalledWith(expect.stringContaining("Failed to fetch UFC cards"));
    errors.mockRestore();
  });

  it("combines the current season with an earlier one for history", async () => {
    httpGet.mockImplementation((url) => eventsFor(Number(url.match(/dates=(\d+)/)[1])));
    const data = await adapter.fetchData("EVL");
    expect(data.recentGames.map((fight) => fight.opponent)).toEqual(["Lerone Murphy", "Diego Lopes"]);
    expect(data.nextGame.opponentName).toBe("Alexander Volkanovski");
    // Two fights is still a thin history, so the walk-back runs to its bound of
    // two earlier seasons — a fixed, predictable cost rather than open-ended.
    expect(httpGet.mock.calls.map(([url]) => url.match(/dates=(\d+)/)[1]))
      .toEqual(["2026", "2025", "2024"]);
  });

  it("stops walking back once the history is full", async () => {
    // Five completed fights in the current season means no earlier year is asked
    // for at all.
    const season = card({
      date: "2026-06-01T21:00Z",
      shortName: "UFC 300",
      fights: ["A", "B", "C", "D", "E"].map((opponent) => ({
        athletes: [{ name: "Movsar Evloev", winner: true }, { name: `${opponent} Fighter` }],
      })),
    });
    httpGet.mockResolvedValue({ data: { events: [season] } });
    const data = await adapter.fetchData("EVL");
    expect(data.recentGames).toHaveLength(5);
    expect(httpGet).toHaveBeenCalledTimes(1);
  });

  it("returns nothing when every season comes back empty", async () => {
    httpGet.mockResolvedValue({ data: { events: [] } });
    expect(await adapter.fetchData("EVL")).toBeNull();
  });
});
