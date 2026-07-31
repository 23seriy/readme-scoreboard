# 🏆 readme-scoreboard

> Live sports stats on your GitHub profile README — place them wherever you want

Currently supports **NBA** and **MLB** with more sports coming soon (NHL, NFL, soccer, etc.)

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

### 2. Create secrets

Go to your profile repo **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `GH_TOKEN` | GitHub token with `repo` scope ([create one](https://github.com/settings/tokens/new)) |
| `BDL_API_KEY` | Free [BallDontLie](https://app.balldontlie.io) API key |

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
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
          BDL_API_KEY: ${{ secrets.BDL_API_KEY }}
          SPORT: nba
          TEAM: LAL
```

Change `TEAM` to your team's abbreviation (see table below). Done!

#### MLB Example (no `BDL_API_KEY` needed)

```yaml
      - uses: 23seriy/readme-scoreboard@main
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
          SPORT: mlb
          TEAM: NYY
```

---

## Supported Sports

| Sport | Status | Data Source | API Key? |
|-------|--------|------------|----------|
| 🏀 NBA | ✅ Available | [BallDontLie API](https://www.balldontlie.io/) | Required (free) |
| ⚾ MLB | ✅ Available | [MLB Stats API](https://statsapi.mlb.com/) | **Not needed** |
| 🏒 NHL | 🔜 Coming soon | — | — |
| 🏈 NFL | 🔜 Coming soon | — | — |
| ⚽ Soccer | 🔜 Coming soon | — | — |

---

## NBA Team Abbreviations

| | Team | Abbr | | | Team | Abbr |
|---|------|------|-|---|------|------|
| <img src="https://cdn.nba.com/logos/nba/1610612737/global/L/logo.svg" width="20"> | Atlanta Hawks | ATL | | <img src="https://cdn.nba.com/logos/nba/1610612749/global/L/logo.svg" width="20"> | Milwaukee Bucks | MIL |
| <img src="https://cdn.nba.com/logos/nba/1610612738/global/L/logo.svg" width="20"> | Boston Celtics | BOS | | <img src="https://cdn.nba.com/logos/nba/1610612750/global/L/logo.svg" width="20"> | Minnesota Timberwolves | MIN |
| <img src="https://cdn.nba.com/logos/nba/1610612751/global/L/logo.svg" width="20"> | Brooklyn Nets | BKN | | <img src="https://cdn.nba.com/logos/nba/1610612740/global/L/logo.svg" width="20"> | New Orleans Pelicans | NOP |
| <img src="https://cdn.nba.com/logos/nba/1610612766/global/L/logo.svg" width="20"> | Charlotte Hornets | CHA | | <img src="https://cdn.nba.com/logos/nba/1610612752/global/L/logo.svg" width="20"> | New York Knicks | NYK |
| <img src="https://cdn.nba.com/logos/nba/1610612741/global/L/logo.svg" width="20"> | Chicago Bulls | CHI | | <img src="https://cdn.nba.com/logos/nba/1610612760/global/L/logo.svg" width="20"> | Oklahoma City Thunder | OKC |
| <img src="https://cdn.nba.com/logos/nba/1610612739/global/L/logo.svg" width="20"> | Cleveland Cavaliers | CLE | | <img src="https://cdn.nba.com/logos/nba/1610612753/global/L/logo.svg" width="20"> | Orlando Magic | ORL |
| <img src="https://cdn.nba.com/logos/nba/1610612742/global/L/logo.svg" width="20"> | Dallas Mavericks | DAL | | <img src="https://cdn.nba.com/logos/nba/1610612755/global/L/logo.svg" width="20"> | Philadelphia 76ers | PHI |
| <img src="https://cdn.nba.com/logos/nba/1610612743/global/L/logo.svg" width="20"> | Denver Nuggets | DEN | | <img src="https://cdn.nba.com/logos/nba/1610612756/global/L/logo.svg" width="20"> | Phoenix Suns | PHX |
| <img src="https://cdn.nba.com/logos/nba/1610612765/global/L/logo.svg" width="20"> | Detroit Pistons | DET | | <img src="https://cdn.nba.com/logos/nba/1610612757/global/L/logo.svg" width="20"> | Portland Trail Blazers | POR |
| <img src="https://cdn.nba.com/logos/nba/1610612744/global/L/logo.svg" width="20"> | Golden State Warriors | GSW | | <img src="https://cdn.nba.com/logos/nba/1610612758/global/L/logo.svg" width="20"> | Sacramento Kings | SAC |
| <img src="https://cdn.nba.com/logos/nba/1610612745/global/L/logo.svg" width="20"> | Houston Rockets | HOU | | <img src="https://cdn.nba.com/logos/nba/1610612759/global/L/logo.svg" width="20"> | San Antonio Spurs | SAS |
| <img src="https://cdn.nba.com/logos/nba/1610612754/global/L/logo.svg" width="20"> | Indiana Pacers | IND | | <img src="https://cdn.nba.com/logos/nba/1610612761/global/L/logo.svg" width="20"> | Toronto Raptors | TOR |
| <img src="https://cdn.nba.com/logos/nba/1610612746/global/L/logo.svg" width="20"> | LA Clippers | LAC | | <img src="https://cdn.nba.com/logos/nba/1610612762/global/L/logo.svg" width="20"> | Utah Jazz | UTA |
| <img src="https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg" width="20"> | Los Angeles Lakers | LAL | | <img src="https://cdn.nba.com/logos/nba/1610612764/global/L/logo.svg" width="20"> | Washington Wizards | WAS |
| <img src="https://cdn.nba.com/logos/nba/1610612763/global/L/logo.svg" width="20"> | Memphis Grizzlies | MEM | | <img src="https://cdn.nba.com/logos/nba/1610612748/global/L/logo.svg" width="20"> | Miami Heat | MIA |

---

## MLB Team Abbreviations

| | Team | Abbr | | | Team | Abbr |
|---|------|------|-|---|------|------|
| <img src="https://www.mlbstatic.com/team-logos/109.svg" width="20"> | Arizona Diamondbacks | AZ | | <img src="https://www.mlbstatic.com/team-logos/146.svg" width="20"> | Miami Marlins | MIA |
| <img src="https://www.mlbstatic.com/team-logos/144.svg" width="20"> | Atlanta Braves | ATL | | <img src="https://www.mlbstatic.com/team-logos/158.svg" width="20"> | Milwaukee Brewers | MIL |
| <img src="https://www.mlbstatic.com/team-logos/110.svg" width="20"> | Baltimore Orioles | BAL | | <img src="https://www.mlbstatic.com/team-logos/142.svg" width="20"> | Minnesota Twins | MIN |
| <img src="https://www.mlbstatic.com/team-logos/111.svg" width="20"> | Boston Red Sox | BOS | | <img src="https://www.mlbstatic.com/team-logos/121.svg" width="20"> | New York Mets | NYM |
| <img src="https://www.mlbstatic.com/team-logos/112.svg" width="20"> | Chicago Cubs | CHC | | <img src="https://www.mlbstatic.com/team-logos/147.svg" width="20"> | New York Yankees | NYY |
| <img src="https://www.mlbstatic.com/team-logos/145.svg" width="20"> | Chicago White Sox | CWS | | <img src="https://www.mlbstatic.com/team-logos/143.svg" width="20"> | Philadelphia Phillies | PHI |
| <img src="https://www.mlbstatic.com/team-logos/113.svg" width="20"> | Cincinnati Reds | CIN | | <img src="https://www.mlbstatic.com/team-logos/134.svg" width="20"> | Pittsburgh Pirates | PIT |
| <img src="https://www.mlbstatic.com/team-logos/114.svg" width="20"> | Cleveland Guardians | CLE | | <img src="https://www.mlbstatic.com/team-logos/133.svg" width="20"> | Sacramento Athletics | ATH |
| <img src="https://www.mlbstatic.com/team-logos/115.svg" width="20"> | Colorado Rockies | COL | | <img src="https://www.mlbstatic.com/team-logos/135.svg" width="20"> | San Diego Padres | SD |
| <img src="https://www.mlbstatic.com/team-logos/116.svg" width="20"> | Detroit Tigers | DET | | <img src="https://www.mlbstatic.com/team-logos/137.svg" width="20"> | San Francisco Giants | SF |
| <img src="https://www.mlbstatic.com/team-logos/117.svg" width="20"> | Houston Astros | HOU | | <img src="https://www.mlbstatic.com/team-logos/136.svg" width="20"> | Seattle Mariners | SEA |
| <img src="https://www.mlbstatic.com/team-logos/118.svg" width="20"> | Kansas City Royals | KC | | <img src="https://www.mlbstatic.com/team-logos/138.svg" width="20"> | St. Louis Cardinals | STL |
| <img src="https://www.mlbstatic.com/team-logos/108.svg" width="20"> | Los Angeles Angels | LAA | | <img src="https://www.mlbstatic.com/team-logos/139.svg" width="20"> | Tampa Bay Rays | TB |
| <img src="https://www.mlbstatic.com/team-logos/119.svg" width="20"> | Los Angeles Dodgers | LAD | | <img src="https://www.mlbstatic.com/team-logos/140.svg" width="20"> | Texas Rangers | TEX |
| | | | | <img src="https://www.mlbstatic.com/team-logos/141.svg" width="20"> | Toronto Blue Jays | TOR |
| | | | | <img src="https://www.mlbstatic.com/team-logos/120.svg" width="20"> | Washington Nationals | WSH |

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
SPORT=nba TEAM=BOS node src/index.js --demo
SPORT=mlb TEAM=NYY node src/index.js --demo
```

---

## Adding a New Sport

Each sport is a single adapter file. See `src/adapters/nba.js` as the reference.

1. Create `src/adapters/your-sport.js`
2. Export `fetchData(teamAbbr, apiKey)` → returns `{ team, recentGames, record }`
3. Export `getDemoData(teamAbbr)` for demo mode
4. Export `TEAM_EMOJI` and `TEAM_IDS` for metadata
5. Add the sport case to `src/renderers/markdown.js`
6. Update this README
7. Open a PR!

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SPORT` | No | Sport adapter to use (default: `nba`) |
| `TEAM` | Yes | Team abbreviation (e.g., `LAL`, `BOS`) |
| `GH_TOKEN` | Yes* | GitHub token with `repo` scope |
| `BDL_API_KEY` | NBA only | BallDontLie API key (not needed for MLB) |
| `TARGET_REPO` | No | Target repo (default: your profile repo) |

\* Not required in `--demo` mode.

---

## License

MIT
