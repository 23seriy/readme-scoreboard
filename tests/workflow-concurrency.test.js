const fs = require("node:fs");

describe("README maintenance workflow coordination", () => {
  it("serializes season and team-directory updates through one concurrency group", () => {
    const season = fs.readFileSync(".github/workflows/update-season-status.yml", "utf8");
    const teamDir = fs.readFileSync(".github/workflows/update-team-directory.yml", "utf8");
    const group = /concurrency:\n {2}group: ([^\n]+)/;

    expect(season).toMatch(group);
    expect(teamDir).toMatch(group);
    expect(season.match(group)[1]).toBe("readme-maintenance");
    expect(teamDir.match(group)[1]).toBe("readme-maintenance");
    expect(season).toContain("cancel-in-progress: false");
    expect(teamDir).toContain("cancel-in-progress: false");
  });

  it("serializes release alias updates so concurrent releases cannot race", () => {
    const release = fs.readFileSync(".github/workflows/release.yml", "utf8");
    const group = /concurrency:\n {2}group: ([^\n]+)/;

    // Two releases published back-to-back both force-push `v1`; without a
    // concurrency group the loser fails with "cannot lock ref 'refs/tags/v1'".
    expect(release).toMatch(group);
    expect(release.match(group)[1]).toBe("release-major-tag");
    expect(release).toContain("cancel-in-progress: false");
    // A release must not queue behind scheduled README maintenance.
    expect(release.match(group)[1]).not.toBe("readme-maintenance");
  });

  it("bounds scheduled maintenance and verification jobs", () => {
    for (const file of [
      ".github/workflows/update-season-status.yml",
      ".github/workflows/update-team-directory.yml",
      ".github/workflows/check-season-dates.yml",
      ".github/workflows/api-health.yml",
    ]) {
      const workflow = fs.readFileSync(file, "utf8");
      expect(workflow).toMatch(/runs-on: ubuntu-24\.04\n\s+timeout-minutes: 10/);
    }
  });

  it("keeps workflow permissions explicit and least-privilege", () => {
    for (const file of [
      ".github/workflows/ci.yml",
      ".github/workflows/demo-smoke.yml",
      ".github/workflows/check-season-dates.yml",
      ".github/workflows/api-health.yml",
    ]) {
      const workflow = fs.readFileSync(file, "utf8");
      expect(workflow).toMatch(/permissions:\n\s+contents: read/);
    }

    for (const file of [
      ".github/workflows/update-season-status.yml",
      ".github/workflows/update-team-directory.yml",
    ]) {
      const workflow = fs.readFileSync(file, "utf8");
      expect(workflow).toMatch(/permissions:\n\s+contents: write\n\s+pull-requests: write/);
    }
  });

  // The repository ruleset ("main branch") requires `lint`, `demo` and
  // `CodeQL` before a commit may land on main. Those checks only run on a
  // commit that already exists, so a workflow cannot push to main and satisfy
  // them — a direct push was tried and rejected with GH013. A pull request is
  // the only route that lets the checks run first, so every generated-artefact
  // workflow must open a PR *and* let it land itself; otherwise the refresh
  // silently rots until a human notices the open PR.
  it("auto-merges generated-artefact refreshes instead of pushing to main", () => {
    const workflows = [
      ".github/workflows/update-examples.yml",
      ".github/workflows/update-league-showcase.yml",
      ".github/workflows/update-team-directory.yml",
    ];

    for (const file of workflows) {
      const workflow = fs.readFileSync(file, "utf8");

      // A pull request is mandatory — never a direct push to main.
      expect(workflow).toContain("gh pr create");
      expect(workflow).not.toMatch(/git push[^\n]*\b(origin\s+)?(HEAD:)?main\b/);

      // The PR URL is captured so the same PR is reused across runs and can be
      // handed to `gh pr merge`.
      expect(workflow).toMatch(/url=\$\(gh pr create/);
      expect(workflow).toMatch(/gh pr view[^\n]*--json url/);

      // Auto-merge waits for the required checks and for the branch to be up
      // to date, then squashes — honouring the ruleset without a human.
      expect(workflow).toMatch(/gh pr merge "\$url" --squash --auto/);

      // Auto-merge cannot be enabled without `pull-requests: write`.
      expect(workflow).toMatch(/permissions:\n\s+contents: write\n\s+pull-requests: write/);
    }
  });

  // These steps used the `AUTOMATION_TOKEN` PAT so the PR was attributed to a
  // user rather than `github-actions[bot]`. That PAT expired, and from
  // 2026-11-12 every refresh pushed its branch and then died at `gh pr create`
  // with `HTTP 401: Bad credentials` — three scheduled workflows silently
  // stopped landing for two days. Nothing in the repo said which credential was
  // in use, so the 401 looked like a code problem.
  //
  // The built-in `github.token` has no expiry and is issued by the run itself.
  // Its bot-attributed PRs have run their checks normally in this repository
  // (see the automation refresh PRs), and the ruleset still requires
  // `lint`/`demo`/`CodeQL`, so switching does not weaken the gate.
  it("authenticates refresh steps with the run's built-in token, not a PAT", () => {
    const workflows = [
      ".github/workflows/update-examples.yml",
      ".github/workflows/update-league-showcase.yml",
      ".github/workflows/update-team-directory.yml",
      ".github/workflows/update-season-status.yml",
    ];

    for (const file of workflows) {
      const workflow = fs.readFileSync(file, "utf8");
      expect(workflow).toContain("GH_TOKEN: ${{ github.token }}");
      // A PAT can expire without anything in this repository changing, which
      // is exactly how the outage above started.
      expect(workflow).not.toContain("secrets.AUTOMATION_TOKEN");
    }
  });

  // The 401 arrived after the branch had been pushed, so the run left a branch
  // with no pull request and a stack-free error that named no cause. Both
  // workflows must now check authentication up front and report why.
  it("fails loudly when the workflow token cannot authenticate", () => {
    for (const file of [
      ".github/workflows/update-examples.yml",
      ".github/workflows/update-league-showcase.yml",
      ".github/workflows/update-team-directory.yml",
    ]) {
      const workflow = fs.readFileSync(file, "utf8");
      // Probe a repository endpoint, not /user: `gh api user` goes through
      // GraphQL, which a scoped GITHUB_TOKEN cannot query, so it reports a
      // valid token as unauthenticated (run 43431615479).
      expect(workflow).toContain('gh api "repos/${GITHUB_REPOSITORY}"');
      expect(workflow).not.toContain("gh api user");
      expect(workflow).toMatch(/::error::The workflow token cannot read/);
      // The check must precede the push, or the branch is left orphaned.
      expect(workflow.indexOf('gh api "repos/')).toBeLessThan(workflow.indexOf("git push --force origin automation/"));
    }
  });

  // The ruleset sets `strict_required_status_checks_policy`, so a PR that is
  // merely `BEHIND` main cannot auto-merge. Observed live: #446 merged, which
  // moved main, and #443/#444/#445 then sat at `BEHIND` with auto-merge ARMED
  // and never moved again — the only thing that refreshes those branches is a
  // new run of the job, and the job exits early when the artefacts are
  // unchanged, so the deadlock is permanent. Branching from `origin/main` on
  // every run is what keeps the PR mergeable.
  it("branches each automation branch from current main so the PR is never BEHIND", () => {
    const workflows = [
      ".github/workflows/update-examples.yml",
      ".github/workflows/update-league-showcase.yml",
      ".github/workflows/update-team-directory.yml",
    ];

    for (const file of workflows) {
      const workflow = fs.readFileSync(file, "utf8");

      // Must fetch main first, or `origin/main` may be stale in the checkout.
      expect(workflow).toContain("git fetch --quiet origin main");

      // Each `git switch -C automation/<x>` must name `origin/main` as its
      // start point, otherwise it inherits the stale commit the action checked
      // out and the PR goes straight back to BEHIND.
      const switches = workflow.match(/git switch -C automation\/[a-z-]+[^\n]*/g);
      expect(switches).not.toBeNull();
      for (const line of switches) {
        expect(line.trim()).toMatch(/^git switch -C automation\/[a-z-]+ origin\/main$/);
      }

      // The fetch has to happen before the switch.
      expect(workflow.indexOf("git fetch --quiet origin main")).toBeLessThan(
        workflow.indexOf("git switch -C automation/")
      );
    }
  });
});
