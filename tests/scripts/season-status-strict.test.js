jest.mock("../../src/http", () => ({ get: jest.fn() }));

const { get } = require("../../src/http");
const { buildRows } = require("../../scripts/update-season-status");

describe("strict season status updates", () => {
  it("fails instead of rendering fallback dates when an API is unavailable", async () => {
    get.mockRejectedValue(new Error("upstream unavailable"));

    await expect(buildRows(new Date("2026-08-20T00:00:00Z"), { strict: true }))
      .rejects.toThrow("NBA: upstream unavailable");
  });
});
