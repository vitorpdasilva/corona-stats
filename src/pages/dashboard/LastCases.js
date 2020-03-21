import React, { useEffect, useState } from 'react';
import { lightFormat, subDays } from 'date-fns';
import { Dimmer, Loader, Image, Segment } from 'semantic-ui-react'
import { API_URL } from '../../constants';
import PlaceholderImage from '../../imgs/short-paragraph.png'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const LastCases = ({ country, timeRange }) => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  useEffect(() => {
    const fetchLastCases = async () => {
      const entireData = [];
      if (!country) return <span></span>;
      try {
        setLoading(true);
        for (let i = timeRange; i > 1; i -= 1) {
          const data = await fetch(`${API_URL}/daily/${lightFormat(subDays(new Date(), i), 'MM-dd-yyyy')}`).then(data => data.json());
          if (country === 'United States') country = 'US';
          const dataFilter =  data.filter(i => i.countryRegion === country)
          entireData.push(dataFilter);
        }
        if (entireData) {
        } else {
          setChartData([])
          return;
        }
        const formatedData = [];
        entireData.map(dailyEntry => {
          let confirmed = 0;
          let deaths = 0;
          let recovered = 0;
          if (dailyEntry.length) {
            dailyEntry.map((i, index) => {
              confirmed += parseInt(i.confirmed);
              deaths += parseInt(i.deaths);
              recovered += parseInt(i.recovered);
            });
            formatedData.push({ confirmed, deaths, recovered, lastUpdate: dailyEntry[0].lastUpdate });
          }
        })
        formatedData.map((i, index) => {
          if (index > 0) {
            formatedData[index].newCases = Number(i.confirmed) - Number(formatedData[index - 1].confirmed)
            formatedData[index].newDeaths = Number(i.deaths) - Number(formatedData[index - 1].deaths)
            formatedData[index].newRecovered = Number(i.recovered) - Number(formatedData[index - 1].recovered)
          }
        })
        setChartData(formatedData);
      } catch (err) {
        console.log({ err });
      } finally {
        setLoading(false);
      }
    }
    fetchLastCases()
}, [country, timeRange]);
  if (!country) return <span></span>;
  if (loading) {
    return (
      
        <Segment>
        <Dimmer active inverted>
          <Loader inverted>Loading</Loader>
        </Dimmer>
        <Image src={PlaceholderImage} />
      </Segment>
    )
  }
  if (!loading && chartData) {
    return (
      <div style={{ width: '500px', maxWidth: '90%', height: 300, marginTop: '25px', marginLeft: '-20px' }}>
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
          >
            <defs>
              <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDeaths" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="red" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="red" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="lastUpdate" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="newCases" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCases)" />
            <Area type="monotone" dataKey="newDeaths" stroke="red" fillOpacity={1} fill="url(#colorDeaths)" />
            <Area type="monotone" dataKey="newRecovered" stroke="#8884d8" fillOpacity={1} fill="url(#colorRecovered)" />
          </AreaChart>  
        </ResponsiveContainer>
      </div>
    )
  }
  if (!loading && !chartData) {
    return (
      <span></span>
    )
  }
}

export default LastCases;