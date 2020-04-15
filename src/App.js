import React, { useContext, useReducer, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Sidebar, Menu, Icon, Segment } from 'semantic-ui-react';
import ReactGA from 'react-ga';
import { createBrowserHistory } from 'history';

import Context from './context';
import reducer from './reducer';

import Header from './Header'; 
import Footer from './Footer';
import Dashboard from './pages/dashboard';
import Daily from './pages/daily';
import Stats from './pages/stats';

const history = createBrowserHistory();

ReactGA.initialize("UA-29845692-1");
history.listen(location => {
  ReactGA.set({ page: location.pathname }); // Update the user's current page
  ReactGA.pageview(location.pathname); // Record a pageview for the given page
});

const Root = () => {
  const initialState = useContext(Context);
  const [visible, setVisible] = useState(false)
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <Router>
      <Sidebar.Pushable as={Segment} style={{ minHeight: '100vh' }}>
        <Sidebar
          as={Menu}
          animation='overlay'
          icon='labeled'
          inverted
          onHide={() => setVisible(false)}
          vertical
          visible={visible}
          width='thin'
        >
          <Menu.Item as='a' href="/">
            <Icon name='home' />
            Dashboard
          </Menu.Item>
          <Menu.Item as='a' href="/stats">
            <Icon name='table' />
            Stats
          </Menu.Item>
          <Menu.Item as='a' href="/daily">
            <Icon name='chart line' />
            Charts
          </Menu.Item>
        </Sidebar>
        <Sidebar.Pusher>
          <Header onClick={() => setVisible(!visible)} />
          <Context.Provider value={{ state, dispatch }}>
            <Switch>
              {/* <Route path="/compare" component={Compare} /> */}
              <Route path="/daily" component={Daily} />
              <Route path="/stats" component={Stats} />
              <Route exact path="/" component={Dashboard} />
            </Switch>
          </Context.Provider>
          <Footer />
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </Router>
  )
}

export default Root;
