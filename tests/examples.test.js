const fs = require("node:fs");
const path = require("node:path");
// The examples/ directory is committed, so a broken board would ship as a
// broken README snippet. These checks catch the specific defects that the
// gallery has regressed into before: unparsed dates and missing score fields.

const EXAMPLES_DIR = path.resolve(__dirname, "../examples");

const files = fs
  .readdirSync(EXAMPLES_DIR)
  .filter((name) => name.endsWith(".md"))
  .map((name) => path.join(EXAMPLES_DIR, name));

// A file can hold several boards — multi-team.md holds three — so games are
// attributed to the record that precedes them. Reading only the file's first
// record and counting every game line compared one board's season against three
// boards' fixtures: it passed while that first record happened to be large, and
// failed the morning it was a season opener at 1W - 0L.
function boardsIn(content) {
  const boards = [];
  for (const line of content.split("\n")) {
    const record = line.match(/(\d+)W - (\d+)L/);
    if (record) {
      boards.push({ wins: Number(record[1]), losses: Number(record[2]), results: 0 });
    } else if (boards.length > 0 && /[✅❌] [WL] /.test(line)) {
      boards[boards.length - 1].results += 1;
    }
  }
  return boards;
}

describe("generated examples", () => {
  it("are present", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("has a synchronous demo renderer for deterministic fixtures", () => {
    // `renderExample` is async and hits the network, so a caller that wants a
    // stable fixture must use `renderDemoExample`. Passing the async one where a
    // string is expected does NOT fail: it yields "[object Promise]", which
    // hashes and compares like any other value. That silently emptied the
    // timezone-independence check, which renders every board and compares a
    // hash — it kept passing while covering nothing.
    const examples = require("../scripts/generate-examples");
    expect(typeof examples.renderExample).toBe("function");
    expect(typeof examples.renderDemoExample).toBe("function");
    expect(examples.renderExample.constructor.name).toBe("AsyncFunction");
    expect(examples.renderDemoExample.constructor.name).toBe("Function");

    const board = examples.renderDemoExample({ key: "nba", team: "LAL" });
    expect(typeof board).toBe("string");
    expect(board).toContain("### ");
    expect(board).not.toContain("object Promise");
  });

  it("does not leak a build timestamp into the committed boards", () => {
    // A generated `Last updated: <now>` footer would make every regeneration
    // differ by construction, so the CI "boards are current" gate could never
    // pass. The action writes that footer into a user's README; the committed
    // examples deliberately omit it.
    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf8");
      expect(content).not.toMatch(/Last updated:/);
    });
  });

  it.each(files.map((file) => [path.basename(file), file]))(
    "%s renders no invalid dates",
    (_name, file) => {
      const content = fs.readFileSync(file, "utf8");
      expect(content).not.toContain("Invalid Date");
      expect(content).not.toContain("NaN");
    }
  );

  it.each(files.map((file) => [path.basename(file), file]))(
    "%s has no undefined or blank score fields",
    (_name, file) => {
      const content = fs.readFileSync(file, "utf8");
      expect(content).not.toContain("undefined");
      expect(content).not.toMatch(/\bundefined-\d/);
      expect(content).not.toMatch(/\d-undefined\b/);
    }
  );

  it.each(files.map((file) => [path.basename(file), file]))(
    "%s shows W-L totals matching the games it lists",
    (_name, file) => {
      const content = fs.readFileSync(file, "utf8");
      const boards = boardsIn(content);
      if (boards.length === 0) return; // F1/tennis boards are standings-only.
      for (const board of boards) {
        // A board displays at most its five most recent games, so its season
        // totals must be at least as large as the results shown.
        expect(board.wins + board.losses).toBeGreaterThanOrEqual(board.results);
        expect(board.wins + board.losses).toBeGreaterThan(0);
      }
    }
  );

  it("compares each board with its own games, not the file's total", () => {
    // The exact shape that broke it: a three-game opener board above two boards
    // with five games each. One record, eleven results.
    const fixture = [
      "### 👑 Los Angeles Lakers (LAL)",
      "📊 2026-2027 Record: 1W - 0L (100.0%)",
      "✅ W 127-105 vs GS  (Oct 21, 2026)",
      "### ⚾ New York Yankees (NYY)",
      "📊 2026 Record: 93W - 68L (57.8%)",
      "❌ L  3-4  vs TB  (Oct 7, 2026)",
      "✅ W  9-2  vs BOS (Sep 30, 2026)",
    ].join("\n");

    expect(boardsIn(fixture)).toEqual([
      { wins: 1, losses: 0, results: 1 },
      { wins: 93, losses: 68, results: 2 },
    ]);
  });

  it.each(files.map((file) => [path.basename(file), file]))(
    "%s never shows a result that contradicts its scoreline",
    (_name, file) => {
      const content = fs.readFileSync(file, "utf8");
      // "✅ W 2-1 @ ENG" lists the board team's score first, so a win cannot be
      // 0-0 and a defeat cannot be 3-1. The sample generator once floored the
      // winning margin at zero and emitted "W 0-0"; when that was fixed the
      // committed files were left stale because nothing checks the artefacts —
      // only the generator. This closes that gap. Matches are skipped where a
      // board lists no score (UFC shows rounds, not points).
      // The class holds 🟡 (outside the BMP), which needs the unicode flag.
      const scored = content.match(/^[✅❌🟡] [WLD] \d+-\d+/gmu) || [];
      scored.forEach((line) => {
        const [, icon, result, own, opponent] = line.match(/^([✅❌🟡]) ([WLD]) (\d+)-(\d+)/u);
        const [expectedIcon, expectedResult] = Number(own) > Number(opponent)
          ? ["✅", "W"]
          : Number(own) < Number(opponent) ? ["❌", "L"] : ["🟡", "D"];
        expect(`${icon}${result} for "${line}"`).toBe(`${expectedIcon}${expectedResult} for "${line}"`);
      });
    }
  );
});
