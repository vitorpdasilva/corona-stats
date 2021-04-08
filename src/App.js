import React, { useContext, useReducer, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider } from 'styled-components';
import ReactGA from 'react-ga';
import { createBrowserHistory } from 'history';
import GlobalStyle from './globalStyles';

import Context from './context';
import reducer from './reducer';

import Sidebar from './components/Sidebar';
import Header from './components/Header'; 
import Footer from './Footer';
import Dashboard from './pages/dashboard';
import Daily from './pages/daily';
import Stats from './pages/stats';

import theme from './theme';
const history = createBrowserHistory();

ReactGA.initialize("UA-29845692-1");
history.listen(({ pathname }) => {
  ReactGA.set({ page: pathname }); // Update the user's current page
  ReactGA.pageview(pathname); // Record a pageview for the given page
});


const Root = () => {
  const initialState = useContext(Context);
  const [visible, setVisible] = useState(false)
  const [state, dispatch] = useReducer(reducer, initialState);
  const selectedTheme = state.theme
  return (
    <Router>
      <Context.Provider value={{ state, dispatch }}>
        <ThemeProvider theme={theme}>
          <GlobalStyle selectedTheme={selectedTheme} />
          <div
            style={{ display: 'flex' }}
          >
            <Sidebar />
            <div style={{ width: '100%' }}>
              <Header onClick={() => setVisible(!visible)} />
                <Switch>
                  {/* <Route path="/compare" component={Compare} /> */}
                  <Route path="/daily" component={Daily} />
                  <Route path="/stats" component={Stats} />
                  <Route exact path="/" component={Dashboard} />
                </Switch>
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </Context.Provider>
    </Router>
  )
}

export default Root;
