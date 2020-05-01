import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Line, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart } from 'recharts';
import _ from 'lodash'
import { Dropdown, Button, Popup } from 'semantic-ui-react';

import { API_URL } from '../../constants'; // Would be nice to set up absolut imports from src
import populationData from '../../data/processed-populations'
import { getDisplayAlias, getPopulationAlias } from './countryTranslations'

//! TODO: Add the chart lines sorted by value. Most deaths per million first.
//! FIXME: Cleanup aligning countries names in population and deaths. It's printing on each render.
//! FIXME: Store data in global state with reducer and check if it needs to be updated.
//! TODO: Add default country as props so that the chart can be used on country page.
//! REFACTOR: Replace moment with date-fns
//! REFACTOR: Move search component to own file.

const LOCATION_LEVEL = Object.freeze({
  CITY: 1,
  PROVINCE: 2,
  COUNTRY: 3,
})
const TOP_COUNTRIES_NUMBER = 10
const populationMissing = new Set()
const searchableCountries = {}
const initialDate = moment('2020-01-22') // This is the first date with source data on deaths

export default function DeathsPerMillionChart() {
  /* Setup */
  const [ deathsTimelineData, setDeathsTimelineData ] = useState()
  const [ adjustedTimelineData, setAdjustedTimelineData ] = useState()
  const [ alignTimelineOptions, setAlignTimelineOptions ] = useState([])
  const [ selectedCountries, setSelectedCountries ] = useState([])
  const [ chartLines, setChartLines ] = useState([])
  const [ topCountries, setTopCountries ] = useState([]) // I don't actually need to have this in state. I tried to have `let topCountries = [] and using that instead of state, but get warning that it will be lost used in useEffect(). Apparently I can use useRef to handle it. But this works so I'm leaving it as is.
  useEffect(() => {
    if (!deathsTimelineData) {
      getDeathsTimelineData().then(deathsTimelineData => {
        setDeathsTimelineData(deathsTimelineData)
        setAdjustedTimelineData(deathsTimelineData)
      })
    } else {
      if (!topCountries.length) { setTopCountries(getTopCountries(deathsTimelineData)) }
      if (!alignTimelineOptions.length) { setAlignTimelineOptions(getAlignTimelineOptions(deathsTimelineData)) }
    }
    
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
      return timelineData

      /* Helper functions */
      async function addDataForDay(timelineData, date) {
        try {
          const data = await fetch(`${API_URL}/daily/${date.format("M-D-YYYY")}`).then(data => data.json());
          processDailyData(data, date, timelineData);
        } catch (err) {
          console.log("Error:", err)
        }
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
          const addToProcessedDataLocal = (key, level) => addDeathsToProcessedData(timelineData, key, locationData, deaths, date, level) // Bind data that will be used in all calls to the function for the current location (ie for city, province and country)

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
          searchableCountries[location] = getRandomColour()

          function getRandomColour() {
            return '#'+ Math.round(Math.random() * 0xffffff).toString(16).padStart(6,'0')
          }
        })
      }

      function addDeathsToProcessedData(processedData, locationKey, newData, deaths, date, locationLevel) {
        const dateIndex = date.diff(initialDate, "days")
        const existingDateEntry = processedData[dateIndex]
        const existingLocationEntry = existingDateEntry && processedData[dateIndex][locationKey]

        processedData[dateIndex][locationKey] = existingLocationEntry
          ? existingLocationEntry + deaths
          : deaths
      }
    }
    function getTopCountries(deathsTimelineData) {
      const finalDayData = getFinalDayData()
      return Object.entries(finalDayData).sort((a, b) => b[1] - a[1]).slice(0,TOP_COUNTRIES_NUMBER).reduce((res,item) => { res.push(item[0]); return res }, [])// Take final day data minus the data key, sort by values, take top countries, and reduce the names to an array.
  
      /** Get the the data for the last day with at least as much data as the top countries number */
      function getFinalDayData() {
        let finalDayData = {}
        let i = 1
        while (Object.keys(finalDayData).length < TOP_COUNTRIES_NUMBER + 1) { // + 1 to account for 'date' key-value
          finalDayData = deathsTimelineData[deathsTimelineData.length - i++]
        }
        return _.omit(finalDayData, 'date')
      }
    }
    function getAlignTimelineOptions(deathsTimelineData) {
      const max = _.max(deathsTimelineData.map(entry => {
        const entryWithoutDateKey = _.omit(entry, 'date')
        return _.max(Object.values(entryWithoutDateKey))
      }))
      const alignTimelineOptions = [ { key: 'None', text: 'None' } ]
      for (let i = 0; i <= max; i++ ) {
        alignTimelineOptions.push({ key: i, text: i, value: i })
      }
      return alignTimelineOptions
    }
  }, [deathsTimelineData, topCountries, alignTimelineOptions]);

  function updateSelectedCountries(selectedCountries) {
    setSelectedCountries(selectedCountries)
    setChartLines(selectedCountries.map(country => {
      return (
        <Line
          type="monotone"
          dataKey={getDisplayAlias(country)}
          stroke={searchableCountries[getDisplayAlias(country)]}
          dot={false}
          key={country}
        />
      )
    }))
  }

  function addTopCountries() {
    let selectedCountries
    const allTopCountriesAreSelected = !_.difference(topCountries, selectedCountries).length
    if (allTopCountriesAreSelected) { selectedCountries = _.difference(selectedCountries, topCountries) } // Remove top countries from selection
    else { selectedCountries = _.uniq(selectedCountries.concat(topCountries)) }
    updateSelectedCountries(selectedCountries)
  }

  function adjustTimelineData(_e, { value }) {
    if (!value) { return setAdjustedTimelineData(deathsTimelineData)}
    const currentDayByCountry = {}
    const adjustedTimelineData = deathsTimelineData.reduce((adjustedTimelineData, dateData) => {
      Object.entries(_.omit(dateData, 'date')).reduce( (adjustedTimelineData, [ country, deaths ]) => {
        if (deaths >= value) {
          const countryHasBeenAdded = currentDayByCountry[country]
          if (!countryHasBeenAdded) { currentDayByCountry[country] = 0 }
          const dayHasBeenAddedToTimeline = adjustedTimelineData[currentDayByCountry[country]]
          if (!dayHasBeenAddedToTimeline) { adjustedTimelineData[currentDayByCountry[country]] = { date: currentDayByCountry[country]}}
          adjustedTimelineData[currentDayByCountry[country]++][country] = deaths
        }
        return adjustedTimelineData
      }, adjustedTimelineData)
      return adjustedTimelineData
    }, [])
    setAdjustedTimelineData(adjustedTimelineData)
  }

  console.log(_.difference(Object.keys(populationData).map(country => country), Object.keys(searchableCountries).map(country => getPopulationAlias(country)) ))
  console.log(populationMissing)

  const searchOptions = Object.keys(searchableCountries).sort().map(country => ({
    key: country,
    text: country,
    value: country,
  }))

  return (
    <>
      <h3>Deaths per 1 million population</h3>
      <div style={{ display: 'flex', maxWidth: "700px" }}>
        <Dropdown
          fluid
          placeholder='Country'
          multiple
          onChange={(_e, { value }) => updateSelectedCountries(value)}
          options={searchOptions}
          search
          selection
          value={selectedCountries}
        />
        <Button 
          style={{ whiteSpace: 'nowrap', marginLeft: '10px', marginRight: '10px' }}
          onClick={addTopCountries}
          disabled={!topCountries.length}
        >
          Top {TOP_COUNTRIES_NUMBER}
        </Button>
        <Popup
          content='Shift the graphs to start at the chosen value'
          trigger={
            <Dropdown
              disabled={!alignTimelineOptions.length}
              style={{ flexBasis: '20%' }}
              fluid
              placeholder='Align'
              options={alignTimelineOptions}
              onChange={adjustTimelineData}
              search
              selection
            />
          }
        />
      </div>
      <div style={{ width: '100%', maxWidth: '700px', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            width={500}
            height={400}
            data={adjustedTimelineData}
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