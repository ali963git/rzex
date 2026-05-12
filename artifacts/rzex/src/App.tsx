import React from 'react';
import { Switch, Route, Router as WouterRouter } from 'wouter';
import TradingPage from './pages/TradingPage';
import MarketsPage from './pages/MarketsPage';
import WalletPage from './pages/WalletPage';
import OrdersPage from './pages/OrdersPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function Router() {
  return (
    <Switch>
      <Route path="/" component={TradingPage} />
      <Route path="/markets" component={MarketsPage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') ?? ''}>
      <Router />
    </WouterRouter>
  );
}

export default App;
