const fs = require("fs");
const path = require("path");
const { LEAGUES } = require("../../src/config/leagues");
const { LEAGUES: seasonLeagues } = require("../../scripts/update-season-status");

describe("supported league registry", () => {
  it("describes every concrete adapter exactly once", () => {
    const adapterKeys = fs.readdirSync(path.resolve(__dirname, "../../src/adapters"))
      .filter((file) => file.endsWith(".js") && !file.startsWith("base-"))
      .map((file) => file.replace(/\.js$/, ""))
      .sort();
    const registryKeys = LEAGUES.map((league) => league.key).sort();

    expect(registryKeys).toEqual(adapterKeys);
    expect(new Set(registryKeys).size).toBe(registryKeys.length);
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
