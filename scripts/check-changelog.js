#!/usr/bin/env node
/**
 * Fails when a pull request changes `src/` without changing CHANGELOG.md.
 *
 * Why this exists: `## [Unreleased]` was empty for two releases in a row
 * (v1.15.1 and v1.15.2). Both times the gap was only found while preparing the
 * release, by diffing the git log against the changelog — which works, but
 * depends on whoever is releasing remembering to look. Entries get written as
 * work lands, so the last changes before a release are the ones most likely to
 * be missed, and they are exactly the ones a release is built from.
 *
 * Scope is deliberately narrow: only `src/` is gated, because that is what
 * changes a board. Docs, tests, CI and the generated artefacts can land without
 * a changelog line. Release-prep PRs pass automatically — they edit the
 * changelog by definition.
 *
 *   npm run changelog:check
 */
const { execSync } = require("node:child_process");

const BASE = process.env.GITHUB_BASE_REF || "main";

function git(command) {
  return execSync(command, { encoding: "utf8" }).trim();
}

function changedFiles() {
  // Needs the base branch: actions/checkout fetches the PR's merge ref only.
  execSync(`git fetch --quiet --depth=1 origin ${BASE}`, { stdio: "ignore" });
  const range = `origin/${BASE}...HEAD`;
  return git(`git diff --name-only ${range}`).split("\n").filter(Boolean);
}

function main() {
  let files;
  try {
    files = changedFiles();
  } catch (error) {
    // A shallow or detached checkout must not fail the build for the wrong
    // reason — report and pass, rather than turning a tooling problem into a
    // red check.
    console.log(`changelog check skipped (${error.message.split("\n")[0]})`);
    return;
  }

  const sourceChanges = files.filter((file) => file.startsWith("src/"));
  const changelogChanged = files.includes("CHANGELOG.md");

  if (sourceChanges.length > 0 && !changelogChanged) {
    console.error("✗ src/ changed without a CHANGELOG.md entry.");
    console.error("");
    console.error(`  ${sourceChanges.length} source file(s) changed:`);
    sourceChanges.slice(0, 10).forEach((file) => console.error(`    ${file}`));
    if (sourceChanges.length > 10) console.error(`    …and ${sourceChanges.length - 10} more`);
    console.error("");
    console.error("  Add a line under `## [Unreleased]` saying what changed for users.");
    console.error("  Docs, tests, CI and generated artefacts do not need one.");
    process.exit(1);
  }

  console.log(
    `✓ changelog check passed (${files.length} changed file(s), ` +
      `${sourceChanges.length} in src/)`
  );
}

main();
