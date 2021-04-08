import React, { useState, useEffect, useContext } from 'react';
import { parseISO, lightFormat, subDays } from 'date-fns';
import _ from 'lodash';
import { Divider, Statistic, Loader, Popup, Icon } from 'semantic-ui-react'
import { API_URL, COUNTRIES_LIST } from '../../constants';
import Context from '../../context';
import DashboardWrapper from './styles';
import formatThousands from '../../helpers/formatThousand';
import LastCases from './LastCases';
import Details from './Details';
import CountriesFilter from '../../components/CountriesFilter';

const Dashboard = () => {
  const { dispatch, state: { selectedCountry } } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState();
  const [detail, setDetail] = useState([])
  const [showDetail, setShowDetail] = useState(false);
  const [message, setMessage] = useState();
  const [timeRange, setTimeRange] = useState(30)
  const selectedCountryFullName = selectedCountry ? COUNTRIES_LIST.filter(i => i.code === selectedCountry) : null

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setMessage(null)
      const resStats = await fetch(`${API_URL}${selectedCountry && selectedCountry !== "GLOBAL" ? `/countries/${selectedCountry}` : '' }`).then(data => data.json())
      const details = await fetch(resStats?.deaths?.detail).then(data => data.json());
      
      const detailsGrouped = _.groupBy(details, 'provinceState');
      setDetail(formatGroupedData(detailsGrouped));
      setLastUpdate(resStats.lastUpdate)
      setShowDetail(true)
      setLoading(false);
    }
    fetchStats();
  }, [selectedCountry]);

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
  }, []) //eslint-disable-line

  const formatGroupedData = (grouped) => {
    const formattedData = [];
    Object.entries(grouped).forEach((states, index) => {
      formattedData.push({ state: states[0] });
      let deaths = 0;
      let confirmed = 0;
      let recovered = 0;
      states[1].forEach(entry => {
        deaths += parseInt(entry.deaths);
        confirmed += parseInt(entry.confirmed);
        recovered += parseInt(entry.recovered);
        formattedData[index].deaths = deaths;
        formattedData[index].confirmed = confirmed;
        formattedData[index].recovered = recovered;
      })
    })
    formattedData.totalDeaths = _.sumBy(formattedData, 'deaths');
    formattedData.totalConfirmed = _.sumBy(formattedData, 'confirmed');
    formattedData.totalRecovered = _.sumBy(formattedData, 'recovered');
    return formattedData;
  };

  const buildStats = () => (
    <>
      {message ? (
        <h3>{message}</h3>
      ) : (
        <div style={{ position: 'relative' }}>
          <Statistic.Group 
            size="mini"
            style={{
              width: '100%',
              maxWidth: '600px',
              display: 'flex',
              margin: '0',
              marginTop: '15px',
              justifyContent: 'space-between',
            }}
          >
            {!detail || loading ? (
              <Loader active inline size='mini'/>
            ) : (
              <>
                <Statistic style={{ margin: 0 }}>
                  <Statistic.Value>{formatThousands(detail.totalConfirmed)}</Statistic.Value>
                  <Statistic.Label>Confirmed</Statistic.Label>
                </Statistic>
                <Statistic style={{ margin: 0 }}>
                  <Statistic.Value>{formatThousands(detail.totalDeaths)}</Statistic.Value>
                  <Statistic.Label>Deaths</Statistic.Label>
                </Statistic>
                <Statistic style={{ margin: 0 }}>
                  <Statistic.Value>
                    {formatThousands(detail.totalRecovered)}
                    {detail.totalRecovered < 1 && (
                      <Popup
                        basic
                        hideOnScroll
                        trigger={<Icon name='info circle' size="tiny" />}
                        content={(selectedCountry && selectedCountry !== "GLOBAL" ? `Some countries does not provide the number of recovered and ${selectedCountryFullName[0].name} seems to be one of them` : '')}
                        size='small'
                      />
                    )}
                  </Statistic.Value>
                  <Statistic.Label>Recovered</Statistic.Label>
                </Statistic>
              </>
            )}
          </Statistic.Group>
          {selectedCountry && selectedCountry !== "GLOBAL" && (
            <>
              {!detail || (loading && <Loader active inline size='mini'/>)}
              {showDetail && <Details detail={detail} selectedCountry={selectedCountry} /> }
            </>
          )}
        </div>
      )}
    </>
  )

  return (
    <DashboardWrapper>
      <h2 className="title">{selectedCountry && selectedCountry !== "GLOBAL" ? selectedCountryFullName[0].name : "GLOBAL"}</h2>
      <CountriesFilter />
      {buildStats()}
      <Divider hidden />
      {!message && selectedCountry && selectedCountry !== "GLOBAL" && (
        <>
          <div>
            How the virus is spreading in the past&nbsp;
            <strong>
              {timeRange} days
            </strong>
          </div>
          <LastCases
            country={selectedCountry && selectedCountry !== "GLOBAL" ? selectedCountryFullName[0].name : ''}
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