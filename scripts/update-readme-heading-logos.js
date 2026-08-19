const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function headingMarkup(league) {
  const { light, dark } = league.logo;
  const title = `${league.name} Team Abbreviations`;
  return `## <picture><source media="(prefers-color-scheme: dark)" srcset="${dark}"><img src="${light}" alt="${league.name} logo" height="28"></picture> ${title}`;
}

function updateHeadingLogos(readme) {
  return LEAGUES.reduce((updated, league) => {
    // College rosters are generated independently and intentionally use plain
    // headings inside <details>; keep their stable navigation anchors intact.
    if (league.key.startsWith("nca")) return updated;

    const title = `${league.name} Team Abbreviations`;
    const pattern = new RegExp(`^## (?:<picture>[^\\n]*?<\\/picture> )?${escapeRegExp(title)}$`, "m");
    return updated.replace(pattern, headingMarkup(league));
  }, readme);
}

function main() {
  const readmePath = path.resolve(__dirname, "..", "README.md");
  const readme = fs.readFileSync(readmePath, "utf8");
  const updated = updateHeadingLogos(readme);
  if (updated === readme) return;
  fs.writeFileSync(readmePath, updated);
}

if (require.main === module) main();

module.exports = { headingMarkup, updateHeadingLogos };
