import React from 'react';
import { Icon } from 'semantic-ui-react';
const Header = () => {

  return (
    <header 
      style={{ display: 'flex', alignItems: 'center', padding: '20px' }}
    >
      <Icon name="dna" /> 
      <h2 style={{ marginTop: '5px' }}>Números e informações sobre o Corona Vírus (Covid-19)</h2>
    </header>
      
  );
}

export default Header;