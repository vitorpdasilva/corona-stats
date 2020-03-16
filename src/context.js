import { createContext } from 'react';

const Context = createContext({
  selectedCountry: null,
  deathsDetail: null,
});

export default Context;
