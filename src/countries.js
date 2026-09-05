// Maps a flag emoji (regional indicator pair) to its country name, so
// per-player rosters only need to carry the flag and this stays the single
// source of truth for the country name shown in generated directories.
const FLAG_TO_COUNTRY = {
  "🇦🇷": "Argentina",
  "🇦🇺": "Australia",
  "🇧🇪": "Belgium",
  "🇧🇷": "Brazil",
  "🇧🇾": "Belarus",
  "🇨🇦": "Canada",
  "🇨🇭": "Switzerland",
  "🇨🇱": "Chile",
  "🇨🇿": "Czechia",
  "🇩🇪": "Germany",
  "🇪🇸": "Spain",
  "🇫🇷": "France",
  "🇮🇹": "Italy",
  "🇯🇵": "Japan",
  "🇰🇿": "Kazakhstan",
  "🇲🇨": "Monaco",
  "🇳🇴": "Norway",
  "🇵🇪": "Peru",
  "🇵🇭": "Philippines",
  "🇵🇱": "Poland",
  "🇷🇴": "Romania",
  "🇷🇸": "Serbia",
  "🇷🇺": "Russia",
  "🇺🇦": "Ukraine",
  "🇺🇸": "United States",
};

function countryForFlag(flag) {
  return FLAG_TO_COUNTRY[flag] || "";
}

module.exports = { FLAG_TO_COUNTRY, countryForFlag };
