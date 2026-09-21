# Contributing to readme-scoreboard

Thanks for your interest in contributing! Here's how you can help.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a branch for your change: `git checkout -b feat/your-feature`
4. Install dependencies: `npm ci --ignore-scripts`
5. Make your changes
6. Run the checks: `npm test -- --runInBand && npm run lint`
7. Test with demo mode: `SPORT=nba TEAM=LAL node src/index.js --demo`
8. Commit and push your branch
9. Open a Pull Request

## Adding a New Sport

This is the most impactful contribution you can make! Each league is one registry
entry plus one adapter file:

1. Register the league in `src/config/leagues.js` (key, name, category, endpoint,
   renderer, emoji, entity, logo, season window, fallback) so it appears in the generated
   [team directory](TEAM_DIRECTORY.md) / [player directory](PLAYER_DIRECTORY.md)
   and supported-sports table
2. Create `src/adapters/<key>.js`. The filename must match the registry key, because
   `src/index.js` resolves adapters as `require("./adapters/" + sport)`
3. Extend the base class that matches the data source: `BaseSoccerAdapter`,
   `BaseEspnLeagueAdapter`, `BaseRacingDriverAdapter`, or `BaseFreeApiAdapter` for a
   league with its own official API
4. Export either a class instance or a plain object — both satisfy the adapter contract,
   which covers `fetchData`, `getDemoData`, `getLogoUrl`, `TEAM_EMOJI`, `TEAM_IDS`, and
   `DEMO_TEAMS`
5. Add tests under `tests/adapters/`, and a `--demo` line to the README's demo list
6. Open a PR

See `src/adapters/nhl.js` (class instance) and `src/adapters/nba.js` (plain object) as
reference implementations.

## Generated README Sections

The supported-sports table, season status, league manifest, team directory, and
player directory are generated from the league registry and public API data.
Keep generated sections intact when editing documentation; update the source
configuration or generator instead of hand-editing a generated table.

Use these commands when changing generated content:

```bash
node scripts/update-season-status.js
npm run leagues:manifest
npm run teams:directory
npm run teams:directory:markdown
npm run players:directory
npm run players:directory:markdown
```

The season and team-directory workflows publish their changes separately. A
pull request that changes an adapter or league metadata should include the
corresponding tests and a `--demo` verification rather than a copied API
response.

The generated [`supported-leagues.json`](supported-leagues.json) file is the
machine-readable catalog for integrations that need league keys, endpoints,
logos, and season windows.

## Development

### Prerequisites

- Node.js 24+
- npm

### Running Locally

```bash
cp sample.env .env
# Fill in your values
npm ci --ignore-scripts
npm run docs:check
npm test -- --runInBand
npm run lint
npm start
```

### Demo Mode

Preview output without API keys:

```bash
SPORT=nba TEAM=BOS node src/index.js --demo
```

## Pull Request Guidelines

- Keep PRs focused on a single change
- Run `npm run lint` before submitting
- Update the README if your change affects usage
- Add a clear description of what your PR does
- Include tests for new behavior and confirm the full local checks pass

## Releasing

Maintainers cut releases from `main`. The version in `package.json`, the
`## [x.y.z]` heading in [`CHANGELOG.md`](CHANGELOG.md), and the Git tag must all
agree.

1. Open a release prep PR:

   ```bash
   git checkout main && git pull
   git checkout -b chore/prepare-vX.Y.Z-release
   npm version X.Y.Z --no-git-tag-version   # bumps package.json and package-lock.json
   ```

2. Move the `## [Unreleased]` entries under a new `## [X.Y.Z] - YYYY-MM-DD`
   heading, point the `[Unreleased]` compare link at `vX.Y.Z...HEAD`, and add the
   new `[X.Y.Z]` link. Leave an empty `## [Unreleased]` at the top.

   The version bump and the CHANGELOG heading must land in the **same commit**.
   `tests/readme-links.test.js` ("keeps the release metadata and v1 alias
   workflow aligned") fails when `package.json`'s version has no matching
   heading below `## [Unreleased]`.

3. Merge the prep PR, then publish the release:

   ```bash
   gh release create vX.Y.Z --target "$(git rev-parse <release-prep-commit>)" \
     --title "vX.Y.Z — <summary>" --notes-file notes.md
   ```

   `--target` accepts a branch name or a **full** commit SHA; a short SHA is
   rejected with `422 target_commitish is invalid`. Point it at the release prep
   commit — the one whose `package.json` carried `X.Y.Z`.

4. `.github/workflows/release.yml` runs on `release: published` and force-moves
   the `v1` major alias to the new tag, which is how `uses: 23seriy/readme-scoreboard@v1`
   picks up the release. It ignores non-semver tags and serializes concurrent
   releases through its `release-major-tag` concurrency group.

Publish in version order: the `v1` alias ends up on whichever release is
published last. Write the notes in prose for people using the action — what
changed for them, plus any input changes — rather than pasting the changelog
section verbatim.

## Code Style

- This project uses ESLint for linting
- Follow existing patterns in `src/`
- Use `const` over `let` — no `var`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
