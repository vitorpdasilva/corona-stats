import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Header from './Header'; 

import Dashboard from './pages/dashboard';
import Daily from './pages/daily';

const Root = () => {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/daily" component={Daily} />
        <Route exact path="/" component={Dashboard} />
      </Switch>
    </Router>
  )
}

export default Root;
