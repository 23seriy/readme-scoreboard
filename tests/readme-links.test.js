const fs = require("fs");

const readme = fs.readFileSync("README.md", "utf8");
const ci = fs.readFileSync(".github/workflows/ci.yml", "utf8");

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
});

describe("repository CI configuration", () => {
  it("uses a locked install and runs tests and lint", () => {
    expect(ci).toContain("npm ci --ignore-scripts");
    expect(ci).toContain("npm test -- --runInBand");
    expect(ci).toContain("npm run lint");
  });
});
