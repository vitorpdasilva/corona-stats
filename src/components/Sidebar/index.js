import React, { useState, useEffect, useContext } from 'react';
import { Icon, Form, Radio } from 'semantic-ui-react';
import Context from '../../context';
import StyledSidebar from './style';

const menuItems = [
  { item: 'Dashboard', icon: 'home', url: '/' },
  { item: 'Stats', icon: 'table', url: '/stats' },
  { item: 'Charts', icon: 'chart line', url: 'daily'},
];

const Sidebar = () => {
  const { dispatch, state: { theme } } = useContext(Context);
  const [checked, setChecked] = useState();

  useEffect(() => {
    const initialTheme = () => {
      const theme = window.localStorage.getItem('theme');
      setChecked(theme === 'dark' ? true : false);
      dispatch({ type: 'THEME', payload: theme ?? 'light' });
    }
    initialTheme();
  }, []); //eslint-disable-line

  const handleCheck = () => {
    const theme = window.localStorage.getItem('theme');
    if (theme === 'dark') {
      setChecked(false);
      window.localStorage.setItem('theme', 'light');
      dispatch({ type: 'THEME', payload: 'light'});
    } else {
      setChecked(true);
      window.localStorage.setItem('theme', 'dark');
      dispatch({ type: 'THEME', payload: 'dark'});
    }
  }

  return (
    <StyledSidebar selectedTheme={theme}>
      <nav>
        {menuItems.map(({ item, icon, url }) => (
          <a key={item} href={url}>
            <Icon size="large" name={icon} /> {item}
          </a>
        ))}
        <Form.Field>
          <Radio toggle checked={checked} label='Dark theme' onChange={e => handleCheck()} />
        </Form.Field>
      </nav>
    </StyledSidebar>
  )
}

export default Sidebar;
