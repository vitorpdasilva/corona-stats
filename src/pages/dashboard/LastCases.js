import React, { useEffect, useState, useContext } from 'react';
import { Dimmer, Loader, Image, Segment, Icon } from 'semantic-ui-react';
import Context from '../../context';
import PlaceholderImage from '../../imgs/short-paragraph.png'
import { ResponsiveContainer, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const LastCases = ({ country }) => {
  const { state: { dailyData } } = useContext(Context);
  const [chartData, setChartData] = useState([]);
  useEffect(() => {
    const fetchLastCases = async () => {
      const entireData = [];
      if (!country) return <span></span>;
      let testCountry = country;
      if (country === 'United States') testCountry = 'US';
      dailyData.map(i => {
        const dataFilter = i.filter(entry => entry.countryRegion === testCountry) 
        entireData.push(dataFilter)
        return true;
      });
        
      const formatedData = [];
      entireData.forEach(dailyEntry => {
        let confirmed = 0;
        let deaths = 0;
        let recovered = 0;
        let active = 0;
        if (dailyEntry.length) {
          dailyEntry.forEach(i => {
            confirmed += parseInt(i.confirmed);
            deaths += parseInt(i.deaths);
            recovered += parseInt(i.recovered);
          });
          formatedData.push({ active, confirmed, deaths, recovered, lastUpdate: dailyEntry[0].lastUpdate });
        }
      })
      formatedData.forEach((i, index) => {
        if (index > 0) {
          formatedData[index].newCases = Math.abs(Number(i.confirmed) - Number(formatedData[index - 1].confirmed))
          formatedData[index].newDeaths = Math.abs(Number(i.deaths) - Number(formatedData[index - 1].deaths))
          formatedData[index].newRecovered = Math.abs(Number(i.recovered) - Number(formatedData[index - 1].recovered))
        }
      })
      setChartData(formatedData);
    }
    fetchLastCases()
  }, [country, dailyData]);

  if (!country) return <span></span>;
  if (dailyData.length < 1) {
    return (
      <Segment>
        <Dimmer active inverted>
          <Loader inverted>Loading <br />It's a lot of data to be fetched <Icon name="meh" size="large" /></Loader>
        </Dimmer>
        <Image src={PlaceholderImage} />
      </Segment>
    )
  }
  return (
    <div style={{ width: '700px', maxWidth: '90%', height: 300, marginTop: '25px', marginLeft: '-20px' }}>
      <ResponsiveContainer>
        <ComposedChart data={chartData}>
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
          <CartesianGrid strokeDasharray="5 3" />
          <XAxis dataKey="lastUpdate" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="newCases" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCases)" />
          <Area type="monotone" dataKey="newDeaths" stroke="red" fillOpacity={1} fill="url(#colorDeaths)" />
          {/* <Area type="monotone" dataKey="newRecovered" stroke="#8884d8" fillOpacity={1} fill="url(#colorRecovered)" /> */}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LastCases;