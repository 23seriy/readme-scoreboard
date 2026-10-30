const axios = require("axios");
const adapter = require("../../src/adapters/nba");

jest.mock("axios");

// ESPN indexes a player's gamelog some time AFTER the game ends, so it lags the
// team's schedule. The board showed Luka Doncic's "Last Game" as the Oct 27
// Portland game while the Lakers had already played, and he had scored in, the
// Oct 28 Clippers game. Two separate defects produced that:
//
//   1. `events[0]` was assumed to be the newest gamelog entry. The entries
//      carry no date (only an eventId), so the order was never verifiable —
//      the same "array order is not data" trap as the standings bugs.
//   2. A gamelog that is behind the team's schedule was rendered anyway.
//
// The adapter now resolves every entry's date, sorts, and omits the section
// outright when the newest entry is older than the team's latest completed
// game.

function gamelog(events) {
  return {
    data: {
      names: ["points", "totalRebounds", "assists", "minutes"],
      seasonTypes: [{ categories: [{ events }] }],
    },
  };
}

function entry(eventId, points = 20, rebounds = 5, assists = 4, minutes = 30) {
  return { eventId, stats: [String(points), String(rebounds), String(assists), String(minutes)] };
}

function summary(date, opponent = "Portland Trail Blazers") {
  return {
    data: {
      header: {
        competitions: [
          {
            date,
            competitors: [
              { team: { abbreviation: "LAL", displayName: "Los Angeles Lakers" } },
              { team: { abbreviation: "POR", displayName: opponent } },
            ],
          },
        ],
      },
    },
  };
}

function schedule(events) {
  return { data: { events } };
}

function scheduleEvent(date, completed = true) {
  return { date, competitions: [{ status: { type: { completed } } }] };
}

// Routes by URL so call order does not matter — the adapter resolves the
// gamelog metas and the team schedule concurrently.
function mockEspn({ events, summaries, scheduleEvents }) {
  axios.get.mockImplementation((url) => {
    const u = String(url);
    if (u.includes("/gamelog")) return Promise.resolve(gamelog(events));
    if (u.includes("/summary")) {
      const id = Number(u.split("event=")[1]);
      const found = summaries[id];
      return found ? Promise.resolve(summary(found.date, found.opponent)) : Promise.resolve({ data: {} });
    }
    if (u.includes("/schedule")) return Promise.resolve(schedule(scheduleEvents));
    return Promise.resolve({ data: {} });
  });
}

describe("NbaAdapter — fetchPlayerLastGame ordering", () => {
  it("picks the newest entry by date, not events[0]", async () => {
    // Deliberately served OLDEST-first, which is the arrangement that broke.
    mockEspn({
      events: [entry(1), entry(2), entry(3)],
      summaries: {
        1: { date: "2026-10-22T02:00Z" },
        2: { date: "2026-10-25T21:00Z" },
        3: { date: "2026-10-28T03:00Z" },
      },
      scheduleEvents: [scheduleEvent("2026-10-22T02:00Z"), scheduleEvent("2026-10-28T03:00Z")],
    });

    const game = await adapter.fetchPlayerLastGame("3945274", "LAL");

    expect(game.date).toBe("2026-10-28T03:00Z");
  });

  it("still picks the newest when the gamelog is served newest-first", async () => {
    mockEspn({
      events: [entry(3), entry(2), entry(1)],
      summaries: {
        1: { date: "2026-10-22T02:00Z" },
        2: { date: "2026-10-25T21:00Z" },
        3: { date: "2026-10-28T03:00Z" },
      },
      scheduleEvents: [scheduleEvent("2026-10-28T03:00Z")],
    });

    const game = await adapter.fetchPlayerLastGame("3945274", "LAL");

    expect(game.date).toBe("2026-10-28T03:00Z");
  });
});

describe("NbaAdapter — fetchPlayerLastGame staleness", () => {
  it("flags the game as stale when the team has played since the newest entry", async () => {
    // The live failure: gamelog ends Oct 27, Lakers have since played Oct 28.
    // The game is real and its stats are real, so it is returned — but marked
    // stale so the renderer labels it "Previous Game" rather than "Last Game".
    mockEspn({
      events: [entry(1, 41, 5, 9, 37)],
      summaries: { 1: { date: "2026-10-28T03:00Z" } },
      scheduleEvents: [
        scheduleEvent("2026-10-28T03:00Z"),
        scheduleEvent("2026-10-29T02:30Z"),
      ],
    });

    const game = await adapter.fetchPlayerLastGame("3945274", "LAL");

    expect(game.points).toBe(41);
    expect(game.stale).toBe(true);
  });

  it("does not flag the game when the gamelog is up to date with the schedule", async () => {
    mockEspn({
      events: [entry(2, 33, 7, 11, 36)],
      summaries: { 2: { date: "2026-10-29T02:30Z" } },
      scheduleEvents: [
        scheduleEvent("2026-10-28T03:00Z"),
        scheduleEvent("2026-10-29T02:30Z"),
      ],
    });

    const game = await adapter.fetchPlayerLastGame("3945274", "LAL");

    expect(game.points).toBe(33);
    expect(game.date).toBe("2026-10-29T02:30Z");
    expect(game.stale).toBe(false);
  });

  it("ignores unplayed games when deciding whether the gamelog is stale", async () => {
    // An upcoming fixture must not make a current entry look stale.
    mockEspn({
      events: [entry(1, 41, 5, 9, 37)],
      summaries: { 1: { date: "2026-10-28T03:00Z" } },
      scheduleEvents: [
        scheduleEvent("2026-10-28T03:00Z"),
        scheduleEvent("2026-10-31T02:00Z", false),
      ],
    });

    const game = await adapter.fetchPlayerLastGame("3945274", "LAL");

    expect(game.date).toBe("2026-10-28T03:00Z");
    expect(game.stale).toBe(false);
  });

  it("does not flag the game when the team schedule cannot be read", async () => {
    // A failed schedule lookup must not label a correct section as stale.
    axios.get.mockImplementation((url) => {
      const u = String(url);
      if (u.includes("/gamelog")) return Promise.resolve(gamelog([entry(1, 41, 5, 9, 37)]));
      if (u.includes("/summary")) return Promise.resolve(summary("2026-10-28T03:00Z"));
      return Promise.reject(new Error("schedule unavailable"));
    });

    const game = await adapter.fetchPlayerLastGame("3945274", "LAL");

    expect(game.points).toBe(41);
    expect(game.stale).toBe(false);
  });
});
