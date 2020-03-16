import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parseISO } from 'date-fns';
import { Divider, Statistic, Loader, Flag, Accordion, Icon } from 'semantic-ui-react'
import { API_URL, COUNTRIES_LIST } from '../../constants';
import DashboardWrapper from './styles';

const Dashboard = () => {
  const [selectedCountry, setSelectedCountry] = useState("AU");
  const [loading, setLoading] = useState(false);
  const [activeAccordionIndex, setActiveAccordionIndex] = useState(0)
  const [stats, setStats] = useState();
  const [deaths, setDeaths] = useState();
  const [message, setMessage] = useState();
  const selectedCountryFullName = selectedCountry ? COUNTRIES_LIST.filter(i => i.sigla2 === selectedCountry) : null
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const resStats = await fetch(`${API_URL}${selectedCountry ? `/countries/${selectedCountry}` : ''}`).then(data => data.json())
        const deathStats = await fetch(resStats.deaths.detail).then(data => data.json());
        setMessage(null)
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
          {deaths && deaths.length > 0 && selectedCountry && (
            <>
              <Divider />
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
        <p>Filtrar:</p>
        <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}>
          <option value="">GLOBAL</option>
          {COUNTRIES_LIST.map((i, index) => (
            <option key={index} value={i.sigla2}>{i.nome}</option>
          ))}
        </select>
      </>
    )
  }
  
  return (
    <DashboardWrapper>
      <h2 className="title">{selectedCountry ? selectedCountryFullName[0].nome : "GLOBAL"}</h2>
      {filterCountries()}
      {buildStats()}
      <Divider />
      <Divider hidden />
      <p>How the <strong>global</strong> outbreak evolved from the day 20/01/2020 until today</p>
      <Link to="/daily">See Charts &rarr;</Link>
      <Divider hidden />
      {stats && <small>Last Update: {parseISO(stats.lastUpdate).toLocaleDateString('EN-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small> }
    </DashboardWrapper>
  )
}

export default Dashboard;