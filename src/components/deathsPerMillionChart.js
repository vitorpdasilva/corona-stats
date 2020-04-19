import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Line, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart } from 'recharts';
import _ from 'lodash'

import { API_URL } from '../constants';
import populationData from '../data/processed-populations'
import { Dropdown } from 'semantic-ui-react';

//! TODO: Let user choose a threshold for number of deaths to align different countries.
//! FIXME: Cleanup aligning countries names in population and deaths. It's printing on each render.
//! FIXME: Store data in global state with reducer and check if it needs to be updated.
//! TODO: Add default country as props so that the chart can be used on country page.
//! TODO: Add 10 (?) worst countries as default?
//! REFACTOR: Replace moment with date-fns
//! REFACTOR: Move search component to own file.

const LOCATION_LEVEL = Object.freeze({
  CITY: 1,
  PROVINCE: 2,
  COUNTRY: 3,
})
const populationMissing = new Set()
const searchableCountries = new Set()
const initialDate = moment('2020-01-22') // This is the first date with source data on deaths

/**
 * Use to get the display name based on the country names in the death data. Use to override the death data name and
 * make sure that the same country is treated as the same even if the name in the death data changes.
 * @param {string} country 
 */
function getDisplayAlias(country) {
  const trimmedCountry = country.trim()
  const DISPLAY_ALIASES = Object.freeze({
    "Mainland China": "China",
    "Republic of Ireland": "Ireland",
    "Iran (Islamic Republic of)": "Iran",
    "Hong Kong SAR": "Hong Kong",
    "Taipei and environs": "Taiwan",
    "Viet Nam": "Vietnam",
    "occupied Palestinian territory": "Palestine",
    "Macao SAR": "Macao",
    "Republic of Moldova": "Moldova",
    "Holy See": "Vatican City",
    "Korea, South": "South Korea",
    "Saint Kitts and Nevis": "St. Kitts and Nevis",
    "Saint Lucia": "St. Lucia",
    "Saint Vincent and the Grenadines": "St. Vincent and the Grenadines",
    "Taiwan*": "Taiwan",
    "Republic of Korea": "South Korea",
    "Saint Martin": "St. Martin",
    "Republic of the Congo": "Congo (Brazzaville)",
    "The Bahamas": "Bahamas",
    "The Gambia": "Gambia",
    "Bahamas, The": "Bahamas",
  })
  return DISPLAY_ALIASES[trimmedCountry] || trimmedCountry
}

/**
 * Get the location name as used in the population data, given location key as created for the data in
 * `processDailyData`
 * @param {string} location 
 */
function getPopulationAlias(location) {
  const POPULATION_ALIASES = Object.freeze({
    "Hong Kong": "Hong Kong SAR, China",
    "Macau": "Macao SAR, China",
    "US": "United States",
    "South Korea": "Korea, Rep.",
    "Ivory Coast": "Cote d'Ivoire",
    "Russia": "Russian Federation",
    "UK": "United Kingdom",
    "Egypt": "Egypt, Arab Rep.",
    "Iran": "Iran, Islamic Rep.",
    "Slovakia": "Slovak Republic",
    "St Martin": "St. Martin (French part)",
    "Brunei": "Brunei Darussalam",
    "Bahamas, The": "Bahamas",
    "Burma": "Myanmar",
    "Czechia": "Czech Republic",
    "Gambia": "Gambia, The",
    "St. Martin": "St. Martin (French part)",
    "Macao": "Macao SAR, China",
    "Venezuela": "Venezuela, RB",
    "Bahamas": "Bahamas, The",
    "Syria": "Syrian Arab Republic",
    "Yemen": "Yemen, Rep.",
    "Congo (Brazzaville)": "Congo, Rep.",
    "Congo (Kinshasa)": "Congo, Dem. Rep.",
    "Kyrgyzstan": "Kyrgyz Republic",
    "Laos": "Lao PDR",
    "Cape Verde": "Cabo Verde",
    "East Timor": "Timor-Leste",
  })
  return POPULATION_ALIASES[location] || location
}

export default function DeathsPerMillionChart() {
  /* Setup */
  const [ deathsTimelineData, setDeathsTimelineData ] = useState()
  const [ selectedCountries, setSelectedCountries ] = useState([])
  useEffect(() => {
    getDeathsTimelineData().then(deathsTimelineData => setDeathsTimelineData(deathsTimelineData))
  }, []);

  /* Functions */
  async function getDeathsTimelineData() {
    /* Main */
    let currentDate = initialDate.clone()
    const asyncOperations = []
    const timelineData = []
    while (!currentDate.isSame(moment(), 'day')) {
      asyncOperations.push(addDataForDay(timelineData, currentDate.clone()))
      currentDate.add(1, 'day')
    }
    await Promise.all(asyncOperations)
    console.log(timelineData)
    return timelineData

    /* Helper functions */
    async function addDataForDay(timelineData, date) {
      const data = await fetch(`${API_URL}/daily/${date.format("M-D-YYYY")}`).then(data => data.json());
      processDailyData(data, date, timelineData);
    }

    /**
     * Add the daily data to the timeline. For each location add the deaths for that location to the city, province and
     * country for that location. Multiple locations combine to give the resulting number for provinces and countries.
     * @param {Object} dailyData 
     * @param {moment} date 
     * @param {Array} timelineData 
     */
    function processDailyData(dailyData, date, timelineData) {
      // I'm assuming that there are no gaps in the data. So if a location has an entry on date A there will be an entry 
      // on date B if B > A.
      const dateIndex = date.diff(initialDate, "days")
      timelineData[dateIndex] = { date: date.format("YYYY-MM-DD") }
      dailyData.forEach(locationData => {
        if (!locationData) { return }
        const keyCountry  = `${getDisplayAlias(locationData.countryRegion) || ""}`
        const keyProvince = `${locationData.provinceState || ""} - ${keyCountry}`
        const keyCity     = `${locationData.admin2        || ""} - ${keyProvince}`
        
        const deaths = Number.parseInt(locationData.deaths) || 0
        const addToProcessedDataLocal = (key, level) => addToProcessedData(timelineData, key, locationData, deaths, date, level) // Bind data that will be used in all calls to the function for the current location (ie for city, province and country)

        if (locationData.admin2) { addToProcessedDataLocal(keyCity, LOCATION_LEVEL.CITY) }
        if (locationData.provinceState) { addToProcessedDataLocal(keyProvince, LOCATION_LEVEL.PROVINCE) }
        if (locationData.countryRegion) { addToProcessedDataLocal(keyCountry, LOCATION_LEVEL.COUNTRY) }
      })

      // Change from absolute deaths to deaths per million
      Object.entries(timelineData[dateIndex]).forEach(entry => {
        if (entry[0] === "date") { return }
        const [ location, deaths ] = entry
        const population = populationData[getPopulationAlias(location)]
        if (!population) {
          if (!location.includes(' - ')) { populationMissing.add(location) } // ' - ' is included if it's lower level than country.
          return delete timelineData[dateIndex][location]
        }
        timelineData[dateIndex][location] = Math.round(deaths / population.Value * 1_000_000)
        searchableCountries.add(location)
      })
    }

    function addToProcessedData(processedData, locationKey, newData, deaths, date, locationLevel) {
      const dateIndex = date.diff(initialDate, "days")
      const existingDateEntry = processedData[dateIndex]
      const existingLocationEntry = existingDateEntry && processedData[dateIndex][locationKey]

      processedData[dateIndex][locationKey] = existingLocationEntry
        ? existingLocationEntry + deaths
        : deaths
    }
  }

  function getRandomColour() {
    return '#'+ Math.round(Math.random() * 0xffffff).toString(16).padStart(6,'0')
  }
  
  function handleCountrySelection(e, { value }) {
    setSelectedCountries(value)
  }

  const chartLines = selectedCountries.map(country => <Line type="monotone" dataKey={getDisplayAlias(country)} stroke={getRandomColour()} dot={false} key={country} />)

  console.log(_.difference(Object.keys(populationData).map(country => country),[...searchableCountries].map(country => getPopulationAlias(country)) ))
  console.log(populationMissing)

  const searchOptions = [...searchableCountries].sort().map(country => ({
    key: country,
    text: country,
    value: country,
  }))

  return (
    <>
      <h3>Deaths per 1 million population</h3>
      <Dropdown
        placeholder='Country'
        multiple
        onChange={handleCountrySelection}
        fluid
        options={searchOptions}
        search
        selection
        // search={_.debounce(handleSearchChange, 500, { leading: true })}
      />
      <div style={{ width: '100%', maxWidth: '700px', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            width={500}
            height={400}
            data={deathsTimelineData}
            margin={{
              top: 10, right: 30, left: 0, bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Legend />
            <Tooltip />
            {chartLines}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}