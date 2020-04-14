import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { API_URL } from '../../constants';
import StatsTable from './statsTable';

const Stats = () => {
  const [ countryData, setCountryData ] = useState();
  useEffect(() => {
    const fetchStats = async () => {
      const data = await fetch(`${API_URL}/deaths`).then(data => data.json());
      const grouped = _.groupBy(data, 'countryRegion');
      const tableData = [];
      Object.entries(grouped).forEach((country, index) => {
        let confirmed = 0;
        let deaths = 0;
        let recovered = 0;
        let active = 0;
        tableData.push({ country: country[0] })
        country[1].forEach(i => {
          confirmed += i.confirmed;
          deaths += i.deaths;
          recovered += i.recovered;
          active += i.active;
          tableData[index].iso2 = i.iso2;
          tableData[index].confirmed = confirmed;
          tableData[index].deaths = deaths;
          tableData[index].recovered = recovered;
          tableData[index].active = active;
          tableData[index].mortality = parseFloat((Math.round(deaths * 100) / confirmed).toFixed(1));
        })
      })
      setCountryData(tableData);
    }
    fetchStats();
  }, []);
  if (!countryData) return <p>loading...</p>
  return (
    <div style={{ padding: 20 }}>
      <StatsTable data={countryData} />
    </div>
  )
};

export default Stats;
