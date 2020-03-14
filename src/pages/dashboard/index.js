import React, { useState, useEffect } from 'react';
import { Divider, Statistic } from 'semantic-ui-react'

import { API_URL } from '../../constants';

const Dashboard = () => {
  const [selectedCountry, setSelectedCountry] = useState();
  function useStats () {
    const [stats, setStats] = useState();
    useEffect(() => {
      async function fetchData() {
        const res = await fetch(`${API_URL}/${selectedCountry ? 'countries/' : ''}${selectedCountry ? selectedCountry : ''}`).then(data => data.json());
        setStats(res);
      }
      fetchData();
    }, [])
    return stats;
  }

  function useCountries() {
    const [countriesList, setCountriesList] = useState();
    useEffect(() => {
      async function fetchCountries() {
        const res = await fetch(`${API_URL}/countries`).then(data => data.json());
        setCountriesList(res)
      }
      fetchCountries();
    }, []);
    return countriesList;
  }
  

  function Stats() {
    const stats = useStats();
    if (!stats) return <p>Carregando...</p>
    return (
      <Statistic.Group size="tiny">
        <Statistic>
          <Statistic.Value>{stats.confirmed.value}</Statistic.Value>
          <Statistic.Label>Casos confirmados:</Statistic.Label>
        </Statistic>
        <Statistic>
          <Statistic.Value>{stats.deaths.value}</Statistic.Value>
          <Statistic.Label>Mortes:</Statistic.Label>
        </Statistic>
        <Statistic>
          <Statistic.Value>{stats.recovered.value}</Statistic.Value>
          <Statistic.Label>Recuperações:</Statistic.Label>
        </Statistic>
      </Statistic.Group>
    )
  }

  function FilterCountries() {
    const list = useCountries();
    
    if (!list) return <p>Carregando países...</p>
    const { countries } = list;
    return (
      <>
      <p>Countries</p>
      <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}>
        {Object.keys(countries).map((i, index) => (
          <option key={index} value={countries[i]}>{i}</option>
        ))}
      </select>
      </>
    )
  }
  
  return (
    <>
      ESTATISTICAS {selectedCountry || "GLOBAIS"}:
      <Divider hidden />
      <Stats />
      <Divider />
      FILTRO DE PAISES: 
      <Divider hidden />
      <FilterCountries />
    </>
  )
}

export default Dashboard;