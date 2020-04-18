import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Divider } from 'semantic-ui-react';
import { API_URL } from '../../constants';
import { ComposedChart, Line, Legend, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';


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
    getDeathsTimelineData().then(deathsTimelineData => setDeathsTimelineData( deathsTimelineData ))
  }, []);

  /* Functions */
  async function getDeathsTimelineData() {
    /* Main */
    let currentDate = initialDate
    const asyncOperations = []
    const timelineData = {}
    while (!currentDate.isSame(moment(), 'day')) {
      asyncOperations.push(addDataForDay(timelineData, currentDate))
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

    function processDailyData(dailyData, date, timelineData) {
      // I'm assuming that there are no gaps in the data. So if a location has an entry on date A there will be an entry 
      // on date B if B > A.
      dailyData.forEach(locationData => {
        if (!locationData) { return }
        const keyCountry  = `${locationData.countryRegion || ""}`
        const keyProvince = `${locationData.provinceState || ""}, ${keyCountry}`
        const keyCity     = `${locationData.admin2        || ""}, ${keyProvince}`
        
        const deaths = Number.parseInt(locationData.deaths)
        const addToProcessedDataLocal = (key) => addToProcessedData(timelineData, key, locationData, deaths)

        if (locationData.admin2) { addToProcessedDataLocal(keyCity) }
        if (locationData.provinceState) { addToProcessedDataLocal(keyProvince) }
        if (locationData.countryRegion) { addToProcessedDataLocal(keyCountry) }
      })
    }

    function addToProcessedData(processedData, key, newData, deaths) {
      processedData[key] = processedData[key] 
        ? Object.assign(processedData[key], processedData[key].deaths = deaths)
        : (({ countryRegion, provinceState, admin2 }) => ({ deaths, countryRegion, provinceState, city: admin2 }))(newData)
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
        <h3>Deaths per Capita</h3>
        <div style={{ width: '100%', maxWidth: '700px', height: 300 }}>
          <ResponsiveContainer>
            <ComposedChart
              width={500}
              height={400}
              data={deathsTimelineData}
              margin={{
                top: 10, right: 30, left: 0, bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="deaths" />
              <YAxis />
              <Legend />
              <Tooltip />
              <Area type="monotone" dataKey="mainlandChina" stroke="#7ca48b" fill="#82ca9d" />
              <Area type="monotone" dataKey="otherLocations" stroke="#ffc658" fill="#ffc658" />
              <Line type="monotone" dataKey="totalConfirmed" stroke="#ff7300" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </>
    )
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