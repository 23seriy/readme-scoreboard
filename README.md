# 🏆 readme-scoreboard

> Live sports stats on your GitHub profile README — place them wherever you want

[![CI](https://github.com/23seriy/readme-scoreboard/actions/workflows/ci.yml/badge.svg)](https://github.com/23seriy/readme-scoreboard/actions/workflows/ci.yml)
[![Latest release](https://img.shields.io/github/v/release/23seriy/readme-scoreboard)](https://github.com/23seriy/readme-scoreboard/releases)
[![License](https://img.shields.io/github/license/23seriy/readme-scoreboard)](LICENSE)

Currently supports **NBA**, **MLB**, **NFL**, **NHL**, **MLS**, the **Premier League**, **La Liga**, the **Bundesliga**, **Serie A**, **Ligue 1**, the **Primeira Liga**, the **Eredivisie**, the **WNBA**, **Liga MX**, the **Brasileirão**, the **NWSL**, the **Saudi Pro League**, **J1 League**, **Scottish Premiership**, **Belgian Pro League**, **UEFA Champions League**, **UEFA Europa League**, the **NBA G League**, **NCAA Men's Basketball**, **NCAA Women's Basketball**, **College Football**, and **NCAA Men's Ice Hockey** with more sports coming soon

---

## See it in action

See a live example in the [23seriy profile README](https://github.com/23seriy/23seriy). The action keeps the scoreboard current automatically, including the league logo, team logo, record, recent games, and season status.

Want the same result? Start with the [three-step setup](#quick-start-3-steps), then add the workflow to your profile repository. You can preview the output first with `dry_run: true`.

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

## Table of Contents

- [Quick Start (3 steps)](#quick-start-3-steps)
  - [1. Add markers to your profile README](#1-add-markers-to-your-profile-readme)
  - [2. Create secret](#2-create-secret)
  - [3. Add the workflow](#3-add-the-workflow)
- [See it in action](#see-it-in-action)
- [Common setups](#common-setups)
- [Supported Sports](#supported-sports)
- [Team Abbreviations](#team-abbreviations)
  - [NBA](#-nba-team-abbreviations)
  - [MLB](#-mlb-team-abbreviations)
  - [NFL](#-nfl-team-abbreviations)
  - [NHL](#-nhl-team-abbreviations)
  - [MLS](#-mls-team-abbreviations)
  - [Premier League](#-premier-league-team-abbreviations)
  - [La Liga](#-la-liga-team-abbreviations)
  - [Bundesliga](#-bundesliga-team-abbreviations)
  - [Serie A](#-serie-a-team-abbreviations)
  - [Ligue 1](#-ligue-1-team-abbreviations)
  - [Primeira Liga](#-primeira-liga-team-abbreviations)
  - [Eredivisie](#-eredivisie-team-abbreviations)
  - [WNBA](#-wnba-team-abbreviations)
  - [Liga MX](#-liga-mx-team-abbreviations)
  - [Brasileirão](#-brasileirão-team-abbreviations)
  - [NWSL](#-nwsl-team-abbreviations)
  - [Saudi Pro League](#-saudi-pro-league-team-abbreviations)
  - [J1 League](#-j1-league-team-abbreviations)
  - [Scottish Premiership](#scottish-premiership-team-abbreviations)
  - [Belgian Pro League](#belgian-pro-league-team-abbreviations)
  - [UEFA Champions League](#uefa-champions-league-team-abbreviations)
  - [UEFA Europa League](#uefa-europa-league-team-abbreviations)
  - [NBA G League](#-nba-g-league-team-abbreviations)
  - [NCAA Men's Basketball](#ncaa-mens-basketball-team-abbreviations)
  - [NCAA Women's Basketball](#ncaa-womens-basketball-team-abbreviations)
  - [College Football](#college-football-team-abbreviations)
  - [NCAA Men's Ice Hockey](#ncaa-mens-ice-hockey-team-abbreviations)
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

In your `username/username` repo's `README.md`, add these markers wherever you want the stats to appear:

```md
<!-- readme-scoreboard-nba start -->
<!-- readme-scoreboard-nba end -->
```

The name is yours to choose — it just has to match the `marker:` on the workflow
step below. Naming it after the sport keeps things clear once you add a second one.

**Tracking more than one sport? Give each its own marker pair.** Every step
rewrites whatever sits between its markers, so two sports sharing one pair means
the second silently overwrites the first — with no error. Add a pair per sport and
point each step at it with `marker:`:

```md
<!-- readme-scoreboard-nba start -->
<!-- readme-scoreboard-nba end -->

<!-- readme-scoreboard-mlb start -->
<!-- readme-scoreboard-mlb end -->
```

A step whose marker is missing from the README fails the job.

You only add the marker pairs — the action fills in everything between them,
including the section heading (`## My Favourite NBA Team`) and its league logo.

### 2. Create secret

Go to your profile repo **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `GH_TOKEN` | Fine-grained token with Contents: Read and write on the target repo ([create one](https://github.com/settings/personal-access-tokens/new)) |

For least-privilege access, create a fine-grained token, select **Only select
repositories**, choose the repository named by `target_repo`, and grant only
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
    inputs:
      sport:
        description: "League key (for example, nba or nhl)"
        required: true
        default: nba
      team:
        description: "Team abbreviation (for example, LAL or TOR)"
        required: true
        default: LAL
      marker:
        description: "README marker (for example, readme-scoreboard-nba)"
        required: true
        default: readme-scoreboard-nba
permissions:
  contents: write
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: ${{ inputs.sport || 'nba' }}
          team: ${{ inputs.team || 'LAL' }}
          marker: ${{ inputs.marker || 'readme-scoreboard-nba' }}
```

Scheduled runs use the NBA/LAL defaults above. When you choose **Run workflow**
in GitHub, the inputs let you select a different supported league, team, and
README marker without editing the file. Set the marker to the pair you added in
step 1; each sport should have its own marker. Done! The action updates your profile
README through the GitHub API, so no checkout or separate commit step is needed.

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

Add a step per sport, each with a `marker` matching a pair in your README:

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: nba
          team: LAL
          marker: readme-scoreboard-nba

      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: mlb
          team: NYY
          marker: readme-scoreboard-mlb
```

Once you use named markers, set one on **every** step — including the first.
A step left on the default `readme-scoreboard` will look for a pair by that
name, and fail the job if you renamed it.

#### MLB Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: mlb
          team: NYY
          marker: readme-scoreboard-mlb
```

#### NFL Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: nfl
          team: KC
          marker: readme-scoreboard-nfl
```

#### NHL Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: nhl
          team: NYR
          marker: readme-scoreboard-nhl
```

#### MLS Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: mls
          team: MIA
          marker: readme-scoreboard-mls
```

#### Premier League Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: epl
          team: LIV
          marker: readme-scoreboard-epl
```

#### La Liga Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: laliga
          team: RMA
          marker: readme-scoreboard-laliga
```

#### Bundesliga Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: bundesliga
          team: MUN
          marker: readme-scoreboard-bundesliga
```

#### Serie A Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: seriea
          team: INT
          marker: readme-scoreboard-seriea
```

#### Ligue 1 Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: ligue1
          team: PSG
          marker: readme-scoreboard-ligue1
```

#### Primeira Liga Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: primeiraliga
          team: SLB
          marker: readme-scoreboard-primeiraliga
```

#### Eredivisie Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: eredivisie
          team: AJA
          marker: readme-scoreboard-eredivisie
```

#### WNBA Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: wnba
          team: MIN
          marker: readme-scoreboard-wnba
```

#### Liga MX Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: ligamx
          team: AME
          marker: readme-scoreboard-ligamx
```

#### Brasileirão Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: brasileirao
          team: PAL
          marker: readme-scoreboard-brasileirao
```

#### NWSL Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: nwsl
          team: GFC
          marker: readme-scoreboard-nwsl
```

#### Saudi Pro League Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: saudipro
          team: HIL
          marker: readme-scoreboard-saudipro
```

#### J1 League Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: j1
          team: KAW
          marker: readme-scoreboard-j1
```

#### NBA G League Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: gleague
          team: OSC
          marker: readme-scoreboard-gleague
```

#### Scottish Premiership Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: scottish
          team: CEL
          marker: readme-scoreboard-scottish
```

#### Belgian Pro League Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: belgian
          team: BRU
          marker: readme-scoreboard-belgian
```

#### UEFA Champions League Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: ucl
          team: RMA
          marker: readme-scoreboard-ucl
```

#### UEFA Europa League Example

```yaml
      - uses: 23seriy/readme-scoreboard@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          target_repo: 23seriy/23seriy
          sport: uel
          team: MUN
          marker: readme-scoreboard-uel
```

---

## Supported Sports

All sports use **free, no-auth APIs** — no secrets required.

Most leagues come from ESPN's public `site.api.espn.com` endpoints — each link below opens the live team list for that league. MLB and the NHL have their own official APIs.

The **Season** column is refreshed daily by [`.github/workflows/update-season-status.yml`](.github/workflows/update-season-status.yml). It uses the league API's season window when available and falls back to the last known window during a temporary API outage. A separate [daily season-date verification workflow](.github/workflows/check-season-dates.yml) checks that normalized opening dates remain valid as leagues roll into new seasons; it reports drift without changing the README automatically.

<!-- supported-sports:start -->
| Sport | League | Season | Endpoint |
|-------|--------|--------|----------|
| 🏀&nbsp;Basketball | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nba.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nba.png" alt="NBA logo" height="20"></picture> NBA | 🔴 Off-season · starts 2026-10-20 | [`basketball/nba`](https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams) |
| ⚾&nbsp;Baseball | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/mlb.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png" alt="MLB logo" height="20"></picture> MLB | 🟢 In progress · ends 2026-11-12 | [MLB Stats API](https://statsapi.mlb.com/api/v1/teams?sportId=1) |
| 🏈&nbsp;Football | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nfl.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png" alt="NFL logo" height="20"></picture> NFL | 🔴 Off-season · starts 2026-09-09 | [`football/nfl`](https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams) |
| 🏒&nbsp;Hockey | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nhl.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png" alt="NHL logo" height="20"></picture> NHL | 🔴 Off-season · starts 2026-09-29 | [NHL Web API](https://api-web.nhle.com/v1/standings/now) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/19.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/19.png" alt="MLS logo" height="20"></picture> MLS | 🟢 In progress · ends 2026-12-31 | [`soccer/usa.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/23.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/23.png" alt="Premier League logo" height="20"></picture> Premier League | 🔴 Off-season · starts 2026-08-21 | [`soccer/eng.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/15.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/15.png" alt="La Liga logo" height="20"></picture> La Liga | 🟢 In progress · ends 2027-06-01 | [`soccer/esp.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/10.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/10.png" alt="Bundesliga logo" height="20"></picture> Bundesliga | 🔴 Off-season · starts 2026-08-28 | [`soccer/ger.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/12.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/12.png" alt="Serie A logo" height="20"></picture> Serie A | 🔴 Off-season · starts 2026-08-22 | [`soccer/ita.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/9.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/9.png" alt="Ligue 1 logo" height="20"></picture> Ligue 1 | 🔴 Off-season · starts 2026-08-23 | [`soccer/fra.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/14.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/14.png" alt="Primeira Liga logo" height="20"></picture> Primeira Liga | 🟢 In progress · ends 2027-07-01 | [`soccer/por.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/por.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/11.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/11.png" alt="Eredivisie logo" height="20"></picture> Eredivisie | 🟢 In progress · ends 2027-06-01 | [`soccer/ned.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/ned.1/teams) |
| 🏀&nbsp;Basketball | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/wnba.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/wnba.png" alt="WNBA logo" height="20"></picture> WNBA | 🟢 In progress · ends 2026-10-20 | [`basketball/wnba`](https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/22.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/22.png" alt="Liga MX logo" height="20"></picture> Liga MX | 🟢 In progress · ends 2027-06-01 | [`soccer/mex.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/mex.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/85.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/85.png" alt="Brasileirão logo" height="20"></picture> Brasileirão | 🟢 In progress · ends 2026-12-31 | [`soccer/bra.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2323.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2323.png" alt="NWSL logo" height="20"></picture> NWSL | 🟢 In progress · ends 2026-12-31 | [`soccer/usa.nwsl`](https://site.api.espn.com/apis/site/v2/sports/soccer/usa.nwsl/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2488.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2488.png" alt="Saudi Pro League logo" height="20"></picture> Saudi Pro League | 🟢 In progress · ends 2027-07-01 | [`soccer/ksa.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/ksa.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2199.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2199.png" alt="J1 League logo" height="20"></picture> J1 League | 🟢 In progress · ends 2027-07-01 | [`soccer/jpn.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/jpn.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/45.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/45.png" alt="Scottish Premiership logo" height="20"></picture> Scottish Premiership | 🟢 In progress · ends 2027-06-01 | [`soccer/sco.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/sco.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/6.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/6.png" alt="Belgian Pro League logo" height="20"></picture> Belgian Pro League | 🟢 In progress · ends 2027-07-01 | [`soccer/bel.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/bel.1/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2.png" alt="UEFA Champions League logo" height="20"></picture> UEFA Champions League | 🔴 Off-season · starts 2027-07-07 | [`soccer/uefa.champions`](https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/teams) |
| ⚽&nbsp;Soccer | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2310.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2310.png" alt="UEFA Europa League logo" height="20"></picture> UEFA Europa League | 🔴 Off-season · starts 2027-07-09 | [`soccer/uefa.europa`](https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/teams) |
| 🏀&nbsp;Basketball | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nba_gleague.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nba_gleague.png" alt="NBA G League logo" height="20"></picture> NBA G League | 🔴 Off-season · starts 2026-12-19 | [`basketball/nba-development`](https://site.api.espn.com/apis/site/v2/sports/basketball/nba-development/teams) |
| 🏀&nbsp;Basketball | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png"><img src="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png" alt="NCAA Men's Basketball logo" height="20"></picture> NCAA Men's Basketball | 🔴 Off-season · starts 2026-11-02 | [`basketball/mens-college-basketball`](https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams) |
| 🏀&nbsp;Basketball | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png"><img src="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png" alt="NCAA Women's Basketball logo" height="20"></picture> NCAA Women's Basketball | 🔴 Off-season · starts 2026-11-02 | [`basketball/womens-college-basketball`](https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/teams) |
| 🏈&nbsp;Football | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-football-college.png"><img src="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-football-college.png" alt="College Football logo" height="20"></picture> College Football | 🔴 Off-season · starts 2026-08-27 | [`football/college-football`](https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams) |
| 🏒&nbsp;Hockey | <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-hockey.png"><img src="https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-hockey.png" alt="NCAA Men's Ice Hockey logo" height="20"></picture> NCAA Men's Ice Hockey | 🔴 Off-season · starts 2026-10-02 | [`hockey/mens-college-hockey`](https://site.api.espn.com/apis/site/v2/sports/hockey/mens-college-hockey/teams) |
<!-- supported-sports:end -->

---

## Team Abbreviations

Use the table of contents to jump to a league. The full team directories are collapsed below to keep the README readable; open a league to see its current abbreviations and logos.

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nba.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nba.png" alt="NBA logo" height="28"></picture> NBA Team Abbreviations
<details><summary>NBA team abbreviations</summary>

| 🏀 Eastern Conference | Abbr | | 🏀 Western Conference | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/atl.png" width="20"> Atlanta Hawks | ATL | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/dal.png" width="20"> Dallas Mavericks | DAL |
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/bos.png" width="20"> Boston Celtics | BOS | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/den.png" width="20"> Denver Nuggets | DEN |
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/bkn.png" width="20"> Brooklyn Nets | BKN | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/gs.png" width="20"> Golden State Warriors | GSW |
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/cha.png" width="20"> Charlotte Hornets | CHA | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/hou.png" width="20"> Houston Rockets | HOU |
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/chi.png" width="20"> Chicago Bulls | CHI | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/lac.png" width="20"> LA Clippers | LAC |
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/cle.png" width="20"> Cleveland Cavaliers | CLE | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/lal.png" width="20"> Los Angeles Lakers | LAL |
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/det.png" width="20"> Detroit Pistons | DET | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/mem.png" width="20"> Memphis Grizzlies | MEM |
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/ind.png" width="20"> Indiana Pacers | IND | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/min.png" width="20"> Minnesota Timberwolves | MIN |
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/mia.png" width="20"> Miami Heat | MIA | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/no.png" width="20"> New Orleans Pelicans | NOP |
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/mil.png" width="20"> Milwaukee Bucks | MIL | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/okc.png" width="20"> Oklahoma City Thunder | OKC |
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/ny.png" width="20"> New York Knicks | NYK | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/phx.png" width="20"> Phoenix Suns | PHX |
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/orl.png" width="20"> Orlando Magic | ORL | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/por.png" width="20"> Portland Trail Blazers | POR |
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/phi.png" width="20"> Philadelphia 76ers | PHI | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/sac.png" width="20"> Sacramento Kings | SAC |
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/tor.png" width="20"> Toronto Raptors | TOR | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/sa.png" width="20"> San Antonio Spurs | SAS |
| <img src="https://a.espncdn.com/i/teamlogos/nba/500/wsh.png" width="20"> Washington Wizards | WAS | | <img src="https://a.espncdn.com/i/teamlogos/nba/500/utah.png" width="20"> Utah Jazz | UTA |

---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/mlb.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png" alt="MLB logo" height="28"></picture> MLB Team Abbreviations
<details><summary>MLB team abbreviations</summary>

| ⚾ American League | Abbr | | ⚾ National League | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/ath.png" width="20"> Athletics | ATH | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/ari.png" width="20"> Arizona Diamondbacks | AZ |
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/bal.png" width="20"> Baltimore Orioles | BAL | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/atl.png" width="20"> Atlanta Braves | ATL |
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/bos.png" width="20"> Boston Red Sox | BOS | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/chc.png" width="20"> Chicago Cubs | CHC |
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/cws.png" width="20"> Chicago White Sox | CWS | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/cin.png" width="20"> Cincinnati Reds | CIN |
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/cle.png" width="20"> Cleveland Guardians | CLE | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/col.png" width="20"> Colorado Rockies | COL |
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/det.png" width="20"> Detroit Tigers | DET | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/lad.png" width="20"> Los Angeles Dodgers | LAD |
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/hou.png" width="20"> Houston Astros | HOU | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/mia.png" width="20"> Miami Marlins | MIA |
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/kc.png" width="20"> Kansas City Royals | KC | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/mil.png" width="20"> Milwaukee Brewers | MIL |
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/laa.png" width="20"> Los Angeles Angels | LAA | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/nym.png" width="20"> New York Mets | NYM |
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/min.png" width="20"> Minnesota Twins | MIN | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/phi.png" width="20"> Philadelphia Phillies | PHI |
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png" width="20"> New York Yankees | NYY | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/pit.png" width="20"> Pittsburgh Pirates | PIT |
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/sea.png" width="20"> Seattle Mariners | SEA | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/sd.png" width="20"> San Diego Padres | SD |
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/tb.png" width="20"> Tampa Bay Rays | TB | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/sf.png" width="20"> San Francisco Giants | SF |
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/tex.png" width="20"> Texas Rangers | TEX | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/stl.png" width="20"> St. Louis Cardinals | STL |
| <img src="https://a.espncdn.com/i/teamlogos/mlb/500/tor.png" width="20"> Toronto Blue Jays | TOR | | <img src="https://a.espncdn.com/i/teamlogos/mlb/500/wsh.png" width="20"> Washington Nationals | WSH |

---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nfl.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png" alt="NFL logo" height="28"></picture> NFL Team Abbreviations
<details><summary>NFL team abbreviations</summary>

<span style="font-size: 0.85em;">

| 🏈 AFC | Abbr | | 🏈 NFC | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/bal.png" width="20"> Baltimore Ravens | BAL | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/ari.png" width="20"> Arizona Cardinals | ARI |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/buf.png" width="20"> Buffalo Bills | BUF | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/atl.png" width="20"> Atlanta Falcons | ATL |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/cin.png" width="20"> Cincinnati Bengals | CIN | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/car.png" width="20"> Carolina Panthers | CAR |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/cle.png" width="20"> Cleveland Browns | CLE | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/chi.png" width="20"> Chicago Bears | CHI |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/den.png" width="20"> Denver Broncos | DEN | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/dal.png" width="20"> Dallas Cowboys | DAL |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/hou.png" width="20"> Houston Texans | HOU | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/det.png" width="20"> Detroit Lions | DET |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/ind.png" width="20"> Indianapolis Colts | IND | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/gb.png" width="20"> Green Bay Packers | GB |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/jax.png" width="20"> Jacksonville Jaguars | JAX | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/lar.png" width="20"> Los Angeles Rams | LAR |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/kc.png" width="20"> Kansas City Chiefs | KC | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/min.png" width="20"> Minnesota Vikings | MIN |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/lac.png" width="20"> Los Angeles Chargers | LAC | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/no.png" width="20"> New Orleans Saints | NO |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/lv.png" width="20"> Las Vegas Raiders | LV | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png" width="20"> New York Giants | NYG |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/mia.png" width="20"> Miami Dolphins | MIA | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/phi.png" width="20"> Philadelphia Eagles | PHI |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/ne.png" width="20"> New England Patriots | NE | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/sf.png" width="20"> San Francisco 49ers | SF |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png" width="20"> New York Jets | NYJ | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/sea.png" width="20"> Seattle Seahawks | SEA |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/pit.png" width="20"> Pittsburgh Steelers | PIT | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/tb.png" width="20"> Tampa Bay Buccaneers | TB |
| <img src="https://a.espncdn.com/i/teamlogos/nfl/500/ten.png" width="20"> Tennessee Titans | TEN | | <img src="https://a.espncdn.com/i/teamlogos/nfl/500/was.png" width="20"> Washington Commanders | WAS |

</span>

---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nhl.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png" alt="NHL logo" height="28"></picture> NHL Team Abbreviations
<details><summary>NHL team abbreviations</summary>

<span style="font-size: 0.85em;">

| 🏒 Eastern Conference | Abbr | | 🏒 Western Conference | Abbr |
|---|------|---|---|------|
| <img src="https://assets.nhle.com/logos/nhl/svg/BOS_dark.svg" width="26"> Boston Bruins | BOS | | <img src="https://assets.nhle.com/logos/nhl/svg/ANA_dark.svg" width="26"> Anaheim Ducks | ANA |
| <img src="https://assets.nhle.com/logos/nhl/svg/BUF_dark.svg" width="26"> Buffalo Sabres | BUF | | <img src="https://assets.nhle.com/logos/nhl/svg/UTA_dark.svg" width="26"> Utah Hockey Club | UTA |
| <img src="https://assets.nhle.com/logos/nhl/svg/CAR_dark.svg" width="26"> Carolina Hurricanes | CAR | | <img src="https://assets.nhle.com/logos/nhl/svg/CGY_dark.svg" width="26"> Calgary Flames | CGY |
| <img src="https://assets.nhle.com/logos/nhl/svg/CBJ_dark.svg" width="26"> Columbus Blue Jackets | CBJ | | <img src="https://assets.nhle.com/logos/nhl/svg/CHI_dark.svg" width="26"> Chicago Blackhawks | CHI |
| <img src="https://assets.nhle.com/logos/nhl/svg/DET_dark.svg" width="26"> Detroit Red Wings | DET | | <img src="https://assets.nhle.com/logos/nhl/svg/COL_dark.svg" width="26"> Colorado Avalanche | COL |
| <img src="https://assets.nhle.com/logos/nhl/svg/FLA_dark.svg" width="26"> Florida Panthers | FLA | | <img src="https://assets.nhle.com/logos/nhl/svg/DAL_dark.svg" width="26"> Dallas Stars | DAL |
| <img src="https://assets.nhle.com/logos/nhl/svg/MTL_dark.svg" width="26"> Montreal Canadiens | MTL | | <img src="https://assets.nhle.com/logos/nhl/svg/EDM_dark.svg" width="26"> Edmonton Oilers | EDM |
| <img src="https://assets.nhle.com/logos/nhl/svg/NJD_dark.svg" width="26"> New Jersey Devils | NJ | | <img src="https://assets.nhle.com/logos/nhl/svg/LAK_dark.svg" width="26"> Los Angeles Kings | LAK |
| <img src="https://assets.nhle.com/logos/nhl/svg/NYI_dark.svg" width="26"> New York Islanders | NYI | | <img src="https://assets.nhle.com/logos/nhl/svg/MIN_dark.svg" width="26"> Minnesota Wild | MIN |
| <img src="https://assets.nhle.com/logos/nhl/svg/NYR_dark.svg" width="26"> New York Rangers | NYR | | <img src="https://assets.nhle.com/logos/nhl/svg/NSH_dark.svg" width="26"> Nashville Predators | NSH |
| <img src="https://assets.nhle.com/logos/nhl/svg/OTT_dark.svg" width="26"> Ottawa Senators | OTT | | <img src="https://assets.nhle.com/logos/nhl/svg/SEA_dark.svg" width="26"> Seattle Kraken | SEA |
| <img src="https://assets.nhle.com/logos/nhl/svg/PHI_dark.svg" width="26"> Philadelphia Flyers | PHI | | <img src="https://assets.nhle.com/logos/nhl/svg/SJS_dark.svg" width="26"> San Jose Sharks | SJ |
| <img src="https://assets.nhle.com/logos/nhl/svg/PIT_dark.svg" width="26"> Pittsburgh Penguins | PIT | | <img src="https://assets.nhle.com/logos/nhl/svg/STL_dark.svg" width="26"> St. Louis Blues | STL |
| <img src="https://assets.nhle.com/logos/nhl/svg/TBL_dark.svg" width="26"> Tampa Bay Lightning | TB | | <img src="https://assets.nhle.com/logos/nhl/svg/VAN_dark.svg" width="26"> Vancouver Canucks | VAN |
| <img src="https://assets.nhle.com/logos/nhl/svg/TOR_dark.svg" width="26"> Toronto Maple Leafs | TOR | | <img src="https://assets.nhle.com/logos/nhl/svg/VGK_dark.svg" width="26"> Vegas Golden Knights | VGK |
| <img src="https://assets.nhle.com/logos/nhl/svg/WSH_dark.svg" width="26"> Washington Capitals | WSH | | <img src="https://assets.nhle.com/logos/nhl/svg/WPG_dark.svg" width="26"> Winnipeg Jets | WPG |

</span>

---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/19.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/19.png" alt="MLS logo" height="28"></picture> MLS Team Abbreviations
<details><summary>MLS team abbreviations</summary>

| ⚽ Eastern Conference | Abbr | | ⚽ Western Conference | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/18418.png" width="20"> Atlanta United | ATL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/20906.png" width="20"> Austin FC | ATX |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21300.png" width="20"> Charlotte FC | CLT | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/184.png" width="20"> Colorado Rapids | COL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/182.png" width="20"> Chicago Fire FC | CHI | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/185.png" width="20"> FC Dallas | DAL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/183.png" width="20"> Columbus Crew | CLB | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/6077.png" width="20"> Houston Dynamo FC | HOU |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/193.png" width="20"> D.C. United | DC | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/187.png" width="20"> LA Galaxy | LA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/18267.png" width="20"> FC Cincinnati | CIN | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/18966.png" width="20"> LAFC | LAFC |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/20232.png" width="20"> Inter Miami CF | MIA | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/17362.png" width="20"> Minnesota United FC | MIN |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/9720.png" width="20"> CF Montréal | MTL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/9723.png" width="20"> Portland Timbers | POR |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/18986.png" width="20"> Nashville SC | NSH | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/4771.png" width="20"> Real Salt Lake | RSL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/189.png" width="20"> New England Revolution | NE | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/22529.png" width="20"> San Diego FC | SD |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/17606.png" width="20"> New York City FC | NYC | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/191.png" width="20"> San Jose Earthquakes | SJ |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/12011.png" width="20"> Orlando City SC | ORL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/9726.png" width="20"> Seattle Sounders FC | SEA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/10739.png" width="20"> Philadelphia Union | PHI | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/186.png" width="20"> Sporting Kansas City | SKC |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/190.png" width="20"> Red Bull New York | RBNY | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21812.png" width="20"> St. Louis CITY SC | STL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7318.png" width="20"> Toronto FC | TOR | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/9727.png" width="20"> Vancouver Whitecaps | VAN |


---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/23.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/23.png" alt="Premier League logo" height="28"></picture> Premier League Team Abbreviations
<details><summary>Premier League team abbreviations</summary>

| ⚽ Club | Abbr | | ⚽ Club | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/349.png" width="20"> AFC Bournemouth | BOU | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/357.png" width="20"> Leeds United | LEE |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/359.png" width="20"> Arsenal | ARS | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/364.png" width="20"> Liverpool | LIV |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/362.png" width="20"> Aston Villa | AVL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/382.png" width="20"> Manchester City | MNC |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/337.png" width="20"> Brentford | BRE | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/360.png" width="20"> Manchester United | MAN |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/331.png" width="20"> Brighton & Hove Albion | BHA | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/361.png" width="20"> Newcastle United | NEW |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/379.png" width="20"> Burnley | BUR | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/393.png" width="20"> Nottingham Forest | NFO |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/363.png" width="20"> Chelsea | CHE | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/366.png" width="20"> Sunderland | SUN |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/384.png" width="20"> Crystal Palace | CRY | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/367.png" width="20"> Tottenham Hotspur | TOT |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/368.png" width="20"> Everton | EVE | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/371.png" width="20"> West Ham United | WHU |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/370.png" width="20"> Fulham | FUL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/380.png" width="20"> Wolverhampton Wanderers | WOL |


---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/15.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/15.png" alt="La Liga logo" height="28"></picture> La Liga Team Abbreviations
<details><summary>La Liga team abbreviations</summary>

| ⚽ Club | Abbr | | ⚽ Club | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/93.png" width="20"> Athletic Club | ATH | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/84.png" width="20"> Mallorca | MLL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/1068.png" width="20"> Atlético Madrid | ATM | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/97.png" width="20"> Osasuna | OSA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/83.png" width="20"> Barcelona | BAR | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/101.png" width="20"> Rayo Vallecano | RAY |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/85.png" width="20"> Celta Vigo | CEL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/244.png" width="20"> Real Betis | BET |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/96.png" width="20"> Deportivo Alavés | ALA | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/86.png" width="20"> Real Madrid | RMA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3751.png" width="20"> Elche | ELC | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/92.png" width="20"> Real Oviedo | OVI |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/88.png" width="20"> Espanyol | ESP | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/89.png" width="20"> Real Sociedad | RSO |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2922.png" width="20"> Getafe | GET | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/243.png" width="20"> Sevilla | SEV |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/9812.png" width="20"> Girona | GIR | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/94.png" width="20"> Valencia | VAL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/1538.png" width="20"> Levante | LEV | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/102.png" width="20"> Villarreal | VIL |


---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/10.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/10.png" alt="Bundesliga logo" height="28"></picture> Bundesliga Team Abbreviations
<details><summary>Bundesliga team abbreviations</summary>

| ⚽ Club | Abbr | | ⚽ Club | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/6418.png" width="20"> 1. FC Heidenheim | HDH | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/127.png" width="20"> Hamburger SV | HSV |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/598.png" width="20"> 1. FC Union Berlin | FCU | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2950.png" width="20"> Mainz 05 | M05 |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/131.png" width="20"> Bayer Leverkusen | B04 | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/11420.png" width="20"> RB Leipzig | RBL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/132.png" width="20"> Bayern Munich | MUN | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/126.png" width="20"> SC Freiburg | SCF |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/124.png" width="20"> Borussia Dortmund | DOR | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/270.png" width="20"> St. Pauli | STP |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/268.png" width="20"> Borussia Mönchengladbach | BMG | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7911.png" width="20"> TSG Hoffenheim | TSG |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/125.png" width="20"> Eintracht Frankfurt | SGE | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/134.png" width="20"> VfB Stuttgart | VFB |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3841.png" width="20"> FC Augsburg | FCA | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/138.png" width="20"> VfL Wolfsburg | WOB |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/122.png" width="20"> FC Cologne | KOE | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/137.png" width="20"> Werder Bremen | SVW |


---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/12.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/12.png" alt="Serie A logo" height="28"></picture> Serie A Team Abbreviations
<details><summary>Serie A team abbreviations</summary>

| ⚽ Club | Abbr | | ⚽ Club | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/103.png" width="20"> AC Milan | MIL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/110.png" width="20"> Internazionale | INT |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/104.png" width="20"> AS Roma | ROMA | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/111.png" width="20"> Juventus | JUV |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/105.png" width="20"> Atalanta | ATA | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/112.png" width="20"> Lazio | LAZ |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/107.png" width="20"> Bologna | BOL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/113.png" width="20"> Lecce | LEC |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2925.png" width="20"> Cagliari | CAG | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/114.png" width="20"> Napoli | NAP |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2572.png" width="20"> Como | COMO | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/115.png" width="20"> Parma | PAR |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/4050.png" width="20"> Cremonese | CRE | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3956.png" width="20"> Pisa | PIS |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/109.png" width="20"> Fiorentina | FIO | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3997.png" width="20"> Sassuolo | SAS |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3263.png" width="20"> Genoa | GEN | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/239.png" width="20"> Torino | TOR |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/119.png" width="20"> Hellas Verona | VER | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/118.png" width="20"> Udinese | UDI |


---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/9.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/9.png" alt="Ligue 1 logo" height="28"></picture> Ligue 1 Team Abbreviations
<details><summary>Ligue 1 team abbreviations</summary>

| ⚽ Club | Abbr | | ⚽ Club | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/172.png" width="20"> AJ Auxerre | AUX | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/176.png" width="20"> Marseille | OLM |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/174.png" width="20"> AS Monaco | MON | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/177.png" width="20"> Metz | METZ |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7868.png" width="20"> Angers | ANG | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/165.png" width="20"> Nantes | NAN |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/6997.png" width="20"> Brest | BRE | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2502.png" width="20"> Nice | NICE |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3236.png" width="20"> Le Havre AC | HAC | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/6851.png" width="20"> Paris FC | PAR |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/175.png" width="20"> Lens | RCL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/160.png" width="20"> Paris Saint-Germain | PSG |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/166.png" width="20"> Lille | LILL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/169.png" width="20"> Stade Rennais | REN |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/273.png" width="20"> Lorient | LOR | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/180.png" width="20"> Strasbourg | STR |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/167.png" width="20"> Lyon | LYON | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/179.png" width="20"> Toulouse | TOU |


---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/14.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/14.png" alt="Primeira Liga logo" height="28"></picture> Primeira Liga Team Abbreviations
<details><summary>Primeira Liga team abbreviations</summary>

| ⚽ Club | Abbr | | ⚽ Club | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/22064.png" width="20"> AVS | AVS | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/12698.png" width="20"> FC Famalicão | FCF |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21613.png" width="20"> Alverca | ALV | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/437.png" width="20"> FC Porto | FCP |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/15784.png" width="20"> Arouca | FCA | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3699.png" width="20"> Gil Vicente | GVFC |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/1929.png" width="20"> Benfica | SLB | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3696.png" width="20"> Moreirense | MFC |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2994.png" width="20"> Braga | SCB | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3822.png" width="20"> Rio Ave | RAFC |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3472.png" width="20"> C.D. Nacional | CDN | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/12215.png" width="20"> Santa Clara | CDSC |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21581.png" width="20"> Casa Pia | CPAC | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2250.png" width="20"> Sporting CP | SCP |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/12216.png" width="20"> Estoril | EPF | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/12706.png" width="20"> Tondela | CDT |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21610.png" width="20"> Estrela | EST | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/5309.png" width="20"> Vitória de Guimarães | VSC |


---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/11.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/11.png" alt="Eredivisie logo" height="28"></picture> Eredivisie Team Abbreviations
<details><summary>Eredivisie team abbreviations</summary>

| ⚽ Club | Abbr | | ⚽ Club | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/140.png" width="20"> AZ Alkmaar | AZ | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3706.png" width="20"> Go Ahead Eagles | GAE |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/139.png" width="20"> Ajax Amsterdam | AJA | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/146.png" width="20"> Heerenveen | HEE |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2566.png" width="20"> Excelsior | EXC | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3708.png" width="20"> Heracles Almelo | HER |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/145.png" width="20"> FC Groningen | GRO | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/141.png" width="20"> NAC Breda | NAC |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/152.png" width="20"> FC Twente | TWE | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/147.png" width="20"> NEC Nijmegen | NEC |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/153.png" width="20"> FC Utrecht | UTR | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2565.png" width="20"> PEC Zwolle | PEC |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2727.png" width="20"> FC Volendam | VOL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/148.png" width="20"> PSV Eindhoven | PSV |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/142.png" width="20"> Feyenoord | FEY | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/151.png" width="20"> Sparta Rotterdam | SPA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/143.png" width="20"> Fortuna Sittard | FOR | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3735.png" width="20"> Telstar | TEL |


---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/wnba.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/wnba.png" alt="WNBA logo" height="28"></picture> WNBA Team Abbreviations
<details><summary>WNBA team abbreviations</summary>

| 🏀 Eastern Conference | Abbr | | 🏀 Western Conference | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/wnba/500/atl.png" width="20"> Atlanta Dream | ATL | | <img src="https://a.espncdn.com/i/teamlogos/wnba/500/dal.png" width="20"> Dallas Wings | DAL |
| <img src="https://a.espncdn.com/i/teamlogos/wnba/500/chi.png" width="20"> Chicago Sky | CHI | | <img src="https://a.espncdn.com/i/teamlogos/wnba/500/gs.png" width="20"> Golden State Valkyries | GS |
| <img src="https://a.espncdn.com/i/teamlogos/wnba/500/con.png" width="20"> Connecticut Sun | CON | | <img src="https://a.espncdn.com/i/teamlogos/wnba/500/la.png" width="20"> Los Angeles Sparks | LA |
| <img src="https://a.espncdn.com/i/teamlogos/wnba/500/ind.png" width="20"> Indiana Fever | IND | | <img src="https://a.espncdn.com/i/teamlogos/wnba/500/lv.png" width="20"> Las Vegas Aces | LV |
| <img src="https://a.espncdn.com/i/teamlogos/wnba/500/ny.png" width="20"> New York Liberty | NY | | <img src="https://a.espncdn.com/i/teamlogos/wnba/500/min.png" width="20"> Minnesota Lynx | MIN |
| <img src="https://a.espncdn.com/i/teamlogos/wnba/500/tor.png" width="20"> Toronto Tempo | TOR | | <img src="https://a.espncdn.com/i/teamlogos/wnba/500/phx.png" width="20"> Phoenix Mercury | PHX |
| <img src="https://a.espncdn.com/i/teamlogos/wnba/500/wsh.png" width="20"> Washington Mystics | WSH | | <img src="https://a.espncdn.com/i/teamlogos/wnba/500/por.png" width="20"> Portland Fire | POR |
|  |  | | <img src="https://a.espncdn.com/i/teamlogos/wnba/500/sea.png" width="20"> Seattle Storm | SEA |


---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/22.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/22.png" alt="Liga MX logo" height="28"></picture> Liga MX Team Abbreviations
<details><summary>Liga MX team abbreviations</summary>

| ⚽ Club | Abbr | | ⚽ Club | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/227.png" width="20"> América | AME | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/229.png" width="20"> Necaxa | NCX |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/216.png" width="20"> Atlas | ATS | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/234.png" width="20"> Pachuca | PAC |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/15720.png" width="20"> Atlético de San Luis | ASL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/231.png" width="20"> Puebla | PUE |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/218.png" width="20"> Cruz Azul | CAZ | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/233.png" width="20"> Pumas UNAM | UNAM |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/17851.png" width="20"> FC Juárez | JUA | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/222.png" width="20"> Querétaro | QRO |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/219.png" width="20"> Guadalajara | GDL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/225.png" width="20"> Santos Laguna | SAN |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/228.png" width="20"> León | LEO | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/232.png" width="20"> Tigres UANL | UANL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/20702.png" width="20"> Mazatlán FC | MAZ | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/10125.png" width="20"> Tijuana | TIJ |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/220.png" width="20"> Monterrey | MTY | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/223.png" width="20"> Toluca | TOL |


---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/85.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/85.png" alt="Brasileirão logo" height="28"></picture> Brasileirão Team Abbreviations
<details><summary>Brasileirão team abbreviations</summary>

| ⚽ Club | Abbr | | ⚽ Club | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3458.png" width="20"> Athletico Paranaense | CAP | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/6273.png" width="20"> Grêmio | GRE |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7632.png" width="20"> Atlético Mineiro | CAM | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/1936.png" width="20"> Internacional | INT |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/9967.png" width="20"> Bahia | BAH | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/9169.png" width="20"> Mirassol | MIR |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/6086.png" width="20"> Botafogo | BOT | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2029.png" width="20"> Palmeiras | PAL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/9318.png" width="20"> Chapecoense | CHA | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/6079.png" width="20"> Red Bull Bragantino | BRA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/874.png" width="20"> Corinthians | COR | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/4936.png" width="20"> Remo | REMO |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3456.png" width="20"> Coritiba | CFC | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2674.png" width="20"> Santos | SAN |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2022.png" width="20"> Cruzeiro | CRU | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2026.png" width="20"> São Paulo | SAO |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/819.png" width="20"> Flamengo | FLA | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3454.png" width="20"> Vasco da Gama | VAS |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3445.png" width="20"> Fluminense | FLU | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3457.png" width="20"> Vitória | VIT |


---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2323.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2323.png" alt="NWSL logo" height="28"></picture> NWSL Team Abbreviations
<details><summary>NWSL team abbreviations</summary>

| ⚽ Club | Abbr | | ⚽ Club | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21422.png" width="20"> Angel City FC | LA | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/15366.png" width="20"> North Carolina Courage | NC |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/22187.png" width="20"> Bay FC | BAY | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/18206.png" width="20"> Orlando Pride | ORL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/131562.png" width="20"> Boston Legacy FC | BOS | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/15362.png" width="20"> Portland Thorns FC | POR |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/15360.png" width="20"> Chicago Stars FC | CHI | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/20905.png" width="20"> Racing Louisville FC | LOU |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/131563.png" width="20"> Denver Summit FC | DEN | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21423.png" width="20"> San Diego Wave FC | SD |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/15364.png" width="20"> Gotham FC | GFC | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/15363.png" width="20"> Seattle Reign FC | SEA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/17346.png" width="20"> Houston Dash | HOU | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/19141.png" width="20"> Utah Royals | UTA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/20907.png" width="20"> Kansas City Current | KC | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/15365.png" width="20"> Washington Spirit | WAS |

---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2488.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2488.png" alt="Saudi Pro League logo" height="28"></picture> Saudi Pro League Team Abbreviations
<details><summary>Saudi Pro League team abbreviations</summary>

| ⚽ Club | Abbr | ⚽ Club | Abbr |
|---|---|---|---|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/8346.png" width="20"> Al Ahli | AHL | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/929.png" width="20"> Al Hilal | HIL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/817.png" width="20"> Al Nassr | NSR | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2276.png" width="20"> Al Ittihad | ITT |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/8363.png" width="20"> Al Ettifaq | ETT | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/793.png" width="20"> Al Shabab | SHA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/22022.png" width="20"> Al Qadsiah | QAD | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/13033.png" width="20"> Al Fateh | FAT |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21827.png" width="20"> Al Fayha | FAY | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/18459.png" width="20"> Al Taawoun | TAA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21965.png" width="20"> Al Riyadh | RIY | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21829.png" width="20"> Al Khaleej | KHA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21964.png" width="20"> Al Hazem | HAZ | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/22028.png" width="20"> Al Kholood | KHO |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21833.png" width="20"> Abha | ABH | <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/%D8%B4%D8%B9%D8%A7%D8%B1_%D9%86%D8%A7%D8%AF%D9%8A_%D8%A7%D9%84%D8%AF%D8%B1%D8%B9%D9%8A%D8%A9.png/120px-%D8%B4%D8%B9%D8%A7%D8%B1_%D9%86%D8%A7%D8%AF%D9%8A_%D8%A7%D9%84%D8%AF%D8%B1%D8%B9%D9%8A%D8%A9.png" width="20"> Al Diriyah | DIR |
| <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/%D8%B4%D8%B9%D8%A7%D8%B1_%D9%81%D8%B1%D9%8A%D9%82_%D8%A7%D9%84%D9%81%D9%8A%D8%B5%D9%84%D9%8A.png/120px-%D8%B4%D8%B9%D8%A7%D8%B1_%D9%81%D8%B1%D9%8A%D9%82_%D8%A7%D9%84%D9%81%D9%8A%D8%B5%D9%84%D9%8A.png" width="20"> Al-Faisaly | ALF | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/130899.png" width="20"> Neom SC | NEOM |

---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2199.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2199.png" alt="J1 League logo" height="28"></picture> J1 League Team Abbreviations
<details><summary>J1 League team abbreviations</summary>

| ⚽ Club | Abbr | ⚽ Club | Abbr |
|---|---|---|---|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7112.png" width="20"> Kawasaki Frontale | KAW | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3385.png" width="20"> Urawa Red Diamonds | URA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7477.png" width="20"> Vissel Kobe | VIS | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7116.png" width="20"> Yokohama F. Marinos | YOK |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7115.png" width="20"> Kashima Antlers | KAN | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7476.png" width="20"> Kashiwa Reysol | KRE |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7102.png" width="20"> Gamba Osaka | GAM | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7109.png" width="20"> Cerezo Osaka | CER |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3384.png" width="20"> FC Tokyo | TOK | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3393.png" width="20"> Tokyo Verdy 1969 | TYKV |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7108.png" width="20"> Nagoya Grampus | NAG | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7114.png" width="20"> Sanfrecce Hiroshima | SAN |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7104.png" width="20"> Shimizu S-Pulse | SHI | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7107.png" width="20"> Avispa Fukuoka | AVF |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21361.png" width="20"> Kyoto Sanga | KYO | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/22522.png" width="20"> Fagiano Okayama | OKA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7111.png" width="20"> JEF United Ichihara-Chiba | JEF | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/131701.png" width="20"> Mito Hollyhock | MITO |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/19001.png" width="20"> V-Varen Nagasaki | VVN | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/22167.png" width="20"> Machida Zelvia | ZEL |

---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/45.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/45.png" alt="Scottish Premiership logo" height="28"></picture> Scottish Premiership Team Abbreviations
<details><summary>Scottish Premiership team abbreviations</summary>

| ⚽ Club | Abbr | ⚽ Club | Abbr |
|---|---|---|---|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/263.png" width="20"> Aberdeen | ABE | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/256.png" width="20"> Celtic | CEL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/261.png" width="20"> Dundee | DUN | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/264.png" width="20"> Dundee United | DUN |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/254.png" width="20"> Falkirk | FALK | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/262.png" width="20"> Heart of Midlothian | HOM |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/258.png" width="20"> Hibernian | HIBS | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/260.png" width="20"> Kilmarnock | KIL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/266.png" width="20"> Motherwell | MOT | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/257.png" width="20"> Rangers | RAN |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/267.png" width="20"> St Johnstone | STJ | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/250.png" width="20"> St Mirren | STM |

---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/6.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/6.png" alt="Belgian Pro League logo" height="28"></picture> Belgian Pro League Team Abbreviations
<details><summary>Belgian Pro League team abbreviations</summary>

| ⚽ Club | Abbr | ⚽ Club | Abbr |
|---|---|---|---|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/441.png" width="20"> Anderlecht | AND | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/17544.png" width="20"> Antwerp | ANT |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3610.png" width="20"> Cercle Brugge KSV | CBK | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/570.png" width="20"> Club Brugge | BRU |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3611.png" width="20"> KAA Gent | GENT | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/5786.png" width="20"> KV Kortrijk | KVK |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7879.png" width="20"> KV Mechelen | KVM | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/606.png" width="20"> KVC Westerlo | KVCW |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/22269.png" width="20"> Lommel SK | LOM | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/5579.png" width="20"> OH Leuven | OHL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/131235.png" width="20"> RAAL La Louvière | RLL | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/938.png" width="20"> Racing Genk | GENK |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3616.png" width="20"> Royal Charleroi SC | CHA | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/936.png" width="20"> Sint-Truidense | STVV |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/559.png" width="20"> Standard Liege | STL | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/5807.png" width="20"> Union St.-Gilloise | USG |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/13450.png" width="20"> Waasland-Beveren | WAA | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/4691.png" width="20"> Zulte-Waregem | ZUL |

---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2.png" alt="UEFA Champions League logo" height="28"></picture> UEFA Champions League Team Abbreviations
<details><summary>UEFA Champions League team abbreviations</summary>

| ⚽ Club | Abbr | ⚽ Club | Abbr |
|---|---|---|---|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/174.png" width="20"> AS Monaco | MON | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/139.png" width="20"> Ajax Amsterdam | AJA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/359.png" width="20"> Arsenal | ARS | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/105.png" width="20"> Atalanta | ATA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/93.png" width="20"> Athletic Club | ATH | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/1068.png" width="20"> Atlético Madrid | ATM |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/83.png" width="20"> Barcelona | BAR | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/131.png" width="20"> Bayer Leverkusen | B04 |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/132.png" width="20"> Bayern Munich | MUN | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/1929.png" width="20"> Benfica | SLB |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2980.png" width="20"> Bodo/Glimt | BODO | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/124.png" width="20"> Borussia Dortmund | DOR |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/363.png" width="20"> Chelsea | CHE | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/570.png" width="20"> Club Brugge | BRU |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/125.png" width="20"> Eintracht Frankfurt | SGE | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/909.png" width="20"> F.C. København | KBH |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/10414.png" width="20"> FK Qarabag | QAR | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/432.png" width="20"> Galatasaray | GAL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/110.png" width="20"> Internazionale | INT | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/111.png" width="20"> Juventus | JUV |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2528.png" width="20"> Kairat Almaty | KAI | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/364.png" width="20"> Liverpool | LIV |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/382.png" width="20"> Manchester City | MNC | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/176.png" width="20"> Marseille | OLM |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/114.png" width="20"> Napoli | NAP | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/361.png" width="20"> Newcastle United | NEW |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/435.png" width="20"> Olympiacos | OLY | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/148.png" width="20"> PSV Eindhoven | PSV |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/22281.png" width="20"> Pafos | PAF | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/160.png" width="20"> Paris Saint-Germain | PSG |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/86.png" width="20"> Real Madrid | RMA | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/494.png" width="20"> Slavia Prague | SLP |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2250.png" width="20"> Sporting CP | SCP | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/367.png" width="20"> Tottenham Hotspur | TOT |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/5807.png" width="20"> Union St.-Gilloise | USG | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/102.png" width="20"> Villarreal | VIL |

This table reflects ESPN's current 2025–26 participant directory and will change when the competition draw changes.

---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2310.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/2310.png" alt="UEFA Europa League logo" height="28"></picture> UEFA Europa League Team Abbreviations
<details><summary>UEFA Europa League team abbreviations</summary>

| ⚽ Club | Abbr | ⚽ Club | Abbr |
|---|---|---|---|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/104.png" width="20"> AS Roma | ROMA | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/362.png" width="20"> Aston Villa | AVL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/107.png" width="20"> Bologna | BOL | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2994.png" width="20"> Braga | SCB |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/85.png" width="20"> Celta Vigo | CEL | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/256.png" width="20"> Celtic | CEL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/597.png" width="20"> Dinamo Zagreb | DZG | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/989.png" width="20"> FC Basel | FCB |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/572.png" width="20"> FC Midtjylland | MID | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/437.png" width="20"> FC Porto | FCP |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/153.png" width="20"> FC Utrecht | UTR | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/484.png" width="20"> FCSB | FCSB |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/436.png" width="20"> Fenerbahce | FEN | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/622.png" width="20"> Ferencvaros | FER |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/142.png" width="20"> Feyenoord Rotterdam | FEY | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3706.png" width="20"> Go Ahead Eagles | GAE |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/166.png" width="20"> Lille | LILL | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/13018.png" width="20"> Ludogorets Razgrad | LUD |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/167.png" width="20"> Lyon | LYON | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/524.png" width="20"> Maccabi Tel-Aviv | MTA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2720.png" width="20"> Malmö FF | MAL | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2502.png" width="20"> Nice | NICE |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/393.png" width="20"> Nottingham Forest | NFO | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/605.png" width="20"> PAOK | PAOK |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/443.png" width="20"> Panathinaikos | PAO | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2790.png" width="20"> RB Salzburg | SLZ |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/938.png" width="20"> Racing Genk | GENK | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/257.png" width="20"> Rangers | RAN |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/244.png" width="20"> Real Betis | BET | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2290.png" width="20"> Red Star Belgrade | RSB |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/126.png" width="20"> SC Freiburg | SCF | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/620.png" width="20"> SK Brann | SKBR |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/3746.png" width="20"> SK Sturm Graz | STG | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/134.png" width="20"> VfB Stuttgart | VFB |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/11706.png" width="20"> Viktoria Plzen | PLZ | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/2722.png" width="20"> Young Boys | YB |

This table reflects ESPN's current 2025–26 participant directory and will change when the competition draw changes.

---


</details>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nba_gleague.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nba_gleague.png" alt="NBA G League logo" height="28"></picture> NBA G League Team Abbreviations
<details><summary>NBA G League team abbreviations</summary>

| 🏀 Eastern Conference | Abbr | | 🏀 Western Conference | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/cap.png" width="20"> Capital City Go-Go | CAP | | <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/aus.png" width="20"> Austin Spurs | AUS |
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/clc.png" width="20"> Cleveland Charge | CLC | | <img src="https://a.espncdn.com/guid/ed81f2d5-eaa5-343d-5b76-c685a731f733/logos/default.png" width="20"> Coachella Valley Lakers | CVL |
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/cps.png" width="20"> College Park Skyhawks | CPS | | <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/iwa.png" width="20"> Iowa Wolves | IWA |
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/del.png" width="20"> Delaware Blue Coats | DEL | | <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/mhu.png" width="20"> Memphis Hustle | MHU |
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/gbo.png" width="20"> Greensboro Swarm | GBO | | <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/mxc.png" width="20"> Mexico City Capitanes | MXC |
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/grd.png" width="20"> Grand Rapids Gold | GRD | | <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/okl.png" width="20"> Oklahoma City Blue | OKL |
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/lak.png" width="20"> Laketown Squadron | LAK | | <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/rcity.png" width="20"> Rip City Remix | RCITY |
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/lin.png" width="20"> Long Island Nets | LIN | | <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/rgv.png" width="20"> Rio Grande Valley Vipers | RGV |
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/mcc.png" width="20"> Motor City Cruise | MCC | | <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/san.png" width="20"> San Diego Clippers | SAN |
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/mne.png" width="20"> Maine Celtics | MNE | | <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/scw.png" width="20"> Santa Cruz Warriors | SCW |
| <img src="https://a.espncdn.com/guid/373d77e0-4edd-aaeb-ec83-eefc2ca511cb/logos/default.png" width="20"> Noblesville Boom | NOB | | <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/slc.png" width="20"> Salt Lake City Stars | SLC |
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/osc.png" width="20"> Osceola Magic | OSC | | <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/sto.png" width="20"> Stockton Kings | STO |
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/rap.png" width="20"> Raptors 905 | RAP | | <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/sxf.png" width="20"> Sioux Falls Skyforce | SXF |
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/wcb.png" width="20"> Windy City Bulls | WCB | | <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/tex.png" width="20"> Texas Legends | TEX |
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/wes.png" width="20"> Westchester Knicks | WES | | <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/valley.png" width="20"> Valley Suns | VALLEY |
| <img src="https://a.espncdn.com/i/teamlogos/nba-development/500/wis.png" width="20"> Wisconsin Herd | WIS | |  |  |

---

</details>

<!-- college-abbreviations:ncaab:start -->
## NCAA Men's Basketball Team Abbreviations
<details><summary>NCAA Men's Basketball roster</summary>


Current teams from ESPN's public directory. The directory can change as schools are added or reclassified.

| Club | Abbr | Club | Abbr |
|---|---|---|---|
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2000.png" width="20"> Abilene Christian Wildcats | `ACU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2005.png" width="20"> Air Force Falcons | `AF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2006.png" width="20"> Akron Zips | `AKR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2010.png" width="20"> Alabama A&M Bulldogs | `AAMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/333.png" width="20"> Alabama Crimson Tide | `ALA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2011.png" width="20"> Alabama State Hornets | `ALST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2016.png" width="20"> Alcorn State Braves | `ALCN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/44.png" width="20"> American University Eagles | `AMER` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2026.png" width="20"> App State Mountaineers | `APP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/9.png" width="20"> Arizona State Sun Devils | `ASU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/12.png" width="20"> Arizona Wildcats | `ARIZ` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/8.png" width="20"> Arkansas Razorbacks | `ARK` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2032.png" width="20"> Arkansas State Red Wolves | `ARST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2029.png" width="20"> Arkansas-Pine Bluff Golden Lions | `UAPB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/349.png" width="20"> Army Black Knights | `ARMY` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2.png" width="20"> Auburn Tigers | `AUB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2046.png" width="20"> Austin Peay Governors | `APSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2050.png" width="20"> Ball State Cardinals | `BALL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/239.png" width="20"> Baylor Bears | `BAY` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/91.png" width="20"> Bellarmine Knights | `BELL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2057.png" width="20"> Belmont Bruins | `BEL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2065.png" width="20"> Bethune-Cookman Wildcats | `BCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2066.png" width="20"> Binghamton Bearcats | `BING` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/68.png" width="20"> Boise State Broncos | `BOIS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/103.png" width="20"> Boston College Eagles | `BC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/104.png" width="20"> Boston University Terriers | `BU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/189.png" width="20"> Bowling Green Falcons | `BGSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/71.png" width="20"> Bradley Braves | `BRAD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/225.png" width="20"> Brown Bears | `BRWN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2803.png" width="20"> Bryant Bulldogs | `BRY` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2083.png" width="20"> Bucknell Bison | `BUCK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2084.png" width="20"> Buffalo Bulls | `BUF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2086.png" width="20"> Butler Bulldogs | `BTLR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/252.png" width="20"> BYU Cougars | `BYU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/13.png" width="20"> Cal Poly Mustangs | `CP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2934.png" width="20"> Cal State Bakersfield Roadrunners | `CSUB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2239.png" width="20"> Cal State Fullerton Titans | `CSUF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2463.png" width="20"> Cal State Northridge Matadors | `CSUN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2856.png" width="20"> California Baptist Lancers | `CBU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/25.png" width="20"> California Golden Bears | `CAL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2097.png" width="20"> Campbell Fighting Camels | `CAM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2099.png" width="20"> Canisius Golden Griffins | `CAN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2110.png" width="20"> Central Arkansas Bears | `CARK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2115.png" width="20"> Central Connecticut Blue Devils | `CCSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2117.png" width="20"> Central Michigan Chippewas | `CMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/232.png" width="20"> Charleston Cougars | `COFC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2127.png" width="20"> Charleston Southern Buccaneers | `CHSO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2429.png" width="20"> Charlotte 49ers | `CLT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/236.png" width="20"> Chattanooga Mocs | `UTC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2130.png" width="20"> Chicago State Cougars | `CHST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2132.png" width="20"> Cincinnati Bearcats | `CIN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/228.png" width="20"> Clemson Tigers | `CLEM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/325.png" width="20"> Cleveland State Vikings | `CLE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/324.png" width="20"> Coastal Carolina Chanticleers | `CCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2142.png" width="20"> Colgate Raiders | `COLG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/38.png" width="20"> Colorado Buffaloes | `COLO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/36.png" width="20"> Colorado State Rams | `CSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/171.png" width="20"> Columbia Lions | `COLU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2154.png" width="20"> Coppin State Eagles | `COPP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/172.png" width="20"> Cornell Big Red | `COR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/156.png" width="20"> Creighton Bluejays | `CREI` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/159.png" width="20"> Dartmouth Big Green | `DART` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2166.png" width="20"> Davidson Wildcats | `DAV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2168.png" width="20"> Dayton Flyers | `DAY` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/48.png" width="20"> Delaware Blue Hens | `DEL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2169.png" width="20"> Delaware State Hornets | `DSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2172.png" width="20"> Denver Pioneers | `DEN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/305.png" width="20"> DePaul Blue Demons | `DEP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2174.png" width="20"> Detroit Mercy Titans | `DETM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2181.png" width="20"> Drake Bulldogs | `DRKE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2182.png" width="20"> Drexel Dragons | `DREX` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/150.png" width="20"> Duke Blue Devils | `DUKE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2184.png" width="20"> Duquesne Dukes | `DUQ` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/151.png" width="20"> East Carolina Pirates | `ECU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2193.png" width="20"> East Tennessee State Buccaneers | `ETSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2837.png" width="20"> East Texas A&M Lions | `ETAM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2197.png" width="20"> Eastern Illinois Panthers | `EIU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2198.png" width="20"> Eastern Kentucky Colonels | `EKU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2199.png" width="20"> Eastern Michigan Eagles | `EMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/331.png" width="20"> Eastern Washington Eagles | `EWU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2210.png" width="20"> Elon Phoenix | `ELON` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/339.png" width="20"> Evansville Purple Aces | `EVAN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2217.png" width="20"> Fairfield Stags | `FAIR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/161.png" width="20"> Fairleigh Dickinson Knights | `FDU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/50.png" width="20"> Florida A&M Rattlers | `FAMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2226.png" width="20"> Florida Atlantic Owls | `FAU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/57.png" width="20"> Florida Gators | `FLA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/526.png" width="20"> Florida Gulf Coast Eagles | `FGCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2229.png" width="20"> Florida International Panthers | `FIU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/52.png" width="20"> Florida State Seminoles | `FSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2230.png" width="20"> Fordham Rams | `FOR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/278.png" width="20"> Fresno State Bulldogs | `FRES` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/231.png" width="20"> Furman Paladins | `FUR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2241.png" width="20"> Gardner-Webb Runnin' Bulldogs | `GWEB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2244.png" width="20"> George Mason Patriots | `GMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/45.png" width="20"> George Washington Revolutionaries | `GW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/46.png" width="20"> Georgetown Hoyas | `GTWN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/61.png" width="20"> Georgia Bulldogs | `UGA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/290.png" width="20"> Georgia Southern Eagles | `GASO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2247.png" width="20"> Georgia State Panthers | `GAST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/59.png" width="20"> Georgia Tech Yellow Jackets | `GT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2250.png" width="20"> Gonzaga Bulldogs | `GONZ` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2755.png" width="20"> Grambling Tigers | `GRAM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2253.png" width="20"> Grand Canyon Lopes | `GCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2739.png" width="20"> Green Bay Phoenix | `GB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2261.png" width="20"> Hampton Pirates | `HAMP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/108.png" width="20"> Harvard Crimson | `HARV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/62.png" width="20"> Hawai'i Rainbow Warriors | `HAW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2272.png" width="20"> High Point Panthers | `HPU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2275.png" width="20"> Hofstra Pride | `HOF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/107.png" width="20"> Holy Cross Crusaders | `HC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2277.png" width="20"> Houston Christian Huskies | `HCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/248.png" width="20"> Houston Cougars | `HOU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/47.png" width="20"> Howard Bison | `HOW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/304.png" width="20"> Idaho State Bengals | `IDST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/70.png" width="20"> Idaho Vandals | `IDHO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/356.png" width="20"> Illinois Fighting Illini | `ILL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2287.png" width="20"> Illinois State Redbirds | `ILST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2916.png" width="20"> Incarnate Word Cardinals | `UIW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/84.png" width="20"> Indiana Hoosiers | `IU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/282.png" width="20"> Indiana State Sycamores | `INST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/314.png" width="20"> Iona Gaels | `IONA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png" width="20"> Iowa Hawkeyes | `IOWA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/66.png" width="20"> Iowa State Cyclones | `ISU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/85.png" width="20"> IU Indianapolis Jaguars | `IUIN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2296.png" width="20"> Jackson State Tigers | `JKST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/294.png" width="20"> Jacksonville Dolphins | `JAX` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/55.png" width="20"> Jacksonville State Gamecocks | `JXST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/256.png" width="20"> James Madison Dukes | `JMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/140.png" width="20"> Kansas City Roos | `KC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png" width="20"> Kansas Jayhawks | `KU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2306.png" width="20"> Kansas State Wildcats | `KSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/338.png" width="20"> Kennesaw State Owls | `KENN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2309.png" width="20"> Kent State Golden Flashes | `KENT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/96.png" width="20"> Kentucky Wildcats | `UK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2325.png" width="20"> La Salle Explorers | `LAS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/322.png" width="20"> Lafayette Leopards | `LAF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2320.png" width="20"> Lamar Cardinals | `LAM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2330.png" width="20"> Le Moyne Dolphins | `LEM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2329.png" width="20"> Lehigh Mountain Hawks | `LEH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2335.png" width="20"> Liberty Flames | `LIB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/288.png" width="20"> Lipscomb Bisons | `LIP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2031.png" width="20"> Little Rock Trojans | `LR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/299.png" width="20"> Long Beach State Beach | `LBSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/112358.png" width="20"> Long Island University Sharks | `LIU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2344.png" width="20"> Longwood Lancers | `LONG` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/309.png" width="20"> Louisiana Ragin' Cajuns | `UL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2348.png" width="20"> Louisiana Tech Bulldogs | `LT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/97.png" width="20"> Louisville Cardinals | `LOU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2350.png" width="20"> Loyola Chicago Ramblers | `LUC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2352.png" width="20"> Loyola Maryland Greyhounds | `L-MD` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2351.png" width="20"> Loyola Marymount Lions | `LMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2443.png" width="20"> LSU New Orleans Privateers | `NOLA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/99.png" width="20"> LSU Tigers | `LSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/311.png" width="20"> Maine Black Bears | `ME` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2363.png" width="20"> Manhattan Jaspers | `MAN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2368.png" width="20"> Marist Red Foxes | `MRST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/269.png" width="20"> Marquette Golden Eagles | `MARQ` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/276.png" width="20"> Marshall Thundering Herd | `MRSH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2379.png" width="20"> Maryland Eastern Shore Hawks | `UMES` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/120.png" width="20"> Maryland Terrapins | `MD` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/113.png" width="20"> Massachusetts Minutemen | `MASS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2377.png" width="20"> McNeese Cowboys | `MCN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/235.png" width="20"> Memphis Tigers | `MEM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2382.png" width="20"> Mercer Bears | `MER` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2385.png" width="20"> Mercyhurst Lakers | `MERC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2771.png" width="20"> Merrimack Warriors | `MRMK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/193.png" width="20"> Miami (OH) RedHawks | `M-OH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png" width="20"> Miami Hurricanes | `MIA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/127.png" width="20"> Michigan State Spartans | `MSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/130.png" width="20"> Michigan Wolverines | `MICH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2393.png" width="20"> Middle Tennessee Blue Raiders | `MTSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/270.png" width="20"> Milwaukee Panthers | `MILW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/135.png" width="20"> Minnesota Golden Gophers | `MINN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/344.png" width="20"> Mississippi State Bulldogs | `MSST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2400.png" width="20"> Mississippi Valley State Delta Devils | `MVSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2623.png" width="20"> Missouri State Bears | `MOST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/142.png" width="20"> Missouri Tigers | `MIZ` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2405.png" width="20"> Monmouth Hawks | `MONM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/149.png" width="20"> Montana Grizzlies | `MONT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/147.png" width="20"> Montana State Bobcats | `MTST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2413.png" width="20"> Morehead State Eagles | `MORE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2415.png" width="20"> Morgan State Bears | `MORG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/116.png" width="20"> Mount St. Mary's Mountaineers | `MSM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/93.png" width="20"> Murray State Racers | `MUR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2426.png" width="20"> Navy Midshipmen | `NAVY` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/152.png" width="20"> NC State Wolfpack | `NCSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/158.png" width="20"> Nebraska Cornhuskers | `NEB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2440.png" width="20"> Nevada Wolf Pack | `NEV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/160.png" width="20"> New Hampshire Wildcats | `UNH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2441.png" width="20"> New Haven Chargers | `NHVN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/167.png" width="20"> New Mexico Lobos | `UNM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/166.png" width="20"> New Mexico State Aggies | `NMSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/315.png" width="20"> Niagara Purple Eagles | `NIA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2447.png" width="20"> Nicholls Colonels | `NICH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2885.png" width="20"> NJIT Highlanders | `NJIT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2450.png" width="20"> Norfolk State Spartans | `NORF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2453.png" width="20"> North Alabama Lions | `UNA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2448.png" width="20"> North Carolina A&T Aggies | `NCAT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2428.png" width="20"> North Carolina Central Eagles | `NCCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/153.png" width="20"> North Carolina Tar Heels | `UNC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/155.png" width="20"> North Dakota Fighting Hawks | `UND` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2449.png" width="20"> North Dakota State Bison | `NDSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2454.png" width="20"> North Florida Ospreys | `UNF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/249.png" width="20"> North Texas Mean Green | `UNT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/111.png" width="20"> Northeastern Huskies | `NE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2464.png" width="20"> Northern Arizona Lumberjacks | `NAU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2458.png" width="20"> Northern Colorado Bears | `UNCO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2459.png" width="20"> Northern Illinois Huskies | `NIU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2460.png" width="20"> Northern Iowa Panthers | `UNI` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/94.png" width="20"> Northern Kentucky Norse | `NKU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2466.png" width="20"> Northwestern State Demons | `NWST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/77.png" width="20"> Northwestern Wildcats | `NU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/87.png" width="20"> Notre Dame Fighting Irish | `ND` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2473.png" width="20"> Oakland Golden Grizzlies | `OAK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/195.png" width="20"> Ohio Bobcats | `OHIO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/194.png" width="20"> Ohio State Buckeyes | `OSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/201.png" width="20"> Oklahoma Sooners | `OU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/197.png" width="20"> Oklahoma State Cowboys | `OKST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/295.png" width="20"> Old Dominion Monarchs | `ODU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/145.png" width="20"> Ole Miss Rebels | `MISS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2437.png" width="20"> Omaha Mavericks | `OMA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/198.png" width="20"> Oral Roberts Golden Eagles | `ORU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png" width="20"> Oregon Ducks | `ORE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/204.png" width="20"> Oregon State Beavers | `ORST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/279.png" width="20"> Pacific Tigers | `PAC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/213.png" width="20"> Penn State Nittany Lions | `PSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/219.png" width="20"> Pennsylvania Quakers | `PENN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2492.png" width="20"> Pepperdine Waves | `PEPP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/221.png" width="20"> Pittsburgh Panthers | `PITT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2501.png" width="20"> Portland Pilots | `PORT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2502.png" width="20"> Portland State Vikings | `PRST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2504.png" width="20"> Prairie View A&M Panthers | `PV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2506.png" width="20"> Presbyterian Blue Hose | `PRES` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/163.png" width="20"> Princeton Tigers | `PRIN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2507.png" width="20"> Providence Friars | `PROV` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png" width="20"> Purdue Boilermakers | `PUR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2870.png" width="20"> Purdue Fort Wayne Mastodons | `PFW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2514.png" width="20"> Quinnipiac Bobcats | `QUIN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2515.png" width="20"> Radford Highlanders | `RAD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/227.png" width="20"> Rhode Island Rams | `URI` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/242.png" width="20"> Rice Owls | `RICE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/257.png" width="20"> Richmond Spiders | `RICH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2520.png" width="20"> Rider Broncs | `RID` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2523.png" width="20"> Robert Morris Colonials | `RMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/164.png" width="20"> Rutgers Scarlet Knights | `RUTG` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/16.png" width="20"> Sacramento State Hornets | `SAC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2529.png" width="20"> Sacred Heart Pioneers | `SHU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2603.png" width="20"> Saint Joseph's Hawks | `JOES` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/139.png" width="20"> Saint Louis Billikens | `SLU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2608.png" width="20"> Saint Mary's Gaels | `SMC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2612.png" width="20"> Saint Peter's Peacocks | `SPU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2534.png" width="20"> Sam Houston Bearkats | `SHSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2535.png" width="20"> Samford Bulldogs | `SAM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/21.png" width="20"> San Diego State Aztecs | `SDSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/301.png" width="20"> San Diego Toreros | `USD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2539.png" width="20"> San Francisco Dons | `SF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/23.png" width="20"> San José State Spartans | `SJSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2541.png" width="20"> Santa Clara Broncos | `SCU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2545.png" width="20"> SE Louisiana Lions | `SELA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2547.png" width="20"> Seattle U Redhawks | `SEA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2550.png" width="20"> Seton Hall Pirates | `HALL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2561.png" width="20"> Siena Saints | `SIE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2565.png" width="20"> SIU Edwardsville Cougars | `SIUE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2567.png" width="20"> SMU Mustangs | `SMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/6.png" width="20"> South Alabama Jaguars | `USA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2579.png" width="20"> South Carolina Gamecocks | `SC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2569.png" width="20"> South Carolina State Bulldogs | `SCST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2908.png" width="20"> South Carolina Upstate Spartans | `UPST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/233.png" width="20"> South Dakota Coyotes | `SDAK` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2571.png" width="20"> South Dakota State Jackrabbits | `SDST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/58.png" width="20"> South Florida Bulls | `USF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2546.png" width="20"> Southeast Missouri State Redhawks | `SEMO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/79.png" width="20"> Southern Illinois Salukis | `SIU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2582.png" width="20"> Southern Jaguars | `SOU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2572.png" width="20"> Southern Miss Golden Eagles | `USM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/253.png" width="20"> Southern Utah Thunderbirds | `SUU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/179.png" width="20"> St. Bonaventure Bonnies | `SBU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2599.png" width="20"> St. John's Red Storm | `SJU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2900.png" width="20"> St. Thomas Tommies | `STMN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/24.png" width="20"> Stanford Cardinal | `STAN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2617.png" width="20"> Stephen F. Austin Lumberjacks | `SFA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/56.png" width="20"> Stetson Hatters | `STET` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/284.png" width="20"> Stonehill Skyhawks | `STO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2619.png" width="20"> Stony Brook Seawolves | `STBK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/183.png" width="20"> Syracuse Orange | `SYR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2627.png" width="20"> Tarleton State Texans | `TAR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2628.png" width="20"> TCU Horned Frogs | `TCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/218.png" width="20"> Temple Owls | `TEM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2634.png" width="20"> Tennessee State Tigers | `TNST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2635.png" width="20"> Tennessee Tech Golden Eagles | `TNTC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png" width="20"> Tennessee Volunteers | `TENN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/245.png" width="20"> Texas A&M Aggies | `TA&M` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/357.png" width="20"> Texas A&M-Corpus Christi Islanders | `AMCC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/251.png" width="20"> Texas Longhorns | `TEX` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2640.png" width="20"> Texas Southern Tigers | `TXSO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/326.png" width="20"> Texas State Bobcats | `TXST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2641.png" width="20"> Texas Tech Red Raiders | `TTU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2643.png" width="20"> The Citadel Bulldogs | `CIT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2649.png" width="20"> Toledo Rockets | `TOL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/119.png" width="20"> Towson Tigers | `TOW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2653.png" width="20"> Troy Trojans | `TROY` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2655.png" width="20"> Tulane Green Wave | `TULN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/202.png" width="20"> Tulsa Golden Hurricane | `TLSA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/5.png" width="20"> UAB Blazers | `UAB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/399.png" width="20"> UAlbany Great Danes | `UALB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/302.png" width="20"> UC Davis Aggies | `UCD` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/300.png" width="20"> UC Irvine Anteaters | `UCI` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/27.png" width="20"> UC Riverside Highlanders | `UCR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/28.png" width="20"> UC San Diego Tritons | `UCSD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2540.png" width="20"> UC Santa Barbara Gauchos | `UCSB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2116.png" width="20"> UCF Knights | `UCF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/26.png" width="20"> UCLA Bruins | `UCLA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/41.png" width="20"> UConn Huskies | `CONN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/82.png" width="20"> UIC Flames | `UIC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2433.png" width="20"> UL Monroe Warhawks | `ULM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2349.png" width="20"> UMass Lowell River Hawks | `UML` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2378.png" width="20"> UMBC Retrievers | `UMBC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2427.png" width="20"> UNC Asheville Bulldogs | `UNCA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2430.png" width="20"> UNC Greensboro Spartans | `UNCG` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/350.png" width="20"> UNC Wilmington Seahawks | `UNCW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2439.png" width="20"> UNLV Rebels | `UNLV` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/30.png" width="20"> USC Trojans | `USC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/250.png" width="20"> UT Arlington Mavericks | `UTA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2630.png" width="20"> UT Martin Skyhawks | `UTM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/292.png" width="20"> UT Rio Grande Valley Vaqueros | `RGV` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/328.png" width="20"> Utah State Aggies | `USU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/3101.png" width="20"> Utah Tech Trailblazers | `UTU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/254.png" width="20"> Utah Utes | `UTAH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/3084.png" width="20"> Utah Valley Wolverines | `UVU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2638.png" width="20"> UTEP Miners | `UTEP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2636.png" width="20"> UTSA Roadrunners | `UTSA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2674.png" width="20"> Valparaiso Beacons | `VAL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/238.png" width="20"> Vanderbilt Commodores | `VAN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2670.png" width="20"> VCU Rams | `VCU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/261.png" width="20"> Vermont Catamounts | `UVM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/222.png" width="20"> Villanova Wildcats | `VILL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/258.png" width="20"> Virginia Cavaliers | `UVA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/259.png" width="20"> Virginia Tech Hokies | `VT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2678.png" width="20"> VMI Keydets | `VMI` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2681.png" width="20"> Wagner Seahawks | `WAG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/154.png" width="20"> Wake Forest Demon Deacons | `WAKE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/264.png" width="20"> Washington Huskies | `WASH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/265.png" width="20"> Washington State Cougars | `WSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2692.png" width="20"> Weber State Wildcats | `WEB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2697.png" width="20"> West Florida Argonauts | `WFL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2698.png" width="20"> West Georgia Wolves | `WGA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/277.png" width="20"> West Virginia Mountaineers | `WVU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2717.png" width="20"> Western Carolina Catamounts | `WCU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2710.png" width="20"> Western Illinois Leathernecks | `WIU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/98.png" width="20"> Western Kentucky Hilltoppers | `WKU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2711.png" width="20"> Western Michigan Broncos | `WMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2724.png" width="20"> Wichita State Shockers | `WICH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2729.png" width="20"> William & Mary Tribe | `W&M` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2737.png" width="20"> Winthrop Eagles | `WIN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/275.png" width="20"> Wisconsin Badgers | `WIS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2747.png" width="20"> Wofford Terriers | `WOF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2750.png" width="20"> Wright State Raiders | `WRST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2751.png" width="20"> Wyoming Cowboys | `WYO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2752.png" width="20"> Xavier Musketeers | `XAV` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/43.png" width="20"> Yale Bulldogs | `YALE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2754.png" width="20"> Youngstown State Penguins | `YSU` |
</details>
<!-- college-abbreviations:ncaab:end -->

<!-- college-abbreviations:ncaaw:start -->
## NCAA Women's Basketball Team Abbreviations
<details><summary>NCAA Women's Basketball roster</summary>

Current teams from ESPN's public directory. The directory can change as schools are added or reclassified.

| Club | Abbr | Club | Abbr |
|---|---|---|---|
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2000.png" width="20"> Abilene Christian Wildcats | `ACU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2005.png" width="20"> Air Force Falcons | `AF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2006.png" width="20"> Akron Zips | `AKR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2010.png" width="20"> Alabama A&M Bulldogs | `AAMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/333.png" width="20"> Alabama Crimson Tide | `ALA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2011.png" width="20"> Alabama State Lady Hornets | `ALST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2016.png" width="20"> Alcorn State Lady Braves | `ALCN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/44.png" width="20"> American University Eagles | `AMER` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2026.png" width="20"> App State Mountaineers | `APP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/9.png" width="20"> Arizona State Sun Devils | `ASU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/12.png" width="20"> Arizona Wildcats | `ARIZ` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/8.png" width="20"> Arkansas Razorbacks | `ARK` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2032.png" width="20"> Arkansas State Red Wolves | `ARST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2029.png" width="20"> Arkansas-Pine Bluff Golden Lions | `UAPB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/349.png" width="20"> Army Black Knights | `ARMY` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2.png" width="20"> Auburn Tigers | `AUB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2046.png" width="20"> Austin Peay Governors | `APSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2050.png" width="20"> Ball State Cardinals | `BALL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/239.png" width="20"> Baylor Bears | `BAY` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/91.png" width="20"> Bellarmine Knights | `BELL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2057.png" width="20"> Belmont Bruins | `BEL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2065.png" width="20"> Bethune-Cookman Wildcats | `BCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2066.png" width="20"> Binghamton Bearcats | `BING` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/68.png" width="20"> Boise State Broncos | `BOIS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/103.png" width="20"> Boston College Eagles | `BC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/104.png" width="20"> Boston University Terriers | `BU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/189.png" width="20"> Bowling Green Falcons | `BGSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/71.png" width="20"> Bradley Braves | `BRAD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/225.png" width="20"> Brown Bears | `BRWN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2803.png" width="20"> Bryant Bulldogs | `BRY` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2083.png" width="20"> Bucknell Bison | `BUCK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2084.png" width="20"> Buffalo Bulls | `BUF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2086.png" width="20"> Butler Bulldogs | `BTLR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/252.png" width="20"> BYU Cougars | `BYU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/13.png" width="20"> Cal Poly Mustangs | `CP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2934.png" width="20"> Cal State Bakersfield Roadrunners | `CSUB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2239.png" width="20"> Cal State Fullerton Titans | `CSUF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2463.png" width="20"> Cal State Northridge Matadors | `CSUN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2856.png" width="20"> California Baptist Lancers | `CBU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/25.png" width="20"> California Golden Bears | `CAL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2097.png" width="20"> Campbell Fighting Camels | `CAM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2099.png" width="20"> Canisius Golden Griffins | `CAN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2110.png" width="20"> Central Arkansas Bears | `CARK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2115.png" width="20"> Central Connecticut Blue Devils | `CCSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2117.png" width="20"> Central Michigan Chippewas | `CMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/232.png" width="20"> Charleston Cougars | `COFC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2127.png" width="20"> Charleston Southern Buccaneers | `CHSO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2429.png" width="20"> Charlotte 49ers | `CLT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/236.png" width="20"> Chattanooga Mocs | `UTC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2130.png" width="20"> Chicago State Cougars | `CHST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2132.png" width="20"> Cincinnati Bearcats | `CIN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/228.png" width="20"> Clemson Tigers | `CLEM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/325.png" width="20"> Cleveland State Vikings | `CLE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/324.png" width="20"> Coastal Carolina Chanticleers | `CCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2142.png" width="20"> Colgate Raiders | `COLG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/38.png" width="20"> Colorado Buffaloes | `COLO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/36.png" width="20"> Colorado State Rams | `CSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/171.png" width="20"> Columbia Lions | `COLU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2154.png" width="20"> Coppin State Eagles | `COPP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/172.png" width="20"> Cornell Big Red | `COR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/156.png" width="20"> Creighton Bluejays | `CREI` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/159.png" width="20"> Dartmouth Big Green | `DART` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2166.png" width="20"> Davidson Wildcats | `DAV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2168.png" width="20"> Dayton Flyers | `DAY` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/48.png" width="20"> Delaware Blue Hens | `DEL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2169.png" width="20"> Delaware State Hornets | `DSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2172.png" width="20"> Denver Pioneers | `DEN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/305.png" width="20"> DePaul Blue Demons | `DEP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2174.png" width="20"> Detroit Mercy Titans | `DETM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2181.png" width="20"> Drake Bulldogs | `DRKE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2182.png" width="20"> Drexel Dragons | `DREX` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/150.png" width="20"> Duke Blue Devils | `DUKE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2184.png" width="20"> Duquesne Dukes | `DUQ` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/151.png" width="20"> East Carolina Pirates | `ECU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2193.png" width="20"> East Tennessee State Bucs | `ETSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2837.png" width="20"> East Texas A&M Lions | `ETAM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2197.png" width="20"> Eastern Illinois Panthers | `EIU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2198.png" width="20"> Eastern Kentucky Colonels | `EKU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2199.png" width="20"> Eastern Michigan Eagles | `EMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/331.png" width="20"> Eastern Washington Eagles | `EWU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2210.png" width="20"> Elon Phoenix | `ELON` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/339.png" width="20"> Evansville Purple Aces | `EVAN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2217.png" width="20"> Fairfield Stags | `FAIR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/161.png" width="20"> Fairleigh Dickinson Knights | `FDU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/50.png" width="20"> Florida A&M Rattlers | `FAMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2226.png" width="20"> Florida Atlantic Owls | `FAU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/57.png" width="20"> Florida Gators | `FLA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/526.png" width="20"> Florida Gulf Coast Eagles | `FGCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2229.png" width="20"> Florida International Panthers | `FIU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/52.png" width="20"> Florida State Seminoles | `FSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2230.png" width="20"> Fordham Rams | `FOR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/278.png" width="20"> Fresno State Bulldogs | `FRES` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/231.png" width="20"> Furman Paladins | `FUR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2241.png" width="20"> Gardner-Webb Runnin' Bulldogs | `GWEB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2244.png" width="20"> George Mason Patriots | `GMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/45.png" width="20"> George Washington Revolutionaries | `GW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/46.png" width="20"> Georgetown Hoyas | `GTWN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/61.png" width="20"> Georgia Lady Bulldogs | `UGA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/290.png" width="20"> Georgia Southern Eagles | `GASO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2247.png" width="20"> Georgia State Panthers | `GAST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/59.png" width="20"> Georgia Tech Yellow Jackets | `GT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2250.png" width="20"> Gonzaga Bulldogs | `GONZ` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2755.png" width="20"> Grambling Lady Tigers | `GRAM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2253.png" width="20"> Grand Canyon Lopes | `GCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2739.png" width="20"> Green Bay Phoenix | `GB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2261.png" width="20"> Hampton Lady Pirates | `HAMP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/108.png" width="20"> Harvard Crimson | `HARV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/62.png" width="20"> Hawai'i Rainbow Warriors | `HAW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2272.png" width="20"> High Point Panthers | `HPU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2275.png" width="20"> Hofstra Pride | `HOF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/107.png" width="20"> Holy Cross Crusaders | `HC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2277.png" width="20"> Houston Christian Huskies | `HCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/248.png" width="20"> Houston Cougars | `HOU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/47.png" width="20"> Howard Bison | `HOW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/304.png" width="20"> Idaho State Bengals | `IDST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/70.png" width="20"> Idaho Vandals | `IDHO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/356.png" width="20"> Illinois Fighting Illini | `ILL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2287.png" width="20"> Illinois State Redbirds | `ILST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2916.png" width="20"> Incarnate Word Cardinals | `UIW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/84.png" width="20"> Indiana Hoosiers | `IU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/282.png" width="20"> Indiana State Sycamores | `INST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/314.png" width="20"> Iona Gaels | `IONA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png" width="20"> Iowa Hawkeyes | `IOWA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/66.png" width="20"> Iowa State Cyclones | `ISU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/85.png" width="20"> IU Indianapolis Jaguars | `IUIN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2296.png" width="20"> Jackson State Lady Tigers | `JKST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/294.png" width="20"> Jacksonville Dolphins | `JAX` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/55.png" width="20"> Jacksonville State Gamecocks | `JXST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/256.png" width="20"> James Madison Dukes | `JMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/140.png" width="20"> Kansas City Roos | `KC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png" width="20"> Kansas Jayhawks | `KU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2306.png" width="20"> Kansas State Wildcats | `KSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/338.png" width="20"> Kennesaw State Owls | `KENN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2309.png" width="20"> Kent State Golden Flashes | `KENT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/96.png" width="20"> Kentucky Wildcats | `UK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2325.png" width="20"> La Salle Explorers | `LAS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/322.png" width="20"> Lafayette Leopards | `LAF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2320.png" width="20"> Lamar Cardinals | `LAM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2330.png" width="20"> Le Moyne Dolphins | `LEM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2329.png" width="20"> Lehigh Mountain Hawks | `LEH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2335.png" width="20"> Liberty Flames | `LIB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2815.png" width="20"> Lindenwood Lions | `LIN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/288.png" width="20"> Lipscomb Bisons | `LIP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2031.png" width="20"> Little Rock Trojans | `LR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/299.png" width="20"> Long Beach State Beach | `LBSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/112358.png" width="20"> Long Island University Sharks | `LIU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2344.png" width="20"> Longwood Lancers | `LONG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/309.png" width="20"> Louisiana Ragin' Cajuns | `UL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2348.png" width="20"> Louisiana Tech Lady Techsters | `LT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/97.png" width="20"> Louisville Cardinals | `LOU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2350.png" width="20"> Loyola Chicago Ramblers | `LUC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2352.png" width="20"> Loyola Maryland Greyhounds | `L-MD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2351.png" width="20"> Loyola Marymount Lions | `LMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2443.png" width="20"> LSU New Orleans Privateers | `NOLA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/99.png" width="20"> LSU Tigers | `LSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/311.png" width="20"> Maine Black Bears | `ME` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2363.png" width="20"> Manhattan Jaspers | `MAN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2368.png" width="20"> Marist Red Foxes | `MRST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/269.png" width="20"> Marquette Golden Eagles | `MARQ` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/276.png" width="20"> Marshall Thundering Herd | `MRSH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2379.png" width="20"> Maryland Eastern Shore Hawks | `UMES` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/120.png" width="20"> Maryland Terrapins | `MD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/113.png" width="20"> Massachusetts Minutewomen | `MASS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2377.png" width="20"> McNeese Cowgirls | `MCN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/235.png" width="20"> Memphis Tigers | `MEM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2382.png" width="20"> Mercer Bears | `MER` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2771.png" width="20"> Merrimack Warriors | `MRMK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/193.png" width="20"> Miami (OH) RedHawks | `M-OH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png" width="20"> Miami Hurricanes | `MIA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/127.png" width="20"> Michigan State Spartans | `MSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/130.png" width="20"> Michigan Wolverines | `MICH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2393.png" width="20"> Middle Tennessee Blue Raiders | `MTSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/270.png" width="20"> Milwaukee Panthers | `MILW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/135.png" width="20"> Minnesota Golden Gophers | `MINN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/344.png" width="20"> Mississippi State Bulldogs | `MSST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2400.png" width="20"> Mississippi Valley State Devilettes | `MVSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2623.png" width="20"> Missouri State Lady Bears | `MOST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/142.png" width="20"> Missouri Tigers | `MIZ` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2405.png" width="20"> Monmouth Hawks | `MONM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/149.png" width="20"> Montana Lady Griz | `MONT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/147.png" width="20"> Montana State Bobcats | `MTST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2413.png" width="20"> Morehead State Eagles | `MORE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2415.png" width="20"> Morgan State Lady Bears | `MORG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/116.png" width="20"> Mount St. Mary's Mountaineers | `MSM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/93.png" width="20"> Murray State Racers | `MUR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2426.png" width="20"> Navy Midshipmen | `NAVY` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/152.png" width="20"> NC State Wolfpack | `NCSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/158.png" width="20"> Nebraska Cornhuskers | `NEB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2440.png" width="20"> Nevada Wolf Pack | `NEV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/160.png" width="20"> New Hampshire Wildcats | `UNH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2441.png" width="20"> New Haven Chargers | `NHVN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/167.png" width="20"> New Mexico Lobos | `UNM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/166.png" width="20"> New Mexico State Aggies | `NMSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/315.png" width="20"> Niagara Purple Eagles | `NIA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2447.png" width="20"> Nicholls Colonels | `NICH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2885.png" width="20"> NJIT Highlanders | `NJIT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2450.png" width="20"> Norfolk State Spartans | `NORF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2453.png" width="20"> North Alabama Lions | `UNA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2448.png" width="20"> North Carolina A&T Aggies | `NCAT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2428.png" width="20"> North Carolina Central Eagles | `NCCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/153.png" width="20"> North Carolina Tar Heels | `UNC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/155.png" width="20"> North Dakota Fighting Hawks | `UND` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2449.png" width="20"> North Dakota State Bison | `NDSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2454.png" width="20"> North Florida Ospreys | `UNF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/249.png" width="20"> North Texas Mean Green | `UNT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/111.png" width="20"> Northeastern Huskies | `NE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2464.png" width="20"> Northern Arizona Lumberjacks | `NAU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2458.png" width="20"> Northern Colorado Bears | `UNCO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2459.png" width="20"> Northern Illinois Huskies | `NIU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2460.png" width="20"> Northern Iowa Panthers | `UNI` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/94.png" width="20"> Northern Kentucky Norse | `NKU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2466.png" width="20"> Northwestern State Lady Demons | `NWST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/77.png" width="20"> Northwestern Wildcats | `NU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/87.png" width="20"> Notre Dame Fighting Irish | `ND` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2473.png" width="20"> Oakland Golden Grizzlies | `OAK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/195.png" width="20"> Ohio Bobcats | `OHIO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/194.png" width="20"> Ohio State Buckeyes | `OSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/201.png" width="20"> Oklahoma Sooners | `OU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/197.png" width="20"> Oklahoma State Cowgirls | `OKST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/295.png" width="20"> Old Dominion Monarchs | `ODU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/145.png" width="20"> Ole Miss Rebels | `MISS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2437.png" width="20"> Omaha Mavericks | `OMA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/198.png" width="20"> Oral Roberts Golden Eagles | `ORU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png" width="20"> Oregon Ducks | `ORE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/204.png" width="20"> Oregon State Beavers | `ORST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/279.png" width="20"> Pacific Tigers | `PAC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/213.png" width="20"> Penn State Lady Lions | `PSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/219.png" width="20"> Pennsylvania Quakers | `PENN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2492.png" width="20"> Pepperdine Waves | `PEPP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/221.png" width="20"> Pittsburgh Panthers | `PITT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2501.png" width="20"> Portland Pilots | `PORT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2502.png" width="20"> Portland State Vikings | `PRST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2504.png" width="20"> Prairie View A&M Lady Panthers | `PV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2506.png" width="20"> Presbyterian Blue Hose | `PRES` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/163.png" width="20"> Princeton Tigers | `PRIN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2507.png" width="20"> Providence Friars | `PROV` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png" width="20"> Purdue Boilermakers | `PUR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2870.png" width="20"> Purdue Fort Wayne Mastodons | `PFW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2511.png" width="20"> Queens University Royals | `QUC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2514.png" width="20"> Quinnipiac Bobcats | `QUIN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2515.png" width="20"> Radford Highlanders | `RAD` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/227.png" width="20"> Rhode Island Rams | `URI` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/242.png" width="20"> Rice Owls | `RICE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/257.png" width="20"> Richmond Spiders | `RICH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2520.png" width="20"> Rider Broncs | `RID` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2523.png" width="20"> Robert Morris Colonials | `RMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/164.png" width="20"> Rutgers Scarlet Knights | `RUTG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/16.png" width="20"> Sacramento State Hornets | `SAC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2529.png" width="20"> Sacred Heart Pioneers | `SHU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2603.png" width="20"> Saint Joseph's Hawks | `JOES` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/139.png" width="20"> Saint Louis Billikens | `SLU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2608.png" width="20"> Saint Mary's Gaels | `SMC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2612.png" width="20"> Saint Peter's Peacocks | `SPU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2534.png" width="20"> Sam Houston Bearkats | `SHSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2535.png" width="20"> Samford Bulldogs | `SAM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/21.png" width="20"> San Diego State Aztecs | `SDSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/301.png" width="20"> San Diego Toreros | `USD` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2539.png" width="20"> San Francisco Dons | `SF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/23.png" width="20"> San José State Spartans | `SJSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2541.png" width="20"> Santa Clara Broncos | `SCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2545.png" width="20"> SE Louisiana Lady Lions | `SELA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2547.png" width="20"> Seattle U Redhawks | `SEA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2550.png" width="20"> Seton Hall Pirates | `HALL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2561.png" width="20"> Siena Saints | `SIE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2565.png" width="20"> SIU Edwardsville Cougars | `SIUE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2567.png" width="20"> SMU Mustangs | `SMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/6.png" width="20"> South Alabama Jaguars | `USA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2579.png" width="20"> South Carolina Gamecocks | `SC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2569.png" width="20"> South Carolina State Lady Bulldogs | `SCST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2908.png" width="20"> South Carolina Upstate Spartans | `UPST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/233.png" width="20"> South Dakota Coyotes | `SDAK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2571.png" width="20"> South Dakota State Jackrabbits | `SDST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/58.png" width="20"> South Florida Bulls | `USF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2546.png" width="20"> Southeast Missouri State Redhawks | `SEMO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/79.png" width="20"> Southern Illinois Salukis | `SIU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/88.png" width="20"> Southern Indiana Screaming Eagles | `USI` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2582.png" width="20"> Southern Jaguars | `SOU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2572.png" width="20"> Southern Miss Lady Eagles | `USM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/253.png" width="20"> Southern Utah Thunderbirds | `SUU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/179.png" width="20"> St. Bonaventure Bonnies | `SBU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2599.png" width="20"> St. John's Red Storm | `SJU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2900.png" width="20"> St. Thomas Tommies | `STMN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/24.png" width="20"> Stanford Cardinal | `STAN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2617.png" width="20"> Stephen F. Austin Ladyjacks | `SFA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/56.png" width="20"> Stetson Hatters | `STET` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/284.png" width="20"> Stonehill Skyhawks | `STO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2619.png" width="20"> Stony Brook Seawolves | `STBK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/183.png" width="20"> Syracuse Orange | `SYR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2627.png" width="20"> Tarleton State Texans | `TAR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2628.png" width="20"> TCU Horned Frogs | `TCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/218.png" width="20"> Temple Owls | `TEM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2633_ncw.png" width="20"> Tennessee Lady Volunteers | `TENN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2634.png" width="20"> Tennessee State Lady Tigers | `TNST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2635.png" width="20"> Tennessee Tech Golden Eagles | `TNTC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/245.png" width="20"> Texas A&M Aggies | `TA&M` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/357.png" width="20"> Texas A&M-Corpus Christi Islanders | `AMCC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/251.png" width="20"> Texas Longhorns | `TEX` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2640.png" width="20"> Texas Southern Tigers | `TXSO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/326.png" width="20"> Texas State Bobcats | `TXST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2641.png" width="20"> Texas Tech Lady Raiders | `TTU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2649.png" width="20"> Toledo Rockets | `TOL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/119.png" width="20"> Towson Tigers | `TOW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2653.png" width="20"> Troy Trojans | `TROY` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2655.png" width="20"> Tulane Green Wave | `TULN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/202.png" width="20"> Tulsa Golden Hurricane | `TLSA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/5.png" width="20"> UAB Blazers | `UAB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/399.png" width="20"> UAlbany Great Danes | `UALB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/302.png" width="20"> UC Davis Aggies | `UCD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/300.png" width="20"> UC Irvine Anteaters | `UCI` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/27.png" width="20"> UC Riverside Highlanders | `UCR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/28.png" width="20"> UC San Diego Tritons | `UCSD` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2540.png" width="20"> UC Santa Barbara Gauchos | `UCSB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2116.png" width="20"> UCF Knights | `UCF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/26.png" width="20"> UCLA Bruins | `UCLA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/41.png" width="20"> UConn Huskies | `CONN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/82.png" width="20"> UIC Flames | `UIC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2433.png" width="20"> UL Monroe Warhawks | `ULM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2349.png" width="20"> UMass Lowell River Hawks | `UML` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2378.png" width="20"> UMBC Retrievers | `UMBC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2427.png" width="20"> UNC Asheville Bulldogs | `UNCA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2430.png" width="20"> UNC Greensboro Spartans | `UNCG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/350.png" width="20"> UNC Wilmington Seahawks | `UNCW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2439.png" width="20"> UNLV Lady Rebels | `UNLV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/30.png" width="20"> USC Trojans | `USC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/250.png" width="20"> UT Arlington Mavericks | `UTA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2630.png" width="20"> UT Martin Skyhawks | `UTM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/292.png" width="20"> UT Rio Grande Valley Vaqueros | `RGV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/328.png" width="20"> Utah State Aggies | `USU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/3101.png" width="20"> Utah Tech Trailblazers | `UTU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/254.png" width="20"> Utah Utes | `UTAH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/3084.png" width="20"> Utah Valley Wolverines | `UVU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2638.png" width="20"> UTEP Miners | `UTEP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2636.png" width="20"> UTSA Roadrunners | `UTSA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2674.png" width="20"> Valparaiso Beacons | `VAL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/238.png" width="20"> Vanderbilt Commodores | `VAN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2670.png" width="20"> VCU Rams | `VCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/261.png" width="20"> Vermont Catamounts | `UVM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/222.png" width="20"> Villanova Wildcats | `VILL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/258.png" width="20"> Virginia Cavaliers | `UVA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/259.png" width="20"> Virginia Tech Hokies | `VT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2681.png" width="20"> Wagner Seahawks | `WAG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/154.png" width="20"> Wake Forest Demon Deacons | `WAKE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/264.png" width="20"> Washington Huskies | `WASH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/265.png" width="20"> Washington State Cougars | `WSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2692.png" width="20"> Weber State Wildcats | `WEB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2697.png" width="20"> West Florida Argonauts | `WFL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2698.png" width="20"> West Georgia Wolves | `WGA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/277.png" width="20"> West Virginia Mountaineers | `WVU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2717.png" width="20"> Western Carolina Catamounts | `WCU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2710.png" width="20"> Western Illinois Leathernecks | `WIU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/98.png" width="20"> Western Kentucky Lady Toppers | `WKU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2711.png" width="20"> Western Michigan Broncos | `WMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2724.png" width="20"> Wichita State Shockers | `WICH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2729.png" width="20"> William & Mary Tribe | `W&M` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2737.png" width="20"> Winthrop Eagles | `WIN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/275.png" width="20"> Wisconsin Badgers | `WIS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2747.png" width="20"> Wofford Terriers | `WOF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2750.png" width="20"> Wright State Raiders | `WRST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2751.png" width="20"> Wyoming Cowgirls | `WYO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2752.png" width="20"> Xavier Musketeers | `XAV` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/43.png" width="20"> Yale Bulldogs | `YALE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2754.png" width="20"> Youngstown State Penguins | `YSU` |
</details>
<!-- college-abbreviations:ncaaw:end -->

<!-- college-abbreviations:ncaaf:start -->
## College Football Team Abbreviations
<details><summary>College Football roster</summary>

Current teams from ESPN's public directory. The directory can change as schools are added or reclassified.

| Club | Abbr | Club | Abbr |
|---|---|---|---|
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2000.png" width="20"> Abilene Christian Wildcats | `ACU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2001.png" width="20"> Adams State Grizzlies | `ADSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2003.png" width="20"> Adrian Bulldogs | `ADR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2005.png" width="20"> Air Force Falcons | `AF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2006.png" width="20"> Akron Zips | `AKR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2010.png" width="20"> Alabama A&M Bulldogs | `AAMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/333.png" width="20"> Alabama Crimson Tide | `ALA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2011.png" width="20"> Alabama State Hornets | `ALST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2013.png" width="20"> Albany State Golden Rams | `ABSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2790.png" width="20"> Albion Britons | `ALBI` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2015.png" width="20"> Albright Lions | `ALBR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2016.png" width="20"> Alcorn State Braves | `ALCN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/365.png" width="20"> Alfred Saxons | `ALFR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/3162.png" width="20"> Alfred State Pioneers | `AFST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2018.png" width="20"> Allegheny Gators | `ALLG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2019.png" width="20"> Allen Yellow Jackets | `ALNU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2800.png" width="20"> Alma Scots | `ALMA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/111674.png" width="20"> Alvernia Golden Wolves | `ALVR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2022.png" width="20"> American International Yellow Jackets | `AIC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/7.png" width="20"> Amherst Mammoths | `AMH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2023.png" width="20"> Anderson (IN) Ravens | `ANIN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/129469.png" width="20"> Anderson (SC) Trojans | `ANSC` |
| Andrew Fighting Tigers | `AND` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2025.png" width="20"> Angelo State Rams | `AGSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2026.png" width="20"> App State Mountaineers | `APP` | Apprentice School Builders | `APPRE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/9.png" width="20"> Arizona State Sun Devils | `ASU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/12.png" width="20"> Arizona Wildcats | `ARIZ` |
| Arkansas Baptist Buffaloes | `ARBA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2028.png" width="20"> Arkansas Monticello Boll Weevils | `UAM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/8.png" width="20"> Arkansas Razorbacks | `ARK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2032.png" width="20"> Arkansas State Red Wolves | `ARST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2033.png" width="20"> Arkansas Tech Wonder Boys | `ARTE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2029.png" width="20"> Arkansas-Pine Bluff Golden Lions | `UAPB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/349.png" width="20"> Army Black Knights | `ARMY` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/308.png" width="20"> Ashland Eagles | `ASH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2038.png" width="20"> Assumption Greyhounds | `ASP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2.png" width="20"> Auburn Tigers | `AUB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/124.png" width="20"> Augsburg Auggies | `AUGS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2042.png" width="20"> Augustana (IL) Vikings | `AUGC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2043.png" width="20"> Augustana (SD) Vikings | `AUSD` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2044.png" width="20"> Aurora Spartans | `AUR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2045.png" width="20"> Austin 'Roos | `AUS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2046.png" width="20"> Austin Peay Governors | `APSU` |
| Ave Maria University Gyrenes | `AVE M` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2047.png" width="20"> Averett Cougars | `AVER` |
| Avila University Eagles | `AVILA` | Azusa Pacific Cougars | `APU` |
| <img src="https://a.espncdn.com/guid/e67b5e1d-5f51-36a1-11d3-ae7bd11285f6/logos/default.png" width="20"> Baker University Baker | `BAK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/188.png" width="20"> Baldwin Wallace Yellow Jackets | `BW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2050.png" width="20"> Ball State Cardinals | `BALL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/122666.png" width="20"> Barton Bulldogs | `BART` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/121.png" width="20"> Bates Bobcats | `BATE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/239.png" width="20"> Baylor Bears | `BAY` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2056.png" width="20"> Belhaven Blazers | `BELH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/266.png" width="20"> Beloit Buccaneers | `BELO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/132.png" width="20"> Bemidji State Beavers | `BST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/490.png" width="20"> Benedict Tigers | `BEN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2283.png" width="20"> Benedictine (IL) Eagles | `BNIL` | Benedictine College Ravens | `BENC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2060.png" width="20"> Bentley Falcons | `BENT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2757.png" width="20"> Berry Vikings | `BERR` |
| Bethany (Ks) | `BETHA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2062.png" width="20"> Bethany (WV) Bison | `BCWV` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2802.png" width="20"> Bethel (MN) Royals | `BUMN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2064.png" width="20"> Bethel University Tennessee Wildcats | `BETHTN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2065.png" width="20"> Bethune-Cookman Wildcats | `BCU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2069.png" width="20"> Black Hills State Yellow Jackets | `BHSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2071.png" width="20"> Bloomsburg Huskies | `BBU` | BLUEFIELD Ramblin' Rams | `BLU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/124180.png" width="20"> Bluefield State Big Blue | `BLUS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2074.png" width="20"> Bluffton Beavers | `BLF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/68.png" width="20"> Boise State Broncos | `BOIS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/103.png" width="20"> Boston College Eagles | `BC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/340.png" width="20"> Bowdoin Polar Bears | `BOW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2075.png" width="20"> Bowie State Bulldogs | `BOWE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/189.png" width="20"> Bowling Green Falcons | `BGSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2913.png" width="20"> Brevard Tornados | `BRE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2079.png" width="20"> Bridgewater Eagles | `BRI` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/18.png" width="20"> Bridgewater State Bears | `BRIS` |
| British Columbia British Col | `BBM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2781.png" width="20"> Brockport Golden Eagles | `BRO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/225.png" width="20"> Brown Bears | `BRWN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2803.png" width="20"> Bryant Bulldogs | `BRY` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2083.png" width="20"> Bucknell Bison | `BUCK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/63.png" width="20"> Buena Vista Beavers | `BVU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2084.png" width="20"> Buffalo Bulls | `BUF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2085.png" width="20"> Buffalo State Bengals | `BSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2086.png" width="20"> Butler Bulldogs | `BTLR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/252.png" width="20"> BYU Cougars | `BYU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2094.png" width="20"> Cal Lutheran Kingsmen | `CLU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/13.png" width="20"> Cal Poly Mustangs | `CP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2858.png" width="20"> California (PA) Vulcans | `CAPA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/25.png" width="20"> California Golden Bears | `CAL` |
| Calvin Knights | `CALU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2097.png" width="20"> Campbell Fighting Camels | `CAM` |
| <img src="https://a.espncdn.com/guid/f76ae38d-adc8-ca05-8b1f-566b0bd32457/logos/default.png" width="20"> Campbellsville University Tigers | `CMPBVIL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/424.png" width="20"> Capital Comets | `CAPU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2101.png" width="20"> Carleton Knights | `CAR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2102.png" width="20"> Carnegie Mellon Tartans | `CGMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/32.png" width="20"> Carroll (WI) Pioneers | `CRU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2105.png" width="20"> Carson Newman Eagles | `CN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2106.png" width="20"> Carthage Firebirds | `CCW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2963.png" width="20"> Case Western Reserve Spartans | `CWRU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2107.png" width="20"> Catawba Indians | `CAT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2108.png" width="20"> Catholic Cardinals | `CATH` |
| Centenary (LA) Gentlemen | `CTLA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2110.png" width="20"> Central Arkansas Bears | `CARK` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2964.png" width="20"> Central College Dutch | `CNTC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2115.png" width="20"> Central Connecticut Blue Devils | `CCSU` |
| Central Methodist Eagles | `CDF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2117.png" width="20"> Central Michigan Chippewas | `CMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2118.png" width="20"> Central Missouri Mules | `UCM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2122.png" width="20"> Central Oklahoma Bronchos | `UCO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2119.png" width="20"> Central State Marauders | `CNSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2120.png" width="20"> Central Washington Wildcats | `CWAU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2121.png" width="20"> Centre Colonels | `CCO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2123.png" width="20"> Chadron State Eagles | `CHAD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/411.png" width="20"> Chapman Panthers | `CHAP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2128.png" width="20"> Charleston (WV) Golden Eagles | `UCWV` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2127.png" width="20"> Charleston Southern Buccaneers | `CHSO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2429.png" width="20"> Charlotte 49ers | `CLT` |
| Charlotte Saints | `COLLE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/236.png" width="20"> Chattanooga Mocs | `UTC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/80.png" width="20"> Chicago Maroons | `CHI` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2804.png" width="20"> Chowan Hawks | `CWAN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/3112.png" width="20"> Christopher Newport Captains | `CNU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2132.png" width="20"> Cincinnati Bearcats | `CIN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/17.png" width="20"> Claremont Mudd Scripps Stags | `CMS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2134.png" width="20"> Clarion Golden Eagles | `CLRN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2805.png" width="20"> Clark Atlanta Panthers | `CKGA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/228.png" width="20"> Clemson Tigers | `CLEM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2557.png" width="20"> Coast Guard Bears | `USCG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/324.png" width="20"> Coastal Carolina Chanticleers | `CCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2141.png" width="20"> Coe Kohawks | `COE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/33.png" width="20"> Colby White Mules | `CLBY` |
| Cole College Jaguars | `COLE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2142.png" width="20"> Colgate Raiders | `COLG` |
| College of Idaho Yotes | `COI` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/38.png" width="20"> Colorado Buffaloes | `COLO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/11.png" width="20"> Colorado Mesa Mavericks | `COMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2146.png" width="20"> Colorado School of Mines Orediggers | `CMIN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/36.png" width="20"> Colorado State Rams | `CSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/171.png" width="20"> Columbia Lions | `COLU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2148.png" width="20"> Concord Mountain Lions | `CONC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2152.png" width="20"> Concordia (MN) Cobbers | `CCMN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/409.png" width="20"> Concordia (WI) Falcons | `CUW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2151.png" width="20"> Concordia Chicago Cougars | `CUC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/3066.png" width="20"> Concordia St. Paul Golden Bears | `CSP` | Concordia University Nebraska Clippers | `CONCONE` |
| Concordia-Michigan Cardinals | `CONCMI` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2155.png" width="20"> Cornell (IA) Rams | `CNIA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/172.png" width="20"> Cornell Big Red | `COR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/509.png" width="20"> Crown Polars | `CRWN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2570.png" width="20"> CSU Pueblo ThunderWolves | `CSUP` | Culver-Stockton College Wildcats | `CULVE` |
| Cumberland (TN) Bulldogs | `CUMBTN` | Cumberlands Indians | `CMBS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/40.png" width="20"> Curry Colonels | `CC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/512.png" width="20"> Dakota State University Trojans | `DAKOT` |
| Dakota Wesleyan Tigers | `DWU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/159.png" width="20"> Dartmouth Big Green | `DART` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2166.png" width="20"> Davidson Wildcats | `DAV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2168.png" width="20"> Dayton Flyers | `DAY` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/110438.png" width="20"> Dean Bulldogs | `DEAN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/190.png" width="20"> Defiance College Yellow Jackets | `DEF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/48.png" width="20"> Delaware Blue Hens | `DEL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2169.png" width="20"> Delaware State Hornets | `DSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2808.png" width="20"> Delaware Valley Aggies | `DVU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2170.png" width="20"> Delta State Statesmen | `DLST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2171.png" width="20"> Denison Big Red | `DSN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/83.png" width="20"> DePauw Tigers | `DPU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2254.png" width="20"> Des Moines Vikings | `GRANDVIEW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2175.png" width="20"> Dickinson Red Devils | `DKSN` |
| <img src="https://a.espncdn.com/guid/ddfd8c06-89f1-9e9f-d698-ec5ed6637891/logos/default.png" width="20"> Dickinson State University Blue Hawks | `DIC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2181.png" width="20"> Drake Bulldogs | `DRKE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/49.png" width="20"> Dubuque Spartans | `DBQ` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/150.png" width="20"> Duke Blue Devils | `DUKE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2184.png" width="20"> Duquesne Dukes | `DUQ` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/151.png" width="20"> East Carolina Pirates | `ECU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2191.png" width="20"> East Central Tigers | `ECNU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2188.png" width="20"> East Stroudsburg Warriors | `ESU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2193.png" width="20"> East Tennessee State Buccaneers | `ETSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2837.png" width="20"> East Texas A&M Lions | `ETAM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2194.png" width="20"> East Texas Baptist Tigers | `ETBU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/127954.png" width="20"> Eastern Eagles | `EU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2197.png" width="20"> Eastern Illinois Panthers | `EIU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2198.png" width="20"> Eastern Kentucky Colonels | `EKU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2199.png" width="20"> Eastern Michigan Eagles | `EMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2201.png" width="20"> Eastern New Mexico Greyhounds | `ENMU` |
| Eastern Oregon | `EORE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/331.png" width="20"> Eastern Washington Eagles | `EWU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2205.png" width="20"> Edinboro Fighting Scots | `EDBR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2206.png" width="20"> Edward Waters Tigers | `EDW` |
| Elgin Eagles | `JUDSO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2207.png" width="20"> Elizabeth City State Vikings | `ECSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/72.png" width="20"> Elmhurst Bluejays | `ELMH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2210.png" width="20"> Elon Phoenix | `ELON` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2213.png" width="20"> Emory & Henry Wasps | `EHC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2214.png" width="20"> Emporia State Hornets | `EMSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/452.png" width="20"> Endicott Gulls | `ENDC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/101784.png" width="20"> Erskine Flying Fleet | `ERSK` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/101.png" width="20"> Eureka Red Devils | `ERKA` | Evangel University Crusaders | `EVA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2986.png" width="20"> Fairmont State Falcons | `FMSU` | Faulkner University Eagles | `FAULKNER` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2220.png" width="20"> Fayetteville State Broncos | `FAYU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2221.png" width="20"> FDU Florham Devils | `FDUF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2222.png" width="20"> Ferris State Bulldogs | `FRST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/366.png" width="20"> Ferrum Panthers | `FC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2224.png" width="20"> Findlay Oilers | `UF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/114.png" width="20"> Fitchburg State Falcons | `FBSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/50.png" width="20"> Florida A&M Rattlers | `FAMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2226.png" width="20"> Florida Atlantic Owls | `FAU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/57.png" width="20"> Florida Gators | `FLA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2229.png" width="20"> Florida International Panthers | `FIU` |
| Florida Memorial University Lions | `FLAMEMRL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/52.png" width="20"> Florida State Seminoles | `FSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2230.png" width="20"> Fordham Rams | `FOR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2231.png" width="20"> Fort Hays Tigers | `FHSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2237.png" width="20"> Fort Lewis Skyhawks | `FLWC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2232.png" width="20"> Fort Valley State Wildcats | `FVSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2967.png" width="20"> Framingham State Rams | `FRSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2234.png" width="20"> Franklin & Marshall Diplomats | `FMC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2233.png" width="20"> Franklin Grizzlies | `FRKL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/112334.png" width="20"> Franklin Pierce Ravens | `FP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/278.png" width="20"> Fresno State Bulldogs | `FRES` | Friends University Friends | `FRIE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/341.png" width="20"> Frostburg State Bobcats | `FSTU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/231.png" width="20"> Furman Paladins | `FUR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/417.png" width="20"> Gallaudet Bison | `GLDT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/367.png" width="20"> Gannon Golden Knights | `GANN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2241.png" width="20"> Gardner-Webb Runnin' Bulldogs | `GWEB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2242.png" width="20"> Geneva Golden Tornadoes | `GEN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/415.png" width="20"> George Fox Bruins | `GFU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2244.png" width="20"> George Mason University Patriots | `GMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2245.png" width="20"> Georgetown College Kentucky Tigers | `GTOWNCOLL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/46.png" width="20"> Georgetown Hoyas | `GTWN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/61.png" width="20"> Georgia Bulldogs | `UGA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/290.png" width="20"> Georgia Southern Eagles | `GASO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2247.png" width="20"> Georgia State Panthers | `GAST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/59.png" width="20"> Georgia Tech Yellow Jackets | `GT` |
| <img src="https://a.espncdn.com/guid/729c7315-1812-052c-1123-f44cf21b435c/logos/default.png" width="20"> Gettysburg Bullets | `GTYB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2249.png" width="20"> Glenville State Pioneers | `GVLS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/530.png" width="20"> Graceland University Graceland | `GRC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2755.png" width="20"> Grambling Tigers | `GRAM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/125.png" width="20"> Grand Valley State Lakers | `GVSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2256.png" width="20"> Greensboro Pride | `GRNB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2257.png" width="20"> Greenville Panthers | `GRNV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/65.png" width="20"> Grinnell Pioneers | `GRNL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/146.png" width="20"> Grove City Wolverines | `GRO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2258.png" width="20"> Guilford Quakers | `GLFD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2968.png" width="20"> Gustavus Adolphus Golden Gusties | `GAC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/348.png" width="20"> Hamilton Continentals | `HAM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/162.png" width="20"> Hamline Pipers | `HMLN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/297.png" width="20"> Hampden Sydney Tigers | `HSC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2261.png" width="20"> Hampton Pirates | `HAMP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2262.png" width="20"> Hanover Panthers | `HNVR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2810.png" width="20"> Hardin Simmons Cowboys | `HSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2264.png" width="20"> Harding Bisons | `HARD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/173.png" width="20"> Hartwick Hawks | `HRTW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/108.png" width="20"> Harvard Crimson | `HARV` |
| Haskell Indian Nations Univ Jayhawks | `HASKELL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/62.png" width="20"> Hawai'i Rainbow Warriors | `HAW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/191.png" width="20"> Heidelberg Student Princes | `HDBG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2271.png" width="20"> Henderson State Reddies | `HSTU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/418.png" width="20"> Hendrix Warriors | `HDX` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/125974.png" width="20"> Hilbert Hawks | `HLBT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2273.png" width="20"> Hillsdale Chargers | `HLDL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2274.png" width="20"> Hiram Terriers | `HIRM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/174.png" width="20"> Hobart Statesmen | `HBRT` | Holland College Hurricanes | `HOL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/107.png" width="20"> Holy Cross Crusaders | `HC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2812.png" width="20"> Hope Flying Dutchmen | `HOPE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2277.png" width="20"> Houston Christian Huskies | `HCU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/248.png" width="20"> Houston Cougars | `HOU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/47.png" width="20"> Howard Bison | `HOW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2758.png" width="20"> Howard Payne Yellow Jackets | `HWPU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2938.png" width="20"> Huntingdon Hawks | `HNTC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2280.png" width="20"> Husson Eagles | `HUSS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/304.png" width="20"> Idaho State Bengals | `IDST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/70.png" width="20"> Idaho Vandals | `IDHO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2286.png" width="20"> Illinois College Blueboys | `ILLC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/356.png" width="20"> Illinois Fighting Illini | `ILL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2287.png" width="20"> Illinois State Redbirds | `ILST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/306.png" width="20"> Illinois Wesleyan Titans | `ILWU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2916.png" width="20"> Incarnate Word Cardinals | `UIW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/84.png" width="20"> Indiana Hoosiers | `IU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/282.png" width="20"> Indiana State Sycamores | `INST` | Indiana Wesleyan Wildcats | `INWESL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2292.png" width="20"> Indianapolis Greyhounds | `INDY` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png" width="20"> Iowa Hawkeyes | `IOWA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/66.png" width="20"> Iowa State Cyclones | `ISU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/175.png" width="20"> Ithaca Bombers | `ITH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2291.png" width="20"> IU Pennsylvania Crimson Hawks | `IUP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2296.png" width="20"> Jackson State Tigers | `JKST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/55.png" width="20"> Jacksonville State Gamecocks | `JXST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/256.png" width="20"> James Madison Dukes | `JMU` |
| Jamestown Jimmies | `UJ` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2302.png" width="20"> John Carroll Blue Streaks | `JCU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/118.png" width="20"> Johns Hopkins Blue Jays | `JHU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2304.png" width="20"> Johnson C. Smith Golden Bulls | `JCSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/246.png" width="20"> Juniata Eagles | `JUN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/126.png" width="20"> Kalamazoo Hornets | `KALC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png" width="20"> Kansas Jayhawks | `KU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2306.png" width="20"> Kansas State Wildcats | `KSU` |
| Kansas Wesleyan Ks Wesleyan | `KANSA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2871.png" width="20"> Kean Cougars | `KEAN` |
| Keiser University Keiser | `KEISER` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/338.png" width="20"> Kennesaw State Owls | `KENN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2309.png" width="20"> Kent State Golden Flashes | `KENT` | Kentucky Christian Knights | `KYCHR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2310.png" width="20"> Kentucky State Thorobreds | `KYSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2316.png" width="20"> Kentucky Wesleyan Panthers | `KWC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/96.png" width="20"> Kentucky Wildcats | `UK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/352.png" width="20"> Kenyon Owls | `KNY` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/122774.png" width="20"> Keystone Giants | `KYSN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/247.png" width="20"> King's Monarchs | `KNGS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/255.png" width="20"> Knox Prairie Fire | `KNOX` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2315.png" width="20"> Kutztown Golden Bears | `KUTZ` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2318.png" width="20"> La Verne Leopards | `ULV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/322.png" width="20"> Lafayette Leopards | `LAF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/548.png" width="20"> LaGrange Panthers | `LGC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/437.png" width="20"> Lake Erie Storm | `LKER` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/262.png" width="20"> Lake Forest Foresters | `LFC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/6353.png" width="20"> Lakeland Muskies | `LKLD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2320.png" width="20"> Lamar Cardinals | `LAM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2323.png" width="20"> Lane College Dragons | `LANE` |
| Langston Lions | `LNGT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/268.png" width="20"> Lawrence Vikings | `LAW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/388.png" width="20"> Lebanon Valley Flying Dutchmen | `LVC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2329.png" width="20"> Lehigh Mountain Hawks | `LEH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2331.png" width="20"> Lenoir Rhyne Bears | `LENR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2333.png" width="20"> Lewis & Clark River Otters | `LC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2335.png" width="20"> Liberty Flames | `LIB` | Lincoln (CA) Oaklanders | `LNCA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2876.png" width="20"> Lincoln (MO) Blue Tigers | `LNMO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2339.png" width="20"> Lincoln (PA) Lions | `LNPA` |
| Lindenwood Belleville Lynx | `LINB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2815.png" width="20"> Lindenwood Lions | `LIN` |
| Lindsey Wilson LINDSEY | `LWU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/203.png" width="20"> Linfield Wildcats | `LINF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2940.png" width="20"> Livingstone Blue Bears | `LIV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/209.png" width="20"> Lock Haven Bald Eagles | `LHU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2341.png" width="20"> Long Island University Sharks | `LIU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/263.png" width="20"> Loras Duhawks | `LOR` |
| <img src="https://a.espncdn.com/guid/e678dcd8-a1e1-55e8-5dcb-4b1076cb6629/logos/default.png" width="20"> Louisiana Christian Wildcats | `LCHR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/309.png" width="20"> Louisiana Ragin' Cajuns | `UL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2348.png" width="20"> Louisiana Tech Bulldogs | `LT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/97.png" width="20"> Louisville Cardinals | `LOU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/99.png" width="20"> LSU Tigers | `LSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/67.png" width="20"> Luther Norse | `LUTH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2354.png" width="20"> Lycoming Warriors | `LYCO` | Lyon Scots | `LYON` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2359.png" width="20"> Macalester Scots | `MAC` | MADONNA | `MDNN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/311.png" width="20"> Maine Black Bears | `ME` | Maine Maritime Mariners | `UMMA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2362.png" width="20"> Manchester Spartans | `MNCH` | MANITOBA | `MB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2365.png" width="20"> Mansfield Mountaineers | `MNFD` | Marian (IN) MARIAN | `MUIN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/317.png" width="20"> Marietta Pioneers | `MRTT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2368.png" width="20"> Marist Red Foxes | `MRST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2369.png" width="20"> Mars Hill Lions | `MHU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/276.png" width="20"> Marshall Thundering Herd | `MRSH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/446.png" width="20"> Martin Luther Knights | `MLC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2371.png" width="20"> Mary Hardin Baylor Crusaders | `MHB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/120.png" width="20"> Maryland Terrapins | `MD` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2373.png" width="20"> Maryville (TN) Scots | `MCTN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/110.png" width="20"> Mass Maritime Buccaneers | `MMT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/113.png" width="20"> Massachusetts Minutemen | `MASS` |
| Mayville State Comets | `MYSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2700.png" width="20"> McDaniel Green Terror | `MCD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2816.png" width="20"> McKendree Bearcats | `MCK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/241.png" width="20"> McMurry War Hawks | `MCM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2377.png" width="20"> McNeese Cowboys | `MCN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/235.png" width="20"> Memphis Tigers | `MEM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2382.png" width="20"> Mercer Bears | `MER` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2383.png" width="20"> Merchant Marine Mariners | `MMA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2385.png" width="20"> Mercyhurst Lakers | `MERC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2771.png" width="20"> Merrimack Warriors | `MRMK` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/291.png" width="20"> Methodist Monarchs | `MU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/193.png" width="20"> Miami (OH) RedHawks | `M-OH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png" width="20"> Miami Hurricanes | `MIA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/127.png" width="20"> Michigan State Spartans | `MSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2392.png" width="20"> Michigan Tech Huskies | `MTU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/130.png" width="20"> Michigan Wolverines | `MICH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2393.png" width="20"> Middle Tennessee Blue Raiders | `MTSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2394.png" width="20"> Middlebury Panthers | `MIDB` |
| Midland MIDLAND LUTHERAN | `MIDL` | Midwestern State Mustangs | `MWSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2396.png" width="20"> Miles Golden Bears | `MILE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/210.png" width="20"> Millersville Marauders | `MILL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/74.png" width="20"> Millikin Big Blue | `MILK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2398.png" width="20"> Millsaps Majors | `MLSP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/134.png" width="20"> Minnesota Duluth Bulldogs | `UMD` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/135.png" width="20"> Minnesota Golden Gophers | `MINN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2399.png" width="20"> Minnesota Morris Cougars | `MNMO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2817.png" width="20"> Minnesota St Moorhead Dragons | `MSUM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2364.png" width="20"> Minnesota State Mavericks | `MNST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/568.png" width="20"> Minot State Beavers | `MINS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2969.png" width="20"> Misericordia Cougars | `MISE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/344.png" width="20"> Mississippi State Bulldogs | `MSST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2400.png" width="20"> Mississippi Valley State Delta Devils | `MVSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2880.png" width="20"> Missouri Baptist Spartans | `MOBU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2402.png" width="20"> Missouri S&T Miners | `MS&T` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2403.png" width="20"> Missouri Southern State Lions | `MSSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2623.png" width="20"> Missouri State Bears | `MOST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/142.png" width="20"> Missouri Tigers | `MIZ` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/137.png" width="20"> Missouri Western Griffons | `MOWE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/109.png" width="20"> MIT Engineers | `MIT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2919.png" width="20"> Monmouth (IL) Fighting Scots | `MNIL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2405.png" width="20"> Monmouth Hawks | `MONM` |
| Monroe Mustangs | `MON` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/149.png" width="20"> Montana Grizzlies | `MONT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/147.png" width="20"> Montana State Bobcats | `MTST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2701.png" width="20"> Montana Western Bulldogs | `UMW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2818.png" width="20"> Montclair State Red Hawks | `MCST` | Monterrey Tech Borregos | `MITE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/323.png" width="20"> Moravian Greyhounds | `MOR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2413.png" width="20"> Morehead State Eagles | `MORE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/60.png" width="20"> Morehouse Maroon Tigers | `MRHO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2415.png" width="20"> Morgan State Bears | `MORG` |
| <img src="https://a.espncdn.com/guid/98f21645-3b08-3b73-6d0a-0994f8bee411/logos/default.png" width="20"> Morningside Chiefs | `MNGS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2419.png" width="20"> Mount St Joseph Lions | `MSJ` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/426.png" width="20"> Mount Union Purple Raiders | `UMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2422.png" width="20"> Muhlenberg Mules | `MUHL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/93.png" width="20"> Murray State Racers | `MUR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/332.png" width="20"> Muskingum Fighting Muskies | `MSK` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2426.png" width="20"> Navy Midshipmen | `NAVY` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/152.png" width="20"> NC State Wolfpack | `NCSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/158.png" width="20"> Nebraska Cornhuskers | `NEB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2438.png" width="20"> Nebraska Kearney Lopers | `NEBK` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/6845.png" width="20"> Nebraska Wesleyan Prairie Wolves | `NWU` | <img src="https://a.espncdn.com/guid/a3ffa68e-753d-aec1-08f4-870dc7d77760/logos/default.png" width="20"> Nelson (TX) Lions | `NEL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2440.png" width="20"> Nevada Wolf Pack | `NEV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/111675.png" width="20"> New England Nor'easters | `UNE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/160.png" width="20"> New Hampshire Wildcats | `UNH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2441.png" width="20"> New Haven Chargers | `NHVN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2424.png" width="20"> New Mexico Highlands Cowboys | `NMHU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/167.png" width="20"> New Mexico Lobos | `UNM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/166.png" width="20"> New Mexico State Aggies | `NMSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2444.png" width="20"> Newberry Wolves | `NBRY` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2447.png" width="20"> Nicholls Colonels | `NICH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2884.png" width="20"> Nichols Bison | `NICC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2450.png" width="20"> Norfolk State Spartans | `NORF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2453.png" width="20"> North Alabama Lions | `UNA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/123086.png" width="20"> North American Stallions | `NAMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2448.png" width="20"> North Carolina A&T Aggies | `NCAT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2428.png" width="20"> North Carolina Central Eagles | `NCCU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/153.png" width="20"> North Carolina Tar Heels | `UNC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/286.png" width="20"> North Carolina Wesleyan Battling Bishops | `NCW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/3071.png" width="20"> North Central College Cardinals | `NCC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/155.png" width="20"> North Dakota Fighting Hawks | `UND` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2449.png" width="20"> North Dakota State Bison | `NDSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2822.png" width="20"> North Greenville Trailblazers | `NGU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/75.png" width="20"> North Park Vikings | `NPU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/249.png" width="20"> North Texas Mean Green | `UNT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/196.png" width="20"> Northeastern State RiverHawks | `NESU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2464.png" width="20"> Northern Arizona Lumberjacks | `NAU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2458.png" width="20"> Northern Colorado Bears | `UNCO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2459.png" width="20"> Northern Illinois Huskies | `NIU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2460.png" width="20"> Northern Iowa Panthers | `UNI` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/128.png" width="20"> Northern Michigan Wildcats | `NMI` | Northern State Wolves | `NSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/138.png" width="20"> Northwest Missouri State Bearcats | `MWMO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/583.png" width="20"> Northwestern (MN) Eagles | `UNW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2823.png" width="20"> Northwestern (OK) Rangers | `NWOK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2466.png" width="20"> Northwestern State Demons | `NWST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/77.png" width="20"> Northwestern Wildcats | `NU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2886.png" width="20"> Northwood Timberwolves | `NWD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2467.png" width="20"> Norwich Cadets | `NWCH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/87.png" width="20"> Notre Dame Fighting Irish | `ND` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/391.png" width="20"> Oberlin Yeomen | `OBE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/195.png" width="20"> Ohio Bobcats | `OHIO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/427.png" width="20"> Ohio Northern Polar Bears | `OHNU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/194.png" width="20"> Ohio State Buckeyes | `OSU` |
| Ohio State Newark Titans | `OSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2980.png" width="20"> Ohio Wesleyan Battling Bishops | `OWU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/319.png" width="20"> Oklahoma Baptist Bison | `OKBU` | Oklahoma Panhandle OK PANHANDLE ST | `OPSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/201.png" width="20"> Oklahoma Sooners | `OU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/197.png" width="20"> Oklahoma State Cowboys | `OKST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/295.png" width="20"> Old Dominion Monarchs | `ODU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/145.png" width="20"> Ole Miss Rebels | `MISS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/354.png" width="20"> Olivet Comets | `UOO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png" width="20"> Oregon Ducks | `ORE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/204.png" width="20"> Oregon State Beavers | `ORST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/359.png" width="20"> Otterbein Cardinals | `OTTB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2888.png" width="20"> Ouachita Baptist Tigers | `OBU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2487.png" width="20"> Pace Setters | `PACE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/205.png" width="20"> Pacific (OR) Boxers | `PCOR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2486.png" width="20"> Pacific Lutheran Lutes | `PCLT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/213.png" width="20"> Penn State Nittany Lions | `PSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/219.png" width="20"> Pennsylvania Quakers | `PENN` |
| Phoenix Firestorm | `AZCHR` | <img src="https://a.espncdn.com/guid/3b75f5c6-221d-212e-7a9a-a38339e0993d/logos/default.png" width="20"> Pikeville Bears | `PIKEV` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/90.png" width="20"> Pittsburg State Gorillas | `PTSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/221.png" width="20"> Pittsburgh Panthers | `PITT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2972.png" width="20"> Plymouth State Panthers | `PLYM` | Point University Skyhawks | `POINT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2923.png" width="20"> Pomona Pitzer Sagehens | `POPI` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2502.png" width="20"> Portland State Vikings | `PRST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/126086.png" width="20"> Post Eagles | `POST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2504.png" width="20"> Prairie View A&M Panthers | `PV` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2506.png" width="20"> Presbyterian Blue Hose | `PRES` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/163.png" width="20"> Princeton Tigers | `PRIN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2508.png" width="20"> Puget Sound Loggers | `PUG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png" width="20"> Purdue Boilermakers | `PUR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2825.png" width="20"> Quincy Hawks | `QUI` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2516.png" width="20"> Randolph Macon Yellow Jackets | `RMC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/29.png" width="20"> Redlands Bulldogs | `REDL` | Reinhardt Eagles | `RHDT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2528.png" width="20"> Rensselaer Engineers | `RPI` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/227.png" width="20"> Rhode Island Rams | `URI` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2519.png" width="20"> Rhodes Lynx | `RHDS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/242.png" width="20"> Rice Owls | `RICE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/257.png" width="20"> Richmond Spiders | `RICH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2891.png" width="20"> Ripon Red Hawks | `RIP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2523.png" width="20"> Robert Morris Colonials | `RMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/184.png" width="20"> Rochester (NY) Yellow Jackets | `URNY` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2524.png" width="20"> Rockford Regents | `RFU` | Roosevelt Lakers | `RSVT` |
| Roosevelt Lakers | `RSVT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/86.png" width="20"> Rose Hulman Fightin' Engineers | `RHIT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2827.png" width="20"> Rowan Profs | `ROW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/164.png" width="20"> Rutgers Scarlet Knights | `RUTG` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/16.png" width="20"> Sacramento State Hornets | `SAC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2529.png" width="20"> Sacred Heart Pioneers | `SHU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/129.png" width="20"> Saginaw Valley State Cardinals | `SVSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2830.png" width="20"> Saint Anselm Hawks | `SANS` |
| <img src="https://a.espncdn.com/guid/082f83e0-cde2-7736-7389-21e88d6e8bf0/logos/default.png" width="20"> Saint Francis (IN) Cougars | `SFIN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2598.png" width="20"> Saint Francis Red Flash | `SFPA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2600.png" width="20"> Saint John's (MN) Johnnies | `STJM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2614.png" width="20"> Saint Vincent Bearcats | `SVC` |
| Saint Xavier Cougars | `STX` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2532.png" width="20"> Salisbury Sea Gulls | `SAL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2776.png" width="20"> Salve Regina Seahawks | `SALV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2534.png" width="20"> Sam Houston Bearkats | `SHSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2535.png" width="20"> Samford Bulldogs | `SAM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/21.png" width="20"> San Diego State Aztecs | `SDSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/301.png" width="20"> San Diego Toreros | `USD` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/23.png" width="20"> San José State Spartans | `SJSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2542.png" width="20"> Savannah State Tigers | `SAV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2545.png" width="20"> SE Louisiana Lions | `SELA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/611.png" width="20"> Seton Hill Griffins | `SEHI` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2553.png" width="20"> Sewanee Tigers | `SEWA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2551.png" width="20"> Shaw Bears | `SHAW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2828.png" width="20"> Shenandoah Hornets | `SHEN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2974.png" width="20"> Shepherd Rams | `SHEP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2559.png" width="20"> Shippensburg Raiders | `SHIP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2560.png" width="20"> Shorter Hawks | `SHOU` | Siena Heights Saints | `SHTU` |
| Simpson (CA) Red Hawks | `SUCA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2564.png" width="20"> Simpson (IA) Storm | `SCIA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2894.png" width="20"> Sioux Falls Cougars | `SFU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/215.png" width="20"> Slippery Rock The Rock | `SRU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2567.png" width="20"> SMU Mustangs | `SMU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/6.png" width="20"> South Alabama Jaguars | `USA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2579.png" width="20"> South Carolina Gamecocks | `SC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2569.png" width="20"> South Carolina State Bulldogs | `SCST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/233.png" width="20"> South Dakota Coyotes | `SDAK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/613.png" width="20"> South Dakota Mines Hardrockers | `SDMT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2571.png" width="20"> South Dakota State Jackrabbits | `SDST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/58.png" width="20"> South Florida Bulls | `USF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2546.png" width="20"> Southeast Missouri State Redhawks | `SEMO` | Southeastern Fires | `SEU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/199.png" width="20"> Southeastern Oklahoma State Savage Storm | `SEOK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2568.png" width="20"> Southern Arkansas Muleriders | `SAR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2583.png" width="20"> Southern Connecticut State Owls | `SCTS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/79.png" width="20"> Southern Illinois Salukis | `SIU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2582.png" width="20"> Southern Jaguars | `SOU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2572.png" width="20"> Southern Miss Golden Eagles | `USM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/200.png" width="20"> Southern Nazarene Crimson Storm | `SNU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2584.png" width="20"> Southern Oregon Raiders | `SOR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/253.png" width="20"> Southern Utah Thunderbirds | `SUU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2896.png" width="20"> Southern Virginia Knights | `SOVA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2586.png" width="20"> Southwest Baptist Bearcats | `SWBU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2587.png" width="20"> Southwest Minnesota State Mustangs | `SWMS` |
| Southwestern (KS) Moundbuilders | `SWKS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2927.png" width="20"> Southwestern Oklahoma State Bulldogs | `SOSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2588.png" width="20"> Southwestern U Pirates | `SWU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/81.png" width="20"> Springfield Pride | `SPR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2591.png" width="20"> St. Ambrose Fighting Bees | `STAM` | St. Andrews Knights | `STAU` |
| St. Francis (IL) Fighting Saints | `SFIL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/374.png" width="20"> St. John Fisher Cardinals | `STJF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2779.png" width="20"> St. Lawrence Saints | `USL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2832.png" width="20"> St. Norbert Green Knights | `STNC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/133.png" width="20"> St. Olaf Oles | `OLAF` | St. Petersburg Glory Eagles | `UFFL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/375.png" width="20"> St. Scholastica Saints | `CSS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2900.png" width="20"> St. Thomas Tommies | `STMN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/24.png" width="20"> Stanford Cardinal | `STAN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2617.png" width="20"> Stephen F. Austin Lumberjacks | `SFA` |
| Sterling STERLING KS | `STLG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/56.png" width="20"> Stetson Hatters | `STET` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/471.png" width="20"> Stevenson Mustangs | `STVS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/284.png" width="20"> Stonehill Skyhawks | `STO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2619.png" width="20"> Stony Brook Seawolves | `STBK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2834.png" width="20"> Sul Ross State Lobos | `SRST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2782.png" width="20"> SUNY Cortland Red Dragons | `NYCL` | SUNY Erie Kats | `NYER` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2951.png" width="20"> SUNY Maritime Privateers | `NYMT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/3110.png" width="20"> SUNY Morrisville Mustangs | `NYMS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/216.png" width="20"> Susquehanna River Hawks | `SUSQ` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/183.png" width="20"> Syracuse Orange | `SYR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2627.png" width="20"> Tarleton State Texans | `TAR` | Taylor Trojans | `TLRU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2628.png" width="20"> TCU Horned Frogs | `TCU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/218.png" width="20"> Temple Owls | `TEM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2634.png" width="20"> Tennessee State Tigers | `TNST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2635.png" width="20"> Tennessee Tech Golden Eagles | `TNTC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png" width="20"> Tennessee Volunteers | `TENN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/245.png" width="20"> Texas A&M Aggies | `TA&M` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2658.png" width="20"> Texas A&M-Kingsville Javelinas | `TAMK` | <img src="https://a.espncdn.com/guid/43f30dfa-e0d9-ad12-1cb6-f8ceae32ffb4/logos/default.png" width="20"> Texas College Steers | `TXCL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/251.png" width="20"> Texas Longhorns | `TEX` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2639.png" width="20"> Texas Lutheran Bulldogs | `TXLU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2640.png" width="20"> Texas Southern Tigers | `TXSO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/326.png" width="20"> Texas State Bobcats | `TXST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2641.png" width="20"> Texas Tech Red Raiders | `TTU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2643.png" width="20"> The Citadel Bulldogs | `CIT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2442.png" width="20"> The College of New Jersey Lions | `TCNJ` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2644.png" width="20"> Thiel Tomcats | `THI` |
| Thomas More Saints | `TMOR` | Thomas Night Hawks | `THO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2838.png" width="20"> Tiffin Dragons | `TIFF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2649.png" width="20"> Toledo Rockets | `TOL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/119.png" width="20"> Towson Tigers | `TOW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2651.png" width="20"> Trine Thunder | `TRNE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2977.png" width="20"> Trinity (CT) Bantams | `TCCT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/386.png" width="20"> Trinity (TX) Tigers | `TUTX` |
| Trinity Bible Lions | `TBIB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2653.png" width="20"> Troy Trojans | `TROY` |
| Troy Vikings | `HVCC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2654.png" width="20"> Truman State Bulldogs | `TRST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/112.png" width="20"> Tufts Jumbos | `TUFT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2655.png" width="20"> Tulane Green Wave | `TULN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/202.png" width="20"> Tulsa Golden Hurricane | `TLSA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2839.png" width="20"> Tusculum Pioneers | `TUSC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2657.png" width="20"> Tuskegee Golden Tigers | `TUSK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/5.png" width="20"> UAB Blazers | `UAB` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/399.png" width="20"> UAlbany Great Danes | `UALB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/302.png" width="20"> UC Davis Aggies | `UCD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2116.png" width="20"> UCF Knights | `UCF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/26.png" width="20"> UCLA Bruins | `UCLA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/41.png" width="20"> UConn Huskies | `CONN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2433.png" width="20"> UL Monroe Warhawks | `ULM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/379.png" width="20"> UMass Dartmouth Corsairs | `MDAR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2882.png" width="20"> UNC Pembroke Braves | `UNCP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/237.png" width="20"> Union Garnet Chargers | `UNNY` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/559.png" width="20"> University of Mary Marauders | `MARY` |
| University of Mexico MEXICO U | `UNAM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2439.png" width="20"> UNLV Rebels | `UNLV` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/389.png" width="20"> Upper Iowa Peacocks | `UIU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2667.png" width="20"> Ursinus Bears | `URSN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/30.png" width="20"> USC Trojans | `USC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2630.png" width="20"> UT Martin Skyhawks | `UTM` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/110243.png" width="20"> UT Permian Basin Falcons | `UTPB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/328.png" width="20"> Utah State Aggies | `USU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/3101.png" width="20"> Utah Tech Trailblazers | `UTU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/254.png" width="20"> Utah Utes | `UTAH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2638.png" width="20"> UTEP Miners | `UTEP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/390.png" width="20"> Utica Pioneers | `UTIC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2636.png" width="20"> UTSA Roadrunners | `UTSA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2842.png" width="20"> UVA Wise Cavaliers | `UVAW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2673.png" width="20"> Valdosta State Blazers | `VALD` | Valley City State VALLEY CITY ST | `VCSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2674.png" width="20"> Valparaiso Beacons | `VAL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/238.png" width="20"> Vanderbilt Commodores | `VAN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/293.png" width="20"> Vermont State Castleton Spartans | `VTSC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/222.png" width="20"> Villanova Wildcats | `VILL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/258.png" width="20"> Virginia Cavaliers | `UVA` | Virginia Lynchburg Dragons | `VUL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/330.png" width="20"> Virginia State Trojans | `VSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/259.png" width="20"> Virginia Tech Hokies | `VT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2676.png" width="20"> Virginia Union Panthers | `VUU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2678.png" width="20"> VMI Keydets | `VMI` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/89.png" width="20"> Wabash Little Giants | `WAB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2681.png" width="20"> Wagner Seahawks | `WAG` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/154.png" width="20"> Wake Forest Demon Deacons | `WAKE` | Waldorf Warriors | `WLDF` |
| <img src="https://a.espncdn.com/guid/01ca3293-0266-38e6-4100-d8767b860a96/logos/default.png" width="20"> Walsh Cavaliers | `WLSH` | Warner Royals | `WRNR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2685.png" width="20"> Wartburg Knights | `WTBG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2687.png" width="20"> Washburn Ichabods | `WSBN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2686.png" width="20"> Washington & Jefferson Presidents | `W&J` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2688.png" width="20"> Washington and Lee Generals | `W&L` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/264.png" width="20"> Washington Huskies | `WASH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/143.png" width="20"> Washington St. Louis Bears | `WUMO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/265.png" width="20"> Washington State Cougars | `WSU` | Wayland Baptist Pioneers | `WYBU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/131.png" width="20"> Wayne State (MI) Warriors | `WSMI` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2844.png" width="20"> Wayne State (NE) Wildcats | `WSNE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2845.png" width="20"> Waynesburg Yellow Jackets | `WAYN` | Webber International Warriors | `WINT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2692.png" width="20"> Weber State Wildcats | `WEB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/336.png" width="20"> Wesleyan (CT) Cardinals | `WSCT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2695.png" width="20"> West Alabama Tigers | `UWA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/223.png" width="20"> West Chester Golden Rams | `WCHT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/110242.png" width="20"> West Florida Argonauts | `WFL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2698.png" width="20"> West Georgia Wolves | `WGA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2699.png" width="20"> West Liberty Hilltoppers | `WLU` | West Memphis Crusaders | `FAI` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2704.png" width="20"> West Texas Buffaloes | `WTAM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/277.png" width="20"> West Virginia Mountaineers | `WVU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2707.png" width="20"> West Virginia State Yellow Jackets | `WVSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/455.png" width="20"> West Virginia Wesleyan Bobcats | `WVWC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2717.png" width="20"> Western Carolina Catamounts | `WCU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2714.png" width="20"> Western Colorado Mountaineers | `WCOL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2843.png" width="20"> Western Connecticut State Wolves | `WCSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2710.png" width="20"> Western Illinois Leathernecks | `WIU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/98.png" width="20"> Western Kentucky Hilltoppers | `WKU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2711.png" width="20"> Western Michigan Broncos | `WMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2702.png" width="20"> Western New England Golden Bears | `WNE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2703.png" width="20"> Western New Mexico Mustangs | `WNMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2848.png" width="20"> Western Oregon Wolves | `WORU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2909.png" width="20"> Westfield State Owls | `WFST` |
| Westgate Christian University Ravens | `WES` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/433.png" width="20"> Westminster (MO) Blue Jays | `WCMO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2849.png" width="20"> Westminster (PA) Titans | `WCPA` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/396.png" width="20"> Wheaton (IL) Thunder | `WCIL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/112335.png" width="20"> Wheeling Cardinals | `WHLG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2850.png" width="20"> Whittier Poets | `WHTR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2721.png" width="20"> Whitworth Pirates | `WHIW` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2725.png" width="20"> Widener Pride | `WIDE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/398.png" width="20"> Wilkes Colonels | `WILK` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2930.png" width="20"> Willamette Bearcats | `WLMT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2729.png" width="20"> William & Mary Tribe | `W&M` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2911.png" width="20"> William Jewell Cardinals | `WJC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2970.png" width="20"> William Paterson Pioneers | `WPU` | William Penn Statesmen | `WPEN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2731.png" width="20"> Williams Ephs | `WLM` | Williamson Mechanics | `WMSN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2733.png" width="20"> Wilmington (OH) Fightin' Quakers | `WCOH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/351.png" width="20"> Wingate Bulldogs | `WINU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2851.png" width="20"> Winona State Warriors | `WNST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2736.png" width="20"> Winston-Salem State Rams | `WSSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/275.png" width="20"> Wisconsin Badgers | `WIS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2738.png" width="20"> Wisconsin Eau Claire Blugolds | `UWEC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2740.png" width="20"> Wisconsin La Crosse Eagles | `UWL` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2741.png" width="20"> Wisconsin Lutheran Warriors | `WLC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/271.png" width="20"> Wisconsin Oshkosh Titans | `UWO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/272.png" width="20"> Wisconsin Platteville Pioneers | `UWP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2723.png" width="20"> Wisconsin River Falls Falcons | `UWRF` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2743.png" width="20"> Wisconsin Stevens Point Pointers | `UWSP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2744.png" width="20"> Wisconsin Stout Blue Devils | `UWST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2745.png" width="20"> Wisconsin Whitewater Warhawks | `UWW` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2746.png" width="20"> Wittenberg Tigers | `WITT` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2747.png" width="20"> Wofford Terriers | `WOF` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2748.png" width="20"> Wooster Fighting Scots | `WOO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/402.png" width="20"> Worcester State Lancers | `WORC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2749.png" width="20"> WPI Engineers | `WPI` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2706.png" width="20"> WVU Tech Golden Bears | `WVUT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2751.png" width="20"> Wyoming Cowboys | `WYO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/43.png" width="20"> Yale Bulldogs | `YALE` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2754.png" width="20"> Youngstown State Penguins | `YSU` |  |  |
</details>
<!-- college-abbreviations:ncaaf:end -->

<!-- college-abbreviations:ncaa_hockey:start -->
## NCAA Men's Ice Hockey Team Abbreviations
<details><summary>NCAA Men's Ice Hockey roster</summary>

Current teams from ESPN's public directory. The directory can change as schools are added or reclassified.

| Club | Abbr | Club | Abbr |
|---|---|---|---|
| Adrian Bulldogs | `ADR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2005.png" width="20"> Air Force Falcons | `AF` |
| Alabama Huntsville Chargers | `AH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/1.png" width="20"> Alaska Anchorage Seawolves | `UAA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/298.png" width="20"> Alaska Nanooks | `AKFB` | Alberta Golden Bears & Pandas | `ABCA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2022.png" width="20"> American International Yellow Jackets | `AIC` | Anna Maria Amcats | `ANMR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/9.png" width="20"> Arizona State Sun Devils | `ASU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/12.png" width="20"> Arizona Wildcats | `ARIZ` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/349.png" width="20"> Army Black Knights | `ARMY` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2038.png" width="20"> Assumption Greyhounds | `ASP` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/124.png" width="20"> Augsburg Auggies | `AUGS` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2043.png" width="20"> Augustana University (SD) Vikings | `AUSD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/132.png" width="20"> Bemidji State Beavers | `BST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2060.png" width="20"> Bentley Falcons | `BENT` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2802.png" width="20"> Bethel College Minnesota Falcons | `BET` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/103.png" width="20"> Boston College Eagles | `BC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/104.png" width="20"> Boston University Terriers | `BU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/189.png" width="20"> Bowling Green Falcons | `BGSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2781.png" width="20"> Brockport Golden Eagles | `BRO` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/225.png" width="20"> Brown Bears | `BRWN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2099.png" width="20"> Canisius Golden Griffins | `CAN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2137.png" width="20"> Clarkson Golden Knights | `CLAR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2142.png" width="20"> Colgate Raiders | `COLG` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2144.png" width="20"> Colorado College Tigers | `COLC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2152.png" width="20"> Concordia (MN) Cobbers | `CCMN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/172.png" width="20"> Cornell Big Red | `COR` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/159.png" width="20"> Dartmouth Big Green | `DART` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2172.png" width="20"> Denver Pioneers | `DEN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2217.png" width="20"> Fairfield Badgers | `FAIR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2222.png" width="20"> Ferris State Bulldogs | `FRST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2224.png" width="20"> Findlay Falcons | `FIN` | Framingham State Rams | `FRSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/112334.png" width="20"> FRANKLIN PIERCE | `FP` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/108.png" width="20"> Harvard Crimson | `HARV` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/107.png" width="20"> Holy Cross Crusaders | `HC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/314.png" width="20"> Iona Gaels | `IONA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/285.png" width="20"> Lake Superior State Lakers | `LSS` | Laurentian Voyageur | `LAUREN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2335.png" width="20"> Liberty Flames | `LIB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2815.png" width="20"> Lindenwood Lions | `LIN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/110133.png" width="20"> Long Island University Sharks | `LIU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/311.png" width="20"> Maine Black Bears | `ME` |
| Manhattanville Valiants | `MNHV` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/113.png" width="20"> Massachusetts Minutemen | `MASS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2385.png" width="20"> Mercyhurst Lakers | `MERC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2771.png" width="20"> Merrimack Warriors | `MRMK` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/193.png" width="20"> Miami (OH) RedHawks | `M-OH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/127.png" width="20"> Michigan State Spartans | `MSU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2392.png" width="20"> Michigan Tech Huskies | `MTU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/130.png" width="20"> Michigan Wolverines | `MICH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2394.png" width="20"> Middlebury Panthers | `MIDB` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/134.png" width="20"> Minnesota Duluth Bulldogs | `UMD` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/135.png" width="20"> Minnesota Golden Gophers | `MINN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2364.png" width="20"> Minnesota State Mavericks | `MNST` |
| Minnesota-Crookston Golden Eagles | `MNCK` | New England College Pilgrims | `NEC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/160.png" width="20"> New Hampshire Wildcats | `UNH` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/315.png" width="20"> Niagara Purple Eagles | `NIA` |
| Nichols Bison | `NICC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/155.png" width="20"> North Dakota Fighting Hawks | `UND` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/111.png" width="20"> Northeastern Huskies | `NE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/128.png" width="20"> Northern Michigan Wildcats | `NMI` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/87.png" width="20"> Notre Dame Fighting Irish | `ND` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/195.png" width="20"> Ohio Bobcats | `OHIO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/194.png" width="20"> Ohio State Buckeyes | `OSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2437.png" width="20"> Omaha Mavericks | `OMA` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/213.png" width="20"> Penn State Nittany Lions | `PSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/430.png" width="20"> Post Eagles | `POST` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/163.png" width="20"> Princeton Tigers | `PRIN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2507.png" width="20"> Providence Friars | `PROV` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2514.png" width="20"> Quinnipiac Bobcats | `QUIN` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2528.png" width="20"> Rensselaer Engineers | `RPI` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/178.png" width="20"> RIT Tigers | `RIT` | Rivier Raiders | `RIVI` |
| Rob Morris Ill Falcons | `RM` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2523.png" width="20"> Robert Morris Colonials | `RMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2529.png" width="20"> Sacred Heart Pioneers | `SHU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2830.png" width="20"> Saint Anselm Hawks | `SANS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/260.png" width="20"> Saint Michael's Purple Knights | `STM` | Salem State Vikings | `SAST` |
| Scranton Falcons | `SCRN` | Seneca Sting | `SEN` |
| Southern Maine Huskies | `SME` | SOUTHERN NEW HAMPSHIRE | `SNH` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2594.png" width="20"> St. Cloud State Huskies | `SCSU` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2779.png" width="20"> St. Lawrence Saints | `USL` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/127963.png" width="20"> St. Michael'S College Purple Knights | `ST.` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2900.png" width="20"> St. Thomas-Minnesota Tommies | `STMN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/284.png" width="20"> Stonehill Skyhawks | `STO` | SUNY Canton SUNY CANT | `NYCA` |
| SUNY Cortland Red Dragons | `CORTLAND` | SUNY Cortland Red Dragons | `NYCL` |
| SUNY Geneseo SUNY-GENESEO | `SNYG` | SUNY Morrisville Mustangs | `NYMS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/182.png" width="20"> SUNY Potsdam SUNY-POTSDAM | `NYPM` | Toronto Metropolitan | `TMU` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2651.png" width="20"> Trine Thunder | `TRNE` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/41.png" width="20"> UConn Huskies | `CONN` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/379.png" width="20"> UMASS DARTMOUTH | `MDAR` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2349.png" width="20"> UMass Lowell River Hawks | `UML` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2785.png" width="20"> Union Garnet Chargers | `UNNY` | Utica Pioneers | `UTIC` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/261.png" width="20"> Vermont Catamounts | `UVM` | Waterloo King Warrior | `WTLO` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/131.png" width="20"> Wayne St. Falcons | `WAY` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2711.png" width="20"> Western Michigan Broncos | `WMU` |
| Westfield State Owls | `WFST` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2731.png" width="20"> Williams Ephs | `WLM` |
| WINDSOR | `WIND` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/275.png" width="20"> Wisconsin Badgers | `WIS` |
| <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2738.png" width="20"> Wisconsin Eau Claire Blugolds | `UWEC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2744.png" width="20"> Wisconsin Stout Blue Devils | `UWST` |
| Worcester State Lancers | `WORC` | <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/43.png" width="20"> Yale Bulldogs | `YALE` |
</details>
<!-- college-abbreviations:ncaa_hockey:end -->

## Run Locally

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
SPORT=gleague TEAM=OSC node src/index.js --demo
SPORT=ncaab TEAM=ARIZ node src/index.js --demo
SPORT=ncaaw TEAM=UCONN node src/index.js --demo
SPORT=ncaaf TEAM=ALA node src/index.js --demo
SPORT=ncaa_hockey TEAM=BC node src/index.js --demo
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
node scripts/update-college-abbreviations.js
```

---

## Adding a New Sport

Each sport is a single adapter file extending `BaseFreeApiAdapter`. See `src/adapters/nhl.js` as the reference.

1. Create `src/adapters/your-sport.js` extending `BaseFreeApiAdapter`
2. Implement abstract methods: `fetchTeam()`, `getGamesUrl()`, `parseGameResponse()`, `parseTeamResponse()`
3. Define `TEAM_EMOJI`, `TEAM_IDS`, and `DEMO_TEAMS`
4. Create tests in `tests/adapters/your-sport.test.js`
5. Add the sport case to `src/renderers/markdown.js`
6. Update this README
7. Open a PR!

---

## Action Inputs (`with:`)

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `gh_token` | Yes* | — | Token with Contents: Read and write on `target_repo` |
| `sport` | No | `nba` | Sport adapter: `nba`, `mlb`, `nfl`, `nhl`, `mls`, `epl`, `laliga`, `bundesliga`, `seriea`, `ligue1`, `primeiraliga`, `eredivisie`, `wnba`, `ligamx`, `brasileirao`, `nwsl`, `saudipro`, `j1`, `scottish`, `belgian`, `ucl`, `uel`, `gleague`, `ncaab`, `ncaaw`, `ncaaf`, `ncaa_hockey` |
| `team` | Yes | — | Team abbreviation (e.g. `LAL`, `NYR`, `KC`, `MIA`) |
| `marker` | No | `readme-scoreboard` | HTML comment marker name. Must match a marker pair in your README, or the job fails. Give each sport a unique name — sharing one pair means the later step silently overwrites the earlier |
| `target_repo` | No | your profile repo | Repo to update, format: `owner/repo` |
| `dry_run` | No | `false` | Fetch and render live data without updating a README. Accepts `true`/`false` (also `1`/`0` or `yes`/`no`) |

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

## License

MIT
