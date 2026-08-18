const fs = require("fs");

const ci = fs.readFileSync(".github/workflows/ci.yml", "utf8");

describe("repository CI configuration", () => {
  it("uses a locked install and runs tests and lint", () => {
    expect(ci).toContain("npm ci --ignore-scripts");
    expect(ci).toContain("npm test -- --runInBand");
    expect(ci).toContain("npm run lint");
  });
});
