// Maps a flag emoji (regional indicator pair) to its country name, so
// per-player rosters only need to carry the flag and this stays the single
// source of truth for the country name shown in generated directories.
//
// Keys are escape sequences rather than literal glyphs on purpose: an edit once
// passed these lines through a toolchain that replaced one of the two regional
// indicators with U+FFFD, which silently broke eight countries — Argentina and
// Italy among them — and blanked their names in the generated directory.
// Escapes cannot be mangled that way, and each key is decoded in the tests.
const FLAG_TO_COUNTRY = {
  "\u{1F1E6}\u{1F1F1}": "Albania",
  "\u{1F1E6}\u{1F1F7}": "Argentina",
  "\u{1F1E6}\u{1F1FA}": "Australia",
  "\u{1F1E7}\u{1F1FE}": "Belarus",
  "\u{1F1E7}\u{1F1EA}": "Belgium",
  "\u{1F1E7}\u{1F1F7}": "Brazil",
  "\u{1F1E8}\u{1F1E6}": "Canada",
  "\u{1F1E8}\u{1F1F1}": "Chile",
  "\u{1F1E8}\u{1F1F3}": "China",
  "\u{1F1E8}\u{1F1FF}": "Czechia",
  "\u{1F1EA}\u{1F1E8}": "Ecuador",
  // England is a subdivision, so Unicode encodes it as a tag sequence rather
  // than a regional-indicator pair.
  "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}": "England",
  "\u{1F1EB}\u{1F1F7}": "France",
  "\u{1F1E9}\u{1F1EA}": "Germany",
  "\u{1F1EE}\u{1F1EA}": "Ireland",
  "\u{1F1EE}\u{1F1F9}": "Italy",
  "\u{1F1EF}\u{1F1F5}": "Japan",
  "\u{1F1F0}\u{1F1FF}": "Kazakhstan",
  "\u{1F1F2}\u{1F1E8}": "Monaco",
  "\u{1F1F3}\u{1F1FF}": "New Zealand",
  "\u{1F1F3}\u{1F1EC}": "Nigeria",
  "\u{1F1F3}\u{1F1F4}": "Norway",
  "\u{1F1F5}\u{1F1F8}": "Palestine",
  "\u{1F1F5}\u{1F1EA}": "Peru",
  "\u{1F1F5}\u{1F1ED}": "Philippines",
  "\u{1F1F5}\u{1F1F1}": "Poland",
  "\u{1F1F7}\u{1F1F4}": "Romania",
  "\u{1F1F7}\u{1F1FA}": "Russia",
  "\u{1F1F7}\u{1F1F8}": "Serbia",
  "\u{1F1FF}\u{1F1E6}": "South Africa",
  "\u{1F1EA}\u{1F1F8}": "Spain",
  "\u{1F1E8}\u{1F1ED}": "Switzerland",
  "\u{1F1FA}\u{1F1E6}": "Ukraine",
  "\u{1F1FA}\u{1F1F8}": "United States",
};

function countryForFlag(flag) {
  return FLAG_TO_COUNTRY[flag] || "";
}

module.exports = { FLAG_TO_COUNTRY, countryForFlag };
