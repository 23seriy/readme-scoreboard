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
      const record = content.match(/(\d+)W - (\d+)L/);
      const results = (content.match(/[✅❌] [WL] /g) || []).length;
      if (!record) return; // F1/tennis boards are standings-only.
      const wins = Number(record[1]);
      const losses = Number(record[2]);
      // A board displays at most its five most recent games, so the season
      // totals must be at least as large as the results shown.
      expect(wins + losses).toBeGreaterThanOrEqual(results);
      expect(wins + losses).toBeGreaterThan(0);
    }
  );

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
