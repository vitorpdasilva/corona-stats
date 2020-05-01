import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Divider } from 'semantic-ui-react';
import { ComposedChart, Line, Legend, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { API_URL } from '../../constants';
import DeathsPerMillionChart from '../../components/deathsPerMillionChart/index'; //It fails to compile if I don't add the index path????

const Daily = () => {
  const [ dataChart, setDataChart ] = useState();
  useEffect(() => {
    async function fetchDailyData() {
      const res = await fetch(`${API_URL}/daily`).then(data => data.json());
      setDataChart(res);
    }
    fetchDailyData();
  }, []);

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
      <Divider />
      <DeathsPerMillionChart />
    </div>
  )
}

export default Daily;