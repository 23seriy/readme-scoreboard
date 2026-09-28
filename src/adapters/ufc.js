const { get: httpGet } = require("../http");
const { dateOffset, makeRng, seedFromString } = require("../demo");

const ESPN_HOST = "https://site.api.espn.com/apis";
const LEAGUE_LOGO = "https://a.espncdn.com/i/teamlogos/leagues/500/ufc.png";
const DEMO_SEASON = 2026;

// ESPN's country codes mapped to ISO 3166-1 alpha-2, so the flag is derived
// rather than hand-copied. Built by inverting ICU's region names against the
// names ESPN publishes alongside each code, with obsolete codes excluded (DD
// and DE both answer to "Germany", CS and RS to "Serbia") and the six ESPN
// spellings ICU does not carry added by hand.
const COUNTRY_ISO = {
  alb: "AL", arg: "AR", arm: "AM", aru: "AW", aus: "AU", aut: "AT", aze: "AZ",
  bel: "BE", bol: "BO", bra: "BR", brn: "BH", can: "CA", chi: "CL", chn: "CN",
  cmr: "CM", col: "CO", cro: "HR", cub: "CU", cze: "CZ", dom: "DO", drc: "CD",
  ecu: "EC", eng: "ENG", esp: "ES", fin: "FI", fra: "FR", geo: "GE", ger: "DE",
  guy: "GY", hai: "HT", hun: "HU", ina: "ID", ind: "IN", irl: "IE", irq: "IQ",
  ita: "IT", jam: "JM", jpn: "JP", kaz: "KZ", kgz: "KG", lib: "LB", ltu: "LT",
  mar: "MA", mda: "MD", mex: "MX", mgl: "MN", mtg: "ME", mya: "MM", ned: "NL",
  ngr: "NG", nzl: "NZ", pan: "PA", per: "PE", phi: "PH", ple: "PS", pol: "PL",
  por: "PT", pur: "PR", rom: "RO", rsa: "ZA", rus: "RU", sct: "SCT", sen: "SN",
  ser: "RS", sko: "KR", sui: "CH", svk: "SK", swe: "SE", tha: "TH", tjk: "TJ",
  tur: "TR", uae: "AE", ukr: "UA", usa: "US", uzb: "UZ", ven: "VE", wal: "WAL",
  zim: "ZW",
};

// England, Scotland and Wales are subdivisions, which Unicode encodes as tag
// sequences rather than regional-indicator pairs.
const SUBDIVISION_FLAGS = {
  ENG: "gbeng", SCT: "gbsct", WAL: "gbwls",
};

/**
 * The flag for a fighter's country. ESPN leaves the country blank for a number
 * of competitors, and inventing one would be worse than showing none, so an
 * unknown or blank code renders nothing.
 */
function flagFor(countryCode) {
  const iso = COUNTRY_ISO[countryCode];
  if (!iso) return "";
  const subdivision = SUBDIVISION_FLAGS[iso];
  if (subdivision) {
    // The tag sequence needs the black flag (U+1F3F4) in front of it and the
    // cancel tag at the end; leaving the flag off renders a stray tag soup.
    const tags = [...subdivision]
      .map((letter) => String.fromCodePoint(0xe0000 + letter.charCodeAt(0)))
      .join("");
    return `\u{1F3F4}${tags}\u{E007F}`;
  }
  return [...iso].map((letter) => String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65)).join("");
}

/**
 * The fighters a board can be requested for.
 *
 * UFC is the only league here whose upstream feed publishes no athlete id at
 * all — ESPN's MMA scoreboard carries names, records and a country only — so a
 * name is the identity, and codes are derived from the surname the way
 * ATP/WTA/NASCAR do. Picked from the headliners of the season's cards rather
 * than guessed: every competitor in the main events of the twelve months to
 * 2026-09-25, plus the top three bouts of the most recent cards.
 */
const FIGHTERS = {
  ABU: { name: "Loai Abushaar", weight: "Lightweight", cc: "usa" },
  ADA: { name: "Matt Adams", weight: "Heavyweight", cc: "usa" },
  ADE: { name: "Israel Adesanya", weight: "Middleweight", cc: "ngr" },
  ALL: { name: "Brendan Allen", weight: "Middleweight", cc: "bra" },
  APO: { name: "Alex Apodaca", weight: "Women's Bantamweight", cc: "usa" },
  BER: { name: "Arlind Berisha", weight: "Light Heavyweight", cc: "alb" },
  BON: { name: "Gabriel Bonfim", weight: "Welterweight", cc: "bra" },
  COS: { name: "Melquizael Costa", weight: "Featherweight", cc: "bra" },
  DAR: { name: "Adam Darby", weight: "Welterweight", cc: "irl" },
  EVL: { name: "Movsar Evloev", weight: "Featherweight", cc: "rus" },
  FIG: { name: "Deiveson Figueiredo", weight: "Bantamweight", cc: "bra" },
  GAE: { name: "Justin Gaethje", weight: "Lightweight", cc: "usa" },
  GAM: { name: "Mateusz Gamrot", weight: "Lightweight", cc: "pol" },
  HAI: { name: "Theo Haig", weight: "Middleweight", cc: "usa" },
  HER: { name: "Anthony Hernandez", weight: "Middleweight", cc: "usa" },
  HOL: { name: "Max Holloway", weight: "Welterweight", cc: "usa" },
  HOO: { name: "Dan Hooker", weight: "Lightweight", cc: "nzl" },
  HOR: { name: "Kyoji Horiguchi", weight: "Flyweight", cc: "jpn" },
  HUN: { name: "Zevan Hunt", weight: "Welterweight", cc: "usa" },
  LOP: { name: "Diego Lopes", weight: "Featherweight", cc: "bra" },
  MAK: { name: "Islam Makhachev", weight: "Welterweight", cc: "rus" },
  MAL: { name: "Mike Malott", weight: "Welterweight", cc: "can" },
  MIR: { name: "Bella Mir", weight: "Women's Bantamweight", cc: "usa" },
  MOI: { name: "Renato Moicano", weight: "Lightweight", cc: "bra" },
  MUH: { name: "Belal Muhammad", weight: "Welterweight", cc: "ple" },
  OLI: { name: "Charles Oliveira", weight: "Lightweight", cc: "bra" },
  OLV: { name: "Vinicius Oliveira", weight: "Bantamweight", cc: "bra" },
  PAN: { name: "Alexandre Pantoja", weight: "Flyweight", cc: "bra" },
  PAR: { name: "Salahdine Parnasse", weight: "Lightweight", cc: "fra" },
  PAS: { name: "Quentin Pasley", weight: "Light Heavyweight", cc: "usa" },
  PER: { name: "Mayton Perea", weight: "Welterweight", cc: "ecu" },
  PIM: { name: "Paddy Pimblett", weight: "Lightweight", cc: "eng" },
  PLE: { name: "Dricus Du Plessis", weight: "Middleweight", cc: "rsa" },
  PRA: { name: "Carlos Prates", weight: "Welterweight", cc: "bra" },
  PRO: { name: "Jiří Procházka", weight: "Light Heavyweight", cc: "cze" },
  STE: { name: "Aljamain Sterling", weight: "Featherweight", cc: "usa" },
  STR: { name: "Sean Strickland", weight: "Middleweight", cc: "usa" },
  VOL: { name: "Alexander Volkanovski", weight: "Featherweight", cc: "aus" },
  WIN: { name: "Anthony Wint", weight: "Heavyweight", cc: "usa" },
  YAD: { name: "Song Yadong", weight: "Bantamweight", cc: "chn" },
};

const TEAM_EMOJI = Object.fromEntries(
  Object.entries(FIGHTERS).map(([code, fighter]) => [code, flagFor(fighter.cc)]),
);

// Surface names come from the feed, so "Jiří Procházka" arrives both accented
// and unaccented depending on the endpoint. Comparing normalised names is what
// makes the roster survive that.
function normalizeName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ATP/NASCAR-style surname code, used for opponents that have no roster entry.
function surnameCode(fullName) {
  const parts = String(fullName || "").replace(/[.'-]/g, " ").split(/\s+/).filter(Boolean);
  const source = parts.length > 1 ? parts[parts.length - 1] : (parts[0] || "");
  const letters = source.replace(/[^A-Za-z]/g, "").toUpperCase();
  return (letters.length >= 3 ? letters : `${letters}${parts[0] || ""}`.replace(/[^A-Za-z]/g, "").toUpperCase()).slice(0, 3);
}

// "31-7-0" is a career record: wins-losses-draws, where the third number also
// folds in no-contests on some cards.
function parseRecord(summary) {
  const parts = String(summary || "").split("-").map((value) => Number.parseInt(value, 10));
  if (parts.length < 2 || parts.some((value) => !Number.isFinite(value))) return null;
  return { wins: parts[0], losses: parts[1], draws: parts[2] || 0 };
}

const DEMO_TEAMS = {
  STR: { abbreviation: "STR", name: "Strickland", full_name: "Sean Strickland", conference: "Middleweight", division: "" },
  MAK: { abbreviation: "MAK", name: "Makhachev", full_name: "Islam Makhachev", conference: "Welterweight", division: "" },
  OLI: { abbreviation: "OLI", name: "Oliveira", full_name: "Charles Oliveira", conference: "Lightweight", division: "" },
};

// ESPN's MMA scoreboard publishes no athlete id, so these were resolved from the
// core API's competition payloads and confirmed by reading each athlete's
// profile back and matching the name — never taken on trust from a reference.
// The board itself does not need them (it matches fights by name); they exist so
// the generated player directory can list UFC fighters like every other
// individual sport.
const ESPN_IDS = {
  ABU: 5401059,
  ADA: 5364347,
  ADE: 4285679,
  ALL: 4025699,
  APO: 5394582,
  BER: 5369721,
  BON: 4921516,
  COS: 4425763,
  DAR: 5369446,
  EVL: 4029275,
  FIG: 4189320,
  GAE: 3022345,
  GAM: 3068125,
  HAI: 4977642,
  HER: 4290956,
  HOL: 2614933,
  HOO: 3109135,
  HOR: 2613374,
  HUN: 5369672,
  LOP: 4881999,
  MAK: 3332412,
  MAL: 3165120,
  MIR: 5369428,
  MOI: 3028863,
  MUH: 3172112,
  OLI: 2504169,
  OLV: 4884877,
  PAN: 2560746,
  PAR: 4312859,
  PAS: 5307124,
  PER: 5369676,
  PIM: 4008549,
  PLE: 3166126,
  PRA: 4294832,
  PRO: 3156612,
  STE: 3031559,
  STR: 3093653,
  VOL: 3949584,
  WIN: 3128853,
  YAD: 3151289,
};

// The directory generator reads a name off each roster value, so pair the id
// with the name the roster already holds rather than repeating it.
const PLAYER_IDS = Object.fromEntries(
  Object.entries(FIGHTERS).map(([code, fighter]) => [code, { id: ESPN_IDS[code], name: fighter.name }]),
);

class UfcAdapter {
  DATA_SOURCE = "ESPN public API";

  // Live validation reads TEAM_IDS and TEAM_EMOJI, the same surface the
  // team-based adapters expose, and every other individual-sport adapter aliases
  // them to its athlete roster. UFC publishes no athlete id upstream, so the
  // roster entry itself is the value — it carries the name validation reports.
  TEAM_IDS = FIGHTERS;
  TEAM_EMOJI = TEAM_EMOJI;
  FIGHTERS = FIGHTERS;
  // Read by the generated player directory for rank/points lookups; UFC has no
  // ranking endpoint, so only the roster and its flags come from here.
  PLAYER_IDS = PLAYER_IDS;
  DEMO_TEAMS = DEMO_TEAMS;

  get baseUrl() {
    return `${ESPN_HOST}/site/v2/sports/mma/ufc`;
  }

  getSeasonYear() {
    return new Date().getFullYear();
  }

  // ESPN publishes no fighter headshots, so every board carries the promotion's
  // mark, the same fallback the racing drivers use for the series logo.
  getLogoUrl() {
    return LEAGUE_LOGO;
  }

  getPlayerHeadshotUrl() {
    return null;
  }

  /**
   * Every card ESPN holds for a calendar year. One request returns the whole
   * season, including each bout's result, so a fighter's history costs a single
   * call rather than one per fight.
   */
  async fetchCards(year) {
    try {
      const { data } = await httpGet(`${this.baseUrl}/scoreboard?dates=${year}`);
      return data.events || [];
    } catch (error) {
      console.error(`Failed to fetch UFC cards for ${year}: ${error.message}`);
      return [];
    }
  }

  /** Flatten the season's cards into the bouts that involve one fighter. */
  collectBouts(cards, fighterName) {
    const target = normalizeName(fighterName);
    const bouts = [];
    for (const card of cards) {
      for (const bout of card.competitions || []) {
        const competitors = bout.competitors || [];
        const side = competitors.find((entry) => normalizeName(entry.athlete?.fullName) === target);
        if (!side) continue;
        const opponent = competitors.find((entry) => entry !== side);
        const completed = Boolean(bout.status?.type?.completed);
        bouts.push({
          date: card.date,
          event: card.shortName || card.name,
          eventName: card.name,
          venue: bout.venue?.fullName || null,
          weight: bout.type?.abbreviation || null,
          completed,
          won: side.winner === true,
          drew: completed && competitors.every((entry) => entry.winner !== true),
          round: bout.status?.period || null,
          record: side.records?.[0]?.summary || null,
          opponentName: opponent?.athlete?.fullName || null,
          opponentFlag: flagFor((opponent?.athlete?.flag?.href || "").split("/").pop()?.replace(".png", "")),
        });
      }
    }
    return bouts.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /** The same bout can arrive from two adjacent season queries, so key it. */
  dedupeBouts(bouts) {
    const seen = new Set();
    return bouts.filter((bout) => {
      const key = `${bout.date}|${bout.opponentName}|${bout.event}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async fetchData(abbr) {
    const upper = String(abbr || "").toUpperCase();
    const fighter = FIGHTERS[upper];
    if (!fighter) return null;

    // ESPN holds one calendar year of cards per request, and the current year
    // always includes the scheduled bouts — a next-year query returns nothing.
    // Walk backwards only while the record of recent fights is thin, so the
    // common case stays a single request.
    const year = this.getSeasonYear();
    let bouts = this.collectBouts(await this.fetchCards(year), fighter.name);
    for (let back = 1; back <= 2; back += 1) {
      if (bouts.filter((bout) => bout.completed).length >= 5) break;
      const earlier = this.collectBouts(await this.fetchCards(year - back), fighter.name);
      bouts = this.dedupeBouts([...earlier, ...bouts]);
    }
    if (!bouts.length) return null;

    const completed = bouts.filter((bout) => bout.completed).reverse();
    const upcoming = bouts.filter((bout) => !bout.completed);
    const latest = completed[0];
    const career = parseRecord(latest?.record);

    return {
      team: {
        id: 0,
        abbreviation: upper,
        name: fighter.name.split(" ").slice(-1)[0],
        full_name: fighter.name,
        conference: latest?.weight || fighter.weight,
        division: "",
      },
      record: { ...(career || { wins: 0, losses: 0, draws: 0 }), season: latest?.date?.slice(0, 4) || String(year) },
      emoji: TEAM_EMOJI[upper],
      logoUrl: LEAGUE_LOGO,
      recentGames: completed.slice(0, 5).map((bout) => ({
        date: bout.date,
        opponent: bout.opponentName,
        opponentAbbr: surnameCode(bout.opponentName),
        opponentFlag: bout.opponentFlag,
        won: bout.won,
        drew: bout.drew,
        round: bout.round,
        event: bout.event,
      })),
      nextGame: upcoming.length
        ? {
          date: upcoming[0].date,
          opponent: surnameCode(upcoming[0].opponentName),
          opponentName: upcoming[0].opponentName,
          opponentFlag: upcoming[0].opponentFlag,
          event: upcoming[0].event,
          venue: upcoming[0].venue,
          weight: upcoming[0].weight,
        }
        : null,
      form: completed.slice(0, 5).map((bout) => (bout.drew ? "D" : bout.won ? "W" : "L")),
      // ESPN publishes no UFC rankings on this feed, so there is no position to
      // report — the board shows the record and the fight schedule instead.
      standing: null,
      spotlight: null,
    };
  }

  /**
   * Sample board for --demo and the examples gallery. Determined by the fighter
   * code alone, with dates from the pinned demo clock, so regenerating the
   * gallery never churns. Fighters have no scores, so the record is counted
   * from the same bout list the board displays.
   */
  getDemoData(abbr) {
    const upper = (abbr || "").toUpperCase();
    const key = DEMO_TEAMS[upper] ? upper : Object.keys(DEMO_TEAMS)[0];
    const team = DEMO_TEAMS[key];
    const rng = makeRng(seedFromString(`ufc-${key}`));
    const opponents = Object.keys(FIGHTERS).filter((code) => code !== key);

    const results = ["W", "W", "L", "W", "W"];
    const recentGames = results.map((result, index) => {
      const opponentCode = opponents[Math.floor(rng() * opponents.length)];
      return {
        date: dateOffset(-7 * (index + 1)),
        opponent: FIGHTERS[opponentCode].name,
        opponentAbbr: opponentCode,
        opponentFlag: flagFor(FIGHTERS[opponentCode].cc),
        won: result === "W",
        drew: false,
        round: 1 + Math.floor(rng() * 3),
        event: `UFC ${300 + Math.floor(rng() * 20)}`,
      };
    });
    const nextOpponent = opponents.find(
      (code) => !recentGames.some((game) => game.opponentAbbr === code),
    ) || opponents[0];

    return {
      team,
      record: {
        wins: results.filter((result) => result === "W").length,
        losses: results.filter((result) => result === "L").length,
        draws: 0,
        season: DEMO_SEASON,
      },
      emoji: TEAM_EMOJI[key],
      logoUrl: LEAGUE_LOGO,
      recentGames,
      nextGame: {
        date: dateOffset(21),
        opponent: nextOpponent,
        opponentName: FIGHTERS[nextOpponent].name,
        opponentFlag: flagFor(FIGHTERS[nextOpponent].cc),
        event: "UFC Fight Night",
        venue: "UFC APEX, Las Vegas",
        weight: FIGHTERS[nextOpponent].weight,
      },
      form: results,
      standing: null,
      spotlight: null,
    };
  }
}

module.exports = new UfcAdapter();
module.exports.helpers = { normalizeName, surnameCode, parseRecord, flagFor, COUNTRY_ISO, ESPN_IDS };
