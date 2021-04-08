import { createContext } from 'react';

const Context = createContext({
  dailyData: [],
  selectedCountry: null,
  sidebarOpen: false,
  theme: 'light',
});

export default Context;
