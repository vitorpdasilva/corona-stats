import React, { useEffect, useState } from 'react';
import { lightFormat, subDays } from 'date-fns';
import { Dimmer, Loader, Image, Segment } from 'semantic-ui-react'
import { API_URL } from '../../constants';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const LastCases = ({ country }) => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  useEffect(() => {
    const fetchLastCases = async () => {
      const entireData = [];
      if (!country) return <span></span>;
      try {
        setLoading(true);
        for (let i = 10; i > 1; i -= 1) {
          const data = await fetch(`${API_URL}/daily/${lightFormat(subDays(new Date(), i), 'MM-dd-yyyy')}`).then(data => data.json());
          entireData.push(data.filter(i => i.countryRegion === country));
        }
        const formatedData = [];
        entireData.map(dailyEntry => {
          let confirmed = 0;
          let deaths = 0;
          let recovered = 0;
          dailyEntry.map((i, index) => {
            confirmed += parseInt(i.confirmed);
            deaths += parseInt(i.deaths);
            recovered += parseInt(i.recovered);
          });
          formatedData.push({ confirmed, deaths, recovered, lastUpdate: dailyEntry[0].lastUpdate });
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
}, [country]);
  if (!country) return <span></span>;
  return (
    <>
      {loading ? (
        <Segment>
        <Dimmer active inverted>
          <Loader inverted>Loading</Loader>
        </Dimmer>
  
        <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
      </Segment>
      ) : (
        <div style={{ width: '500px', maxWidth: '90%', height: 300, marginTop: '25px', marginLeft: '-25px' }}>
          {console.log({ country })}
          <ResponsiveContainer>
            <LineChart
              width={500}
              height={300}
              data={chartData}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lastUpdate" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="newCases" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="newDeaths" stroke="#82ca9d" />
              <Line type="monotone" dataKey="newRecovered" stroke="red" />
            </LineChart>  
          </ResponsiveContainer>
        </div>
      )}
    </>
  )
}

export default LastCases;