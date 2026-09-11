# Examples

These are the rendered outputs readme-scoreboard writes between your markers.
Each file below is actual action output — open it to see the live-markdown preview.
Run `npm run examples:generate` to refresh these from the current demo data.

## Boards by sport

### NBA — LAL (team)

A live mid-season basketball board with record and recent results.

[View rendered output →](nba-lal.md)

### MLB — NYY (team)

A baseball board.

[View rendered output →](mlb-nyy.md)

### NFL — BUF (team)

An American football board.

[View rendered output →](nfl-buf.md)

### NHL — NYR (team)

An NHL board.

[View rendered output →](nhl-nyr.md)

### EPL — ARS (team)

A top-flight soccer board.

[View rendered output →](epl-ars.md)

### MLS — ATL (team)

A Major League Soccer board.

[View rendered output →](mls-atl.md)

### UCL — RMA (team)

A UEFA Champions League board.

[View rendered output →](ucl-rma.md)

### NCAAF — ALA (team)

A college football board.

[View rendered output →](ncaaf-ala.md)

### F1 — LP (player)

A Formula 1 constructor board (entity: player).

[View rendered output →](f1-lp.md)

### ATP — SIN (player)

A tennis board tracking an individual player (entity: player) — world ranking and last match.

[View rendered output →](atp-sin.md)

### WTA — SAB (player)

A women's tennis board tracking an individual player (entity: player) — world ranking and last match.

[View rendered output →](wta-sab.md)

## Custom title

The `title:` input replaces the default `My Favourite <League> Team` heading.

[View rendered output →](custom-title.md)

## Multi-team

The `teams:` input renders several boards in one run, each with its own section.

[View rendered output →](multi-team.md)

## Compact mode

The `compact: true` input produces a smaller block without team logos or recent-game details.

[View rendered output →](compact.md)

## Badge mode

The `badge: true` input renders compact shields-style badges instead of a full board.

[View rendered output →](badge.md)

## Player spotlight

The `player:` input adds a Player Spotlight block for one athlete on the board's roster,
with their season headline stats and most recent game.
Supported for NBA, MLB, NFL, NHL, and every soccer league.
The name must match the roster's exact spelling, including accents.

### NBA — Luka Doncic

`player: Luka Doncic` on `team: LAL`.

[View rendered output →](nba-lal-luka-doncic.md)

### MLB — Vladimir Guerrero Jr.

`player: Vladimir Guerrero Jr.` on `team: TOR`.

[View rendered output →](mlb-tor-vladimir-guerrero-jr.md)

### NFL — Patrick Mahomes

`player: Patrick Mahomes` on `team: KC`.

[View rendered output →](nfl-kc-patrick-mahomes.md)

### NHL — Artemi Panarin

`player: Artemi Panarin` on `team: NYR`.

[View rendered output →](nhl-nyr-artemi-panarin.md)

### EPL — Bukayo Saka

`player: Bukayo Saka` on `team: ARS`.

[View rendered output →](epl-ars-bukayo-saka.md)

### LALIGA — Kylian Mbappe

`player: Kylian Mbappe` on `team: RMA`.

[View rendered output →](laliga-rma-kylian-mbappe.md)

### MLS — Miguel Almiron

`player: Miguel Almiron` on `team: ATL`.

[View rendered output →](mls-atl-miguel-almiron.md)

### UCL — Vinicius Junior

`player: Vinicius Junior` on `team: RMA`.

[View rendered output →](ucl-rma-vinicius-junior.md)

