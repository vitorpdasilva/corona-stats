import React, { useContext, useReducer, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ReactGA from 'react-ga';
import { createBrowserHistory } from 'history';

import Context from './context';
import reducer from './reducer';

import Header from './components/Header'; 
import Footer from './Footer';
import Dashboard from './pages/dashboard';
import Daily from './pages/daily';
import Stats from './pages/stats';

const history = createBrowserHistory();

ReactGA.initialize("UA-29845692-1");
history.listen(({ pathname }) => {
  ReactGA.set({ page: pathname }); // Update the user's current page
  ReactGA.pageview(pathname); // Record a pageview for the given page
});

const menuItems = [
  { item: 'Dashboard', icon: 'home', url: '/' },
  { item: 'Stats', icon: 'table', url: '/stats' },
  { item: 'Charts', icon: 'chart line', url: 'daily'},
]

const Root = () => {
  const initialState = useContext(Context);
  const [visible, setVisible] = useState(false)
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <Router>
      <div
        style={{ border: '1px solid red', display: 'flex' }}
      >
        <nav style={{ minHeight: '100vh', border: '1px solid green' }}>
          {menuItems.map(({ item, icon, url }) => (
            <a key="item" href={url}>
              {item}
            </a>
          ))}
        </nav>
        <div style={{ width: '100%' }}>
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
        </div>
      </div>
    </Router>
  )
}

export default Root;
