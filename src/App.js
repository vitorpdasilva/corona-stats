import React, { useContext, useReducer } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Context from './Context';
import reducer from './reducer';

import Dashboard from './pages/dashboard';

const Root = () => {
  const initialState = useContext(Context);
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <Router>
      <Context.Provider value={{ state, dispatch }}>
        <Switch>
          <Route path="/" component={Dashboard} />
        </Switch>
      </Context.Provider>
    </Router>
  )
}

export default Root;
