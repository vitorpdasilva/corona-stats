import React, { useState, useEffect } from 'react';

import { API_URL } from '../../constants';

const Dashboard = () => {
  function useStats () {
    const [stats, setStats] = useState();
    useEffect(() => {
      async function fetchData() {
        const res = await fetch(API_URL).then(data => data.json());
        setStats(res);
      }
      fetchData();
    }, [])
    return stats;
  }

  function Stats() {
    const stats = useStats();
    console.log(stats);
    if (!stats) return <p>Carregando...</p>
    return (
      <>
        <div>
          <h3>Casos confirmados:</h3>
          <span>{stats.confirmed.value}</span>
        </div>
        <div>
          <h3>Mortes:</h3>
          <span>{stats.deaths.value}</span>
        </div>
        <div>
          <h3>Recuperações:</h3>
          {stats.recovered.value}
        </div>
      </>
    )
  }
  
  return (
    <>
      Stats: <Stats />
    </>
  )
}

export default Dashboard;