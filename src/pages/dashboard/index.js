import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parseISO } from 'date-fns';
import { Divider, Statistic, Loader, Flag, Accordion, Icon, Dropdown, Button } from 'semantic-ui-react'
import { API_URL, COUNTRIES_LIST } from '../../constants';
import DashboardWrapper from './styles';
import getParameterByName from '../../helpers/getQueryParam';
import LastCases from './LastCases';

const Dashboard = ({ history, location }) => {
  const [selectedCountry, setSelectedCountry] = useState();
  const [loading, setLoading] = useState(false);
  const [activeAccordionIndex, setActiveAccordionIndex] = useState(0)
  const [stats, setStats] = useState();
  const [deaths, setDeaths] = useState();
  const [message, setMessage] = useState();
  const [timeRange, setTimeRange] = useState(10)
  const selectedCountryFullName = selectedCountry ? COUNTRIES_LIST.filter(i => i.code === selectedCountry) : null
  const timeRangeOpts = [
    { key: 5, text: 5, value: 5 },
    { key: 10, text: 10, value: 10 },
    { key: 15, text: 15, value: 15 },
    { key: 20, text: 20, value: 20 },
    { key: 30, text: 30, value: 30 },
  ]

  useEffect(() => {
    const fetchStats = async () => {
      if (selectedCountry === undefined && getParameterByName('country')) {
        return;
      }
      try {
        setLoading(true);
        setMessage(null)
        const resStats = await fetch(`${API_URL}${selectedCountry ? `/countries/${selectedCountry}` : ''}`).then(data => data.json())
        const deathStats = await fetch(resStats.deaths.detail).then(data => data.json());
        setStats(resStats);
        setDeaths(deathStats)
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
        <>
          <Statistic.Group size="tiny">
            <Statistic>
              <Statistic.Value>{!stats || loading ? <Loader active inline size='mini'/> : stats.confirmed.value}</Statistic.Value>
              <Statistic.Label>Confirmed</Statistic.Label>
            </Statistic>
            <Statistic>
              <Statistic.Value>{!stats || loading ? <Loader active inline size='mini'/> : stats.deaths.value}</Statistic.Value>
              <Statistic.Label>Deaths</Statistic.Label>
            </Statistic>
            <Statistic>
              <Statistic.Value>{!stats || loading ?<Loader active inline size='mini'/> : stats.recovered.value}</Statistic.Value>
              <Statistic.Label>Recovered</Statistic.Label>
            </Statistic>
          </Statistic.Group>
          {deaths && deaths.length > 0 && selectedCountry && !loading && (
            <>
              <Divider hidden />
              <Flag name={selectedCountry.toLowerCase()} /> Where the deaths happened
              <Accordion fluid styled>
                {deaths.map((i, index) => (
                  <div key={i.provinceState || i.countryRegion}>
                    <Accordion.Title
                      active={activeAccordionIndex === index}
                      index={index}
                      onClick={() => setActiveAccordionIndex(index)}
                    >
                      <Icon name='dropdown' />
                      {i.provinceState ? i.provinceState : 'Province or State not provided'}
                    </Accordion.Title>
                    <Accordion.Content active={activeAccordionIndex === index}>
                      Confirmed deaths: {i.deaths} <br />
                      Active cases: {i.active}
                    </Accordion.Content>
                  </div>
                ))}
              </Accordion>
            </>
          )}
          
        </>
      )}
    </>
  )
  
  const filterCountries = () => {
    if (!COUNTRIES_LIST) return <p>Loading countries...</p>
    return (
      <>
        <p>Filter:</p>
        <select value={selectedCountry} onChange={e => selectCountry(e.target.value)}>
          <option value="">GLOBAL</option>
          {COUNTRIES_LIST.map((i, index) => (
            <option key={index} value={i.code}>{i.name}</option>
          ))}
        </select>
      </>
    )
  }
  
  return (
    <DashboardWrapper>
      <h2 className="title">{selectedCountry ? selectedCountryFullName[0].name : "GLOBAL"}</h2>
      {filterCountries()}
      {buildStats()}
      <Divider hidden />
      {!message && (
        <>
          <div>
            How the virus is spreading in the past&nbsp;
            <strong>
              <Dropdown 
                upward
                floating
                inline
                options={timeRangeOpts}
                defaultValue={timeRange}
                onChange={e => setTimeRange(e.target.textContent)}
              /> 
              days
            </strong>
          </div>
          <LastCases 
            country={selectedCountry ? selectedCountryFullName[0].name : ''} 
            timeRange={timeRange}
          />
        </>
      )}
      <Divider />
      <Divider hidden />
      <p>How the <strong>global</strong> outbreak evolved from the day 20/01/2020 until today</p>
      <Link to="/daily"><Button primary>See Charts &rarr;</Button></Link>
      <Divider hidden />
      {stats && <small>Last Update: {parseISO(stats.lastUpdate).toLocaleDateString('EN-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small> }
    </DashboardWrapper>
  )
}

export default Dashboard;