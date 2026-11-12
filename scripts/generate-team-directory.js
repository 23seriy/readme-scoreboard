const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");
const { get } = require("../src/http");
const { NAME_EQUALS_ABBREVIATION_ALLOWLIST } = require("./validate-team-directory");

// These leagues carry hundreds (or draw-determined sets) of teams, so we ask
// for the full roster rather than the default page. Their hardcoded TEAM_IDS
// only lists a handful of entries, which made the generated directory look
// incomplete.
const FULL_ROSTER_KEYS = new Set(["ncaab", "ncaaw", "ncaaf", "ncaa_hockey"]);

// A resolved name is only a real name when it is non-empty and is not just
// the abbreviation itself. ESPN sometimes reports a club by its initials
// only (e.g. "PAOK"), and the registry has no better name for bare-number
// TEAM_IDS entries, so without this check the generated directory silently
// fills with rows like { name: "CON", id: 18 } — the PR #512 Connecticut
// Sun regression. The comparison is case-sensitive on purpose: F1's "Audi"
// is a real name even though its abbreviation is "AUDI". The few clubs
// whose real name genuinely is their initials are allowlisted in
// validate-team-directory.js instead.
function isProperName(name, abbreviation) {
  return typeof name === "string"
    && name.trim().length > 0
    && name.trim() !== String(abbreviation || "");
}

// The league's team-list endpoint. An endpointOverride is honoured only when
// it points at a teams endpoint: NHL's override is a standings URL, which
// returns no teams at all, so the generator used to silently produce a
// nameless roster for the whole league (26 of 32 NHL rows were just
// abbreviations). The ESPN teams URL built from league.endpoint is the
// fallback for every league.
function endpointFor(league) {
  const override = league.endpointOverride?.match(/\((https:\/\/[^)]+)\)/)?.[1];
  if (override && override.includes("/teams")) return override;
  return `https://site.api.espn.com/apis/site/v2/sports/${league.endpoint}/teams`;
}

function apiTeams(payload) {
  const teams = payload?.sports?.[0]?.leagues?.[0]?.teams?.map(({ team }) => team) || payload?.teams;
  return Array.isArray(teams) ? teams : [];
}

// The endpoint URL for a league's team list. Collegiate leagues expose the
// full roster behind `?limit=1000`; everything else uses the default page
// (which already returns the complete set for fixed-size leagues).
function teamListUrl(league) {
  const base = endpointFor(league);
  if (FULL_ROSTER_KEYS.has(league.key)) {
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}limit=1000`;
  }
  return base;
}

// Throws on any fetch failure: a league whose roster cannot be fetched must
// fail the run loudly (see generate) instead of silently degrading to
// "no live data" and writing abbreviation-only rows.
async function liveTeams(league) {
  const response = await get(teamListUrl(league), { timeout: 10000 });
  return apiTeams(response.data).map((team) => ({
    abbreviation: team.abbreviation,
    name: team.displayName || team.name,
    id: team.id,
  }));
}

// Resolve a team's display name from a live name, the registry value, or the
// adapter's demo data. Returns null when no source has a proper name: falling
// back to the abbreviation itself is what wrote rows like { name: "CON" }
// into the committed directory. Callers must rescue a null name (from the
// live roster or the team-detail endpoint) or fail loudly — never emit it.
function resolveName(adapter, abbreviation, value, live) {
  if (isProperName(live, abbreviation)) return live;
  const objectName = typeof value === "object" ? (value.full_name || value.name) : null;
  if (isProperName(objectName, abbreviation)) return objectName;
  const demoName = adapter.DEMO_TEAMS?.[abbreviation]?.full_name
    || adapter.DEMO_TEAMS?.[abbreviation]?.name;
  if (isProperName(demoName, abbreviation)) return demoName;
  return null;
}

// Merge the adapter's static registry with the live roster.
//
// - The registry abbreviation is authoritative and is never overwritten by
//   live data: ESPN lists both Vienna clubs as "VIE", while the registry
//   deliberately disambiguates them as AUS (Austria Vienna) and RAP (Rapid
//   Vienna). Letting the live abbreviation win collapsed both rows to VIE.
// - A live entry is matched to a registry entry by abbreviation first
//   (through the adapter's ESPN_ABBR map when ESPN spells it differently,
//   e.g. NHL LAK -> LA). Id matching is only a fallback for entries whose
//   abbreviation ESPN does not use at all (e.g. Austria's AUS/RAP), and
//   only against live entries no abbreviation match claimed: id spaces
//   differ per source — the NFL registry uses its own sequential ids, the
//   NHL registry uses NHL ids, the live roster carries ESPN ids — so a
//   naive id match misattributes teams (e.g. registry NJ id 1 would take
//   live Boston's name).
// - A live name is used only when it is a proper name (see isProperName).
//   A registry entry with no proper name anywhere keeps a null name so the
//   caller can rescue or fail on it, instead of silently becoming its own
//   abbreviation.
// - Live teams with no registry entry are appended only when they carry a
//   real abbreviation and a proper name. Placeholder rows (e.g. MLS
//   "TBD Away"/"TBD Home") and abbreviation-less entries are skipped with a
//   warning instead of being written into the directory.
function mergeRosters(registryTeams, live) {
  const liveAbbrCounts = new Map();
  live.forEach((t) => {
    if (t.abbreviation) liveAbbrCounts.set(t.abbreviation, (liveAbbrCounts.get(t.abbreviation) || 0) + 1);
  });
  // Only unambiguous live abbreviations may match by abbreviation: two
  // clubs can share one (e.g. both Vienna clubs are "VIE" in ESPN data).
  const liveByAbbr = new Map(
    live.filter((t) => t.abbreviation && liveAbbrCounts.get(t.abbreviation) === 1)
      .map((t) => [t.abbreviation, t]),
  );
  const liveById = new Map(
    live.filter((t) => t.id !== undefined && t.id !== null).map((t) => [String(t.id), t]),
  );
  const liveAbbreviations = new Set(liveByAbbr.keys());

  const consumedLiveIds = new Set();
  const source = registryTeams.map((entry) => {
    // Abbreviation match first; id match only as a fallback when the
    // registry abbreviation is not an unambiguous live abbreviation (i.e.
    // ESPN does not use it, or several live clubs share it) — and only
    // against a live entry no abbreviation match already claimed.
    let liveEntry = liveByAbbr.get(entry.abbreviation);
    if (!liveEntry && !liveAbbreviations.has(entry.abbreviation)) {
      const byId = liveById.get(String(entry.id));
      if (byId && !consumedLiveIds.has(String(byId.id))) liveEntry = byId;
    }
    if (liveEntry) {
      consumedLiveIds.add(String(liveEntry.id));
      if (isProperName(liveEntry.name, liveEntry.abbreviation || entry.abbreviation)) {
        return { abbreviation: entry.abbreviation, name: liveEntry.name, id: entry.id };
      }
    }
    return entry;
  });

  // Only consumedLiveIds filters here: comparing live ids against registry
  // ids is unsound because the id spaces differ (registry NJ id 1 is an NHL
  // id, live BOS id 1 is an ESPN id — different teams, same number). A live
  // entry that matched a registry row is already marked consumed.
  const extraLive = live.filter((t) => {
    if (consumedLiveIds.has(String(t.id))) return false;
    if (!t.abbreviation || !isProperName(t.name, t.abbreviation)) {
      console.warn(`Skipping live team with no usable name/abbreviation: ${JSON.stringify(t)}`);
      return false;
    }
    if (/^TBD\b/i.test(t.abbreviation) || /^TBD\b/i.test(t.name)) {
      console.warn(`Skipping placeholder live team: ${t.abbreviation} (${t.name})`);
      return false;
    }
    return true;
  }).map((t) => ({ abbreviation: t.abbreviation, name: t.name, id: t.id }));
  source.push(...extraLive);

  return source;
}

// ESPN team-detail endpoint, used only as a rescue when the roster omits a
// team: the soccer roster endpoints currently omit several current clubs
// (e.g. Burnley, Girona) while the detail endpoint names them correctly.
// Returns a proper name, or null when the endpoint disagrees about which
// team this is — the detail record must carry the same abbreviation, so an
// NFL sequential id (e.g. 31/32) resolving to a conference node
// ("Afc"/"Nfc") is rejected rather than written into the directory.
async function fetchTeamDisplayName(league, entry) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${league.endpoint}/teams/${entry.id}`;
  try {
    const response = await get(url, { timeout: 10000 });
    const team = response.data?.team;
    if (!team) return null;
    if (team.abbreviation
      && String(team.abbreviation).toUpperCase() !== String(entry.abbreviation).toUpperCase()) return null;
    const name = team.displayName || team.name;
    return isProperName(name, entry.abbreviation) ? name : null;
  } catch {
    return null;
  }
}

// Rescue registry entries that still have no proper name after the merge:
// allowlisted clubs keep their abbreviation as the name, everything else is
// looked up on the team-detail endpoint. Returns the entries that could not
// be rescued, so the caller can fail loudly instead of writing them.
async function resolveUnnamed(league, teams) {
  const unresolved = [];
  for (const team of teams) {
    if (isProperName(team.name, team.abbreviation)) continue;
    if (NAME_EQUALS_ABBREVIATION_ALLOWLIST.has(`${league.key}:${team.abbreviation}`)) {
      console.log(`Keeping allowlisted abbreviation-as-name: ${league.key} ${team.abbreviation}`);
      team.name = team.abbreviation;
      continue;
    }
    const rescued = await fetchTeamDisplayName(league, team);
    if (rescued) {
      console.log(`Rescued ${league.key} ${team.abbreviation} from team-detail endpoint: ${rescued}`);
      team.name = rescued;
    } else {
      unresolved.push(team);
    }
  }
  return unresolved;
}

// Two live rows sharing an abbreviation AND a name are almost certainly one
// team listed under a stale id (e.g. NCAAF "Roosevelt Lakers" under both
// 599 and 127991 — the detail endpoint shows 599 is really Robert Morris,
// "ROB"). The detail endpoint is authoritative for which id is current:
// keep the candidate whose detail record still carries the abbreviation.
// Groups with different names (e.g. Dundee / Dundee United sharing "DUN")
// are genuinely different clubs and are left alone.
async function dedupeSameNameTeams(league, teams) {
  const groups = new Map();
  teams.forEach((team) => {
    const key = `${team.abbreviation}::${team.name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(team);
  });
  let result = teams;
  for (const [key, group] of groups) {
    if (group.length < 2) continue;
    const verified = [];
    for (const candidate of group) {
      verified.push({ candidate, ok: (await fetchTeamDisplayName(league, candidate)) !== null });
    }
    const keepers = verified.filter((v) => v.ok).map((v) => v.candidate);
    if (keepers.length === 1) {
      const dropped = group.filter((c) => c !== keepers[0]);
      result = result.filter((t) => !dropped.includes(t));
      console.warn(`Dropping stale duplicate ${key}: kept id ${keepers[0].id}, dropped ${dropped.map((c) => c.id).join(", ")}`);
    } else {
      console.warn(`Leaving ambiguous duplicate ${key} untouched (ids ${group.map((c) => c.id).join(", ")}): team-detail endpoint did not disambiguate`);
    }
  }
  return result;
}

async function generate() {
  const failures = [];
  const unresolved = [];

  // Fetch every league's live roster first (concurrently), collecting
  // failures instead of letting one bad league abort the rest, so a single
  // run reports everything that is wrong at once.
  const leagueTeams = await Promise.all(LEAGUES.filter((league) => league.entity !== "player").map(async (league) => {
    const adapter = require(`../src/adapters/${league.key}`);
    const registry = adapter.ESPN_TEAM_IDS || adapter.TEAM_IDS || {};
    // Registry keys that are aliases of another abbreviation (e.g. NFL WAS
    // -> WSH) are remapped to the canonical abbreviation below, so the
    // canonical row is emitted once, with the registry id.
    const aliases = adapter.TEAM_ALIASES || {};
    let live = [];
    try {
      live = await liveTeams(league);
    } catch (error) {
      failures.push(`${league.key}: live roster fetch failed: ${error.message}`);
    }
    if (live.length === 0) failures.push(`${league.key}: live roster returned no teams`);

    const espnAbbr = adapter.ESPN_ABBR || {};
    const registryTeams = Object.entries(registry)
      .map(([abbreviation, value]) => {
        // An alias key (e.g. NFL WAS) is not a team of its own: emit it
        // under the canonical abbreviation, carrying the alias entry's id,
        // so the canonical row keeps the registry id instead of the live
        // ESPN id — which can collide with another registry id (NFL WSH's
        // ESPN id 28 is the 49ers' registry id). If the canonical
        // abbreviation is already a registry key, the real row wins and the
        // alias contributes nothing.
        const canonical = aliases[abbreviation];
        if (canonical && registry[canonical] !== undefined) return null;
        const key = canonical || abbreviation;
        return {
          abbreviation: key,
          name: resolveName(adapter, key, value, null),
          id: typeof value === "object" ? value.id : value,
          matchAbbr: espnAbbr[key] || key,
        };
      })
      .filter(Boolean);
    return { league, registryTeams, live };
  }));

  // Merge, rescue, and dedupe per league, then refuse to write anything if
  // any league or team could not be resolved: a stale or corrupt directory
  // must fail the run loudly, not silently ship abbreviation-only rows.
  const teams = [];
  for (const { league, registryTeams, live } of leagueTeams) {
    const forMerge = registryTeams.map((t) => ({ abbreviation: t.matchAbbr, name: t.name, id: t.id }));
    const merged = mergeRosters(forMerge, live);
    const restoreAbbr = new Map(registryTeams.map((t) => [t.matchAbbr, t.abbreviation]));
    const restored = merged.map((t) => ({
      ...t,
      abbreviation: restoreAbbr.get(t.abbreviation) || t.abbreviation,
    }));
    const stillUnnamed = await resolveUnnamed(league, restored);
    stillUnnamed.forEach((t) => unresolved.push(`${league.key} ${t.abbreviation} (id ${t.id}): no proper name found in registry, demo data, live roster, or team-detail endpoint`));
    const deduped = await dedupeSameNameTeams(league, restored);
    deduped.forEach((t) => teams.push({
      league: league.key,
      leagueName: league.name,
      abbreviation: t.abbreviation,
      name: t.name,
      id: t.id,
    }));
  }

  if (failures.length || unresolved.length) {
    [...failures, ...unresolved].forEach((line) => console.error(`- ${line}`));
    throw new Error("Team directory generation failed: refusing to write a directory with missing leagues or missing names (see errors above).");
  }

  fs.writeFileSync(
    path.resolve(__dirname, "../team-directory.json"),
    `${JSON.stringify({ generatedFrom: "src/config/leagues.js", generatedAt: new Date().toISOString(), teams }, null, 2)}\n`,
  );
}

if (require.main === module) generate().catch((error) => { console.error(error.message); process.exitCode = 1; });

module.exports = { apiTeams, endpointFor, generate, mergeRosters, resolveName, teamListUrl };
