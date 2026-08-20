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

  it("keeps every league reference section collapsible", () => {
    expect((readme.match(/<details>/g) || []).length).toBe(LEAGUES.length);

    LEAGUES.forEach((league) => {
      const heading = `${league.name} Team Abbreviations`;
      const headingIndex = readme.indexOf(heading);
      const detailsStart = readme.lastIndexOf("<details>", headingIndex);
      const detailsEnd = readme.indexOf("</details>", headingIndex);

      expect(headingIndex).toBeGreaterThanOrEqual(0);
      expect(detailsStart).toBeGreaterThanOrEqual(0);
      expect(detailsEnd).toBeGreaterThan(headingIndex);
      expect(readme.slice(detailsStart, detailsEnd)).toContain(league.name);
    });
  });

  it("keeps every supported-sports row aligned with the league registry", () => {
    const start = readme.indexOf("<!-- supported-sports:start -->");
    const end = readme.indexOf("<!-- supported-sports:end -->");
    const table = readme.slice(start, end);

    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    LEAGUES.forEach((league) => {
      expect(table).toContain(` ${league.name} |`);
      const endpoint = league.endpointOverride
        ? league.endpointOverride.match(/\((https:\/\/[^)]+)\)/)[1]
        : `https://site.api.espn.com/apis/site/v2/sports/${league.endpoint}/teams`;
      expect(table).toContain(endpoint);
    });
  });

  it("keeps every supported league discoverable in the table of contents", () => {
    const tocStart = readme.indexOf("## Table of Contents");
    const tocEnd = readme.indexOf("\n---", tocStart);
    const toc = readme.slice(tocStart, tocEnd);

    expect(tocStart).toBeGreaterThanOrEqual(0);
    expect(tocEnd).toBeGreaterThan(tocStart);
    LEAGUES.forEach((league) => {
      expect(toc).toContain(`[${league.name}]`);
    });
  });

  it("exposes a stable team-abbreviations section anchor", () => {
    expect(readme).toContain("[Team Abbreviations](#team-abbreviations)");
    expect(readme).toContain("## Team Abbreviations");
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
    expect(require("../package.json").version).toBe("1.6.0");
    expect(fs.readFileSync("CHANGELOG.md", "utf8")).toContain("## [1.5.0]");
    expect(release).toContain("types: [published]");
    expect(release).toContain('git tag -fa "$major"');
    expect(release).toContain("git push origin \"$major\" --force");
  });

  it("documents the current supported inputs and maintenance workflow", () => {
    expect(readme).toContain("target_repo: 23seriy/23seriy");
    expect(readme).toContain("node scripts/update-college-abbreviations.js");
    expect(readme).toContain(".github/workflows/check-season-dates.yml");
    expect(readme).toContain("Pin the action to a release tag (for example, `@v1`)");
    expect(readme).toContain("NCAA Men's Ice Hockey");
  });

  it("documents the dry-run action input", () => {
    expect(action).toContain("  dry_run:");
    expect(readme).toContain("Accepts `true`/`false`");
  });

  it("documents the action outputs", () => {
    expect(readme).toContain("## Action Outputs");
    expect(readme).toContain("`${{ steps.scoreboard.outputs.updated }}`");
    expect(readme).toContain("`target_repo`");
  });

  it("exposes machine-readable outputs from the runtime step", () => {
    expect(action).toMatch(/outputs:\n[\s\S]*updated:/);
    expect(action).toContain("value: ${{ steps.run.outputs.updated }}");
    expect(action).toContain("value: ${{ steps.run.outputs.mode }}");
    expect(action).toContain("value: ${{ steps.run.outputs.target_repo }}");
    expect(action).toContain("- id: run");
  });

  it("documents least-privilege token permissions", () => {
    expect(readme).toContain("Contents: Read and write on the target repo");
    expect(readme).toMatch(/Only select\s+repositories/);
    expect(readme).toContain("Classic tokens with `repo` scope are also");
    expect(action).toContain("Contents read/write access to target_repo");
  });

  it("declares write permission in the canonical workflow example", () => {
    const workflowStart = readme.indexOf("name: Update Scoreboard");
    const workflowEnd = readme.indexOf("```", workflowStart);
    const workflow = readme.slice(workflowStart, workflowEnd);
    expect(workflow).toContain("permissions:\n  contents: write");
  });

  it("makes the canonical workflow selectable from Run workflow", () => {
    const workflowStart = readme.indexOf("name: Update Scoreboard");
    const workflowEnd = readme.indexOf("```", workflowStart);
    const workflow = readme.slice(workflowStart, workflowEnd);
    expect(workflow).toMatch(/workflow_dispatch:[^\n]*\n\s+inputs:/);
    expect(workflow).toContain("sport: ${{ inputs.sport || 'nba' }}");
    expect(workflow).toContain("team: ${{ inputs.team || 'LAL' }}");
    expect(workflow).toContain("marker: ${{ inputs.marker || 'readme-scoreboard-nba' }}");
  });

  it("pins every README action example to the stable major release", () => {
    const examples = readme.match(/uses: 23seriy\/readme-scoreboard@[^\s]+/g) || [];
    expect(examples.length).toBeGreaterThan(0);
    expect(examples).toEqual(expect.arrayContaining(["uses: 23seriy/readme-scoreboard@v1"]));
    expect(examples).not.toContain("uses: 23seriy/readme-scoreboard@main");
    expect(examples.every((example) => example.endsWith("@v1"))).toBe(true);
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
