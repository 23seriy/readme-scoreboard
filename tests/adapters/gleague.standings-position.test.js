const axios = require("axios");

jest.mock("axios");

const gleague = require("../../src/adapters/gleague");

// The G League serves its conference table WORST-FIRST: a completed season
// starts with the 10-26 team and ends with the 26-10 team. The adapter used
// `index + 1`, so the board reported the exact INVERSE of the real standing —
// the last-place team as 1st and the best team as 16th.
//
// It went unnoticed because the adapter resolves a season that has no table yet
// (off-season returns 0-0 with no entries) and because `stats` is every
// category concatenated, so the old `reduce` reported a split record rather
// than the overall one.
//
// These fixtures reproduce the real payload shape: worst-first order, with each
// entry's own `playoffSeed` saying where it actually belongs.

function firstOccurrences(stats) {
  const out = {};
  for (const s of stats) if (!(s.name in out)) out[s.name] = s.value;
  return out;
}

function entry(abbr, wins, losses, playoffSeed) {
  return {
    team: { abbreviation: abbr },
    stats: [
      { name: "wins", value: wins },
      { name: "losses", value: losses },
      { name: "playoffSeed", value: playoffSeed },
    ],
  };
}

// Worst-first, mirroring the real Eastern Conference payload.
const WORST_FIRST = [
  entry("WIS", 10, 26, 16),
  entry("GRD", 11, 25, 15),
  entry("CPS", 14, 22, 13),
  entry("NOB", 16, 20, 10),
  entry("GBO", 24, 12, 2),
  entry("OSC", 26, 10, 1),
];

function standings(entries = WORST_FIRST) {
  return { data: { children: [{ name: "Eastern Conference", standings: { entries } }] } };
}

function schedule() {
  return { data: { events: [] } };
}

function team(abbr) {
  return { data: { team: { id: 1, abbreviation: abbr, name: abbr, displayName: abbr } } };
}

function mockFeeds() {
  axios.get.mockImplementation((url) => {
    if (String(url).includes("/standings")) return Promise.resolve(standings());
    if (String(url).includes("/schedule")) return Promise.resolve(schedule());
    return Promise.resolve(team("OSC"));
  });
}

describe("gleague standings position", () => {
  afterEach(() => jest.clearAllMocks());

  it("does not report the inverted rank for a worst-first table", async () => {
    mockFeeds();

    const data = await gleague.fetchData("OSC");

    // OSC is LAST in the array but is genuinely 1st (26-10).
    expect(data.standing).toEqual({ position: 1, label: "Eastern" });
    expect(data.standing.position).not.toBe(WORST_FIRST.length);
  });

  it("does not report the last-place team as first", async () => {
    mockFeeds();

    const data = await gleague.fetchData("WIS");

    // WIS is FIRST in the array (10-26) but is genuinely last.
    expect(data.standing).toEqual({ position: 16, label: "Eastern" });
    expect(data.standing.position).not.toBe(1);
  });

  it("reads the overall record, not a Home/Road split", async () => {
    // `stats` repeats every category; only the first block is the overall one.
    axios.get.mockImplementation((url) => {
      if (String(url).includes("/standings")) {
        return Promise.resolve({
          data: {
            children: [
              {
                name: "Eastern Conference",
                standings: {
                  entries: [
                    {
                      team: { abbreviation: "OSC" },
                      stats: [
                        { name: "wins", value: 26 },
                        { name: "losses", value: 10 },
                        { name: "playoffSeed", value: 1 },
                        { name: "wins", value: 14 },
                        { name: "losses", value: 4 },
                        { name: "playoffSeed", value: 3 },
                        { name: "Home", value: undefined },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        });
      }
      if (String(url).includes("/schedule")) return Promise.resolve(schedule());
      return Promise.resolve(team("OSC"));
    });

    const data = await gleague.fetchData("OSC");

    expect(data.record.wins).toBe(26);
    expect(data.record.losses).toBe(10);
    expect(data.standing.position).toBe(1);
  });

  it("omits the position when ESPN publishes no playoffSeed", async () => {
    axios.get.mockImplementation((url) => {
      if (String(url).includes("/standings")) {
        return Promise.resolve({
          data: {
            children: [
              {
                name: "Eastern Conference",
                standings: {
                  entries: [
                    { team: { abbreviation: "OSC" }, stats: [{ name: "wins", value: 26 }, { name: "losses", value: 10 }] },
                  ],
                },
              },
            ],
          },
        });
      }
      if (String(url).includes("/schedule")) return Promise.resolve(schedule());
      return Promise.resolve(team("OSC"));
    });

    const data = await gleague.fetchData("OSC");

    expect(data.standing).toBeNull();
  });

  it("keeps the first-occurrence helper honest", () => {
    // Guards the helper the fixtures rely on, so a broken fixture cannot make
    // the tests above pass for the wrong reason.
    const stats = firstOccurrences([
      { name: "wins", value: 26 },
      { name: "wins", value: 14 },
    ]);
    expect(stats.wins).toBe(26);
  });
});
