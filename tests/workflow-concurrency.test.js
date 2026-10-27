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

  // `github.token` attributes the PR to `github-actions[bot]`, and the repo's
  // Actions approval policy is `first_time_contributors`. GitHub counts the bot
  // as a first-time contributor, so every run is parked at `action_required`
  // with ZERO jobs until a human approves — observed live on PR #441, where
  // lint/demo/CodeQL all sat at `action_required` and auto-merge could not fire.
  // A PAT fixes the attribution; `github.token` stays as a fallback so the
  // refresh still happens (with an approval click) when the secret is missing.
  it("authenticates refresh steps with a PAT so the approval gate does not apply", () => {
    const workflows = [
      ".github/workflows/update-examples.yml",
      ".github/workflows/update-league-showcase.yml",
      ".github/workflows/update-team-directory.yml",
    ];

    for (const file of workflows) {
      const workflow = fs.readFileSync(file, "utf8");
      expect(workflow).toContain("secrets.AUTOMATION_TOKEN || github.token");
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
