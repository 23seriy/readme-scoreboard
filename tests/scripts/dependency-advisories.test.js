const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");
const pkg = require(path.join(ROOT, "package.json"));
const security = fs.readFileSync(path.join(ROOT, "SECURITY.md"), "utf8");

// GHSA-gcqx-w48m-w2h4 (deepmerge prototype poisoning) cannot be fixed: 4.3.1 is
// the newest published version and the latest jest-config still requires it.
// The mitigation is therefore a deterministic pin plus a written decision, and
// both must not quietly disappear — an unexplained `overrides` entry is exactly
// the kind of thing a future contributor deletes as noise, and an undocumented
// accepted advisory looks like an oversight.
describe("deepmerge advisory (GHSA-gcqx-w48m-w2h4)", () => {
  it("pins deepmerge deterministically via overrides", () => {
    expect(pkg.overrides).toBeDefined();
    expect(pkg.overrides.deepmerge).toBe("4.3.1");
  });

  it("documents the advisory and why it cannot be patched", () => {
    expect(security).toContain("GHSA-gcqx-w48m-w2h4");
    expect(security).toMatch(/no patched version/i);
    // The version ceiling is the crux — without it a reader assumes an upgrade
    // path exists.
    expect(security).toContain("4.3.1");
  });

  it("records that it is dev-only, not shipped at runtime", () => {
    expect(security).toMatch(/devDependency/i);
    expect(security).toMatch(/jest-config/);
  });

  it("keeps deepmerge out of the production dependency graph", () => {
    // If this ever fails, the advisory stops being dev-only and the accepted
    // risk above must be reconsidered rather than silently inherited.
    const prod = Object.keys(pkg.dependencies || {});
    expect(prod).not.toContain("deepmerge");

    const lock = require(path.join(ROOT, "package-lock.json"));
    const offenders = Object.entries(lock.packages || {})
      .filter(([, meta]) => meta.dev !== true)
      .filter(([, meta]) => {
        const deps = { ...(meta.dependencies || {}), ...(meta.peerDependencies || {}) };
        return Object.prototype.hasOwnProperty.call(deps, "deepmerge");
      })
      .map(([name]) => name);

    expect(offenders).toEqual([]);
  });
});
