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

  it("points team lookups at the generated team and player directories", () => {
    expect(readme).toContain("## Team & Player Abbreviations");
    expect(readme).toContain("[team directory](TEAM_DIRECTORY.md)");
    expect(readme).toContain("[player directory](PLAYER_DIRECTORY.md)");
    expect(readme).toContain("[`player-directory.json`](player-directory.json)");
  });

  it("keeps the README player-spotlight exclusions aligned with validation", () => {
    const { validateInputs } = require("../src/validation");
    const supportedSports = LEAGUES.map(({ key }) => key);
    const unsupported = supportedSports.filter((sport) => {
      try {
        validateInputs({ sport, team: "ZZZ", entity: "team", adapter: {}, supportedSports, player: "Someone" });
        return false;
      } catch (error) {
        return /player: is not yet supported/.test(error.message);
      }
    });

    const start = readme.indexOf("#### Leagues without player spotlight");
    // Matches the trailing paragraph whatever leagues it happens to name, so
    // rewording it doesn't silently make this slice run to the end of the file.
    const end = readme.indexOf("used to be on this list", start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const section = readme.slice(start, end);

    // The table's league rows must be exactly the leagues validation rejects.
    const documented = [...section.matchAll(/`([a-z0-9_]+)`/g)].map((match) => match[1]);
    expect(new Set(documented)).toEqual(new Set(unsupported));

    // F1 is excluded because it has no athlete roster, not because it already
    // renders a player board, so it must not share a row with the tours.
    const rows = section.split("\n").filter((line) => line.startsWith("| `"));
    expect(rows.some((row) => row.includes("`f1`") && row.includes("`atp`"))).toBe(false);

    // ...and the prose count must match, so it cannot drift from the table.
    const numbers = ["zero", "one", "two", "three", "four", "five", "six",
      "seven", "eight", "nine", "ten", "eleven", "twelve"];
    const count = numbers[unsupported.length];
    expect(count).toBeDefined();
    const countWord = `${count[0].toUpperCase()}${count.slice(1)}`;
    expect(section).toContain(`${countWord} leagues intentionally don't support`);
  });

  it("does not describe Formula 1 as an individual-athlete sport", () => {
    // F1 tracks constructors, not drivers (reclassified in #241), so it must
    // never be grouped with the player-entity leagues in the docs.
    expect(LEAGUES.find(({ key }) => key === "f1").entity).toBe("team");
    expect(readme).not.toMatch(/individual sport[s]?[^.]*(?:\bF1\b|Formula 1)/i);
  });

  it("keeps every supported-sports row aligned with the league registry", () => {
    const start = readme.indexOf("<!-- supported-sports:start -->");
    const end = readme.indexOf("<!-- supported-sports:end -->");
    const table = readme.slice(start, end);

    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    // The README tells readers this table "lists every league key", and the
    // action's `sport:` input takes exactly those keys, so the column has to
    // be here for that instruction to be followable.
    expect(table).toContain("| Sport | League | Key | Season | Endpoint |");
    LEAGUES.forEach((league) => {
      expect(table).toContain(` ${league.name} |`);
      expect(table).toContain(`\`${league.key}\` |`);
      const endpoint = league.endpointOverride
        ? league.endpointOverride.match(/\((https:\/\/[^)]+)\)/)[1]
        : `https://site.api.espn.com/apis/site/v2/sports/${league.endpoint}/teams`;
      expect(table).toContain(endpoint);
    });
  });

  it("names every league in the intro enumeration", () => {
    // The sentence after the league count spells out every league by name. It is
    // generated by scripts/update-season-status.js from the same registry rows as
    // the table, so the two cannot disagree. Before that it drifted: it claimed
    // 41 leagues while naming 39, because NASCAR and IndyCar were never added.
    expect(readme).toContain("<!-- league-list:start -->");
    expect(readme).toContain("<!-- league-list:end -->");
    const paragraph = readme.match(/Currently supports ([^\n]+)/)[1];
    const named = [...paragraph.matchAll(/\*\*([^*]+)\*\*/g)].map((match) => match[1]);

    expect(named.length).toBeGreaterThan(0);
    expect([...named].sort()).toEqual(LEAGUES.map((league) => league.name).sort());
  });

  it("gives every supported league a runnable demo command", () => {
    // This list drifted once already: it covered 23 of the 41 leagues, because
    // nothing connected it to the registry. The keys are validated against the
    // adapters elsewhere; this ties the list itself to the registry.
    const start = readme.indexOf("### Demo Mode");
    const end = readme.indexOf("### College competition examples", start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const block = readme.slice(start, end);
    LEAGUES.forEach(({ key }) => {
      expect(block).toContain(`SPORT=${key} TEAM=`);
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

  it("documents the automated directory refresh", () => {
    const workflow = fs.readFileSync(".github/workflows/update-team-directory.yml", "utf8");
    expect(workflow).toContain("npm run teams:directory");
    expect(workflow).toContain("npm run teams:directory:markdown");
    expect(workflow).toContain("npm run leagues:examples");
    expect(workflow).toContain("npm run players:directory");
    expect(workflow).toContain("npm run players:directory:markdown");
    expect(readme).toContain("A daily workflow keeps these files current.");
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
    expect(toc).toContain("[Team & Player Abbreviations](#team--player-abbreviations)");
    // With the per-league rosters now living in TEAM_DIRECTORY.md, the TOC no
    // longer lists every league — leagues remain discoverable via Supported Sports.
    expect(toc).not.toMatch(/Team & Player Abbreviations\]\(#team--player-abbreviations\)\n\s+- \[/);
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
      return text.toLowerCase().replace(/[^\p{L}\p{N} -]/gu, "").replace(/\s/g, "-");
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
      return text.toLowerCase().replace(/[^\p{L}\p{N} -]/gu, "").replace(/\s/g, "-");
    });

    expect(anchors.length).toBeGreaterThan(0);
    anchors.forEach((anchor) => {
      expect(headingSlugs).toContain(anchor.slice(1).replace(/^-+/, ""));
    });
  });

  it("exposes a stable team-and-player-abbreviations section anchor", () => {
    expect(readme).toContain("[Team & Player Abbreviations](#team--player-abbreviations)");
    expect(readme).toContain("## Team & Player Abbreviations");
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
    expect(ci).toContain("npm run test:coverage");
    expect(ci).toContain("npm run lint");
  });

  it("enforces coverage thresholds in CI", () => {
    expect(require("../package.json").scripts["test:coverage"]).toBe(
      "jest --coverage --runInBand",
    );
    const { coverageThreshold } = require("../jest.config.js");
    expect(coverageThreshold.global.statements).toBeGreaterThan(0);
    expect(coverageThreshold.global.branches).toBeGreaterThan(0);
    expect(coverageThreshold.global.functions).toBeGreaterThan(0);
    expect(coverageThreshold.global.lines).toBeGreaterThan(0);
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

  it("wires every action input to its environment variable", () => {
    const inputsBlock = action.slice(action.indexOf("inputs:"), action.indexOf("outputs:"));
    const actionInputs = [...inputsBlock.matchAll(/^\x20{2}([a-z_]+):$/gm)].map((match) => match[1]);
    const envBlock = action.slice(action.indexOf("env:"), action.indexOf("runs:", action.indexOf("env:")) || action.length);
    actionInputs.forEach((input) => {
      expect(envBlock).toContain("${{ inputs." + input + " }}");
    });
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

  it("keeps every documented league count matching the registry", () => {
    // Prose counts drift silently: when the registry grew to 41, the README still
    // claimed 39 and action.yml still claimed 30 — the latter had been wrong for
    // several releases because nothing checked it.
    const claims = [...readme.matchAll(/(\d+)\s+(?:supported\s+)?leagues/g)].map((m) => Number(m[1]));
    const actionClaims = [...action.matchAll(/(\d+)\s+(?:supported\s+)?leagues/g)].map((m) => Number(m[1]));

    expect(claims.length).toBeGreaterThan(0);
    expect(actionClaims.length).toBeGreaterThan(0);
    for (const count of [...claims, ...actionClaims]) {
      expect(count).toBe(LEAGUES.length);
    }
  });

  it("documents the locked Node 24 development workflow", () => {
    expect(contributing).toContain("Node.js 24+");
    expect(contributing).toContain("npm ci --ignore-scripts");
    expect(contributing).toContain("npm test -- --runInBand");
  });

  it("documents the release process, including the traps that break it", () => {
    expect(contributing).toContain("## Releasing");
    expect(contributing).toContain("npm version X.Y.Z --no-git-tag-version");
    // The bump and the CHANGELOG heading must be in one commit, or the release
    // metadata test above fails.
    expect(contributing).toContain("same commit");
    // `--target` rejects a short SHA (HTTP 422), so the docs must say so.
    expect(contributing).toContain("full");
    expect(contributing).toContain("422 target_commitish is invalid");
    // The v1 alias moves on `release: published`.
    expect(contributing).toContain("release.yml");
  });
});
