const fs = require("node:fs");

function summaryMarkdown({ sport, leagueName, team, mode, result, targetRepo }) {
  const destination = targetRepo || "local workspace / automatic profile repository";
  return [
    "## 🏆 readme-scoreboard",
    "",
    "| Field | Value |",
    "|---|---|",
    `| League | ${leagueName || sport.toUpperCase()} |`,
    `| Sport | ${sport.toUpperCase()} |`,
    `| Team | ${team} |`,
    `| Mode | ${mode} |`,
    `| Result | ${result} |`,
    `| Destination | ${destination} |`,
    "",
  ].join("\n");
}

function writeStepSummary(details, summaryPath = process.env.GITHUB_STEP_SUMMARY) {
  if (!summaryPath) return false;
  fs.appendFileSync(summaryPath, summaryMarkdown(details));
  return true;
}

function writeActionOutputs({ updated, mode, targetRepo }, outputPath = process.env.GITHUB_OUTPUT) {
  if (!outputPath) return false;
  fs.appendFileSync(
    outputPath,
    `updated=${updated}\nmode=${mode}\ntarget_repo=${targetRepo || ""}\n`
  );
  return true;
}

module.exports = { summaryMarkdown, writeStepSummary, writeActionOutputs };
