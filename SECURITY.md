# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email the maintainer or use [GitHub's private vulnerability reporting](https://github.com/23seriy/readme-scoreboard/security/advisories/new)
3. Include steps to reproduce the issue
4. Allow reasonable time for a fix before public disclosure

## Scope

This project handles GitHub tokens and API keys via environment variables.
Please report any issues related to:

- Token or credential exposure
- Unsafe handling of secrets
- Dependency vulnerabilities

## Response

We aim to acknowledge reports within 48 hours and provide a fix or mitigation within 7 days.

## Known accepted advisories

Dependencies are kept current and `npm audit` is expected to be clean. The
following is knowingly accepted because **no fix exists yet**; it is recorded
here so a future reader does not spend time re-investigating it.

### GHSA-gcqx-w48m-w2h4 — `deepmerge` prototype poisoning (`<= 4.3.1`)

- **Why it cannot be patched:** `4.3.1` is the newest version published on npm
  (last modified 2023) and the advisory lists **no patched version**. The latest
  `jest-config` still requires `deepmerge@^4.3.1`, so upgrading Jest does not
  remove it either. An `overrides` pin is set in `package.json` to keep the
  resolved version deterministic; it cannot fix the advisory.
- **Why the exposure is limited:** it is reached only through
  `jest → @jest/core → jest-config → deepmerge`, a **devDependency**. Nothing in
  `dependencies` pulls it in, so it is absent from any published runtime.
- **Why it is not exploitable here:** `jest-config` calls `deepmerge.all([defaults,
  overrides])` to merge its own defaults with this repo's static `jest.config.js`.
  No attacker-controlled object reaches it — the advisory requires merging
  untrusted input. The project itself never imports `deepmerge`.
- **Revisit when:** `deepmerge` publishes a patched release, or `jest-config`
  drops or replaces the dependency. Dependabot alert #7 tracks this.

## Transitive dependency overrides

Two **dev-only** transitive packages are pinned above the ranges their
dependants declare, because no parent release accepts the fixed version yet:

| Override                | Required by                                                      | Advisory fixed                                            |
| ----------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| `glob` → `^14.0.4`      | `@jest/reporters`, `jest-config`, `jest-runtime`, `test-exclude`  | GHSA-3g3m-2fjr-6pw4 (CVE-2026-118773), patched in 14.0.2 |
| `minimatch` → `^11.0.5` | `glob`, `test-exclude`, `eslint`                                 | GHSA-g3hv-75wg-m249 (CVE-2026-118764), patched in 11.0.1  |

- **Why overrides and not upgrades:** Jest 30.5.2 (the latest) still asks for
  `glob@^13` and `test-exclude@^7`, and `test-exclude@8` still asks for
  `minimatch@^10`. Neither resolved tree clears the advisories, so the pinned
  versions are lifted in `package.json` until those releases catch up.
- **Why they move together:** `glob@13` reads `Minimatch#set` entries as regular
  expressions, which `minimatch@11` no longer produces. Pinning `minimatch`
  alone breaks Jest's file walking, so `glob` must be on `14` whenever
  `minimatch` is on `11`.
- **Why the exposure was limited anyway:** both advisories require
  attacker-controlled patterns or cancellation signals; the only consumers here
  are Jest's own test-file and coverage globs plus ESLint's config globs.
- **Revisit when:** Jest or ESLint ship dependency ranges that accept
  `glob@>=14.0.2` and `minimatch@>=11.0.1`; then the overrides can be dropped.
  `tests/scripts/dependency-advisories.test.js` fails if they are removed early.
