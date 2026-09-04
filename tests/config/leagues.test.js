const fs = require("fs");
const path = require("path");
const { LEAGUES } = require("../../src/config/leagues");
const { LEAGUES: seasonLeagues } = require("../../scripts/update-season-status");

describe("supported league registry", () => {
  it("keeps the machine-readable manifest synchronized", () => {
    const manifest = require("../../supported-leagues.json");
    const expected = LEAGUES.map(({ key, name, category, entity, endpoint, renderer, emoji, logo, seasonWindow, fallback, endpointOverride }) => ({
      key,
      name,
      category,
      entity,
      endpoint,
      apiSource: endpointOverride ? "official league API" : "ESPN public API",
      teamEndpoint: endpointOverride?.match(/\((https:\/\/[^)]+)\)/)?.[1]
        || `https://site.api.espn.com/apis/site/v2/sports/${endpoint}/teams`,
      renderer,
      emoji,
      logo,
      seasonWindow,
      fallback,
      ...(endpointOverride ? { endpointOverride } : {}),
    }));

    expect(manifest.generatedFrom).toBe("src/config/leagues.js");
    expect(manifest.leagues).toEqual(expected);
  });

  it("describes every concrete adapter exactly once", () => {
    const adapterKeys = fs.readdirSync(path.resolve(__dirname, "../../src/adapters"))
      .filter((file) => file.endsWith(".js") && !file.startsWith("base-"))
      .map((file) => file.replace(/\.js$/, ""))
      .sort();
    const registryKeys = LEAGUES.map((league) => league.key).sort();

    expect(registryKeys).toEqual(adapterKeys);
    expect(new Set(registryKeys).size).toBe(registryKeys.length);
  });

  it("keeps the generated team directory populated for every league", () => {
    const directory = require("../../team-directory.json");
    expect(directory.teams.length).toBeGreaterThan(LEAGUES.length);
    expect(directory.generatedAt).toEqual(expect.any(String));
    // Abbreviations can collide within a league (e.g. two clubs share `CEL`
    // or `RIV`), so treat each team id as the unique key.
    expect(new Set(directory.teams.map(({ league, id }) => `${league}:${id}`)).size)
      .toBe(directory.teams.length);
    expect(directory.teams.every(({ league, abbreviation }) => league && abbreviation)).toBe(true);
  });

  it("keeps the human-readable team directory generated", () => {
    const markdown = fs.readFileSync(path.resolve(__dirname, "../../TEAM_DIRECTORY.md"), "utf8");
    expect(markdown).toContain("# Team Directory");
    LEAGUES.filter((league) => league.entity !== "player")
      .forEach((league) => expect(markdown).toContain(`## ${league.name}`));
    LEAGUES.filter((league) => league.entity === "player")
      .forEach((league) => expect(markdown).not.toContain(`## ${league.name}`));
  });

  it("rejects malformed team directory entries", () => {
    const { validate } = require("../../scripts/validate-team-directory");
    expect(validate({ teams: [] })).toEqual(expect.arrayContaining([expect.stringMatching(/empty roster/)]));
    expect(validate(require("../../team-directory.json"))).toEqual([]);
  });

  it("drives the supported-season table in registry order", () => {
    expect(seasonLeagues).toEqual(LEAGUES.map(({ category, name, endpoint }) => [category, name, endpoint]));
  });

  it.each(LEAGUES)("$key has complete public metadata", (league) => {
    expect(league.name).toEqual(expect.any(String));
    expect(league.category).toEqual(expect.any(String));
    expect(league.emoji).toEqual(expect.any(String));
    expect(league.endpoint).toEqual(expect.any(String));
    expect(league.renderer).toEqual(expect.any(String));
    expect(league.logo.light).toMatch(/^https:\/\//);
    expect(league.logo.dark).toMatch(/^https:\/\//);
    expect(league.seasonWindow.start).toHaveLength(2);
    expect(league.seasonWindow.end).toHaveLength(2);
    expect(league.fallback).toHaveLength(2);
  });
});
