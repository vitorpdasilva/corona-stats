import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Divider } from 'semantic-ui-react';
import { API_URL } from '../../constants';
import { ComposedChart, Line, Legend, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart } from 'recharts';
import moment from 'moment';

import populationData from '../../data/processed-populations'

//! FIXME: Replace moment with date-fns
//! FIXME: Store the raw virus data in global state with reducer.
//! FIXME: Refactor out the Deaths per capita.
//! TODO: Let the user pick the countries that they want to show in deaths per million.
//! TODO: Let user choose a threshold for number of deaths to align different countries.

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
const initialDate = moment('2020-01-01')

const Daily = () => {
  /* Setup */
  const [ dataChart, setDataChart ] = useState();
  const [ deathsTimelineData, setDeathsTimelineData ] = useState()
  useEffect(() => {
    async function fetchDailyData() {
      const res = await fetch(`${API_URL}/daily`).then(data => data.json());
      setDataChart(res);
    }
    fetchDailyData();
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
     * @param {*} dailyData 
     * @param {*} date 
     * @param {*} timelineData 
     */
    function processDailyData(dailyData, date, timelineData) {
      // I'm assuming that there are no gaps in the data. So if a location has an entry on date A there will be an entry 
      // on date B if B > A.
      const dateIndex = date.diff(initialDate, "days")
      timelineData[dateIndex] = { date }
      dailyData.forEach(locationData => {
        if (!locationData) { return }
        const keyCountry  = `${DISPLAY_ALIASES[locationData.countryRegion] || locationData.countryRegion || ""}`
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
        const population = populationData[POPULATION_ALIASES[country] || country]
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

  function BuildChart() {
    return (
      <>
        <h3>Outbreak Mainland China vs Other countries</h3>
        <div style={{ width: '100%', maxWidth: '700px', height: 300 }}>
          <ResponsiveContainer>
            <ComposedChart
              width={500}
              height={400}
              data={dataChart}
              margin={{
                top: 10, right: 30, left: 0, bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="reportDate" />
              <YAxis />
              <Legend />
              <Tooltip />
              <Area type="monotone" dataKey="mainlandChina" stroke="#7ca48b" fill="#82ca9d" />
              <Area type="monotone" dataKey="otherLocations" stroke="#ffc658" fill="#ffc658" />
              <Line type="monotone" dataKey="totalConfirmed" stroke="#ff7300" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <Divider />
        <h3>Deaths per 1 million population</h3>
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


  function getRandomColour() {
    return '#'+ Math.round(Math.random() * 0xffffff).toString(16).padStart(6,'0')
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Charts</h1>
      <p>How the Global Outbreak evolved from 20/01/2020 until today</p>
      <Link to="/">&larr; Back to data and filters</Link>
      <Divider />
      <BuildChart />
    </div>
  )
}

export default Daily;