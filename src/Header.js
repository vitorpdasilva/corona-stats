import React from 'react';
import { Segment, Icon } from 'semantic-ui-react';
const Header = ({ onClick }) => (
  <header 
    
  >
    <Segment 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '20px',
      }}
    >
      <Icon size="big" name="bars" onClick={() => onClick()} />
      
      <h2 style={{ margin: 0, marginLeft: '15px' }}>Numbers and data related to Corona Virus (Covid-19)</h2>
    </Segment>
  </header>
    
);

export default Header;