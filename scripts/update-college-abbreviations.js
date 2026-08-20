const fs = require("fs");
const path = require("path");
const { get: httpGet } = require("../src/http");

const sections = [
  ["ncaab", "NCAA Men's Basketball", "basketball/mens-college-basketball"],
  ["ncaaw", "NCAA Women's Basketball", "basketball/womens-college-basketball"],
  ["ncaaf", "College Football", "football/college-football"],
  ["ncaa_hockey", "NCAA Men's Ice Hockey", "hockey/mens-college-hockey"],
];

function flattenTeams(data) {
  return (data.sports || []).flatMap((sport) => sport.leagues || [])
    .flatMap((league) => league.teams || [])
    .map((entry) => entry.team || entry)
    .filter((team) => team.abbreviation && team.displayName)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function renderSection(slug, title, teams) {
  if (!teams.length) {
    throw new Error(`No teams returned for ${slug}; refusing to replace its README section`);
  }

  const rows = [
    `<!-- college-abbreviations:${slug}:start -->`,
    `## ${title} Team Abbreviations`,
    `<details><summary>${title} roster</summary>`,
    "",
    "Current teams from ESPN's public directory. The directory can change as schools are added or reclassified.",
    "",
    "| Club | Abbr | Club | Abbr |",
    "|---|---|---|---|",
  ];
  for (let i = 0; i < teams.length; i += 2) {
    const cells = [teams[i], teams[i + 1]];
    const row = cells.flatMap((team) => team
      ? [`${team.logos?.[0]?.href ? `<img src="${team.logos[0].href}" width="20"> ` : ""}${team.displayName}`, `\`${team.abbreviation}\``]
      : ["", ""]);
    rows.push(`| ${row.join(" | ")} |`);
  }
  rows.push("</details>");
  rows.push(`<!-- college-abbreviations:${slug}:end -->`);
  return rows.join("\n");
}

async function main() {
  const readmePath = path.resolve(__dirname, "..", "README.md");
  let readme = fs.readFileSync(readmePath, "utf8");
  for (const [slug, title, endpoint] of sections) {
    const { data } = await httpGet(`https://site.api.espn.com/apis/site/v2/sports/${endpoint}/teams?limit=1000`);
    const section = renderSection(slug, title, flattenTeams(data));
    const pattern = new RegExp(`<!-- college-abbreviations:${slug}:start -->[\\s\\S]*?<!-- college-abbreviations:${slug}:end -->`);
    if (!pattern.test(readme)) throw new Error(`Missing README markers for ${slug}`);
    readme = readme.replace(pattern, section);
  }
  fs.writeFileSync(readmePath, readme);
}

if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });

module.exports = { flattenTeams, renderSection, sections };
