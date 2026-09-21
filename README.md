# 🏆 readme-scoreboard

> Live sports stats on your GitHub profile README — place them wherever you want

[![CI](https://github.com/23seriy/readme-scoreboard/actions/workflows/ci.yml/badge.svg)](https://github.com/23seriy/readme-scoreboard/actions/workflows/ci.yml)
[![Latest release](https://img.shields.io/github/v/release/23seriy/readme-scoreboard)](https://github.com/23seriy/readme-scoreboard/releases)
[![License](https://img.shields.io/github/license/23seriy/readme-scoreboard)](LICENSE)
[![Stars](https://img.shields.io/github/stars/23seriy/readme-scoreboard?style=flat-square)](https://github.com/23seriy/readme-scoreboard)
[![Forks](https://img.shields.io/github/forks/23seriy/readme-scoreboard?style=flat-square)](https://github.com/23seriy/readme-scoreboard/network/members)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-readme--scoreboard-orange?logo=github&logoColor=white)](https://github.com/marketplace/actions/readme-scoreboard)

**Install it** by adding the action to a workflow (see [Quick start](#quick-start-3-steps)), or [ask a question](https://github.com/23seriy/readme-scoreboard/discussions), [report a bug](https://github.com/23seriy/readme-scoreboard/issues/new?template=bug_report.md), or [contribute](CONTRIBUTING.md). See [`SUPPORT.md`](SUPPORT.md) for where to get help.

## Project health

[![API health](https://github.com/23seriy/readme-scoreboard/actions/workflows/api-health.yml/badge.svg)](https://github.com/23seriy/readme-scoreboard/actions/workflows/api-health.yml)
[![Dependency health](https://github.com/23seriy/readme-scoreboard/actions/workflows/dependency-health.yml/badge.svg)](https://github.com/23seriy/readme-scoreboard/actions/workflows/dependency-health.yml)

The project currently supports **42 leagues**. The [support manifest](supported-leagues.json),
[team directory](TEAM_DIRECTORY.md), and [player directory](PLAYER_DIRECTORY.md) are generated
from the same registry used by the action.

<!-- league-list:start -->
Currently supports **NBA**, **MLB**, **NFL**, **NHL**, **MLS**, **Premier League**, **La Liga**, **Bundesliga**, **Serie A**, **Ligue 1**, **Primeira Liga**, **Eredivisie**, **WNBA**, **Liga MX**, **Brasileirão**, **NWSL**, **Saudi Pro League**, **J1 League**, **Scottish Premiership**, **Belgian Pro League**, **UEFA Champions League**, **UEFA Europa League**, **FIFA World Cup**, **NBA G League**, **NCAA Men's Basketball**, **NCAA Women's Basketball**, **College Football**, **NCAA Men's Ice Hockey**, **Formula 1**, **ATP Tennis**, **WTA Tennis**, **NASCAR Cup Series**, **IndyCar Series**, **Argentine Primera**, **A-League Men**, **Indian Super League**, **Chinese Super League**, **Greek Super League**, **Austrian Bundesliga**, **Danish Superliga**, **Norwegian Eliteserien**, and **Swedish Allsvenskan** with more sports coming soon
<!-- league-list:end -->

---

## See it in action

See a live example in the [23seriy profile README](https://github.com/23seriy/23seriy#-my-favourite-nba-team). The action keeps the scoreboard current automatically, including the league logo, team logo, record, recent games, and season status.

Want the same result? Start with the [three-step setup](#quick-start-3-steps), then add the workflow to your profile repository. You can preview the output first with `dry_run: true`.

## Examples

See rendered output from several sports and every input option without running
anything. Open the [examples gallery](examples/) to preview real boards (NBA,
MLB, NFL, NHL, Premier League, MLS, UEFA Champions League, College Football,
Formula 1, ATP Tennis, and WTA Tennis) plus demos of the `title:`, `teams:` (multi-team),
`compact:`, and `badge:` options. For every one of the 42 supported leagues,
see the [league showcase](examples/leagues/) — one file per league, built
from live data and refreshed daily, showing the default board plus the
`title:`, `compact:`, and `badge:` options. Or browse the league's
[workflow examples](LEAGUE_WORKFLOW_EXAMPLES.md) for a copy-ready step.

## Preview

This is what the action writes between your markers — heading, logos and all.
Live output for the Lakers (heading levels lowered by one so it nests here):

### <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nba.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nba.png" alt="NBA" height="28" align="top"></picture> My Favourite NBA Team

<img src="https://a.espncdn.com/i/teamlogos/nba/500/lal.png" width="72" align="right" />

#### 👑 Los Angeles Lakers (LAL)
Western Conference · Pacific Division
🔴 Off-season · Next season starts October 2026

📊 2025-2026 Record: 53W - 29L (64.6%)
   ████████████████▏░░░░░░░░

**📅 Recent Games:**
```
❌ L 110-115 vs OKC (May 11, 2026) [Playoffs]
❌ L 108-131 vs OKC (May 9, 2026) [Playoffs]
❌ L 107-125 @ OKC (May 7, 2026) [Playoffs]
❌ L  90-108 @ OKC (May 5, 2026) [Playoffs]
✅ W  98-78  @ HOU (May 1, 2026) [Playoffs]
```

---

## 30-second setup

1. Add two marker comments to your profile `README.md` ([details](#1-add-markers-to-your-profile-readme)).
2. Create a `GH_TOKEN` secret ([details](#2-create-secret)).
3. Paste a one-step workflow ([details](#3-add-the-workflow)).

That's it — the action keeps your scoreboard current. Want to see more before committing? Browse the [examples gallery](examples/) or set `dry_run: true`.

## Table of Contents

- [30-second setup](#30-second-setup)
- [Quick Start (3 steps)](#quick-start-3-steps)
  - [1. Add markers to your profile README](#1-add-markers-to-your-profile-readme)
  - [2. Create secret](#2-create-secret)
  - [3. Add the workflow](#3-add-the-workflow)
- [Project health](#project-health)
- [See it in action](#see-it-in-action)
- [Examples](#examples)
- [Preview](#preview)
- [Common setups](#common-setups)
- [Supported Sports](#supported-sports)
- [Team & Player Abbreviations](#team--player-abbreviations)
- [Customizing the board](#customizing-the-board)
- [Run Locally](#run-locally)
- [Adding a New Sport](#adding-a-new-sport)
- [Action Inputs (`with:`)](#action-inputs-with)
- [Action Outputs](#action-outputs)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Changelog](CHANGELOG.md)

---

## Quick Start (3 steps)

### 1. Add markers to your profile README

Your profile README lives in a public repository with the same name as your
GitHub username. If you do not have one yet, create it first.

In your `username/username` repo's `README.md`, add these markers wherever you want the stats to appear:

```md
<!-- readme-scoreboard-nba start -->
<!-- readme-scoreboard-nba end -->
```

The name is yours to choose — it just has to match the `marker:` on the workflow
step below.

You only add the markers — the action fills in everything between them,
including the section heading (`## My Favourite NBA Team`) and its league logo.

### 2. Create secret

Go to your profile repo **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `GH_TOKEN` | Fine-grained token with Contents: Read and write on the target repo ([create one](https://github.com/settings/personal-access-tokens/new)) |

For least-privilege access, create a fine-grained token, select **Only select
repositories**, choose your profile repository, and grant only
**Contents: Read and write**. Classic tokens with `repo` scope are also
supported, but they grant broader access than this action needs.

**That's all!** No sports-specific API keys needed — all adapters use free, no-auth public APIs (ESPN, MLB Stats API, NHL.com, etc).

### 3. Add the workflow

Create `.github/workflows/scoreboard.yml` in your profile repo:

```yaml
name: Update Scoreboard
on:
  schedule:
    - cron: "0 */6 * * *"  # Every 6 hours
  workflow_dispatch:        # Manual trigger
permissions:
  contents: write
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: nba
          team: LAL
          marker: readme-scoreboard-nba
```

Replace `nba`, `LAL`, and `readme-scoreboard-nba` with your league, team, and
marker from step 1. A manual **Run workflow** uses the same configuration as
the schedule. Done! The action updates your profile README through the GitHub
API, so no checkout or separate commit step is needed.

Need a different team? Use [Supported Sports](#supported-sports) to find the
league key, the generated [team directory](TEAM_DIRECTORY.md) to find the team
abbreviation (or the [player directory](PLAYER_DIRECTORY.md) for an individual
athlete), or [league workflow examples](LEAGUE_WORKFLOW_EXAMPLES.md) for a
copy-ready step.

For the first update, commit the workflow, open the **Actions** tab, select
**Update Scoreboard**, and choose **Run workflow**. When it finishes, refresh
your profile README to see the scoreboard.

#### Choose an update frequency

Use one of these simple schedule choices by changing the cron line:

| Frequency | Cron | Use when |
|-----------|------|----------|
| Every 6 hours | `0 */6 * * *` | You want scores refreshed throughout the day. |
| Daily | `0 12 * * *` | You want a lighter, once-a-day update. |
| Manual only | Remove `schedule` | You only want updates from **Run workflow**. |

To verify live API data without changing a README, set `dry_run: true`. Dry runs
still render the normal preview and job summary, but they do not require a token
or target repository.

Pin the action to a release tag (for example, `@v1`) for reproducible workflows,
or to a commit SHA after reviewing the release. Using `@main` follows the
latest changes and is best suited to trying upcoming features.

## Common setups

| Goal | What to use |
|------|-------------|
| One scoreboard | Add one marker pair and one action step with `sport` and `team`. |
| Several sports | Give every sport its own marker name, such as `readme-scoreboard-nba` and `readme-scoreboard-mlb`. |
| Another repository | Set `target_repo: owner/repository` and grant the token access to that repository. |
| Test before publishing | Set `dry_run: true`; the action renders the result without changing a README. |

### Understanding the season status

The Season column uses both a color and text so it remains understandable without
emoji support: **In progress** shows the season end date, while **Off-season**
shows the next season start date. Logos include descriptive alt text, and the
status text is the source of truth for screen readers.

#### Multiple sports in one README

Give each sport its own marker pair. Every step rewrites whatever sits between
its markers, so two sports sharing one pair means the second silently overwrites
the first. Add matching pairs to your README:

```md
<!-- readme-scoreboard-nba start -->
<!-- readme-scoreboard-nba end -->

<!-- readme-scoreboard-mlb start -->
<!-- readme-scoreboard-mlb end -->
```

Then add a step per sport with its matching `marker`:

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: nba
          team: LAL
          marker: readme-scoreboard-nba

      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: mlb
          team: NYY
          marker: readme-scoreboard-mlb
```

Once you use named markers, set one on **every** step — including the first.
A step left on the default `readme-scoreboard` will look for a pair by that
name, and fail the job if you renamed it. A missing marker also fails the job.

For a copy-ready step for any league, open the complete [league workflow examples](LEAGUE_WORKFLOW_EXAMPLES.md).

---

## Customizing the board

The board is generated between your markers, so you can shape it without editing
generated output.

### Pick your league and team

Not sure of the league key or team/player abbreviation? Open the generated
[team directory](TEAM_DIRECTORY.md) (or its machine-readable
[`team-directory.json`](team-directory.json)) to look up a league, abbreviation,
full name, and ID. For individual sports (ATP, WTA), use the generated
[player directory](PLAYER_DIRECTORY.md) (or its machine-readable
[`player-directory.json`](player-directory.json)). Constructor-based series
such as Formula 1 are team sports, so look those up in the team directory. The
[Supported Sports](#supported-sports)
table lists every league key and endpoint. Run `npm run doctor -- --demo` to validate
your choices locally before publishing.

### Compact output

Set `compact: true` to render a smaller block without the team logo or the
recent-games list — handy for a tighter profile:

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: nba
          team: LAL
          compact: true
```

### Multiple teams in one run

Set `teams:` to a comma-separated list to render several boards from a single
step (one board per team, joined with a divider):

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: nba
          teams: LAL, BOS, NYK
```

### Player spotlight

Feature a specific player's season line and last game alongside a team board with the `player:` input. Supported for `nba`, `wnba`, `ncaab`, `ncaaw`, `mlb`, `nfl`, `nhl`, and **every soccer league**.

```yaml
- uses: 23seriy/readme-scoreboard@v1
  with:
    sport: nba
    team: LAL
    player: "Luka Doncic"
    gh_token: ${{ secrets.GH_TOKEN }}
```

For MLB, add a batter's spotlight to a team board (e.g. Vladimir Guerrero Jr. on the Blue Jays):

```yaml
- uses: 23seriy/readme-scoreboard@v1
  with:
    sport: mlb
    team: TOR
    player: "Vladimir Guerrero Jr."
    gh_token: ${{ secrets.GH_TOKEN }}
```

Football and hockey work the same way:

```yaml
- uses: 23seriy/readme-scoreboard@v1
  with:
    sport: nfl
    team: KC
    player: "Patrick Mahomes"
    gh_token: ${{ secrets.GH_TOKEN }}
```

```yaml
- uses: 23seriy/readme-scoreboard@v1
  with:
    sport: nhl
    team: NYR
    player: "Artemi Panarin"
    gh_token: ${{ secrets.GH_TOKEN }}
```

The WNBA shares the NBA's athlete endpoints, so it works the same way:

```yaml
- uses: 23seriy/readme-scoreboard@v1
  with:
    sport: wnba
    team: MIN
    player: "Napheesa Collier"
    gh_token: ${{ secrets.GH_TOKEN }}
```

Every soccer league supports it too:

```yaml
- uses: 23seriy/readme-scoreboard@v1
  with:
    sport: epl
    team: ARS
    player: "Bukayo Saka"
    gh_token: ${{ secrets.GH_TOKEN }}
```

Match the player's full name exactly as it appears on the team's live roster. The match is case-insensitive but otherwise exact — every letter and any diacritic must match the league's roster spelling, so you need to check the roster's actual rendering. For example, the Lakers roster spells Luka as `Luka Doncic` (no `č`), so `player: "Luka Doncic"` is the value that matches (using `Luka Dončić` would not). If the name doesn't match, the run fails with an error listing the first few roster names, so you can copy the correct spelling.

Each sport's spotlight shows stats that fit the position:

| Sport | Season line | Last game |
|-------|-------------|-----------|
| `nba`, `wnba` | Points, rebounds, assists per game | Points, rebounds, assists, minutes |
| `mlb` | Batting average, home runs, RBIs | Hits, home runs, RBIs, batting average |
| `nfl` | Position-dependent — passing yards/TDs for a QB, rushing for a back, receiving for a receiver | The same position group's stats |
| `nhl` | Goals, assists, points for a skater; wins, GAA, save percentage for a goalie | Goals/assists/points, or saves/shots against for a goalie |
| soccer | Appearances, goals, assists | Goals, assists |

Every spotlight includes the opponent and game date, rendered in the league's timezone.

The spotlight also shows the player's **headshot**, right-aligned beside the heading, matching how the team logo sits beside the team board. The image is built from the athlete id the roster lookup already returns, so it needs no extra request or configuration:

```markdown
**👑 Player Spotlight: Luka Doncic**
<img src="https://a.espncdn.com/i/headshots/nba/players/full/3945274.png" alt="Luka Doncic headshot" width="72" align="right" />
33.5 PPG · 7.7 RPG · 8.3 APG
```

If the upstream feed doesn't supply an athlete id, the headshot is simply omitted and the board renders exactly as before. Headshots are never shown in `compact: true` mode, which stays text-only.

Soccer season totals are summed from the player's game log, because ESPN publishes no season-stats endpoint for soccer athletes. If ESPN has no game log for the chosen player yet — common in the off-season or in the first weeks of a season — the run fails with a clear "No season stats available" error rather than rendering a line of zeroes.

#### Leagues without player spotlight

Eight leagues intentionally don't support `player:`, either because the
upstream data isn't there or because the league has no athlete roster to
feature:

| Leagues | Reason |
|---------|--------|
| `ncaaf`, `gleague`, `ncaa_hockey` | ESPN publishes no per-athlete season stats — the stats endpoint 404s, and the game log is empty (for `ncaa_hockey` the gamelog 404s too). |
| `atp`, `wta`, `nascar`, `indycar` | These already render as a single player board (`entity: player`), so a spotlight inside one is redundant. |
| `f1` | It renders a constructor board from a teams endpoint and has no athlete roster, so there is no player to spotlight. |

The **WNBA** and **NCAA men's and women's basketball** used to be on this list. They aren't any more: ESPN now serves athletes the same `avgPoints`/`avgRebounds`/`avgAssists` splits payload and game log that the NBA uses, so `player:` works there too. If a league's upstream data changes, re-check the endpoints — the exclusions above are verified against the live APIs, not assumed.

`player:` isn't supported together with `teams:` (multiple boards in one run) — use a single `team:` instead. In `compact: true` mode, the spotlight collapses to a single stat line and drops the last-game details, matching how compact mode trims the rest of the board.

### Custom heading

Set `title:` to override the default "My Favourite `<League>` Team" heading:

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: nba
          team: LAL
          title: My Lakers Scoreboard
```

### Badge mode

Set `badge: true` to emit a compact shields-style badge row instead of the full
scoreboard block — useful when you want just a status chip:

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: nba
          teams: LAL, BOS
          badge: true
```

### Richer stats

Where the league API provides them, the board also shows the team's
**standing position**, its **next scheduled game**, and its **last-five form**
(`✅`/`➖`/`❌`). These lines appear automatically for supported leagues and are
omitted when a league doesn't supply the data, so existing boards stay clean.

### Preview without publishing

Set `dry_run: true` to fetch and render live data without touching a README. The
output is printed to the job log and step summary, so you can inspect it before
you commit to a live update.

---

## Supported Sports

All sports use **free, no-auth APIs** — no secrets required.

Most leagues come from ESPN's public `site.api.espn.com` endpoints — each link below opens the live team list for that league. MLB and the NHL have their own official APIs.

For a machine-readable support map, see [`supported-leagues.json`](supported-leagues.json). It lists every league, sport category, API source, team endpoint, logos, and season window.

For copy-ready workflow steps, see [league workflow examples](LEAGUE_WORKFLOW_EXAMPLES.md).

For team setup, use the generated [team directory](TEAM_DIRECTORY.md) or its machine-readable counterpart [`team-directory.json`](team-directory.json) to look up a league, abbreviation, full name, and ID. For individual athletes, use the [player directory](PLAYER_DIRECTORY.md) or [`player-directory.json`](player-directory.json). A daily workflow keeps these files current.

The **Season** column is refreshed daily by [`.github/workflows/update-season-status.yml`](.github/workflows/update-season-status.yml). It uses the league API's season window when available and falls back to the last known window during a temporary API outage. A separate [daily season-date verification workflow](.github/workflows/check-season-dates.yml) checks that normalized opening dates remain valid as leagues roll into new seasons; it reports drift without changing the README automatically.

<!-- supported-sports:start -->
| Sport | League | Key | Season | Endpoint |
|-------|--------|-----|--------|----------|
| 🏀&nbsp;Basketball | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nba.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nba.png" alt="NBA logo" height="20"></picture> NBA | `nba` | 🔴 Off-season · starts 2026-10-20 | [`basketball/nba`](https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams) |
| ⚾&nbsp;Baseball | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/mlb.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png" alt="MLB logo" height="20"></picture> MLB | `mlb` | 🟢 In progress · ends 2026-11-12 | [MLB Stats API](https://statsapi.mlb.com/api/v1/teams?sportId=1) |
| 🏈&nbsp;Football | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nfl.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png" alt="NFL logo" height="20"></picture> NFL | `nfl` | 🟢 In progress · ends 2027-02-16 | [`football/nfl`](https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams) |
| 🏒&nbsp;Hockey | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nhl.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png" alt="NHL logo" height="20"></picture> NHL | `nhl` | 🔴 Off-season · starts 2026-09-29 | [NHL Web API](https://api-web.nhle.com/v1/standings/now) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/19.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/19.png" alt="MLS logo" height="20"></picture> MLS | `mls` | 🟢 In progress · ends 2026-12-31 | [`soccer/usa.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/23.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/23.png" alt="Premier League logo" height="20"></picture> Premier League | `epl` | 🟢 In progress · ends 2027-06-01 | [`soccer/eng.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/15.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/15.png" alt="La Liga logo" height="20"></picture> La Liga | `laliga` | 🟢 In progress · ends 2027-06-01 | [`soccer/esp.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/10.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/10.png" alt="Bundesliga logo" height="20"></picture> Bundesliga | `bundesliga` | 🟢 In progress · ends 2027-07-01 | [`soccer/ger.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/12.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/12.png" alt="Serie A logo" height="20"></picture> Serie A | `seriea` | 🟢 In progress · ends 2027-07-01 | [`soccer/ita.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/9.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/9.png" alt="Ligue 1 logo" height="20"></picture> Ligue 1 | `ligue1` | 🟢 In progress · ends 2027-06-01 | [`soccer/fra.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/14.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/14.png" alt="Primeira Liga logo" height="20"></picture> Primeira Liga | `primeiraliga` | 🟢 In progress · ends 2027-07-01 | [`soccer/por.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/por.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/11.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/11.png" alt="Eredivisie logo" height="20"></picture> Eredivisie | `eredivisie` | 🟢 In progress · ends 2027-06-01 | [`soccer/ned.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/ned.1/teams) |
| 🏀&nbsp;Basketball | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/wnba.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/wnba.png" alt="WNBA logo" height="20"></picture> WNBA | `wnba` | 🟢 In progress · ends 2026-11-01 | [`basketball/wnba`](https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/22.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/22.png" alt="Liga MX logo" height="20"></picture> Liga MX | `ligamx` | 🟢 In progress · ends 2027-06-01 | [`soccer/mex.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/mex.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/85.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/85.png" alt="Brasileirão logo" height="20"></picture> Brasileirão | `brasileirao` | 🟢 In progress · ends 2026-12-31 | [`soccer/bra.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2323.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2323.png" alt="NWSL logo" height="20"></picture> NWSL | `nwsl` | 🟢 In progress · ends 2026-12-31 | [`soccer/usa.nwsl`](https://site.api.espn.com/apis/site/v2/sports/soccer/usa.nwsl/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2488.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2488.png" alt="Saudi Pro League logo" height="20"></picture> Saudi Pro League | `saudipro` | 🟢 In progress · ends 2027-07-01 | [`soccer/ksa.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/ksa.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2199.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2199.png" alt="J1 League logo" height="20"></picture> J1 League | `j1` | 🟢 In progress · ends 2027-07-01 | [`soccer/jpn.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/jpn.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/45.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/45.png" alt="Scottish Premiership logo" height="20"></picture> Scottish Premiership | `scottish` | 🟢 In progress · ends 2027-06-01 | [`soccer/sco.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/sco.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/6.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/6.png" alt="Belgian Pro League logo" height="20"></picture> Belgian Pro League | `belgian` | 🟢 In progress · ends 2027-07-01 | [`soccer/bel.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/bel.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2.png" alt="UEFA Champions League logo" height="20"></picture> UEFA Champions League | `ucl` | 🟢 In progress · ends 2027-07-01 | [`soccer/uefa.champions`](https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2310.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2310.png" alt="UEFA Europa League logo" height="20"></picture> UEFA Europa League | `uel` | 🟢 In progress · ends 2027-07-01 | [`soccer/uefa.europa`](https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/4.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/4.png" alt="FIFA World Cup logo" height="20"></picture> FIFA World Cup | `worldcup` | 🟢 In progress · ends 2026-12-31 | [`soccer/fifa.world`](https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams) |
| 🏀&nbsp;Basketball | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nba_gleague.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nba_gleague.png" alt="NBA G League logo" height="20"></picture> NBA G League | `gleague` | 🔴 Off-season · starts 2026-12-19 | [`basketball/nba-development`](https://site.api.espn.com/apis/site/v2/sports/basketball/nba-development/teams) |
| 🏀&nbsp;Basketball | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png"><img src="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png" alt="NCAA Men's Basketball logo" height="20"></picture> NCAA Men's Basketball | `ncaab` | 🔴 Off-season · starts 2026-11-02 | [`basketball/mens-college-basketball`](https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams) |
| 🏀&nbsp;Basketball | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png"><img src="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png" alt="NCAA Women's Basketball logo" height="20"></picture> NCAA Women's Basketball | `ncaaw` | 🔴 Off-season · starts 2026-11-02 | [`basketball/womens-college-basketball`](https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/teams) |
| 🏈&nbsp;Football | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-football-college.png"><img src="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-football-college.png" alt="College Football logo" height="20"></picture> College Football | `ncaaf` | 🟢 In progress · ends 2027-01-28 | [`football/college-football`](https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams) |
| 🏒&nbsp;Hockey | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-hockey.png"><img src="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-hockey.png" alt="NCAA Men's Ice Hockey logo" height="20"></picture> NCAA Men's Ice Hockey | `ncaa_hockey` | 🔴 Off-season · starts 2026-10-02 | [`hockey/mens-college-hockey`](https://site.api.espn.com/apis/site/v2/sports/hockey/mens-college-hockey/teams) |
| 🏆&nbsp;Racing | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/f1.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/f1.png" alt="Formula 1 logo" height="20"></picture> Formula 1 | `f1` | 🟢 In progress · ends 2026-12-31 | [`racing/f1`](https://site.api.espn.com/apis/site/v2/sports/racing/f1/teams) |
| 🎾&nbsp;Tennis | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-tennis.png"><img src="https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-tennis.png" alt="ATP Tennis logo" height="20"></picture> ATP Tennis | `atp` | 🟢 In progress · ends 2027-01-01 | [`tennis/atp`](https://site.api.espn.com/apis/site/v2/sports/tennis/atp/teams) |
| 🎾&nbsp;Tennis | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-tennis.png"><img src="https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-tennis.png" alt="WTA Tennis logo" height="20"></picture> WTA Tennis | `wta` | 🟢 In progress · ends 2027-01-01 | [`tennis/wta`](https://site.api.espn.com/apis/site/v2/sports/tennis/wta/teams) |
| 🏆&nbsp;Racing | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-NASCAR.png"><img src="https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-NASCAR.png" alt="NASCAR Cup Series logo" height="20"></picture> NASCAR Cup Series | `nascar` | 🟢 In progress · ends 2026-12-31 | [`racing/nascar-premier`](https://site.api.espn.com/apis/site/v2/sports/racing/nascar-premier/teams) |
| 🏆&nbsp;Racing | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/combiner/i?img=/i/espn/teamlogos/500/indycar_series.png"><img src="https://a.espncdn.com/combiner/i?img=/i/espn/teamlogos/500/indycar_series.png" alt="IndyCar Series logo" height="20"></picture> IndyCar Series | `indycar` | 🟢 In progress · ends 2026-12-31 | [`racing/irl`](https://site.api.espn.com/apis/site/v2/sports/racing/irl/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/1.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/1.png" alt="Argentine Primera logo" height="20"></picture> Argentine Primera | `argentina` | 🟢 In progress · ends 2026-12-31 | [`soccer/arg.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/1308.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/1308.png" alt="A-League Men logo" height="20"></picture> A-League Men | `aleague` | 🟢 In progress · ends 2027-07-01 | [`soccer/aus.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/aus.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2334.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2334.png" alt="Indian Super League logo" height="20"></picture> Indian Super League | `isl` | 🟢 In progress · ends 2027-07-01 | [`soccer/ind.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/ind.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2350.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2350.png" alt="Chinese Super League logo" height="20"></picture> Chinese Super League | `csl` | 🟢 In progress · ends 2026-12-31 | [`soccer/chn.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/chn.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500/98.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/98.png" alt="Greek Super League logo" height="20"></picture> Greek Super League | `greek` | 🟢 In progress · ends 2027-07-01 | [`soccer/gre.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/gre.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/5.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/5.png" alt="Austrian Bundesliga logo" height="20"></picture> Austrian Bundesliga | `austria` | 🟢 In progress · ends 2027-07-01 | [`soccer/aut.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/aut.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-soccer.png"><img src="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-soccer.png" alt="Danish Superliga logo" height="20"></picture> Danish Superliga | `denmark` | 🟢 In progress · ends 2027-07-01 | [`soccer/den.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/den.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-soccer.png"><img src="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-soccer.png" alt="Norwegian Eliteserien logo" height="20"></picture> Norwegian Eliteserien | `norway` | 🟢 In progress · ends 2026-12-31 | [`soccer/nor.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/nor.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500/16.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/16.png" alt="Swedish Allsvenskan logo" height="20"></picture> Swedish Allsvenskan | `sweden` | 🟢 In progress · ends 2026-12-01 | [`soccer/swe.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/swe.1/teams) |
<!-- supported-sports:end -->

---

## Team & Player Abbreviations

Looking up a team abbreviation? The generated [team directory](TEAM_DIRECTORY.md)
(and its machine-readable [`team-directory.json`](team-directory.json)) lists
every league in one place — name, abbreviation, and ID. For individual sports,
the [player directory](PLAYER_DIRECTORY.md) (and its machine-readable
[`player-directory.json`](player-directory.json)) does the same for players.
Both are refreshed daily by a scheduled workflow and are the single source of
truth, so this README no longer duplicates each league's roster inline.

## Run Locally

Requires **Node.js 24 or newer**. The version is pinned in [`.nvmrc`](.nvmrc), so `nvm use`
selects the right one, and `package.json` declares the same minimum so package managers warn on
an older runtime.

```bash
cp sample.env .env
# Fill in your values
npm install
npm start
```

Before a live run, check the configuration without making any API requests:

```bash
npm run doctor
```

For a preview configuration, use `npm run doctor -- --demo`. The doctor checks
the sport, team abbreviation, marker, and `target_repo` format and reports
several valid team examples when one is unknown.

### Demo Mode

Preview output without API keys:

```bash
SPORT=nba TEAM=LAL node src/index.js --demo
SPORT=mlb TEAM=NYY node src/index.js --demo
SPORT=nfl TEAM=KC node src/index.js --demo
SPORT=nhl TEAM=TOR node src/index.js --demo
SPORT=mls TEAM=MIA node src/index.js --demo
SPORT=epl TEAM=LIV node src/index.js --demo
SPORT=laliga TEAM=RMA node src/index.js --demo
SPORT=bundesliga TEAM=MUN node src/index.js --demo
SPORT=seriea TEAM=INT node src/index.js --demo
SPORT=ligue1 TEAM=PSG node src/index.js --demo
SPORT=primeiraliga TEAM=SLB node src/index.js --demo
SPORT=eredivisie TEAM=AJA node src/index.js --demo
SPORT=wnba TEAM=MIN node src/index.js --demo
SPORT=ligamx TEAM=AME node src/index.js --demo
SPORT=brasileirao TEAM=PAL node src/index.js --demo
SPORT=nwsl TEAM=GFC node src/index.js --demo
SPORT=saudipro TEAM=HIL node src/index.js --demo
SPORT=j1 TEAM=KAW node src/index.js --demo
SPORT=scottish TEAM=CEL node src/index.js --demo
SPORT=belgian TEAM=BRU node src/index.js --demo
SPORT=ucl TEAM=RMA node src/index.js --demo
SPORT=uel TEAM=MUN node src/index.js --demo
SPORT=worldcup TEAM=ARG node src/index.js --demo
SPORT=gleague TEAM=OSC node src/index.js --demo
SPORT=ncaab TEAM=ARIZ node src/index.js --demo
SPORT=ncaaw TEAM=UCONN node src/index.js --demo
SPORT=ncaaf TEAM=ALA node src/index.js --demo
SPORT=ncaa_hockey TEAM=BC node src/index.js --demo
SPORT=f1 TEAM=LP node src/index.js --demo
SPORT=atp TEAM=SIN node src/index.js --demo
SPORT=wta TEAM=SAB node src/index.js --demo
SPORT=nascar TEAM=HAM node src/index.js --demo
SPORT=indycar TEAM=PAL node src/index.js --demo
SPORT=argentina TEAM=RIV node src/index.js --demo
SPORT=aleague TEAM=MCY node src/index.js --demo
SPORT=isl TEAM=BFC node src/index.js --demo
SPORT=csl TEAM=SIPG node src/index.js --demo
SPORT=greek TEAM=OLY node src/index.js --demo
SPORT=austria TEAM=SLZ node src/index.js --demo
SPORT=denmark TEAM=KBH node src/index.js --demo
SPORT=norway TEAM=BODO node src/index.js --demo
SPORT=sweden TEAM=MAL node src/index.js --demo
```

### College competition examples

These ESPN college leagues have large, changing team directories. Use the
abbreviation shown by ESPN; the adapter discovers the current team list when
needed. Common examples:

| Competition | Sport input | Example team |
|---|---|---|
| NCAA Men's Basketball | `ncaab` | `ARIZ` (Arizona) |
| NCAA Women's Basketball | `ncaaw` | `UCONN` (Connecticut) |
| College Football | `ncaaf` | `ALA` (Alabama) |
| NCAA Men's Ice Hockey | `ncaa_hockey` | `BC` (Boston College) |

The corresponding ESPN directories are [men's basketball](https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams), [women's basketball](https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/teams), [college football](https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams), and [men's ice hockey](https://site.api.espn.com/apis/site/v2/sports/hockey/mens-college-hockey/teams).

When the action runs in GitHub Actions, it also adds a concise run summary to
the job with the sport, team, destination, and whether the README was updated
or skipped.

To refresh the generated tables after cloning this repository, run:

```bash
npm ci --ignore-scripts
npm run teams:directory
npm run teams:directory:markdown
npm run leagues:examples
npm run leagues:manifest
```

---

## Adding a New Sport

A league is one registry entry plus one adapter file, and the filename has to match
the league key — the action loads adapters with `require("./adapters/<key>")`.

1. Add the league to [`src/config/leagues.js`](src/config/leagues.js): key, name, category,
   endpoint, renderer, emoji, entity, logo, season window, and fallback. This one entry
   drives the supported-sports table, the manifest, and both generated directories.
2. Create `src/adapters/<key>.js`, extending the base class that matches the data source:
   `BaseSoccerAdapter` (soccer), `BaseEspnLeagueAdapter` (ESPN league endpoints),
   `BaseRacingDriverAdapter` (driver standings), or `BaseFreeApiAdapter` for a league with
   its own official API, such as the NHL or MLB.
3. Add tests under `tests/adapters/`, and add a `--demo` line to the list above so the
   league is covered by the local preview.
4. Only if the league needs its own rendering, add a case to `src/renderers/markdown.js`
   and set `renderer` in the registry entry to match.

Adapters come in two shapes and both are supported: a class instance
([`src/adapters/nhl.js`](src/adapters/nhl.js)) or a plain object
([`src/adapters/nba.js`](src/adapters/nba.js)). The base classes supply the contract —
`fetchData`, `getDemoData`, `getLogoUrl`, `TEAM_EMOJI`, `TEAM_IDS`, and `DEMO_TEAMS` —
plus the optional player-spotlight methods.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow, including the generated
files you may need to refresh.

---

## Action Inputs (`with:`)

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `gh_token` | Yes* | — | Token with Contents: Read and write on `target_repo` |
| `sport` | No | `nba` | League key (for example, `nba`). See [Supported Sports](#supported-sports). |
| `team` | Yes | — | Team or player abbreviation (e.g. `LAL`, `NYR`, `MIA`, or `SIN` for Jannik Sinner). Invalid abbreviations show example names. |
| `player` | No | — | Player full name to feature alongside the team board (e.g. `Luka Doncic` or `Napheesa Collier`); must match the roster's exact spelling, including any diacritics. Supported for `nba`, `wnba`, `ncaab`, `ncaaw`, `mlb`, `nfl`, `nhl` and every soccer league; not supported together with `teams:` (use `team:` instead). |
| `entity` | No | `team` | Entity type: `team` (default) or `player`. Inferred from the sport — individual sports like ATP Tennis and WTA Tennis default to `player`. |
| `teams` | No | — | Comma-separated team/player abbreviations to render multiple boards in one run (e.g. `LAL, NYY, ARS`). |
| `title` | No | `My Favourite <League> Team` | Custom heading text for the scoreboard (individual sports default to `<League> Player`). |
| `badge` | No | `false` | Render shields-style badges instead of a full scoreboard block. |
| `marker` | No | `readme-scoreboard` | HTML comment marker name. Must match a marker pair in your README, or the job fails. Give each sport a unique name — sharing one pair means the later step silently overwrites the earlier |
| `target_repo` | No | your profile repo | Repo to update, format: `owner/repo` |
| `dry_run` | No | `false` | Fetch and render live data without updating a README. Accepts `true`/`false` (also `1`/`0` or `yes`/`no`) |
| `compact` | No | `false` | Use a smaller block without team logos or recent-game details. Accepts `true`/`false` |

Inputs are validated before any API request or README update. If a team abbreviation
is not recognized, the action reports several valid abbreviations for that league;
`target_repo` must use the `owner/repository` format.

\* Required for live remote README updates. Not required in `--demo` or `dry_run` mode.

## Action Outputs

The action exposes outputs for downstream workflow steps:

| Output | Values | Description |
|--------|--------|-------------|
| `updated` | `true` / `false` | Whether the target README changed during this run |
| `mode` | `live`, `dry-run`, `preview` | How the action ran |
| `target_repo` | `owner/repo` or empty | Repository selected for the update |

For example, use `${{ steps.scoreboard.outputs.updated }}` after giving your
action step the id `scoreboard`.

Every successful update ends with a small `Last updated` timestamp. The action
only replaces the README after a successful data fetch, so a temporary API
outage leaves the last known scoreboard in place. The GitHub Actions summary
also reports the data source and generation time.

---

## Troubleshooting

| Message or symptom | What to check |
|---|---|
| `TEAM environment variable is required` | Set the `team` input, or run with `--demo` for a preview. |
| `Marker not found` | Add matching `start` and `end` marker comments to the target README and use the same `marker` value in the workflow. |
| `Could not update README` or a permission error | Confirm `GH_TOKEN` can read and write Contents in `target_repo`. |
| `TARGET_REPO must use the owner/repository format` | Use a value such as `23seriy/23seriy`, with exactly one `/`. |
| `Unsupported sport` or an unknown team | Check the supported-sports table and use the current abbreviation listed for that league. |

For a safe local check that makes no API requests, run `npm run doctor -- --demo`.

The repository also runs a daily API health check. It tests every supported league
endpoint independently, reports the affected league when a request fails, and
continues checking the remaining leagues so one outage does not hide others. A
failure report also includes the slowest response time to help spot degradation.
The same job verifies every league logo: each one has to resolve, and to match the
logo ESPN reports for that league, so neither a broken image nor the wrong
competition's artwork reaches these pages unnoticed.

A weekly [dependency-health workflow](.github/workflows/dependency-health.yml)
runs the full test suite, lint, and a high-severity security audit. It reports
outdated packages without changing the repository automatically.

## License

MIT
