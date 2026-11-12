const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

describe("check-changelog", () => {
  it("does not execute shell metacharacters from GITHUB_BASE_REF", () => {
    // BASE comes from the environment, so a crafted ref must never reach a
    // shell. Both classic injection shapes are tried; neither may create its
    // marker file.
    const script = path.join(__dirname, "..", "..", "scripts", "check-changelog.js");
    const cases = [
      `main; touch ${path.join(os.tmpdir(), `readme-scoreboard-changelog-injection-${process.pid}.txt`)}`,
      `$(touch ${path.join(os.tmpdir(), `readme-scoreboard-changelog-injection-2-${process.pid}.txt`)})`,
    ];
    for (const ref of cases) {
      const marker = ref.match(/touch (\S+?)(?:\)|$)/)[1];
      const result = spawnSync("node", [script], {
        env: { ...process.env, GITHUB_BASE_REF: ref },
        encoding: "utf8",
      });
      expect(fs.existsSync(marker)).toBe(false);
      // A hostile ref makes the fetch fail, which the script reports and
      // passes on rather than turning into a red check.
      expect(result.status).toBe(0);
      expect(result.stdout).toMatch(/changelog check skipped/);
      fs.rmSync(marker, { force: true });
    }
  });
});
