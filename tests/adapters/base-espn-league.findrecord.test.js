const adapter = require("../../src/adapters/ncaab");

// College football's conference standings are the awkward case: one entry's
// `stats` array is every category concatenated — overall first, then Home, Road,
// vs Division, vs Conference, vs AP Top 25 and so on. `wins` therefore appears
// once per category, and the old `Object.fromEntries` kept only the LAST, so
// Alabama's 5-0 overall season was reported as its 1-0 record against ranked
// teams. These tests pin the overall figures and the wins-only shape.

// Build an entry whose stats repeat `wins` across categories, as ESPN does.
function entry(abbr, categories) {
  const stats = [];
  for (const { wins, losses, gamesPlayed } of categories) {
    if (wins !== undefined) stats.push({ name: "wins", value: wins });
    if (losses !== undefined) stats.push({ name: "losses", value: losses });
    if (gamesPlayed !== undefined) stats.push({ name: "gamesPlayed", value: gamesPlayed });
  }
  return { team: { abbreviation: abbr }, stats };
}

function standings(entries, groupName = "Southeastern Conference") {
  return { children: [{ name: groupName, standings: { entries } }] };
}

describe("BaseEspnLeagueAdapter — findRecord", () => {
  it("takes the FIRST win count, which is the overall record", () => {
    // Overall 5-0, then a ranked-opponents category of 1-0.
    const data = standings([entry("ALA", [{ wins: 5, losses: 0 }, { wins: 1, losses: 0 }])]);

    const record = adapter.findRecord(data, "ALA", 2026);

    expect(record.wins).toBe(5);
  });

  it("reports losses as null when the feed omits them, rather than zero", () => {
    // College football publishes no overall `losses` at all. Reporting 0 made
    // every team look undefeated.
    const data = standings([entry("ALA", [{ wins: 5 }, { wins: 1 }])]);

    const record = adapter.findRecord(data, "ALA", 2026);

    expect(record.losses).toBeNull();
  });

  it("uses a real losses figure when the feed provides one", () => {
    const data = standings([entry("UGA", [{ wins: 4, losses: 1 }, { wins: 2, losses: 0 }])]);

    const record = adapter.findRecord(data, "UGA", 2026);

    expect(record.wins).toBe(4);
    expect(record.losses).toBe(1);
  });

  it("does not let a later category overwrite the overall win count", () => {
    // The exact Alabama case: 5, 3, 2, 0, 3, 1, 1 -> the last is 1.
    const data = standings([
      entry("ALA", [
        { wins: 5 },
        { wins: 3 },
        { wins: 2 },
        { wins: 0 },
        { wins: 3 },
        { wins: 1 },
        { wins: 1 },
      ]),
    ]);

    const record = adapter.findRecord(data, "ALA", 2026);

    expect(record.wins).toBe(5);
    expect(record.wins).not.toBe(1);
  });

  it("returns an empty record for a team that is not listed", () => {
    const data = standings([entry("ALA", [{ wins: 5 }])]);

    const record = adapter.findRecord(data, "ZZZ", 2026);

    expect(record).toEqual({ wins: 0, losses: 0, season: 2026, conference: "", position: null });
  });
});
