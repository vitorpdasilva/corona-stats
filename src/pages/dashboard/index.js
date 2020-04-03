import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { parseISO } from 'date-fns';
import _ from 'lodash';
import { lightFormat, subDays } from 'date-fns';
import { Divider, Statistic, Loader, Button } from 'semantic-ui-react'
import { API_URL, COUNTRIES_LIST } from '../../constants';
import Context from '../../context';
import DiscreteButton from '../../components/discreteButton';
import DashboardWrapper from './styles';
import getParameterByName from '../../helpers/getQueryParam';
import formatThousands from '../../helpers/formatThousand';
import LastCases from './LastCases';
import DeathsDetail from './deathsDetail';
import ConfirmedDetails from './confirmedDetails';
import RecoveredDetails from './recoveredDetails';

const Dashboard = ({ history, location }) => {
  const { dispatch, state: { dailyData } } = useContext(Context);
  const [selectedCountry, setSelectedCountry] = useState();
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState();
  const [showDetail, setShowDetail] = useState('deaths');
  const [deaths, setDeaths] = useState();
  const [recovered, setRecovered] = useState();
  const [confirmed, setConfirmed] = useState();
  const [message, setMessage] = useState();
  const [timeRange] = useState(30)
  const selectedCountryFullName = selectedCountry ? COUNTRIES_LIST.filter(i => i.code === selectedCountry) : null
  
  useEffect(() => {
    const fetchStats = async () => {
      if (selectedCountry === undefined && getParameterByName('country')) {
        return;
      }
      try {
        setLoading(true);
        setMessage(null)
        const resStats = await fetch(`${API_URL}${selectedCountry ? `/countries/${selectedCountry}` : ''}`).then(data => data.json())
        const deaths = await fetch(resStats.deaths.detail).then(data => data.json());
        const confirmed = await fetch(resStats.confirmed.detail).then(data => data.json());
        const recovered = await fetch(resStats.recovered.detail).then(data => data.json())
        
        const deathsGrouped = _.groupBy(deaths, 'provinceState');
        const confirmedGrouped = _.groupBy(confirmed, 'provinceState');
        const recoveredGrouped = _.groupBy(recovered, 'provinceState');
        setConfirmed(formatGroupedData(confirmedGrouped, 'confirmed'))
        setRecovered(formatGroupedData(recoveredGrouped, 'recovered'))
        setDeaths(formatGroupedData(deathsGrouped, 'deaths'))
        setLastUpdate(resStats.lastUpdate)
      } catch (err) {
        console.log(err);
        setMessage("No case registered")
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [selectedCountry]);

  useEffect(() => {
    const country = getParameterByName('country', location.search);
    setSelectedCountry(country);
  }, [location.search])

  useEffect(() => {
    const fetchDailyData = async () => {
      const rawDailyData = dailyData;
      for (let i = 30; i > 0; i -= 1) {
        const data = await fetch(`${API_URL}/daily/${lightFormat(subDays(new Date(), i), 'MM-dd-yyyy')}`).then(data => data.json());
        rawDailyData.push(data)
      }
      dispatch({ type: 'DAILY_DATA', payload: rawDailyData })
    }
    fetchDailyData();
  }, [dispatch]) //eslint-disable-line

  const formatGroupedData = (grouped, type) => {
    const formatedData = [];
    Object.entries(grouped).forEach((states, index) => {
      formatedData.push({ state: states[0] });
      let key = 0;
      
      states[1].forEach(entry => {
        key += parseInt(entry[type]);
        formatedData[index][type] = key;
      })
    })
    formatedData.total = _.sumBy(formatedData, type);
    return formatedData;
  };

  const selectCountry = (country) => {
    const countryParam = country ? `?country=${country}` : '';
    history.push({
      search: countryParam
    });
  }

  const buildStats = () => (
    <>
      {message ? (
        <h3>{message}</h3>
      ) : (
        <div style={{ position: 'relative' }}>
          <Statistic.Group 
            size="tiny"
            style={{
              width: '100%',
              maxWidth: '600px',
              display: 'flex',
              margin: '0',
              marginTop: '15px',
              justifyContent: 'space-between',
            }}
          >
            <Statistic style={{ margin: 0 }}>
              <Statistic.Value>{!confirmed || loading ? <Loader active inline size='mini'/> : formatThousands(confirmed.total)}</Statistic.Value>
              <Statistic.Label><DiscreteButton onClick={() => setShowDetail('confirmed')}>Confirmed</DiscreteButton></Statistic.Label>
            </Statistic>
            <Statistic style={{ margin: 0 }}>
              <Statistic.Value>{!deaths || loading ? <Loader active inline size='mini'/> : formatThousands(deaths.total)}</Statistic.Value>
              <Statistic.Label><DiscreteButton onClick={() => setShowDetail('deaths')}>Deaths</DiscreteButton></Statistic.Label>
            </Statistic>
            <Statistic style={{ margin: 0 }}>
              <Statistic.Value>{!recovered || loading ?<Loader active inline size='mini'/> : formatThousands(recovered.total)}</Statistic.Value>
              <Statistic.Label><DiscreteButton>Recovered</DiscreteButton></Statistic.Label>
            </Statistic>
          </Statistic.Group>
          {selectedCountry && (
            <>
              {!confirmed || !deaths || !recovered || loading && <Loader active inline size='mini'/>}
              {showDetail === 'confirmed' && <ConfirmedDetails confirmed={confirmed} selectedCountry={selectedCountry} /> }
              {showDetail === 'deaths' && <DeathsDetail deaths={deaths} selectedCountry={selectedCountry} /> }
              {showDetail === 'recovered' && <RecoveredDetails recovered={recovered} selectedCountry={selectedCountry} /> }
            </>
          )}
        </div>
      )}
    </>
  )

  const filterCountries = () => {
    if (!COUNTRIES_LIST) return <p>Loading countries...</p>
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <p style={{ margin: '0 10px 0 0' }}>Filter:</p>
        <select value={selectedCountry} onChange={e => selectCountry(e.target.value)}>
          <option value="">GLOBAL</option>
          {COUNTRIES_LIST.map((i, index) => (
            <option key={index} value={i.code}>{i.name}</option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <DashboardWrapper>
      <h2 className="title">{selectedCountry ? selectedCountryFullName[0].name : "GLOBAL"}</h2>
      {filterCountries()}
      {buildStats()}
      <Divider hidden />
      {!message && selectedCountry && (
        <>
          <div>
            How the virus is spreading in the past&nbsp;
            <strong>
              {timeRange} days
            </strong>
          </div>
          {/* <LastCases
            country={selectedCountry ? selectedCountryFullName[0].name : ''}
            timeRange={timeRange}
          /> */}
        </>
      )}
      <Divider />
      <h3>How the <strong>global</strong> outbreak evolved from the day 20/01/2020 until today</h3>
      <Link to="/daily"><Button primary>See Charts &rarr;</Button></Link>
      <Divider />
      <h3>Check the ranking of the most affected countries</h3>
      <Link to="/ranking"><Button primary>Ranking &rarr;</Button></Link>
      <Divider hidden />
      {lastUpdate && <small>Last Update: {parseISO(lastUpdate).toLocaleDateString('EN-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small> }
    </DashboardWrapper>
  )
}

export default Dashboard;