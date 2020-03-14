import React, { useState, useEffect } from 'react';
import { Divider, Statistic, Loader } from 'semantic-ui-react'
import { API_URL, COUNTRIES_LIST } from '../../constants';
import DashboardWrapper from './styles';

const Dashboard = () => {
  const [selectedCountry, setSelectedCountry] = useState();
  const [message, setMessage] = useState();
  const selectedCountryFullName = selectedCountry ? COUNTRIES_LIST.filter(i => i.sigla2 === selectedCountry) : null
  function useStats () {
    const [stats, setStats] = useState();
    
    useEffect(() => {
      async function fetchData() {
        const res = await fetch(`${API_URL}/${selectedCountry ? 'countries/' : ''}${selectedCountry ? selectedCountry : ''}`)
        .then(data => data.json())
        .catch(err => {
          setMessage(`Por enquanto nenhum caso registrado no país ${selectedCountry}`)
          console.log(err);
        })
        if (!res.error) {
          setMessage(null)
          console.log(res);
          setStats(res);
        }
      }
      fetchData();
    }, [])
    return stats;
  }

  function Stats() {
    const stats = useStats();
    return (
      <>
        {message ? (
          <h3>{message}</h3>
        ) : (
          <Statistic.Group size="tiny">
          <Statistic>
            <Statistic.Value>{!stats ? <Loader active inline size='mini'/> : stats.confirmed.value}</Statistic.Value>
            <Statistic.Label>Confirmados</Statistic.Label>
          </Statistic>
          <Statistic>
            <Statistic.Value>{!stats ? <Loader active inline size='mini'/> : stats.deaths.value}</Statistic.Value>
            <Statistic.Label>Mortes</Statistic.Label>
          </Statistic>
          <Statistic>
            <Statistic.Value>{!stats ? <Loader active inline size='mini'/> : stats.recovered.value}</Statistic.Value>
            <Statistic.Label>Recuperações</Statistic.Label>
          </Statistic>
        </Statistic.Group>
        )}
      </>
    )
  }

  function FilterCountries() {
    if (!COUNTRIES_LIST) return <p>Carregando países...</p>
    return (
      <>
      <p>Filtrar por país:</p>
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
      <h2 className="title">ESTATISTICAS {selectedCountry ? selectedCountryFullName[0].nome : "GLOBAIS"}</h2>
      <Divider hidden />
      <Stats />
      <Divider />
      <Divider hidden />
      <FilterCountries />
    </DashboardWrapper>
  )
}

export default Dashboard;