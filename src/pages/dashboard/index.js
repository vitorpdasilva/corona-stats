import React, { useState, useEffect, useContext } from 'react';
import { parseISO } from 'date-fns';
import _ from 'lodash';
import { lightFormat, subDays } from 'date-fns';
import { Divider, Statistic, Loader, Popup, Icon } from 'semantic-ui-react'
import { API_URL, COUNTRIES_LIST, IP_DATA_KEY } from '../../constants';
import Context from '../../context';
import DashboardWrapper from './styles';
import getParameterByName from '../../helpers/getQueryParam';
import formatThousands from '../../helpers/formatThousand';
import LastCases from './LastCases';
import DeathsDetail from './deathsDetail';

const Dashboard = ({ history, location }) => {
  const { dispatch } = useContext(Context);
  const [selectedCountry, setSelectedCountry] = useState();
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState();
  const [detail, setDetail] = useState([])
  const [showDetail, setShowDetail] = useState(false);
  const [message, setMessage] = useState();
  const [timeRange] = useState(15)
  const selectedCountryFullName = selectedCountry ? COUNTRIES_LIST.filter(i => i.code === selectedCountry) : null
  
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedCountry) {
        setLoading(true);
        const ipData = await fetch(`https://api.ipdata.co/?api-key=${IP_DATA_KEY}`).then(data => data.json());
        setSelectedCountry(ipData.country_code);
        setLoading(false);
        return
      }
      if (selectedCountry === undefined && getParameterByName('country')) {
        return;
      }
      try {
        setLoading(true);
        setMessage(null)
        const resStats = await fetch(`${API_URL}${selectedCountry ? `/countries/${selectedCountry}` : ''}`).then(data => data.json())
        const details = await fetch(resStats.deaths.detail).then(data => data.json());
        
        const detailsGrouped = _.groupBy(details, 'provinceState');
        
        setDetail(formatGroupedData(detailsGrouped));
        setLastUpdate(resStats.lastUpdate)
        setShowDetail(true)
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
      const rawDailyData = [];
      for (let i = timeRange; i > 0; i -= 1) {
        const data = await fetch(`${API_URL}/daily/${lightFormat(subDays(new Date(), i), 'MM-dd-yyyy')}`).then(data => data.json());
        rawDailyData.push(data)
      }
      dispatch({ type: 'DAILY_DATA', payload: rawDailyData })
    }
    fetchDailyData();
  }, [dispatch]) //eslint-disable-line

  const formatGroupedData = (grouped) => {
    const formatedData = [];
    Object.entries(grouped).forEach((states, index) => {
      formatedData.push({ state: states[0] });
      let deaths = 0;
      let confirmed = 0;
      let recovered = 0;
      states[1].forEach(entry => {
        deaths += parseInt(entry.deaths);
        confirmed += parseInt(entry.confirmed);
        recovered += parseInt(entry.recovered);
        formatedData[index].deaths = deaths;
        formatedData[index].confirmed = confirmed;
        formatedData[index].recovered = recovered;
      })
    })
    formatedData.totalDeaths = _.sumBy(formatedData, 'deaths');
    formatedData.totalConfirmed = _.sumBy(formatedData, 'confirmed');
    formatedData.totalRecovered = _.sumBy(formatedData, 'recovered');
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
              <Statistic.Value>{!detail || loading ? <Loader active inline size='mini'/> : formatThousands(detail.totalConfirmed)}</Statistic.Value>
              <Statistic.Label>Confirmed</Statistic.Label>
            </Statistic>
            <Statistic style={{ margin: 0 }}>
              <Statistic.Value>{!detail || loading ? <Loader active inline size='mini'/> : formatThousands(detail.totalDeaths)}</Statistic.Value>
              <Statistic.Label>Deaths</Statistic.Label>
            </Statistic>
            <Statistic style={{ margin: 0 }}>
              <Statistic.Value>
                {!detail || loading ?<Loader active inline size='mini'/> : formatThousands(detail.totalRecovered)}&nbsp;&nbsp;
                {detail.totalRecovered < 1 && (
                  <Popup 
                    trigger={<Icon name='info circle' size="tiny" />}
                    content={`Some countries does not provide the number of recovered and ${selectedCountryFullName[0].name} seems to one of them`}
                    size='small'
                  />
                )}
              </Statistic.Value>
              <Statistic.Label>Recovered</Statistic.Label>
            </Statistic>
          </Statistic.Group>
          {selectedCountry && (
            <>
              {!detail || loading && <Loader active inline size='mini'/>}
              {showDetail && <DeathsDetail detail={detail} selectedCountry={selectedCountry} /> }
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
          <LastCases
            country={selectedCountry ? selectedCountryFullName[0].name : ''}
            timeRange={timeRange}
          />
        </>
      )}
      <Divider />
      <Divider hidden />
      {lastUpdate && <small>Last Update: {parseISO(lastUpdate).toLocaleDateString('EN-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small> }
    </DashboardWrapper>
  )
}

export default Dashboard;