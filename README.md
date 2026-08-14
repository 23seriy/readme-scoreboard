# 🏆 readme-scoreboard

> Live sports stats on your GitHub profile README — place them wherever you want

Currently supports **NBA**, **MLB**, **NFL**, **NHL**, **MLS**, the **Premier League**, **La Liga**, the **Bundesliga**, **Serie A**, **Ligue 1**, the **Primeira Liga**, the **Eredivisie**, the **WNBA**, **Liga MX**, and the **Brasileirão** with more sports coming soon

---

## Preview

The action replaces everything between your markers with this — heading,
logos and all. Live output for the Lakers:

````md
## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nba.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nba.png" alt="NBA" height="28" align="top"></picture> My Favourite NBA Team

<img src="https://a.espncdn.com/i/teamlogos/nba/500/lal.png" width="72" align="right" />

### 👑 Los Angeles Lakers (LAL)
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
````

---

## Table of Contents

- [Quick Start (3 steps)](#quick-start-3-steps)
  - [1. Add markers to your profile README](#1-add-markers-to-your-profile-readme)
  - [2. Create secret](#2-create-secret)
  - [3. Add the workflow](#3-add-the-workflow)
- [Supported Sports](#supported-sports)
- Team Abbreviations
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
- [Run Locally](#run-locally)
- [Adding a New Sport](#adding-a-new-sport)
- [Action Inputs (`with:`)](#action-inputs-with)
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
| `GH_TOKEN` | GitHub token with `repo` scope ([create one](https://github.com/settings/tokens/new)) |

**That's all!** No sports-specific API keys needed — all adapters use free, no-auth public APIs (ESPN, MLB Stats API, NHL.com, etc).

### 3. Add the workflow

Create `.github/workflows/scoreboard.yml` in your profile repo:

```yaml
name: Update Scoreboard
on:
  schedule:
    - cron: "0 */6 * * *"  # Every 6 hours
  workflow_dispatch:        # Manual trigger
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: nba
          team: LAL
          marker: readme-scoreboard-nba
```

Change `team` to your team's abbreviation (see table below), and keep `marker`
matching the pair you added in step 1. Done!

#### Multiple sports in one README

Add a step per sport, each with a `marker` matching a pair in your README:

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: nba
          team: LAL
          marker: readme-scoreboard-nba

      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: mlb
          team: NYY
          marker: readme-scoreboard-mlb
```

Once you use named markers, set one on **every** step — including the first.
A step left on the default `readme-scoreboard` will look for a pair by that
name, and fail the job if you renamed it.

#### MLB Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: mlb
          team: NYY
          marker: readme-scoreboard-mlb
```

#### NFL Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: nfl
          team: KC
          marker: readme-scoreboard-nfl
```

#### NHL Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: nhl
          team: NYR
          marker: readme-scoreboard-nhl
```

#### MLS Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: mls
          team: MIA
          marker: readme-scoreboard-mls
```

#### Premier League Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: epl
          team: LIV
          marker: readme-scoreboard-epl
```

#### La Liga Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: laliga
          team: RMA
          marker: readme-scoreboard-laliga
```

#### Bundesliga Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: bundesliga
          team: MUN
          marker: readme-scoreboard-bundesliga
```

#### Serie A Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: seriea
          team: INT
          marker: readme-scoreboard-seriea
```

#### Ligue 1 Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: ligue1
          team: PSG
          marker: readme-scoreboard-ligue1
```

#### Primeira Liga Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: primeiraliga
          team: SLB
          marker: readme-scoreboard-primeiraliga
```

#### Eredivisie Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: eredivisie
          team: AJA
          marker: readme-scoreboard-eredivisie
```

#### WNBA Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: wnba
          team: MIN
          marker: readme-scoreboard-wnba
```

#### Liga MX Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: ligamx
          team: AME
          marker: readme-scoreboard-ligamx
```

#### Brasileirão Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: brasileirao
          team: PAL
          marker: readme-scoreboard-brasileirao
```

---

## Supported Sports

All sports use **free, no-auth APIs** — no secrets required.

Most leagues come from ESPN's public `site.api.espn.com` endpoints — each link below opens the live team list for that league. MLB and the NHL have their own official APIs.

| Sport | Status | Endpoint |
|-------|--------|----------|
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nba.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nba.png" alt="NBA logo" height="20"></picture> NBA | ✅ Available | [`basketball/nba`](https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/mlb.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png" alt="MLB logo" height="20"></picture> MLB | ✅ Available | [MLB Stats API](https://statsapi.mlb.com/api/v1/teams?sportId=1) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nfl.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png" alt="NFL logo" height="20"></picture> NFL | ✅ Available | [`football/nfl`](https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nhl.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png" alt="NHL logo" height="20"></picture> NHL | ✅ Available | [NHL Web API](https://api-web.nhle.com/v1/standings/now) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/19.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/19.png" alt="MLS logo" height="20"></picture> MLS | ✅ Available | [`soccer/usa.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/23.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/23.png" alt="Premier League logo" height="20"></picture> Premier League | ✅ Available | [`soccer/eng.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/15.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/15.png" alt="Premier League logo" height="20"></picture> La Liga | ✅ Available | [`soccer/esp.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/10.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/10.png" alt="Premier League logo" height="20"></picture> Bundesliga | ✅ Available | [`soccer/ger.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/teams) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/12.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/12.png" alt="Premier League logo" height="20"></picture> Serie A | ✅ Available | [`soccer/ita.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/teams) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/9.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/9.png" alt="Premier League logo" height="20"></picture> Ligue 1 | ✅ Available | [`soccer/fra.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/teams) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/14.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/14.png" alt="Premier League logo" height="20"></picture> Primeira Liga | ✅ Available | [`soccer/por.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/por.1/teams) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/11.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/11.png" alt="Premier League logo" height="20"></picture> Eredivisie | ✅ Available | [`soccer/ned.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/ned.1/teams) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/wnba.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/wnba.png" alt="WNBA logo" height="20"></picture> WNBA | ✅ Available | [`basketball/wnba`](https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/teams) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/22.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/22.png" alt="Premier League logo" height="20"></picture> Liga MX | ✅ Available | [`soccer/mex.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/mex.1/teams) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/85.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/85.png" alt="Premier League logo" height="20"></picture> Brasileirão | ✅ Available | [`soccer/bra.1`](https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/teams) |

---

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nba.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nba.png" alt="NBA logo" height="28"></picture> NBA Team Abbreviations

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

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/mlb.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png" alt="MLB logo" height="28"></picture> MLB Team Abbreviations

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

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nfl.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png" alt="NFL logo" height="28"></picture> NFL Team Abbreviations

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

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nhl.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png" alt="NHL logo" height="28"></picture> NHL Team Abbreviations

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

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/19.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/19.png" alt="MLS logo" height="28"></picture> MLS Team Abbreviations

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

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/23.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/23.png" alt="Premier League logo" height="28"></picture> Premier League Team Abbreviations

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

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/15.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/15.png" alt="Premier League logo" height="28"></picture> La Liga Team Abbreviations

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

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/10.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/10.png" alt="Premier League logo" height="28"></picture> Bundesliga Team Abbreviations

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

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/12.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/12.png" alt="Premier League logo" height="28"></picture> Serie A Team Abbreviations

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

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/9.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/9.png" alt="Premier League logo" height="28"></picture> Ligue 1 Team Abbreviations

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

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/14.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/14.png" alt="Premier League logo" height="28"></picture> Primeira Liga Team Abbreviations

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

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/11.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/11.png" alt="Premier League logo" height="28"></picture> Eredivisie Team Abbreviations

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

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/wnba.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/wnba.png" alt="Premier League logo" height="28"></picture> WNBA Team Abbreviations

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

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/22.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/22.png" alt="Premier League logo" height="28"></picture> Liga MX Team Abbreviations

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

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/85.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/85.png" alt="Premier League logo" height="28"></picture> Brasileirão Team Abbreviations

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

## Run Locally

```bash
cp sample.env .env
# Fill in your values
npm install
npm start
```

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
| `gh_token` | Yes* | — | GitHub token with `repo` scope |
| `sport` | No | `nba` | Sport adapter: `nba`, `mlb`, `nfl`, `nhl`, `mls`, `epl`, `laliga`, `bundesliga`, `seriea`, `ligue1`, `primeiraliga`, `eredivisie`, `wnba`, `ligamx`, `brasileirao` |
| `team` | Yes | — | Team abbreviation (e.g. `LAL`, `NYR`, `KC`, `MIA`) |
| `marker` | No | `readme-scoreboard` | HTML comment marker name. Must match a marker pair in your README, or the job fails. Give each sport a unique name — sharing one pair means the later step silently overwrites the earlier |
| `target_repo` | No | your profile repo | Repo to update, format: `owner/repo` |

\* Not required in `--demo` mode.

---

## License

MIT
