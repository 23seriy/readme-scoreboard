#!/usr/bin/env node
/**
 * Audits every configured league for the bug classes that have actually shipped
 * to a board:
 *
 *  1. An empty "Recent Games" block, or a 0-0 record, because the adapter picked
 *     a season with nothing played in it (the NHL reported pre-season fixtures as
 *     proof the season had started, so it never reached the completed one).
 *  2. An image that resolves to a placeholder rather than a photo — the NHL mug
 *     path answered 200 with an 11 KB stand-in, which GitHub drew as the grey
 *     silhouette, so a broken image looked like a working URL.
 *  3. A season window that disagrees with the upstream feed, so the board
 *     announces the wrong off-season start date.
 *
 * Exit code is 1 when anything is flagged, so it can gate a release by hand.
 * It is deliberately NOT part of CI: it makes ~100 live requests and a provider
 * hiccup would fail the build for reasons unrelated to the change under test.
 *
 *   node scripts/audit-league-invariants.js [--league=nhl,nba]
 */
const { LEAGUES } = require("../src/config/leagues");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// A real player photo is tens of KB. The NHL placeholder is 11 KB; anything
// this small is worth a human look rather than an automatic pass.
const MIN_PLAUSIBLE_IMAGE_BYTES = 15000;

async function probeImage(url) {
  if (!url) return { url, status: null, bytes: 0 };
  try {
    // globalThis-prefixed so the lint config's older globals list accepts it;
    // Node 24 provides fetch natively.
    const response = await globalThis.fetch(url, { method: "GET" });
    const body = await response.arrayBuffer();
    return { url, status: response.status, bytes: body.byteLength };
  } catch (error) {
    return { url, status: "ERR", bytes: 0, error: error.message };
  }
}

function seasonState(league, today) {
  const window = league.seasonWindow;
  if (!window?.start) return { active: null, nextStart: null };
  const [sm, sd] = window.start;
  const [em, ed] = window.end;
  const m = today.getUTCMonth() + 1;
  const d = today.getUTCDate();
  const after = m > sm || (m === sm && d >= sd);
  const before = m < em || (m === em && d <= ed);
  const active = sm > em ? after || before : after && before;
  const startPassed = m > sm || (m === sm && d > sd);
  const year = window.nextStartYear ?? (startPassed ? today.getUTCFullYear() + 1 : today.getUTCFullYear());
  return {
    active,
    nextStart: new Date(Date.UTC(year, sm - 1, sd)),
    nextStartLabel: `${MONTHS[sm - 1]} ${sd}, ${year}`,
  };
}

async function auditLeague(league, today) {
  const row = { key: league.key, name: league.name, flags: [] };
  let adapter;
  try {
    adapter = require(`../src/adapters/${league.key}`);
  } catch (error) {
    row.flags.push(`adapter did not load: ${error.message}`);
    return row;
  }

  const teams = Object.keys(adapter.TEAM_IDS || adapter.DEMO_TEAMS || {});
  row.team = teams[0];
  const state = seasonState(league, today);
  row.active = state.active;
  row.nextStartLabel = state.nextStartLabel;

  if (!row.team) {
    row.flags.push("no teams or players configured");
    return row;
  }

  // The image beside the heading. A league or series logo is legitimately small,
  // so size is not judged here — only reachability.
  if (typeof adapter.getLogoUrl === "function") {
    const image = await probeImage(adapter.getLogoUrl(row.team));
    row.logo = image.status;
    if (image.status !== 200) row.flags.push(`board image ${image.status}`);
    else if (image.bytes) row.logoBytes = image.bytes;
  } else {
    row.flags.push("no getLogoUrl");
  }

  // The spotlight headshot, where the adapter can build one from a roster id.
  // A null URL is deliberate for sports whose feed publishes no photos (UFC,
  // racing), so only a URL that IS produced and does not resolve is a fault —
  // and a real photo is never 11 KB, which is what the NHL placeholder was.
  const rosterId = adapter.PLAYER_IDS?.[row.team]?.id;
  if (rosterId && typeof adapter.getPlayerHeadshotUrl === "function") {
    const url = adapter.getPlayerHeadshotUrl(rosterId);
    if (url) {
      const image = await probeImage(url);
      row.headshot = image.status;
      if (image.status !== 200) row.flags.push(`headshot ${image.status}`);
      else if (image.bytes && image.bytes < MIN_PLAUSIBLE_IMAGE_BYTES) {
        row.flags.push(`headshot is a ${image.bytes}B placeholder?`);
      }
    } else {
      row.headshot = "none by design";
    }
  }

  // Live board data.
  try {
    const data = await adapter.fetchData(row.team);
    if (!data) {
      row.flags.push("fetchData returned nothing");
    } else {
      const games = data.recentGames || [];
      const played = (data.record?.wins || 0) + (data.record?.losses || 0);
      row.recentGames = games.length;
      row.record = data.record ? `${data.record.wins}-${data.record.losses}` : null;
      row.standing = data.standing ? data.standing.position : null;
      row.nextGame = data.nextGame?.date?.slice(0, 10) || null;

      // A board that can list results, has a record, and reports 0-0 has lost
      // them — the NHL shipped exactly this, mid-off-season. An empty list on
      // its own is NOT a fault: some feeds have no game log (racing, tennis
      // boards), and an off-season league can legitimately have nothing to
      // show. It is reported below as context, not as a failure.
      if (games.length > 0 && played === 0) {
        row.flags.push(`record is 0-0 with ${games.length} games listed`);
      }
    }
  } catch (error) {
    row.flags.push(`fetchData threw: ${error.message}`);
  }

  // An off-season board must not point at a start date that has already passed.
  if (state.active === false && state.nextStart < today) {
    row.flags.push(`next season start ${state.nextStartLabel} is in the past`);
  }

  return row;
}

async function main() {
  const only = process.argv.find((arg) => arg.startsWith("--league="));
  const keys = only ? only.split("=")[1].split(",") : null;
  const leagues = keys ? LEAGUES.filter((l) => keys.includes(l.key)) : LEAGUES;
  const today = new Date();

  const rows = [];
  for (const league of leagues) {
    process.stdout.write(`  ${league.key.padEnd(14)}`);
    const row = await auditLeague(league, today);
    rows.push(row);
    process.stdout.write(
      `${String(row.recentGames ?? "-").padStart(2)} games | rec ${String(row.record ?? "-").padEnd(6)}` +
        ` | next ${String(row.nextGame ?? "-").padEnd(10)} | ${row.flags.length ? "⚠️" : "✅"}\n`
    );
  }

  const flagged = rows.filter((row) => row.flags.length);
  console.log(`\n  ${rows.length - flagged.length}/${rows.length} leagues clean`);
  if (flagged.length) {
    console.log(`\n  Flagged (${flagged.length}):`);
    for (const row of flagged) {
      console.log(`   ${row.key}: ${row.flags.join("; ")}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
