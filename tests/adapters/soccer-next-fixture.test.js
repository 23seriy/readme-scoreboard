const axios = require("axios");
const epl = require("../../src/adapters/epl");

jest.mock("axios");

// The general soccer tests stub three responses — team, standings, schedule. This
// file exists for the FOURTH call: the future-fixture feed.
//
// Without `&fixture=true` the schedule endpoint returns a truncated page of
// COMPLETED matches (five events for a Premier League season), so no upcoming
// match is ever in the response and `parseNextGame` — which was already wired
// into the base class — always returned null. Every soccer board therefore
// rendered without its `📅 Next:` line, and nothing noticed, because the request
// being made was never asserted.
//
// This pins the request contract: the fix is the parameter, so the parameter is
// what the guard checks. (The rendered line is covered by the live boards and by
// `npm run audit:leagues`, which reports a next fixture per league.)
const teamResponse = {
  data: { team: { id: 359, abbreviation: "ARS", name: "Arsenal", displayName: "Arsenal" } },
};

const standingsResponse = {
  data: {
    children: [
      {
        name: "English Premier League",
        standings: {
          entries: [
            {
              team: { abbreviation: "ARS" },
              stats: [
                { name: "wins", value: 10 },
                { name: "losses", value: 2 },
                { name: "ties", value: 3 },
              ],
            },
          ],
        },
      },
    ],
  },
};

// The team and standings responses have to be real: a bare `{ data: {} }` makes
// fetchTeamByAbbr return null and fetchData bail out before it ever builds a
// schedule URL — which is how the first version of this test failed.
async function scheduleUrls() {
  axios.get
    .mockResolvedValueOnce(teamResponse)
    .mockResolvedValueOnce(standingsResponse)
    .mockResolvedValue({ data: { events: [] } });

  await epl.fetchData("ARS");

  return axios.get.mock.calls.map(([url]) => String(url)).filter((url) => url.includes("/schedule?"));
}

describe("soccer — the future-fixture feed", () => {
  it("asks for upcoming fixtures, not just the completed page", async () => {
    const urls = await scheduleUrls();
    expect(urls.some((url) => url.includes("fixture=true"))).toBe(true);
  });

  it("still asks for the completed schedule, for recent results", async () => {
    const urls = await scheduleUrls();
    // At least one: the conference record fetches a schedule too, so asserting an
    // exact count here would pin an implementation detail rather than the point.
    expect(urls.filter((url) => !url.includes("fixture=true")).length).toBeGreaterThanOrEqual(1);
  });
});
