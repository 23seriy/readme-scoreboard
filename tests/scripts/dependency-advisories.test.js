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

// GHSA-g3hv-75wg-m249 (minimatch DoS) and GHSA-3g3m-2fjr-6pw4 (glob AbortSignal
// bypass) both have fixes that no intermediate release accepts yet — Jest 30
// still asks for glob@^13 and test-exclude@^8 still asks for minimatch@^10 — so
// the resolved versions are lifted via `overrides`. Deleting an override, or a
// lockfile refresh that reintroduces the vulnerable copies, must fail loudly.
describe("transitive glob/minimatch advisories", () => {
  const lock = require(path.join(ROOT, "package-lock.json"));

  const resolvedVersions = (name) =>
    Object.entries(lock.packages || {})
      .filter(([entry]) => entry === `node_modules/${name}` || entry.endsWith(`/node_modules/${name}`))
      .map(([, meta]) => meta.version);

  it("pins glob and minimatch above their patched versions", () => {
    expect(pkg.overrides.glob).toBe("^14.0.4");
    expect(pkg.overrides.minimatch).toBe("^11.0.5");
  });

  it.each([
    ["glob", 14, 0, 2],
    ["minimatch", 11, 0, 1],
  ])("resolves every %s copy above the patched version", (name, major, minor, patch) => {
    const versions = resolvedVersions(name);
    expect(versions.length).toBeGreaterThan(0);
    for (const version of versions) {
      expect(isAtLeast(version, major, minor, patch)).toBe(true);
    }
  });

  it("documents both advisories and why the overrides must move together", () => {
    expect(security).toContain("GHSA-g3hv-75wg-m249");
    expect(security).toContain("GHSA-3g3m-2fjr-6pw4");
  });
});

function isAtLeast(version, major, minor, patch) {
  const [actualMajor, actualMinor, actualPatch] = version.split("-")[0].split(".").map(Number);
  if (actualMajor !== major) return actualMajor > major;
  if (actualMinor !== minor) return actualMinor > minor;
  return actualPatch >= patch;
}
