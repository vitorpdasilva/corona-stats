import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ReactGA from 'react-ga';
import { createBrowserHistory } from 'history';
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
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/daily" component={Daily} />
        <Route exact path="/" component={Dashboard} />
      </Switch>
      <Footer />
    </Router>
  )
}

export default Root;
