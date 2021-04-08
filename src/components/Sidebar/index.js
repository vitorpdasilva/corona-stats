import React from 'react';
import { Icon, Form, Radio } from 'semantic-ui-react';
import StyledSidebar from './style';

const menuItems = [
  { item: 'Dashboard', icon: 'home', url: '/' },
  { item: 'Stats', icon: 'table', url: '/stats' },
  { item: 'Charts', icon: 'chart line', url: 'daily'},
];

const Sidebar = () => {
  return (
    <div style={{ minHeight: '100vh', borderRight: '1px solid lightgrey' }}>
      <StyledSidebar>
        {menuItems.map(({ item, icon, url }) => (
          <a key={item} href={url}>
            <Icon size="large" name={icon} /> {item}
          </a>
        ))}
        <Form.Field>
          <Radio toggle label='Dark theme' />
        </Form.Field>
      </StyledSidebar>
    </div>
  )
}

export default Sidebar;
