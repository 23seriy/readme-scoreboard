const fs = require("node:fs");
const path = require("node:path");

const {
  buildPreview,
  replacePreviewBlock,
  lowerHeadings,
  START,
  END,
} = require("../../scripts/update-readme-preview");

const README = fs.readFileSync(path.resolve(__dirname, "../../README.md"), "utf8");

// The README used to claim "Live output for the Lakers" over hand-pasted prose.
// It drifted for months — still showing a 2025-2026 record and a fixture from
// the previous season — because nothing regenerated it and nothing noticed. A
// README advertising live data must not be the most stale file in the repo.

describe("README preview — block placement", () => {
  it("has both markers, in order", () => {
    const start = README.indexOf(START);
    const end = README.indexOf(END);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
  });

  it("has exactly one preview block", () => {
    expect(README.split(START)).toHaveLength(2);
    expect(README.split(END)).toHaveLength(2);
  });

  it("throws rather than silently doing nothing when markers are missing", () => {
    // A generator that no-ops on a missing marker is how the drift happened.
    expect(() => replacePreviewBlock("# no markers here", "body")).toThrow(/markers/);
  });

  it("throws when the end marker precedes the start marker", () => {
    expect(() => replacePreviewBlock(`${END}\n${START}`, "body")).toThrow(/before/);
  });

  it("replaces only the block, leaving the rest of the README alone", () => {
    const updated = replacePreviewBlock(README, "REPLACEMENT");

    expect(updated).toContain("REPLACEMENT");
    expect(updated).toContain("## 30-second setup");
    // Everything before the markers is preserved verbatim.
    expect(updated.slice(0, updated.indexOf(START))).toBe(README.slice(0, README.indexOf(START)));
  });
});

describe("README preview — heading levels", () => {
  it("lowers ATX headings by exactly one level", () => {
    const out = lowerHeadings("## Title\n### Sub\n");
    expect(out).toContain("### Title");
    expect(out).toContain("#### Sub");
  });

  it("does not touch a heading marker without a following space", () => {
    // "#hashtag" is not a heading in Markdown.
    expect(lowerHeadings("#hashtag")).toBe("#hashtag");
  });
});

describe("README preview — content is the real board", () => {
  it("embeds the Lakers board with its heading nested under the section", () => {
    const block = README.slice(README.indexOf(START) + START.length, README.indexOf(END));

    // The generator lowers the board's `##` title to `###` so it nests under
    // the README's `## Preview`; the team heading drops from `###` to `####`.
    expect(block).toMatch(/^### \[<picture>/m);
    expect(block).toMatch(/^#### 👑 Los Angeles Lakers \(LAL\)/m);
    // The board's own section labels must survive, or the preview is a fragment.
    expect(block).toContain("🏅 Standing:");
    expect(block).toContain("📊 20");
    expect(block).toContain("Recent Games");
  });

  it("does not claim a season that contradicts its own record line", () => {
    // The specific drift that went unnoticed: a "2025-2026 Record" next to a
    // board advertising itself as live. Whatever season the board shows, the
    // preview must at least not carry a stale fixed year alongside a fresh one.
    const block = README.slice(README.indexOf(START) + START.length, README.indexOf(END));
    const season = block.match(/📊 (\d{4})-(\d{4}) Record/);
    if (season) {
      const [, startYear] = season;
      const now = new Date().getUTCFullYear();
      // A board more than a year behind "now" is stale by definition.
      expect(Number(startYear)).toBeGreaterThanOrEqual(now - 1);
    }
  });

  it("builds a preview from the same renderer the example boards use", async () => {
    // Feed a fake renderer so the assertion is about the wiring, not live data.
    const preview = await buildPreview(async (example) => {
      expect(example).toEqual({ key: "nba", team: "LAL" });
      return "## Board\n";
    });

    expect(preview).toBe("### Board");
  });
});
