/**
 * Use to get the display name based on the country names in the death data. Use to override the death data name and
 * make sure that the same country is treated as the same even if the name in the death data changes.
 * @param {string} country 
 */
exports.getDisplayAlias = function getDisplayAlias(country) {
  const trimmedCountry = country.trim()
  const DISPLAY_ALIASES = Object.freeze({
    "Bahamas, The": "Bahamas",
    "Holy See": "Vatican City",
    "Hong Kong SAR": "Hong Kong",
    "Iran (Islamic Republic of)": "Iran",
    "Korea, South": "South Korea",
    "Macao SAR": "Macao",
    "Mainland China": "China",
    "Republic of Ireland": "Ireland",
    "Republic of Korea": "South Korea",
    "Republic of Moldova": "Moldova",
    "Republic of the Congo": "Congo (Brazzaville)",
    "Saint Kitts and Nevis": "St. Kitts and Nevis",
    "Saint Lucia": "St. Lucia",
    "Saint Martin": "St. Martin",
    "Saint Vincent and the Grenadines": "St. Vincent and the Grenadines",
    "Taipei and environs": "Taiwan",
    "Taiwan*": "Taiwan",
    "The Bahamas": "Bahamas",
    "The Gambia": "Gambia",
    "UK": "United Kingdom",
    "US": "USA",
    "Viet Nam": "Vietnam",
    "occupied Palestinian territory": "Palestine",
  })
  return DISPLAY_ALIASES[trimmedCountry] || trimmedCountry
}

/**
 * Get the location name as used in the population data, given location key as created for the data in
 * `processDailyData`
 * @param {string} location 
 */
exports.getPopulationAlias = function getPopulationAlias(location) {
  const POPULATION_ALIASES = Object.freeze({
    "Bahamas": "Bahamas, The",
    "Bahamas, The": "Bahamas",
    "Brunei": "Brunei Darussalam",
    "Burma": "Myanmar",
    "Cape Verde": "Cabo Verde",
    "Congo (Brazzaville)": "Congo, Rep.",
    "Congo (Kinshasa)": "Congo, Dem. Rep.",
    "Czechia": "Czech Republic",
    "East Timor": "Timor-Leste",
    "Egypt": "Egypt, Arab Rep.",
    "Gambia": "Gambia, The",
    "Hong Kong": "Hong Kong SAR, China",
    "Iran": "Iran, Islamic Rep.",
    "Ivory Coast": "Cote d'Ivoire",
    "Kyrgyzstan": "Kyrgyz Republic",
    "Laos": "Lao PDR",
    "Macao": "Macao SAR, China",
    "Macau": "Macao SAR, China",
    "Russia": "Russian Federation",
    "Slovakia": "Slovak Republic",
    "South Korea": "Korea, Rep.",
    "St Martin": "St. Martin (French part)",
    "St. Martin": "St. Martin (French part)",
    "Syria": "Syrian Arab Republic",
    "USA": "United States",
    "Venezuela": "Venezuela, RB",
    "Yemen": "Yemen, Rep.",
  })
  return POPULATION_ALIASES[location] || location
}
