import React from 'react';
import { Icon } from 'semantic-ui-react';
const Header = () => (
  <header 
    style={{ display: 'flex', alignItems: 'center', padding: '20px' }}
  >
    <Icon name="dna" /> 
    <h2 style={{ marginTop: '5px' }}>Numbers and data related to Corona Virus (Covid-19)</h2>
  </header>
    
);

export default Header;