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

This is the most impactful contribution you can make! Each sport is a single adapter file:

1. Create `src/adapters/your-sport.js`
2. Export a `fetchData(teamAbbr)` function that returns `{ team, recentGames, record }`
3. Export `TEAM_EMOJI`, `TEAM_IDS`, and `getDemoData(teamAbbr)` for metadata and demo mode
4. Register the league in `src/config/leagues.js` (so it appears in the generated
   [team directory](TEAM_DIRECTORY.md) / [player directory](PLAYER_DIRECTORY.md)
   and supported-sports table)
5. Open a PR

See `src/adapters/nba.js` as the reference implementation.

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

## Code Style

- This project uses ESLint for linting
- Follow existing patterns in `src/`
- Use `const` over `let` — no `var`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
