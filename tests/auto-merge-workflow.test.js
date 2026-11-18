const fs = require("node:fs");

const FILE = ".github/workflows/auto-merge.yml";
const workflow = () => fs.readFileSync(FILE, "utf8");

// GitHub never auto-merges a pull request unless auto-merge is armed on it.
// Only the generated-artefact workflows used to do that, so human PRs sat
// green forever (PR #553 was merged by hand). These assertions pin the guards
// that make arming safe rather than merely present.
describe("auto-merge workflow", () => {
  it("runs on every pull-request change that can arm it", () => {
    expect(workflow()).toMatch(/pull_request:\n\s+types: \[opened, reopened, ready_for_review, synchronize\]/);
  });

  it("requests only the permissions auto-merge needs", () => {
    expect(workflow()).toMatch(/permissions:\n\s+contents: write\n\s+pull-requests: write/);
  });

  it("never arms drafts or fork pull requests", () => {
    const w = workflow();
    expect(w).toContain("github.event.pull_request.draft == false");
    expect(w).toContain("github.event.pull_request.head.repo.full_name == github.repository");
  });

  it("leaves bot-authored refreshes to their own workflows", () => {
    expect(workflow()).toContain('github.event.pull_request.user.type }}" = "Bot"');
  });

  it("arms auto-merge instead of merging ahead of the required checks", () => {
    const w = workflow();
    expect(w).toMatch(/gh pr merge .*--squash --auto/);
    expect(w).not.toMatch(/gh pr merge [^\n]*--squash(?! --auto)/);
  });

  it("is idempotent across pushes", () => {
    expect(workflow()).toContain("autoMergeRequest");
  });
});
