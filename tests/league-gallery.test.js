const fs = require("node:fs");
const path = require("node:path");
const { LEAGUES } = require("../src/config/leagues");

// The league gallery is the committed reference the README links for every
// league ("one file per league, built from live data"), and it has been
// regenerated on every league addition without a single assertion about its
// contents. That is how a UFC board shipped with its fight log still present in
// the "Compact mode" section: compaction matches the log by heading, so a new
// wording silently survives.

const GALLERY = path.resolve(__dirname, "../examples/leagues");
const read = (file) => fs.readFileSync(path.join(GALLERY, file), "utf8");

// The compact board sits between its section heading and the badge section. It
// cannot be delimited by the next "## " because the board's own title is an h2.
function section(text, heading, next) {
  const start = text.indexOf(heading);
  if (start < 0) return null;
  const end = text.indexOf(next, start + heading.length);
  return end < 0 ? text.slice(start) : text.slice(start, end);
}

describe("league gallery", () => {
  it("has a file for every league in the registry", () => {
    LEAGUES.forEach((league) => {
      expect(fs.existsSync(path.join(GALLERY, `${league.key}.md`))).toBe(true);
    });
    // ...and no files for leagues that no longer exist.
    const files = fs.readdirSync(GALLERY).filter((file) => file.endsWith(".md") && file !== "README.md");
    expect(files.sort()).toEqual(LEAGUES.map((league) => `${league.key}.md`).sort());
  });

  it("links every league from the gallery index", () => {
    const index = read("README.md");
    LEAGUES.forEach((league) => {
      expect(index).toContain(`[${league.name}](${league.key}.md)`);
    });
  });

  it("renders the compact section without a logo or a results log", () => {
    LEAGUES.forEach((league) => {
      const text = read(`${league.key}.md`);
      const compact = section(text, "## Compact mode", "## Badge");
      expect(`${league.key}:${Boolean(compact)}`).toBe(`${league.key}:true`);

      // A compact board still has a board in it, so this cannot pass by the
      // section being empty.
      expect(`${league.key}:${compact.includes(league.name)}`).toBe(`${league.key}:true`);

      // The formatter strips every <img> line and the recent-results block. The
      // board's own heading keeps an inline <picture>, so the check is for a
      // standalone image line — the team logo — exactly as the pattern does.
      expect(`${league.key}:${/^<img/m.test(compact)}`).toBe(`${league.key}:false`);
      expect(`${league.key}:${/\*\*📅 Recent (Games|Fights):\*\*/.test(compact)}`)
        .toBe(`${league.key}:false`);

      // And the default section must actually have had something to strip, or
      // the assertion above proves nothing for that sport.
      const standard = section(text, "## Default", "## Custom title");
      const hadLog = /\*\*📅 Recent (Games|Fights):\*\*/.test(standard);
      const hadLogo = /<img/.test(standard);
      expect(`${league.key}:${hadLog || hadLogo}`).toBe(`${league.key}:true`);
    });
  });
});
