# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Because this is a GitHub Action rather than a library, "breaking" means a change
that would alter what appears in your README or require editing your workflow.

## [Unreleased]

### Added

- **Entity typing**: sports now declare whether they track a `team` or a
  `player`. Individual sports like **ATP Tennis** and **Formula 1** default to
  `player`, so boards read "My Favourite ATP Tennis Player" and validations say
  "player abbreviation". The `entity` input lets you override the inferred type.
- **ATP Tennis** support: an individual-sport board showing a ranked player's
  world ranking, ranking points, movement, and most recent match result. A new
  `atp` adapter reads the free ESPN ATP rankings endpoint and the player's
  latest competition (opponent, result, set scores), and a new `renderAtp`
  renders the board.

### Changed

- Added a generated **player directory** ([PLAYER_DIRECTORY.md](PLAYER_DIRECTORY.md)
  and its machine-readable [`player-directory.json`](player-directory.json)),
  mirroring the team directory for individual sports. It lists player
  abbreviations, names, and IDs so individual-sport boards (ATP) can be looked
  up the same way team boards use the team directory. The daily directory
  refresh workflow regenerates it alongside the team directory.
- Removed the huge per-league team abbreviation tables from the README. The
  generated [team directory](TEAM_DIRECTORY.md) is now the single source of
  truth for team names, abbreviations, and IDs, so the README no longer
  duplicates each league's roster inline (README shrank from ~2000 to ~550
  lines). The college roster automation workflow and scripts were retired in
  favor of the daily team-directory refresh.

## [1.8.2] - 2026-08-30

### Added

- **Argentine Primera** support: a new `argentina` soccer adapter reusing the
  shared soccer base (single-table standings, record, and richer stats).
- Expanded the [examples gallery](examples/): boards for MLB, UEFA Champions
  League, College Football, and Formula 1, plus demos of the `title:`, `teams:`
  (multi-team), `compact:`, and `badge:` options.

### Changed

- The generated [team directory](TEAM_DIRECTORY.md) now pulls the **complete**
  live roster for collegiate and UEFA tournament leagues, so it no longer shows
  just the handful of hardcoded teams.
- Removed the redundant last-five `🔥 Form:` line from the board: the Recent
  Games list already shows the W/L/D sequence.
- Fixed the MLB "next game" showing a stale postponed game (e.g. "Apr 3") by
  fetching the upcoming schedule and only treating genuinely future games as
  the next opponent.
- Corrected the supported-league count to 29.
- The README GitHub Marketplace badge and install line now point at the
  repository; a tip explains how to publish the action so the Marketplace
  listing appears.
- Added the required `author` field to `action.yml` so the action can be
  published to the GitHub Marketplace.

## [1.8.1] - 2026-08-30

### Fixed

- Repaired the invalid `action.yml` YAML that broke opening the action. The
  composite `env:` block had over-indented `TEAMS`/`TITLE`/`BADGE` mappings and
  was missing `MARKER`/`TARGET_REPO`/`DRY_RUN`/`COMPACT`, so the GitHub Actions
  manifest loader rejected the action. All 10 env mappings now sit at a
  consistent level.

## [1.8.0] - 2026-08-29

### Added

- **Formula 1** support: constructor championship position and points on the
  board via a new `f1` adapter and renderer.
- Extended the richer board output (standing position, next game, last-five
  form) to the remaining leagues: WNBA, NBA G League, MLB, and NHL.

## [1.7.0] - 2026-08-29

### Added

- Generated examples gallery under `examples/` (with `npm run examples:generate`)
  and a `SUPPORT.md` getting-help guide.
- GitHub Marketplace, stars, and forks badges plus a Marketplace/Discussions
  callout at the top of the README.
- A "30-second setup" quick-start box and a "Customizing the board" section
  documenting `compact` and `dry_run`.
- `teams:` input to render multiple scoreboards in a single action run.
- `title:` input to customize the scoreboard heading.
- `badge:` input to render shields-style badges instead of a full block.
- Richer board output: league/standing position, the next scheduled game, and
  last-five form (W/D/L), shown for supported leagues.

### Fixed

- Team-directory generation no longer writes `null` team names when a live
  name lookup fails or omits a name; it falls back to demo data and finally the
  abbreviation so the generated directory never shows an empty cell.

### Changed

- `action.yml` input descriptions clarified (team, token, marker, target repo).
- README team-abbreviation section links to the generated `TEAM_DIRECTORY.md`
  as the single searchable source of truth.

## [1.6.0] - 2026-08-20

### Added

- Live dry-run mode, step outputs, and workflow-dispatch inputs for easier
  testing and automation.
- Daily API and season-date verification, including regular-season opening-date
  checks for supported leagues.

### Changed

- README examples now target the versioned `@v1` action release and document
  fine-grained token permissions.
- Maintenance updates use strict live-date checks, serialized branches, safe
  fetches, and bounded workflow runtimes.

### Fixed

- League logos, heading alt text, and season-year rollover handling across the
  generated README output.

## [1.5.0] - 2026-08-19

### Added

- All-adapter demo smoke tests and a scheduled API health check workflow.
- `npm run doctor` for local configuration and connectivity diagnostics.
- GitHub Actions step summaries for generated README output and run results.

### Changed

- Shared API requests now use bounded timeouts and retries across adapters and
  maintenance scripts.
- Action inputs are validated before a run can modify a README.
- Maintenance workflows serialize updates to avoid competing README changes.

### Fixed

- README league headings and registry links are checked for complete logos,
  accessible alt text, and supported endpoints.

## [1.4.0] - 2026-08-18

### Added

- Weekly automation for refreshing NCAA team abbreviation tables from ESPN.
- Safer README update retries and serialized maintenance workflows.

### Changed

- Action metadata now documents every supported league and installs production
  dependencies with the locked package file.

## [1.3.0] - 2026-08-14

Five new leagues, and the generated block now includes its own section heading.

### Added

- **Primeira Liga** (`primeiraliga`) — 18 clubs ([#61])
- **Eredivisie** (`eredivisie`) — 18 clubs ([#66])
- **WNBA** (`wnba`) — 15 teams, the first non-soccer league since the NBA and the
  first women's league. Standalone adapter: single-year season, conferences but
  no divisions, and playoff tagging via a separate schedule fetch ([#67])
- **Liga MX** (`ligamx`) — 18 clubs. Plays two 17-match tournaments a year
  (Apertura and Clausura), so the season label stays within one calendar year and
  the standings group names the current tournament ([#68])
- **Brasileirão** (`brasileirao`) — 20 clubs ([#69])
- The section heading (`## My Favourite <League> Team`, with the league logo) is
  now rendered **inside** the marker block, so the whole section is generated
  rather than half-authored by hand ([#65])

### Fixed

- The NHL entry in the Supported Sports table linked to a URL that returned
  **404**. Every league now links to an endpoint that returns real data ([#70])
- The Supported Sports table linked "ESPN API" to the ESPN homepage 13 times;
  it now shows each league's actual endpoint path ([#70])

### Documentation

- Explained that **each sport needs its own marker pair**. Two sports sharing one
  pair caused the second to silently overwrite the first, with no error ([#62])
- Added the missing `marker` input to the MLB, NFL, NHL and Quick Start examples,
  which previously demonstrated the overwrite bug they now warn about ([#63])

## [1.2.0] - 2026-08-09

### Added

- **Premier League** (`epl`) — 20 clubs, with W/L/D records, points (W×3 + D) and
  draws marked 🟡 ([#51])
- `BaseSoccerAdapter`, shared by every soccer league. MLS dropped to a 39-line
  data file, and each new league since has been roughly 35 lines ([#51])
- League logos in the README section headings and the sports table ([#52])

### Fixed

- **Team logos were broken across four of five sports.** The NBA CDN returned 403
  for all 30 teams, MLB's `.png` path 404'd for all 30, several MLS clubs pointed
  at other clubs' crests, and three NHL abbreviations (`NJ`, `SJ`, `TB`) don't
  match the CDN's spelling. All now verified working ([#48], [#49])
- Off-season status reported next season a year late on the eve of kickoff — it
  compared only the month, so Aug 8 with an Aug 10 start read "August 2027" ([#51])

### Changed

- Logo construction moved out of `index.js` into a `getLogoUrl()` on each adapter,
  so per-sport quirks live with the sport that owns them ([#49])

## [1.1.0] - 2026-08-05

### Added

- **MLS** (`mls`), including draw handling — the first sport where a game can end
  in neither a win nor a loss
- `[Playoffs]` tag on postseason games, across all sports
- Season status line (🟢 in progress / 🔴 off-season with the next start date)
- Year included in recent-game dates

### Changed

- **NBA moved from BallDontLie to ESPN's free API, removing the last API key.**
  Every sport now uses a free, no-auth source, and the `api_key` action input is
  gone

### Fixed

- NBA season label used the wrong year — ESPN's season number is the *end* year
- MLB records read from the standings API rather than counted game by game, which
  had missed doubleheaders
- NHL off-season detection now falls back to the previous season
- Pre-season games excluded, playoff games included, across all sports

## [1.0.0] - 2026-07-31

Initial release.

### Added

- NBA, MLB, NFL and NHL scoreboards, written between HTML comment markers in your
  profile README
- `marker` input, so multiple scoreboards can live in one README
- Team abbreviation tables and demo mode (`--demo`)

[Unreleased]: https://github.com/23seriy/readme-scoreboard/compare/v1.6.0...HEAD
[1.6.0]: https://github.com/23seriy/readme-scoreboard/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/23seriy/readme-scoreboard/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/23seriy/readme-scoreboard/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/23seriy/readme-scoreboard/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/23seriy/readme-scoreboard/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/23seriy/readme-scoreboard/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/23seriy/readme-scoreboard/releases/tag/v1.0.0

[#48]: https://github.com/23seriy/readme-scoreboard/pull/48
[#49]: https://github.com/23seriy/readme-scoreboard/pull/49
[#51]: https://github.com/23seriy/readme-scoreboard/pull/51
[#52]: https://github.com/23seriy/readme-scoreboard/pull/52
[#61]: https://github.com/23seriy/readme-scoreboard/pull/61
[#62]: https://github.com/23seriy/readme-scoreboard/pull/62
[#63]: https://github.com/23seriy/readme-scoreboard/pull/63
[#65]: https://github.com/23seriy/readme-scoreboard/pull/65
[#66]: https://github.com/23seriy/readme-scoreboard/pull/66
[#67]: https://github.com/23seriy/readme-scoreboard/pull/67
[#68]: https://github.com/23seriy/readme-scoreboard/pull/68
[#69]: https://github.com/23seriy/readme-scoreboard/pull/69
[#70]: https://github.com/23seriy/readme-scoreboard/pull/70
