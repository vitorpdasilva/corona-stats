import React, { useState, useEffect, useContext } from 'react';
import { createBrowserHistory } from 'history';
import { getParameterByName } from '../../helpers';
import { COUNTRIES_LIST, IP_DATA_URL, IP_DATA_KEY } from '../../constants';
import StyledFilter from './style';
import Context from '../../context';

const { push, location } = createBrowserHistory();

const CountriesFilter = () => {
  const { dispatch } = useContext(Context);
  const [selectedCountry, setSelectedCountry] = useState();

  useEffect(() => {
    const setInitialCountryByIp = async () => {
      if (!selectedCountry && !getParameterByName('country')) {
        const { country_code } = await fetch(`${IP_DATA_URL}?api-key=${IP_DATA_KEY}`).then(data => data.json());
        setSelectedCountry(country_code);
        dispatch({ type: 'SELECT_COUNTRY', payload: country_code });
      }
    }
    setInitialCountryByIp();
  })

  useEffect(() => {
    const country = getParameterByName('country', location.search);
    setSelectedCountry(country);
  }, []);

  const selectCountry = (country) => {
    const countryParam = country ? `?country=${country}` : '';
    push({
      search: countryParam
    });
  }

  if (!COUNTRIES_LIST) return <>error country filter</>;
  return (
    <StyledFilter>
      <p style={{ margin: '0 10px 0 0' }}>Filter:</p>
      <select value={selectedCountry} onChange={({ target: { value }}) => selectCountry(value ?? 'GLOBAL')}>
        <option value="">GLOBAL</option>
        {COUNTRIES_LIST.map((i, index) => (
          <option key={index} value={i.code}>{i.name}</option>
        ))}
      </select>
    </StyledFilter>
  )
};

export default CountriesFilter;