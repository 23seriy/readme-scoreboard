const fs = require("fs");

const readme = fs.readFileSync("README.md", "utf8");
const ci = fs.readFileSync(".github/workflows/ci.yml", "utf8");
const action = fs.readFileSync("action.yml", "utf8");
const contributing = fs.readFileSync("CONTRIBUTING.md", "utf8");
const release = fs.readFileSync(".github/workflows/release.yml", "utf8");
const { LEAGUES } = require("../src/config/leagues");

describe("README navigation links", () => {
  const collegeLinks = [
    ["#ncaa-mens-basketball-team-abbreviations", "## NCAA Men's Basketball Team Abbreviations"],
    ["#ncaa-womens-basketball-team-abbreviations", "## NCAA Women's Basketball Team Abbreviations"],
    ["#college-football-team-abbreviations", "## College Football Team Abbreviations"],
    ["#ncaa-mens-ice-hockey-team-abbreviations", "## NCAA Men's Ice Hockey Team Abbreviations"],
  ];

  it.each(collegeLinks)("resolves %s to a README heading", (anchor, heading) => {
    expect(readme).toContain(`](${anchor})`);
    expect(readme).toContain(heading);
  });

  it("keeps college ESPN endpoint links well-formed", () => {
    const endpoints = [
      "basketball/mens-college-basketball",
      "basketball/womens-college-basketball",
      "football/college-football",
      "hockey/mens-college-hockey",
    ];
    endpoints.forEach((endpoint) => {
      expect(readme).toMatch(new RegExp(`https://site\\.api\\.espn\\.com/apis/site/v2/sports/${endpoint}/teams`));
    });
  });

  it("uses the registry logo and accessible alt text for league headings", () => {
    LEAGUES.filter(({ key }) => !key.startsWith("nca")).forEach((league) => {
      expect(readme).toContain(`srcset="${league.logo.dark}"`);
      expect(readme).toContain(`src="${league.logo.light}" alt="${league.name} logo"`);
      expect(readme).toContain(`${league.name} Team Abbreviations`);
    });
  });
});

describe("repository CI configuration", () => {
  it("uses a locked install and runs tests and lint", () => {
    expect(ci).toContain("npm ci --ignore-scripts");
    expect(ci).toContain("npm test -- --runInBand");
    expect(ci).toContain("npm run lint");
  });
});

describe("documentation and action metadata", () => {
  it("keeps the release metadata and v1 alias workflow aligned", () => {
    expect(require("../package.json").version).toBe("1.4.0");
    expect(fs.readFileSync("CHANGELOG.md", "utf8")).toContain("## [1.4.0]");
    expect(release).toContain("types: [published]");
    expect(release).toContain('git tag -fa "$major"');
    expect(release).toContain("git push origin \"$major\" --force");
  });

  it("documents the current supported inputs and maintenance workflow", () => {
    expect(readme).toContain("target_repo: 23seriy/23seriy");
    expect(readme).toContain("node scripts/update-college-abbreviations.js");
    expect(readme).toContain("Pin the action to a release tag (for example, `@v1`)");
    expect(readme).toContain("NCAA Men's Ice Hockey");
  });

  it("keeps action metadata aligned with every supported league key", () => {
    const keys = require("../src/config/leagues").LEAGUES.map(({ key }) => key);
    keys.forEach((key) => expect(action).toContain(key));
  });

  it("documents the locked Node 24 development workflow", () => {
    expect(contributing).toContain("Node.js 24+");
    expect(contributing).toContain("npm ci --ignore-scripts");
    expect(contributing).toContain("npm test -- --runInBand");
  });
});
