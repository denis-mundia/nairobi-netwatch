import React, { useState } from 'react';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import { Dashboard } from './components/Dashboard';
import Devices from './components/Devices';
import Compliance from './components/Compliance';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import Settings from './components/Settings';
import { AlertCenter } from './components/Alerts';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'devices':
        return <Devices />;
      case 'compliance':
        return <Compliance />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <UserManagement />;
      case 'alerts':
        return <AlertCenter />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Layout activeView={activeView} setActiveView={setActiveView}>
        {renderView()}
      </Layout>
    </>
  );
}

export default App;