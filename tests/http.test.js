jest.mock("axios");

const axios = require("axios");
const fs = require("node:fs");
const path = require("node:path");
const { DEFAULT_TIMEOUT_MS, get, isRetryableError } = require("../src/http");

describe("HTTP request helper", () => {
  beforeEach(() => jest.clearAllMocks());

  it("applies a bounded default timeout", async () => {
    axios.get.mockResolvedValue({ data: { ok: true } });

    await get("https://example.test/data");

    expect(axios.get).toHaveBeenCalledWith("https://example.test/data", { timeout: DEFAULT_TIMEOUT_MS });
  });

  it("preserves custom options while allowing a custom timeout", async () => {
    axios.get.mockResolvedValue({ data: { ok: true } });

    await get("https://example.test/data", { headers: { Authorization: "token" }, timeout: 5000 });

    expect(axios.get).toHaveBeenCalledWith("https://example.test/data", {
      headers: { Authorization: "token" },
      timeout: 5000,
    });
  });

  it("retries transient upstream failures and succeeds", async () => {
    axios.get
      .mockRejectedValueOnce({ response: { status: 503 } })
      .mockResolvedValueOnce({ data: { ok: true } });

    await get("https://example.test/data");

    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it("does not retry client errors", async () => {
    const error = { response: { status: 404 } };
    axios.get.mockRejectedValue(error);

    await expect(get("https://example.test/data")).rejects.toBe(error);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(isRetryableError(error)).toBe(false);
  });

  it("keeps production requests behind the shared helper", () => {
    const sourceRoots = [path.join(__dirname, "../src/adapters"), path.join(__dirname, "../scripts")];
    const sourceFiles = sourceRoots.flatMap((root) => fs.readdirSync(root)
      .filter((file) => file.endsWith(".js"))
      .map((file) => path.join(root, file)));

    sourceFiles.forEach((file) => {
      expect(fs.readFileSync(file, "utf8")).not.toContain("axios.get");
    });
  });
});
