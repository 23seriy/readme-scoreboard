jest.mock("../src/http", () => ({ get: jest.fn() }));

const { get } = require("../src/http");
const { LEAGUES } = require("../src/config/leagues");
const { buildEndpointList, checkApiHealth } = require("../scripts/check-api-health");

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
