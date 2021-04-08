import React from 'react';
import { Icon } from 'semantic-ui-react';
import StyledHeader from './style.js';
const Header = ({ onClick }) => (
  <StyledHeader>
      <Icon size="big" name="bars" onClick={() => onClick()} />
      <h1 style={{ margin: 0, marginLeft: '15px' }}>Corona Virus (Covid-19) numbers and data</h1>
  </StyledHeader>
    
);

export default Header;