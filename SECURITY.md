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

