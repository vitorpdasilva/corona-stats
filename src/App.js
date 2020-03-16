import React, { useContext, useReducer } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ReactGA from 'react-ga';
import { createBrowserHistory } from 'history';

import Context from './context';
import reducer from './reducer';

import Header from './Header'; 
import Footer from './Footer';
import Dashboard from './pages/dashboard';
import Daily from './pages/daily';

const history = createBrowserHistory();

ReactGA.initialize("UA-29845692-1");
history.listen(location => {
  ReactGA.set({ page: location.pathname }); // Update the user's current page
  ReactGA.pageview(location.pathname); // Record a pageview for the given page
});

const Root = () => {
  const initialState = useContext(Context);
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <Router>
      <Header />
      <Context.Provider value={{ state, dispatch }}>
        <Switch>
          <Route path="/daily" component={Daily} />
          <Route exact path="/" component={Dashboard} />
        </Switch>
      </Context.Provider>
      <Footer />
    </Router>
  )
}

export default Root;
