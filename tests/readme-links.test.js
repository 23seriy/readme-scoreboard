const fs = require("fs");

const readme = fs.readFileSync("README.md", "utf8");
const ci = fs.readFileSync(".github/workflows/ci.yml", "utf8");
const action = fs.readFileSync("action.yml", "utf8");
const contributing = fs.readFileSync("CONTRIBUTING.md", "utf8");
const release = fs.readFileSync(".github/workflows/release.yml", "utf8");
const { LEAGUES } = require("../src/config/leagues");

describe("README navigation links", () => {
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

  it("uses the registry logo and accessible alt text for league rows", () => {
    // Logos and accessible alt text are rendered in the Supported Sports table.
    LEAGUES.forEach((league) => {
      expect(readme).toContain(`srcset="${league.logo.dark}"`);
      expect(readme).toContain(`src="${league.logo.light}" alt="${league.name} logo"`);
    });
  });

  it("points team lookups at the generated team directory", () => {
    expect(readme).toContain("## Team Abbreviations");
    expect(readme).toContain("[team directory](TEAM_DIRECTORY.md)");
    expect(readme).not.toMatch(/## .+ Team Abbreviations/);
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

  it("keeps the machine-readable league manifest linked", () => {
    expect(readme).toContain("[`supported-leagues.json`](supported-leagues.json)");
    const manifest = require("../supported-leagues.json");
    expect(manifest.leagues).toHaveLength(LEAGUES.length);
    manifest.leagues.forEach((league) => {
      expect(league.apiSource).toMatch(/^(ESPN public API|official league API)$/);
      expect(league.teamEndpoint).toMatch(/^https:\/\//);
    });
  });

  it("keeps generated league workflow examples available", () => {
    const examples = fs.readFileSync("LEAGUE_WORKFLOW_EXAMPLES.md", "utf8");
    expect(readme).toContain("[league workflow examples](LEAGUE_WORKFLOW_EXAMPLES.md)");
    LEAGUES.forEach((league) => expect(examples).toContain(`## ${league.name}`));
  });

  it("documents the automated team-directory refresh", () => {
    const workflow = fs.readFileSync(".github/workflows/update-team-directory.yml", "utf8");
    expect(workflow).toContain("npm run teams:directory");
    expect(workflow).toContain("npm run teams:directory:markdown");
    expect(workflow).toContain("npm run leagues:examples");
    expect(readme).toContain("A daily workflow keeps both files current.");
  });

  it("keeps dependency maintenance covered by CI", () => {
    const workflow = fs.readFileSync(".github/workflows/dependency-health.yml", "utf8");
    expect(workflow).toContain("npm audit --audit-level=high");
    expect(workflow).toContain("npm test -- --runInBand");
    expect(readme).toContain("dependency-health workflow");
  });

  it("documents the project health links", () => {
    expect(readme).toContain("actions/workflows/api-health.yml/badge.svg");
    expect(readme).toContain("actions/workflows/dependency-health.yml/badge.svg");
    expect(readme).toContain("## Project health");
    expect(readme).toContain("support manifest");
    expect(readme).toContain("team directory");
  });

  it("keeps the table of contents scannable without per-league stubs", () => {
    const tocStart = readme.indexOf("## Table of Contents");
    const tocEnd = readme.indexOf("\n---", tocStart);
    const toc = readme.slice(tocStart, tocEnd);

    expect(tocStart).toBeGreaterThanOrEqual(0);
    expect(tocEnd).toBeGreaterThan(tocStart);
    expect(toc).toContain("[Supported Sports](#supported-sports)");
    expect(toc).toContain("[Team Abbreviations](#team-abbreviations)");
    // With the per-league rosters now living in TEAM_DIRECTORY.md, the TOC no
    // longer lists every league — leagues remain discoverable via Supported Sports.
    expect(toc).not.toMatch(/Team Abbreviations\]\(#team-abbreviations\)\n\s+- \[/);
  });

  it("keeps README markdown links non-empty and well-formed", () => {
    const links = [...readme.matchAll(/(?<!!)\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)]
      .map((match) => match[1]);

    expect(links.length).toBeGreaterThan(30);
    links.forEach((destination) => {
      expect(destination).toMatch(/^(?:https?:\/\/|#|\.\.\/|[^/]+\/|[^\s]+$)/);
    });
  });

  it("keeps every internal README link pointed at a real heading", () => {
    const headingSlugs = new Set([...readme.matchAll(/^#{1,6} (.+)$/gm)].map((match) => {
      const heading = match[1];
      const text = (heading.includes("</picture>") ? heading.split("</picture>").pop() : heading)
        .replace(/&nbsp;/g, " ")
        .trim();
      return text.toLowerCase().replace(/[^\p{L}\p{N} -]/gu, "").replace(/\s+/g, "-");
    }));
    const internalLinks = [...readme.matchAll(/(?<!!)\[[^\]]+\]\((#[^)]+)\)/g)].map((match) => match[1].slice(1));

    expect(internalLinks.length).toBeGreaterThan(20);
    internalLinks.forEach((anchor) => expect(headingSlugs).toContain(anchor.replace(/^-+/, "")));
  });

  it("keeps table-of-contents anchors tied to README headings", () => {
    const tocStart = readme.indexOf("## Table of Contents");
    const tocEnd = readme.indexOf("\n---", tocStart);
    const toc = readme.slice(tocStart, tocEnd);
    const anchors = [...toc.matchAll(/\[[^\]]+\]\((#[^)]+)\)/g)].map((match) => match[1]);
    const headingSlugs = [...readme.matchAll(/^#{1,6} (.+)$/gm)].map((match) => {
      const heading = match[1];
      const text = (heading.includes("</picture>") ? heading.split("</picture>").pop() : heading)
        .replace(/&nbsp;/g, " ")
        .trim();
      return text.toLowerCase().replace(/[^\p{L}\p{N} -]/gu, "").replace(/\s+/g, "-");
    });

    expect(anchors.length).toBeGreaterThan(0);
    anchors.forEach((anchor) => {
      expect(headingSlugs).toContain(anchor.slice(1).replace(/^-+/, ""));
    });
  });

  it("exposes a stable team-abbreviations section anchor", () => {
    expect(readme).toContain("[Team Abbreviations](#team-abbreviations)");
    expect(readme).toContain("## Team Abbreviations");
  });
});

describe("repository CI configuration", () => {
  it("exposes a focused documentation check command", () => {
    expect(require("../package.json").scripts["docs:check"]).toBe(
      "jest --runInBand tests/readme-links.test.js",
    );
  });

  it("uses a locked install and runs tests and lint", () => {
    expect(ci).toContain("npm ci --ignore-scripts");
    expect(ci).toContain("npm run docs:check");
    expect(ci).toContain("npm test -- --runInBand");
    expect(ci).toContain("npm run lint");
  });
});

describe("documentation and action metadata", () => {
  it("documents every supported sport key in the action input", () => {
    const sportDescription = action.match(/description: "Sport: ([^"]+)"/)[1];

    LEAGUES.forEach(({ key }) => {
      expect(sportDescription.split(", ")).toContain(key);
    });
  });

  it("keeps the release metadata and v1 alias workflow aligned", () => {
    const version = require("../package.json").version;
    const changelog = fs.readFileSync("CHANGELOG.md", "utf8");

    expect(changelog).toContain(`## [${version}]`);
    expect(changelog.indexOf(`## [${version}]`)).toBeGreaterThan(changelog.indexOf("## [Unreleased]"));
    expect(release).toContain("types: [published]");
    expect(release).toContain('git tag -fa "$major"');
    expect(release).toContain("git push origin \"$major\" --force");
  });

  it("documents the current supported inputs and maintenance workflow", () => {
    expect(readme).toContain("Set `target_repo: owner/repository`");
    expect(readme).toContain(".github/workflows/check-season-dates.yml");
    expect(readme).toContain("Pin the action to a release tag (for example, `@v1`)");
    expect(readme).toContain("NCAA Men's Ice Hockey");
    expect(readme).toContain("[Troubleshooting](#troubleshooting)");
    expect(readme).toContain("## Troubleshooting");
  });

  it("documents how generated README sections are maintained", () => {
    expect(contributing).toContain("## Generated README Sections");
    expect(contributing).toContain("node scripts/update-season-status.js");
    expect(contributing).toContain("npm run leagues:manifest");
  });

  it("documents the dry-run action input", () => {
    expect(action).toContain("  dry_run:");
    expect(readme).toContain("Accepts `true`/`false`");
  });

  it("documents every action input in the Action Inputs table", () => {
    const inputsBlock = action.slice(action.indexOf("inputs:"), action.indexOf("outputs:"));
    const actionInputs = [...inputsBlock.matchAll(/^\x20{2}([a-z_]+):$/gm)].map((match) => match[1]);
    const tableStart = readme.indexOf("## Action Inputs (`with:`)");
    const tableEnd = readme.indexOf("## Action Outputs", tableStart);
    const table = readme.slice(tableStart, tableEnd);

    expect(actionInputs.length).toBeGreaterThan(0);
    actionInputs.forEach((input) => expect(table).toContain(`| \`${input}\` |`));
  });

  it("describes the sport input as a league key without duplicating the full registry", () => {
    const tableStart = readme.indexOf("## Action Inputs (`with:`)"),
      tableEnd = readme.indexOf("## Action Outputs", tableStart);
    const table = readme.slice(tableStart, tableEnd);

    expect(table).toContain("League key (for example, `nba`). See [Supported Sports](#supported-sports).");
    expect(table).not.toContain("Sport adapter:");
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
    expect(readme).toContain("choose your profile repository");
    expect(readme).not.toContain("choose the repository named by `target_repo`");
    expect(readme).toContain("Classic tokens with `repo` scope are also");
    expect(action).toContain("Contents read/write access to target_repo");
  });

  it("declares write permission in the canonical workflow example", () => {
    const workflowStart = readme.indexOf("name: Update Scoreboard");
    const workflowEnd = readme.indexOf("```", workflowStart);
    const workflow = readme.slice(workflowStart, workflowEnd);
    expect(workflow).toContain("permissions:\n  contents: write");
  });

  it("keeps the canonical workflow simple for scheduled and manual runs", () => {
    const workflowStart = readme.indexOf("name: Update Scoreboard");
    const workflowEnd = readme.indexOf("```", workflowStart);
    const workflow = readme.slice(workflowStart, workflowEnd);
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toMatch(/workflow_dispatch:[^\n]*\n\s+inputs:/);
    expect(workflow).toContain("sport: nba");
    expect(workflow).toContain("team: LAL");
    expect(workflow).toContain("marker: readme-scoreboard-nba");
    expect(workflow).not.toContain("target_repo:");
  });

  it("keeps team lookup guidance near the quick start workflow", () => {
    const quickStart = readme.slice(
      readme.indexOf("## Quick Start (3 steps)"),
      readme.indexOf("#### Choose an update frequency"),
    );

    expect(quickStart).toContain("[Supported Sports](#supported-sports)");
    expect(quickStart).toContain("[team directory](TEAM_DIRECTORY.md)");
    expect(quickStart).toContain("[league workflow examples](LEAGUE_WORKFLOW_EXAMPLES.md)");
  });

  it("keeps the multi-sport example scoped to the profile repository", () => {
    const setupStart = readme.indexOf("#### Multiple sports in one README");
    const setupEnd = readme.indexOf("---", setupStart);
    const setup = readme.slice(setupStart, setupEnd);

    expect(setup).not.toContain("target_repo:");
  });

  it("keeps multi-sport marker guidance out of the one-scoreboard quick start", () => {
    const quickStart = readme.slice(
      readme.indexOf("## Quick Start (3 steps)"),
      readme.indexOf("## Common setups"),
    );
    const multiSportStart = readme.indexOf("#### Multiple sports in one README");
    const multiSportEnd = readme.indexOf("---", multiSportStart);
    const multiSport = readme.slice(multiSportStart, multiSportEnd);

    expect(quickStart).not.toContain("Tracking more than one sport?");
    expect(multiSport).toContain("<!-- readme-scoreboard-mlb start -->");
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
