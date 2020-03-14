import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Dashboard from './pages/dashboard';

const Root = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Dashboard} />
      </Switch>
    </Router>
  )
}

export default Root;
