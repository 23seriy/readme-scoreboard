# 🏆 readme-scoreboard

> Live sports stats on your GitHub profile README — place them wherever you want

Currently supports **NBA**, **MLB**, **NFL**, and **NHL** with more sports coming soon (soccer, etc.)

---

## Preview

<!-- readme-scoreboard start -->
<img src="https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg" width="60" align="right" />

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

---

## Supported Sports

All sports use **free, no-auth APIs** — no secrets required.

| Sport | Status | Data Source |
|-------|--------|------------|
| 🏀 NBA | ✅ Available | [ESPN API](https://www.espn.com/) |
| ⚾ MLB | ✅ Available | [MLB Stats API](https://statsapi.mlb.com/) |
| 🏈 NFL | ✅ Available | [ESPN API](https://www.espn.com/) |
| 🏒 NHL | ✅ Available | [NHL.com Stats API](https://api-web.nhle.com/v1/) |
| ⚽ MLS | ✅ Available | [ESPN API](https://www.espn.com/) |

---

## 🏀 NBA Team Abbreviations

<span style="font-size: 0.85em;">

| 🏀 Eastern Conference | Abbr | | 🏀 Western Conference | Abbr |
|---|------|---|---|------|
| <img src="https://cdn.nba.com/logos/nba/1610612737/global/L/logo.svg" width="20"> Atlanta Hawks | ATL | | <img src="https://cdn.nba.com/logos/nba/1610612742/global/L/logo.svg" width="20"> Dallas Mavericks | DAL |
| <img src="https://cdn.nba.com/logos/nba/1610612738/global/L/logo.svg" width="20"> Boston Celtics | BOS | | <img src="https://cdn.nba.com/logos/nba/1610612743/global/L/logo.svg" width="20"> Denver Nuggets | DEN |
| <img src="https://cdn.nba.com/logos/nba/1610612751/global/L/logo.svg" width="20"> Brooklyn Nets | BKN | | <img src="https://cdn.nba.com/logos/nba/1610612744/global/L/logo.svg" width="20"> Golden State Warriors | GSW |
| <img src="https://cdn.nba.com/logos/nba/1610612766/global/L/logo.svg" width="20"> Charlotte Hornets | CHA | | <img src="https://cdn.nba.com/logos/nba/1610612745/global/L/logo.svg" width="20"> Houston Rockets | HOU |
| <img src="https://cdn.nba.com/logos/nba/1610612741/global/L/logo.svg" width="20"> Chicago Bulls | CHI | | <img src="https://cdn.nba.com/logos/nba/1610612746/global/L/logo.svg" width="20"> LA Clippers | LAC |
| <img src="https://cdn.nba.com/logos/nba/1610612739/global/L/logo.svg" width="20"> Cleveland Cavaliers | CLE | | <img src="https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg" width="20"> Los Angeles Lakers | LAL |
| <img src="https://cdn.nba.com/logos/nba/1610612765/global/L/logo.svg" width="20"> Detroit Pistons | DET | | <img src="https://cdn.nba.com/logos/nba/1610612763/global/L/logo.svg" width="20"> Memphis Grizzlies | MEM |
| <img src="https://cdn.nba.com/logos/nba/1610612754/global/L/logo.svg" width="20"> Indiana Pacers | IND | | <img src="https://cdn.nba.com/logos/nba/1610612750/global/L/logo.svg" width="20"> Minnesota Timberwolves | MIN |
| <img src="https://cdn.nba.com/logos/nba/1610612748/global/L/logo.svg" width="20"> Miami Heat | MIA | | <img src="https://cdn.nba.com/logos/nba/1610612740/global/L/logo.svg" width="20"> New Orleans Pelicans | NOP |
| <img src="https://cdn.nba.com/logos/nba/1610612749/global/L/logo.svg" width="20"> Milwaukee Bucks | MIL | | <img src="https://cdn.nba.com/logos/nba/1610612760/global/L/logo.svg" width="20"> Oklahoma City Thunder | OKC |
| <img src="https://cdn.nba.com/logos/nba/1610612752/global/L/logo.svg" width="20"> New York Knicks | NYK | | <img src="https://cdn.nba.com/logos/nba/1610612756/global/L/logo.svg" width="20"> Phoenix Suns | PHX |
| <img src="https://cdn.nba.com/logos/nba/1610612753/global/L/logo.svg" width="20"> Orlando Magic | ORL | | <img src="https://cdn.nba.com/logos/nba/1610612757/global/L/logo.svg" width="20"> Portland Trail Blazers | POR |
| <img src="https://cdn.nba.com/logos/nba/1610612755/global/L/logo.svg" width="20"> Philadelphia 76ers | PHI | | <img src="https://cdn.nba.com/logos/nba/1610612758/global/L/logo.svg" width="20"> Sacramento Kings | SAC |
| <img src="https://cdn.nba.com/logos/nba/1610612761/global/L/logo.svg" width="20"> Toronto Raptors | TOR | | <img src="https://cdn.nba.com/logos/nba/1610612759/global/L/logo.svg" width="20"> San Antonio Spurs | SAS |
| <img src="https://cdn.nba.com/logos/nba/1610612764/global/L/logo.svg" width="20"> Washington Wizards | WAS | | <img src="https://cdn.nba.com/logos/nba/1610612762/global/L/logo.svg" width="20"> Utah Jazz | UTA |

</span>

---

## ⚾ MLB Team Abbreviations

<span style="font-size: 0.85em;">

| ⚾ American League | Abbr | | ⚾ National League | Abbr |
|---|------|---|---|------|
| <img src="https://www.mlbstatic.com/team-logos/133.svg" width="20"> Athletics | ATH | | <img src="https://www.mlbstatic.com/team-logos/109.svg" width="20"> Arizona Diamondbacks | AZ |
| <img src="https://www.mlbstatic.com/team-logos/110.svg" width="20"> Baltimore Orioles | BAL | | <img src="https://www.mlbstatic.com/team-logos/144.svg" width="20"> Atlanta Braves | ATL |
| <img src="https://www.mlbstatic.com/team-logos/111.svg" width="20"> Boston Red Sox | BOS | | <img src="https://www.mlbstatic.com/team-logos/112.svg" width="20"> Chicago Cubs | CHC |
| <img src="https://www.mlbstatic.com/team-logos/145.svg" width="20"> Chicago White Sox | CWS | | <img src="https://www.mlbstatic.com/team-logos/113.svg" width="20"> Cincinnati Reds | CIN |
| <img src="https://www.mlbstatic.com/team-logos/114.svg" width="20"> Cleveland Guardians | CLE | | <img src="https://www.mlbstatic.com/team-logos/115.svg" width="20"> Colorado Rockies | COL |
| <img src="https://www.mlbstatic.com/team-logos/116.svg" width="20"> Detroit Tigers | DET | | <img src="https://www.mlbstatic.com/team-logos/119.svg" width="20"> Los Angeles Dodgers | LAD |
| <img src="https://www.mlbstatic.com/team-logos/117.svg" width="20"> Houston Astros | HOU | | <img src="https://www.mlbstatic.com/team-logos/146.svg" width="20"> Miami Marlins | MIA |
| <img src="https://www.mlbstatic.com/team-logos/118.svg" width="20"> Kansas City Royals | KC | | <img src="https://www.mlbstatic.com/team-logos/158.svg" width="20"> Milwaukee Brewers | MIL |
| <img src="https://www.mlbstatic.com/team-logos/108.svg" width="20"> Los Angeles Angels | LAA | | <img src="https://www.mlbstatic.com/team-logos/121.svg" width="20"> New York Mets | NYM |
| <img src="https://www.mlbstatic.com/team-logos/142.svg" width="20"> Minnesota Twins | MIN | | <img src="https://www.mlbstatic.com/team-logos/143.svg" width="20"> Philadelphia Phillies | PHI |
| <img src="https://www.mlbstatic.com/team-logos/147.svg" width="20"> New York Yankees | NYY | | <img src="https://www.mlbstatic.com/team-logos/134.svg" width="20"> Pittsburgh Pirates | PIT |
| <img src="https://www.mlbstatic.com/team-logos/136.svg" width="20"> Seattle Mariners | SEA | | <img src="https://www.mlbstatic.com/team-logos/135.svg" width="20"> San Diego Padres | SD |
| <img src="https://www.mlbstatic.com/team-logos/139.svg" width="20"> Tampa Bay Rays | TB | | <img src="https://www.mlbstatic.com/team-logos/137.svg" width="20"> San Francisco Giants | SF |
| <img src="https://www.mlbstatic.com/team-logos/140.svg" width="20"> Texas Rangers | TEX | | <img src="https://www.mlbstatic.com/team-logos/138.svg" width="20"> St. Louis Cardinals | STL |
| <img src="https://www.mlbstatic.com/team-logos/141.svg" width="20"> Toronto Blue Jays | TOR | | <img src="https://www.mlbstatic.com/team-logos/120.svg" width="20"> Washington Nationals | WSH |

</span>

---

## 🏈 NFL Team Abbreviations

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

## 🏒 NHL Team Abbreviations

<span style="font-size: 0.85em;">

| 🏒 Eastern Conference | Abbr | | 🏒 Western Conference | Abbr |
|---|------|---|---|------|
| <img src="https://assets.nhle.com/logos/nhl/svg/BOS.svg" width="26"> Boston Bruins | BOS | | <img src="https://assets.nhle.com/logos/nhl/svg/ANA.svg" width="26"> Anaheim Ducks | ANA |
| <img src="https://assets.nhle.com/logos/nhl/svg/BUF.svg" width="26"> Buffalo Sabres | BUF | | <img src="https://assets.nhle.com/logos/nhl/svg/UTA.svg" width="26"> Utah Hockey Club | UTA |
| <img src="https://assets.nhle.com/logos/nhl/svg/CAR.svg" width="26"> Carolina Hurricanes | CAR | | <img src="https://assets.nhle.com/logos/nhl/svg/CGY.svg" width="26"> Calgary Flames | CGY |
| <img src="https://assets.nhle.com/logos/nhl/svg/CBJ.svg" width="26"> Columbus Blue Jackets | CBJ | | <img src="https://assets.nhle.com/logos/nhl/svg/CHI.svg" width="26"> Chicago Blackhawks | CHI |
| <img src="https://assets.nhle.com/logos/nhl/svg/DET.svg" width="26"> Detroit Red Wings | DET | | <img src="https://assets.nhle.com/logos/nhl/svg/COL.svg" width="26"> Colorado Avalanche | COL |
| <img src="https://assets.nhle.com/logos/nhl/svg/FLA.svg" width="26"> Florida Panthers | FLA | | <img src="https://assets.nhle.com/logos/nhl/svg/DAL.svg" width="26"> Dallas Stars | DAL |
| <img src="https://assets.nhle.com/logos/nhl/svg/MTL.svg" width="26"> Montreal Canadiens | MTL | | <img src="https://assets.nhle.com/logos/nhl/svg/EDM.svg" width="26"> Edmonton Oilers | EDM |
| <img src="https://assets.nhle.com/logos/nhl/svg/NJD.svg" width="26"> New Jersey Devils | NJ | | <img src="https://assets.nhle.com/logos/nhl/svg/LAK.svg" width="26"> Los Angeles Kings | LAK |
| <img src="https://assets.nhle.com/logos/nhl/svg/NYI.svg" width="26"> New York Islanders | NYI | | <img src="https://assets.nhle.com/logos/nhl/svg/MIN.svg" width="26"> Minnesota Wild | MIN |
| <img src="https://assets.nhle.com/logos/nhl/svg/NYR.svg" width="26"> New York Rangers | NYR | | <img src="https://assets.nhle.com/logos/nhl/svg/NSH.svg" width="26"> Nashville Predators | NSH |
| <img src="https://assets.nhle.com/logos/nhl/svg/OTT.svg" width="26"> Ottawa Senators | OTT | | <img src="https://assets.nhle.com/logos/nhl/svg/SEA.svg" width="26"> Seattle Kraken | SEA |
| <img src="https://assets.nhle.com/logos/nhl/svg/PHI.svg" width="26"> Philadelphia Flyers | PHI | | <img src="https://assets.nhle.com/logos/nhl/svg/SJS.svg" width="26"> San Jose Sharks | SJ |
| <img src="https://assets.nhle.com/logos/nhl/svg/PIT.svg" width="26"> Pittsburgh Penguins | PIT | | <img src="https://assets.nhle.com/logos/nhl/svg/STL.svg" width="26"> St. Louis Blues | STL |
| <img src="https://assets.nhle.com/logos/nhl/svg/TBL.svg" width="26"> Tampa Bay Lightning | TB | | <img src="https://assets.nhle.com/logos/nhl/svg/VAN.svg" width="26"> Vancouver Canucks | VAN |
| <img src="https://assets.nhle.com/logos/nhl/svg/TOR.svg" width="26"> Toronto Maple Leafs | TOR | | <img src="https://assets.nhle.com/logos/nhl/svg/VGK.svg" width="26"> Vegas Golden Knights | VGK |
| <img src="https://assets.nhle.com/logos/nhl/svg/WSH.svg" width="26"> Washington Capitals | WSH | | <img src="https://assets.nhle.com/logos/nhl/svg/WPG.svg" width="26"> Winnipeg Jets | WPG |

</span>

---

## ⚽ MLS Team Abbreviations

| ⚽ Eastern Conference | Abbr | | ⚽ Western Conference | Abbr |
|---|------|---|---|------|
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/18418.png" width="20"> Atlanta United | ATL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/20906.png" width="20"> Austin FC | ATX |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/9720.png" width="20"> CF Montréal | MTL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/6977.png" width="20"> Dallas FC | DAL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21300.png" width="20"> Charlotte FC | CLT | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/16467.png" width="20"> Houston Dynamo | HOU |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/183.png" width="20"> Columbus Crew | CLB | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/187.png" width="20"> LA Galaxy | LA |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/193.png" width="20"> D.C. United | DC | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/18966.png" width="20"> LAFC | LAFC |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/20232.png" width="20"> Inter Miami CF | MIA | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/9726.png" width="20"> Minnesota United | MIN |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/17606.png" width="20"> New York City FC | NYC | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/18986.png" width="20"> Nashville SC | NSH |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/1906.png" width="20"> New York Red Bulls | NYRB | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/9727.png" width="20"> Portland Timbers | POR |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/17609.png" width="20"> Orlando City SC | ORL | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/22529.png" width="20"> San Diego Loyal | SD |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/10739.png" width="20"> Philadelphia Union | PHI | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/185.png" width="20"> San Jose Earthquakes | SJ |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/189.png" width="20"> New England Revolution | NE | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/21812.png" width="20"> St. Louis City SC | STL |
| <img src="https://a.espncdn.com/i/teamlogos/soccer/500/9728.png" width="20"> Toronto FC | TOR | | <img src="https://a.espncdn.com/i/teamlogos/soccer/500/188.png" width="20"> Sporting Kansas City | SKC |

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
| `sport` | No | `nba` | Sport adapter: `nba`, `mlb`, `nfl`, `nhl`, `mls` |
| `team` | Yes | — | Team abbreviation (e.g. `LAL`, `NYR`, `KC`, `MIA`) |
| `marker` | No | `readme-scoreboard` | HTML comment marker name — use unique names for multiple scoreboards in one README |
| `target_repo` | No | your profile repo | Repo to update, format: `owner/repo` |

\* Not required in `--demo` mode.

---

## License

MIT
