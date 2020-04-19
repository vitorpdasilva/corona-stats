import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Line, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart } from 'recharts';

import { API_URL } from '../constants';
import populationData from '../data/processed-populations'
import { Dropdown } from 'semantic-ui-react';

//! BUG: Let the user pick the countries that they want to show instead of hardcoding them.
//! BUG: Make sure all keys are properly aliased between the deaths and population data.
//! FIXME: Fix the chart grid.
//! TODO: Let user choose a threshold for number of deaths to align different countries.
//! FIXME: Store data in global state with reducer and check if it needs to be updated.
//! TODO: Add default country as props so that the chart can be used on country page.
//! REFACTOR: Replace moment with date-fns

const LOCATION_LEVEL = Object.freeze({
  CITY: 1,
  PROVINCE: 2,
  COUNTRY: 3,
})
const DISPLAY_ALIASES = Object.freeze({
  China: "Mainland China",
})
const POPULATION_ALIASES = Object.freeze({
  "Mainland China": "China",
})
const searchOptions = Object.keys(populationData).map(country => {
  const name = getDisplayAlias(country)
  return {
    key: name,
    text: name,
    value: name,
  }
})
const initialDate = moment('2020-01-01')

function getDisplayAlias(location) {
  return DISPLAY_ALIASES[location] || location
}

function getPopulationAlias(location) {
  return POPULATION_ALIASES[location] || location
}

export default function DeathsPerMillionChart() {
  /* Setup */
  const [ deathsTimelineData, setDeathsTimelineData ] = useState()
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
      timelineData[dateIndex] = { date }
      dailyData.forEach(locationData => {
        if (!locationData) { return }
        const keyCountry  = `${getDisplayAlias(locationData.countryRegion) || ""}`
        const keyProvince = `${locationData.provinceState || ""}, ${keyCountry}`
        const keyCity     = `${locationData.admin2        || ""}, ${keyProvince}`
        
        const deaths = Number.parseInt(locationData.deaths) || 0
        const addToProcessedDataLocal = (key, level) => addToProcessedData(timelineData, key, locationData, deaths, date, level) // Bind data that will be used in all calls to the function for the current location (ie for city, province and country)

        if (locationData.admin2) { addToProcessedDataLocal(keyCity, LOCATION_LEVEL.CITY) }
        if (locationData.provinceState) { addToProcessedDataLocal(keyProvince, LOCATION_LEVEL.PROVINCE) }
        if (locationData.countryRegion) { addToProcessedDataLocal(keyCountry, LOCATION_LEVEL.COUNTRY) }
      })

      // Change from absolute deaths to deaths per million
      Object.entries(timelineData[dateIndex]).forEach(entry => {
        if (entry[0] === "date") { return }
        const [ country, deaths ] = entry
        const population = populationData[getPopulationAlias(country)]
        if (!population) { return delete timelineData[dateIndex][country] }
        timelineData[dateIndex][country] = Math.round(deaths / population.Value * 1_000_000)
      })
    }

    function addToProcessedData(processedData, locationKey, newData, deaths, date, locationLevel) {
      const dateIndex = date.diff(initialDate, "days")
      const existingDateEntry = processedData[dateIndex]
      const existingLocationEntry = existingDateEntry && processedData[dateIndex][locationKey]

      processedData[dateIndex][locationKey] = existingLocationEntry
        ? existingLocationEntry + deaths
        : deaths
      
      // const locationEntry = existingLocationEntry
      // ? Object.assign(existingLocationEntry, { deaths: existingLocationEntry.deaths + deaths }) // Create new entry with sum of previously recorded deaths for locationdate and additional deaths
      // : (({ countryRegion, provinceState, admin2 }) => ({
      //   deaths: deaths || 0,
      //   countryRegion,
      //   provinceState: locationLevel < LOCATION_LEVEL.COUNTRY && provinceState,
      //   city: locationLevel < LOCATION_LEVEL.PROVINCE && admin2,
      //   date,
      // }))(newData) // Create new entry based on the current locationdate data.
      // if (!existingDateEntry) { processedData[dateIndex] = {} }
      // processedData[dateIndex][locationKey] = locationEntry
    }
  }

  function getRandomColour() {
    return '#'+ Math.round(Math.random() * 0xffffff).toString(16).padStart(6,'0')
  }

  return (
    <>
      <h3>Deaths per 1 million population</h3>
      <Dropdown
        placeholder='Country'
        multiple
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
            <Line type="monotone" dataKey="Mainland China" stroke={getRandomColour()} dot={false} />
            <Line type="monotone" dataKey="Sweden" stroke={getRandomColour()} dot={false} />
            <Line type="monotone" dataKey="Italy" stroke={getRandomColour()} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}