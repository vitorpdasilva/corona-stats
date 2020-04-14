import React, { useEffect, useState, useContext } from 'react';
import { lightFormat, subDays } from 'date-fns';
import { API_URL, COUNTRIES_LIST } from '../../constants';
import Context from '../../context';
import { Dropdown } from 'semantic-ui-react';
const countriesOpts = [];
COUNTRIES_LIST.map(i => (
  countriesOpts.push({
    text: i.name,
    key: i.code,
    value: i.code,
  })
))

const Compare = () => {
  const { state: { dailyData }, dispatch } = useContext(Context);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [timeRange] = useState(30)
  useEffect(() => {
     if (!dailyData) {
      const fetchDailyData = async () => {
        const rawDailyData = [];
        for (let i = timeRange; i > 0; i -= 1) {
          const data = await fetch(`${API_URL}/daily/${lightFormat(subDays(new Date(), i), 'MM-dd-yyyy')}`).then(data => data.json());
          rawDailyData.push(data)
        }
        dispatch({ type: 'DAILY_DATA', payload: rawDailyData })
      }
      fetchDailyData();
     }
  }, [timeRange, dispatch, dailyData])
  return (
    <div style={{ padding: '20px', minHeight: '210px' }}>
      <Dropdown
        placeholder='State'
        fluid
        multiple
        search
        selection
        onChange={(e, { value }) => setSelectedCountries(value)}
        options={countriesOpts}
      />
    </div>
  )
}

export default Compare;