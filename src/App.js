import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Dashboard from './pages/dashboard';
import Daily from './pages/daily';

const Root = () => {
  return (
    <Router>
      <Switch>
        <Route path="/daily" component={Daily} />
        <Route exact path="/" component={Dashboard} />
      </Switch>
    </Router>
  )
}

export default Root;
