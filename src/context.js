import { createContext } from 'react';

const Context = createContext({
  dailyData: [],
  selectedCountry: null,
  sidebarOpen: false,
});

export default Context;
