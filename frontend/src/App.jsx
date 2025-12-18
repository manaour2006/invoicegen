import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';

import CreateInvoice from './pages/CreateInvoice';
import Automations from './pages/Automations';
import Clients from './pages/Clients';
import Items from './pages/Items';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreateInvoice />} />
          <Route path="clients" element={<Clients />} />
          <Route path="items" element={<Items />} />
          <Route path="automations" element={<Automations />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<div className="p-8 text-center text-muted">Page not found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
