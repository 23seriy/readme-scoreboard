// Compact boards drop the images and the recent-results log.
//
// Renderers emit the full board and let this strip it — soccer, basketball,
// hockey and the rest all rely on that, so the log is matched by its heading
// rather than by re-rendering with a compact flag. That makes the heading part
// of the contract: a sport whose log is titled differently is silently left
// alone in compact mode, which is how UFC's "Recent Fights" shipped to the
// gallery. The pattern therefore covers every sport's wording, and it lives
// here alone — it used to be copied into src/index.js and two scripts, so a new
// sport had to match three identical regexes or none at all.
const IMAGE_LINE = /^<img[^>]+>\n?/gm;
const RECENT_LOG = /\n\*\*📅 Recent (?:Games|Fights):\*\*\n```[\s\S]*?```\n?/g;

function compactMarkdown(content) {
  return String(content)
    .replace(IMAGE_LINE, "")
    .replace(RECENT_LOG, "\n");
}

module.exports = { compactMarkdown, RECENT_LOG };
