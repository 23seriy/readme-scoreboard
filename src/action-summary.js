const fs = require("node:fs");

function summaryMarkdown({ sport, team, mode, result, targetRepo }) {
  const destination = targetRepo || "local workspace / automatic profile repository";
  return [
    "## 🏆 readme-scoreboard",
    "",
    "| Field | Value |",
    "|---|---|",
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

module.exports = { summaryMarkdown, writeStepSummary };
