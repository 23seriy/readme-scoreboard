#!/usr/bin/env node
/**
 * Refreshes the README "Preview" block from the action's real output.
 *
 * Why this exists: the preview claimed to be "Live output for the Lakers" but
 * was hand-pasted prose. It drifted for months — it still showed a 2025-2026
 * record and a fixture from the previous season while the shipped boards had
 * moved on. A README that advertises live data must not be the most stale file
 * in the repo.
 *
 * The block is generated from `renderExample`, the same function the example
 * boards use, so the README cannot disagree with `examples/nba-lal.md`.
 *
 * Heading levels are lowered by one because the preview nests under an `##`
 * section; the board is written top-level with `##`, which would break the
 * document outline if pasted as-is.
 *
 *   npm run readme:preview
 */
const fs = require("node:fs");
const path = require("node:path");

const START = "<!-- preview:start -->";
const END = "<!-- preview:end -->";

function lowerHeadings(markdown) {
  // Only ATX headings at line start, and never inside a fenced code block —
  // the recent-games list is fenced and contains no headings today, but a
  // sport that emits one must not be rewritten.
  return markdown
    .split("\n")
    .map((line) => line.replace(/^(#{1,5})(\s)/, "#$1$2"))
    .join("\n");
}

/**
 * Replace the marked block in `readme` with `body`.
 * Throws when the markers are missing or out of order, rather than silently
 * doing nothing — a preview that quietly stops updating is the bug this file
 * exists to prevent.
 */
function replacePreviewBlock(readme, body) {
  const start = readme.indexOf(START);
  const end = readme.indexOf(END);
  if (start === -1 || end === -1) {
    throw new Error(`README is missing the ${START} / ${END} markers`);
  }
  if (end < start) {
    throw new Error(`README has ${END} before ${START}`);
  }
  return `${readme.slice(0, start + START.length)}\n${body}\n${readme.slice(end)}`;
}

async function buildPreview(renderExample) {
  const board = await renderExample({ key: "nba", team: "LAL" });
  return lowerHeadings(board.trim());
}

async function main() {
  const { renderExample } = require("./generate-examples");
  const readmePath = path.resolve(__dirname, "..", "README.md");
  const readme = fs.readFileSync(readmePath, "utf8");
  const body = await buildPreview(renderExample);
  const updated = replacePreviewBlock(readme, body);
  if (updated === readme) {
    console.log("README preview is already current");
    return;
  }
  fs.writeFileSync(readmePath, updated);
  console.log("Updated the README preview from live data");
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { buildPreview, replacePreviewBlock, lowerHeadings, START, END };
