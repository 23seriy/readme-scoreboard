jest.mock("../src/http", () => ({ get: jest.fn() }));

const { get } = require("../src/http");
const { LEAGUES } = require("../src/config/leagues");
const { buildEndpointList, checkApiHealth, checkLeagueLogos } = require("../scripts/check-api-health");

describe("API health checks", () => {
  beforeEach(() => jest.clearAllMocks());

  it("builds one unique HTTPS endpoint per supported league", () => {
    const endpoints = buildEndpointList();

    expect(endpoints).toHaveLength(LEAGUES.length);
    expect(new Set(endpoints.map(({ url }) => url)).size).toBe(endpoints.length);
    endpoints.forEach(({ url }) => expect(url).toMatch(/^https:\/\//));
  });

  it("reports all endpoints healthy when requests succeed", async () => {
    get.mockResolvedValue({ status: 200 });

    const result = await checkApiHealth();
    expect(result.checked).toBe(LEAGUES.length);
    expect(result.failures).toEqual([]);
    expect(result.results).toBe("all healthy");
    expect(Object.keys(result.timings)).toHaveLength(LEAGUES.length);
    expect(Object.values(result.timings).every((duration) => duration >= 0)).toBe(true);
    expect(get).toHaveBeenCalledTimes(LEAGUES.length);
  });

  it("returns endpoint-specific failures without hiding other results", async () => {
    get.mockImplementation((url) => url.endsWith("basketball/nba/teams")
      ? Promise.reject(new Error("503 Service Unavailable"))
      : Promise.resolve({ status: 200 }));

    const result = await checkApiHealth();

    expect(result.checked).toBe(LEAGUES.length);
    expect(result.failures).toEqual([expect.stringMatching(/^NBA:/)]);
    expect(result.results).toBe("one or more endpoints unavailable");
  });
});

describe("league logo checks", () => {
  beforeEach(() => jest.clearAllMocks());

  it("passes when every logo resolves and matches the id ESPN reports", async () => {
    get.mockImplementation((url) => {
      if (url.endsWith("/scoreboard")) {
        const league = LEAGUES.find((entry) => url.includes(`/${entry.endpoint}/scoreboard`));
        const id = league?.logo.light.match(/soccer\/500\/(\d+)\.png$/)?.[1];
        return Promise.resolve({
          status: 200,
          data: id ? { leagues: [{ logos: [{ href: `https://a.espncdn.com/i/leaguelogos/soccer/500/${id}.png` }] }] } : {},
        });
      }
      return Promise.resolve({ status: 200 });
    });

    await expect(checkLeagueLogos()).resolves.toEqual([]);
  });

  it("reports a logo URL that does not resolve", async () => {
    const target = LEAGUES[0];
    get.mockImplementation((url) => (url === target.logo.light
      ? Promise.reject(new Error("404 Not Found"))
      : Promise.resolve({ status: 200, data: {} })));

    const failures = await checkLeagueLogos();

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain(target.name);
    expect(failures[0]).toContain(target.logo.light);
    expect(failures[0]).toContain("404 Not Found");
  });

  it("reports a logo that resolves but is another competition's artwork", async () => {
    // The case a status check cannot see: the file loads, so only comparing
    // against ESPN's own answer catches it.
    const target = LEAGUES.find((entry) => /soccer\/500\/\d+\.png$/.test(entry.logo.light));
    get.mockImplementation((url) => (url.endsWith(`/${target.endpoint}/scoreboard`)
      ? Promise.resolve({
        status: 200,
        data: { leagues: [{ logos: [{ href: "https://a.espncdn.com/i/leaguelogos/soccer/500/9999.png" }] }] },
      })
      : Promise.resolve({ status: 200, data: {} })));

    const failures = await checkLeagueLogos();

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain(target.name);
    expect(failures[0]).toContain("ESPN reports 9999");
  });
});
