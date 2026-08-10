# 🏆 readme-scoreboard

> Live sports stats on your GitHub profile README — place them wherever you want

Currently supports **NBA**, **MLB**, **NFL**, **NHL**, **MLS**, the **Premier League**, and **La Liga** with more sports coming soon

---

## Preview

<!-- readme-scoreboard start -->
<img src="https://a.espncdn.com/i/teamlogos/nba/500/lal.png" width="60" align="right" />

### 👑 Los Angeles Lakers (LAL)
West Conference · Pacific Division

📊 2025-2026 Record: 57W - 35L (62.0%)
&nbsp;&nbsp;&nbsp;███████████████▌░░░░░░░░░

**📅 Recent Games:**
```
❌ L 110-115 vs OKC (May 10)
❌ L 108-131 vs OKC (May 8)
❌ L 107-125 @ OKC (May 6)
❌ L  90-108 @ OKC (May 4)
✅ W  98-78  @ HOU (Apr 30)
```
<!-- readme-scoreboard end -->

---

## Quick Start (3 steps)

### 1. Add markers to your profile README

In your `username/username` repo's `README.md`, add these markers wherever you want the stats to appear:

```md
<!-- readme-scoreboard start -->
<!-- readme-scoreboard end -->
```

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
```

Change `team` to your team's abbreviation (see table below). Done!

#### MLB Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: mlb
          team: NYY
```

#### NFL Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: nfl
          team: KC
```

#### NHL Example

```yaml
      - uses: 23seriy/readme-scoreboard@main
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          sport: nhl
          team: NYR
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

---

## Supported Sports

All sports use **free, no-auth APIs** — no secrets required.

| Sport | Status | Data Source |
|-------|--------|------------|
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nba.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nba.png" alt="NBA logo" height="20"></picture> NBA | ✅ Available | [ESPN API](https://www.espn.com/) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/mlb.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png" alt="MLB logo" height="20"></picture> MLB | ✅ Available | [MLB Stats API](https://statsapi.mlb.com/) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nfl.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png" alt="NFL logo" height="20"></picture> NFL | ✅ Available | [ESPN API](https://www.espn.com/) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/teamlogos/leagues/500-dark/nhl.png"><img src="https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png" alt="NHL logo" height="20"></picture> NHL | ✅ Available | [NHL.com Stats API](https://api-web.nhle.com/v1/) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/19.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/19.png" alt="MLS logo" height="20"></picture> MLS | ✅ Available | [ESPN API](https://www.espn.com/) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/23.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/23.png" alt="Premier League logo" height="20"></picture> Premier League | ✅ Available | [ESPN API](https://www.espn.com/) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://a.espncdn.com/i/leaguelogos/soccer/500-dark/15.png"><img src="https://a.espncdn.com/i/leaguelogos/soccer/500/15.png" alt="Premier League logo" height="20"></picture> La Liga | ✅ Available | [ESPN API](https://www.espn.com/) |

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
| `sport` | No | `nba` | Sport adapter: `nba`, `mlb`, `nfl`, `nhl`, `mls`, `epl`, `laliga` |
| `team` | Yes | — | Team abbreviation (e.g. `LAL`, `NYR`, `KC`, `MIA`) |
| `marker` | No | `readme-scoreboard` | HTML comment marker name — use unique names for multiple scoreboards in one README |
| `target_repo` | No | your profile repo | Repo to update, format: `owner/repo` |

\* Not required in `--demo` mode.

---

## License

MIT
