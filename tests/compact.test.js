const fs = require("node:fs");
const path = require("node:path");
const { compactMarkdown, RECENT_LOG } = require("../src/compact");

// Compact mode has no renderer involvement: the full board is rendered and this
// strips the images and the recent-results log. The log is matched by heading,
// so the heading is part of the contract — a sport that titles it differently is
// silently left alone, which is exactly how UFC's "Recent Fights" reached the
// gallery with its fight log intact.

const BOARD = [
  '<img src="https://a.espncdn.com/i/teamlogos/leagues/500/ufc.png" alt="UFC logo" width="72" align="right" />',
  "",
  "### 🇷🇺 Movsar Evloev (EVL)",
  "Featherweight",
  "🟢 Season in progress",
  "",
  "🥊 Career record: 20W - 0L",
  "",
  "**📅 Recent Fights:**",
  "```",
  "✅ W (R5) vs 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Lerone Murphy — Mar 21, 2026",
  "```",
].join("\n");

const SOCCER_BOARD = [
  '<img src="https://a.espncdn.com/i/teamlogos/soccer/500/20232.png" alt="logo" width="72" align="right" />',
  "",
  "### 🦩 Inter Miami CF (MIA)",
  "",
  "**📅 Recent Games:**",
  "```",
  "✅ W 2-1 vs CLB (Jul 15, 2026)",
  "```",
].join("\n");

describe("compactMarkdown", () => {
  it("strips the logo", () => {
    expect(compactMarkdown(BOARD)).not.toContain("<img");
    expect(compactMarkdown(SOCCER_BOARD)).not.toContain("<img");
  });

  it("strips a soccer board's recent games", () => {
    const compact = compactMarkdown(SOCCER_BOARD);
    expect(compact).not.toContain("Recent Games");
    expect(compact).not.toContain("vs CLB");
    expect(compact).toContain("Inter Miami CF (MIA)");
  });

  it("strips a UFC board's recent fights", () => {
    const compact = compactMarkdown(BOARD);
    expect(compact).not.toContain("Recent Fights");
    expect(compact).not.toContain("Lerone Murphy");
    // Everything that is not the log survives.
    expect(compact).toContain("Movsar Evloev (EVL)");
    expect(compact).toContain("🥊 Career record: 20W - 0L");
  });

  it("leaves the next-fight block alone", () => {
    // Only the recent log is trimmed; the upcoming fixture is the point of the
    // board and must survive compaction.
    const withNext = `${BOARD}\n\n**📅 Next Fight:**\n\`\`\`\n🇦🇺 vs Alexander Volkanovski — Oct 24, 2026\n\`\`\``;
    const compact = compactMarkdown(withNext);
    expect(compact).toContain("**📅 Next Fight:**");
    expect(compact).toContain("Alexander Volkanovski");
  });

  it("covers both headings with the shared pattern", () => {
    // One pattern for every sport, in one place: this used to be three identical
    // copies, so a new sport had to match all three or none.
    const games = compactMarkdown("\n**📅 Recent Games:**\n```\n✅ W vs ABC\n```");
    const fights = compactMarkdown("\n**📅 Recent Fights:**\n```\n✅ W vs ABC\n```");
    expect(games).not.toContain("ABC");
    expect(fights).not.toContain("ABC");
    expect(RECENT_LOG.source).toContain("Games");
    expect(RECENT_LOG.source).toContain("Fights");
  });

  it("is the single implementation every consumer shares", () => {
    // The duplication is what let a new sport's heading slip through: three
    // identical copies, and a sport had to match all three or none. The action
    // and both generators must keep using this one.
    const source = (file) => fs.readFileSync(path.resolve(__dirname, file), "utf8");
    expect(require("../scripts/generate-league-showcase").compactMarkdown).toBe(compactMarkdown);
    expect(source("../src/index.js")).toContain('require("./compact")');
    expect(source("../scripts/generate-examples.js")).toContain('require("../src/compact")');
    // And nobody re-implements it locally.
    expect(source("../src/index.js")).not.toContain("function compactMarkdown");
    expect(source("../scripts/generate-examples.js")).not.toContain("function compactMarkdown");
  });

  it("is idempotent", () => {
    const once = compactMarkdown(BOARD);
    expect(compactMarkdown(once)).toBe(once);
  });

  it("handles content with nothing to strip", () => {
    expect(compactMarkdown("### Just a heading")).toBe("### Just a heading");
  });
});
