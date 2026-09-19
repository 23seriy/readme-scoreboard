const axios = require("axios");
const nascar = require("../../src/adapters/nascar");
const indycar = require("../../src/adapters/indycar");
const { render } = require("../../src/renderers/markdown");

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

function standings(entries) {
  return { data: { children: [{ name: "Standings", standings: { entries } }] } };
}

function entry(id, displayName, rank, points) {
  return {
    athlete: { id, displayName },
    stats: [{ name: "rank", value: rank }, { name: "championshipPts", value: points }],
  };
}

const ADAPTERS = [["nascar", nascar], ["indycar", indycar]];

describe("racing adapters — metadata", () => {
  it.each(ADAPTERS)("%s exposes a 30-driver roster as both PLAYER_IDS and TEAM_IDS", (_key, adapter) => {
    expect(Object.keys(adapter.PLAYER_IDS).length).toBe(30);
    expect(adapter.TEAM_IDS).toBe(adapter.PLAYER_IDS);
  });

  it.each(ADAPTERS)("%s falls back to the series logo, since drivers have no crest", (_key, adapter) => {
    expect(adapter.getLogoUrl("HAM")).toMatch(/^https:\/\//);
  });
});

describe("NascarAdapter — fetchData", () => {
  it("reads the driver's championship position and points", async () => {
    axios.get.mockResolvedValueOnce(standings([
      entry("4539", "Kyle Larson", 2, 2140),
      entry("747", "Denny Hamlin", 1, 2168),
    ]));

    const data = await nascar.fetchData("HAM");
    expect(data.team.full_name).toBe("Denny Hamlin");
    expect(data.team.conference).toBe("NASCAR Cup Series");
    expect(data.standing).toEqual({ position: 1, label: "Driver Championship" });
    expect(data.record.points).toBe(2168);
    // ESPN publishes no per-driver race log here, so the board is standings-only.
    expect(data.recentGames).toEqual([]);
  });

  it("matches the driver by ESPN id, not by the stored name", async () => {
    // Regression guard: abbreviation/name matching silently picks the wrong row
    // when ESPN renders a name differently (this bit the F1 and college
    // basketball lookups). Ids are the stable key.
    axios.get.mockResolvedValueOnce(standings([entry("747", "D. Hamlin", 1, 2168)]));

    const data = await nascar.fetchData("HAM");
    expect(data.team.full_name).toBe("D. Hamlin");
    expect(data.record.points).toBe(2168);
  });

  it("reports no position rather than zeroes when the driver is not yet ranked", async () => {
    axios.get.mockResolvedValueOnce(standings([entry("4539", "Kyle Larson", 1, 2140)]));

    const data = await nascar.fetchData("HAM");
    expect(data.standing).toBeNull();
    expect(data.record.points).toBe(0);
  });

  it("returns null for an unknown driver without calling the API", async () => {
    expect(await nascar.fetchData("ZZZ")).toBeNull();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("returns null when the standings request fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("network error"));
    expect(await nascar.fetchData("HAM")).toBeNull();
  });
});

describe("IndycarAdapter — fetchData", () => {
  it("resolves an accented ESPN name while the roster stores ASCII", async () => {
    // The roster key is PAL / "Alex Palou"; ESPN returns "Álex Palou". Only the
    // id can be relied on to join the two.
    axios.get.mockResolvedValueOnce(standings([
      entry("5704", "Kyle Kirkwood", 2, 594),
      entry("5632", "Álex Palou", 1, 631),
    ]));

    const data = await indycar.fetchData("PAL");
    expect(data.team.full_name).toBe("Álex Palou");
    expect(data.standing).toEqual({ position: 1, label: "Driver Championship" });
    expect(data.record.points).toBe(631);
  });
});

describe("racing adapters — demo boards", () => {
  it.each(ADAPTERS)("%s is deterministic and uses pinned points", (_key, adapter) => {
    const key = Object.keys(adapter.DEMO_TEAMS)[0];
    const board = adapter.getDemoData(key);

    expect(adapter.getDemoData(key)).toEqual(board);
    expect(board.record.season).toBe(2026);
    expect(board.standing.position).toBe(1);
    expect(board.record.points).toBe(adapter.DEMO_POINTS[key]);
  });

  it("falls back to the first sample driver for an unknown abbreviation", () => {
    expect(nascar.getDemoData("ZZZ").team.abbreviation).toBe("HAM");
  });
});

describe("racing boards render as a driver championship", () => {
  it("shows the driver, championship position and points", () => {
    const board = render("nascar", nascar.getDemoData("HAM"));

    expect(board).toContain("Denny Hamlin (HAM)");
    expect(board).toContain("NASCAR Cup Series · Driver Championship");
    expect(board).toContain("🏆 Championship position: 1");
    expect(board).toContain("📍 Points: 2168");
  });

  it("labels the IndyCar board with its own series", () => {
    const board = render("indycar", indycar.getDemoData("PAL"));
    expect(board).toContain("IndyCar Series · Driver Championship");
    // Demo rosters use the ASCII spelling; live data uses ESPN's accented name.
    expect(board).toContain("Alex Palou (PAL)");
  });
});
