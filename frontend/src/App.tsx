import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Create a global function to trigger re-renders when token changes
let forceUpdate: () => void;

function App() {
  const [, setUpdateTrigger] = useState(0);
  forceUpdate = () => setUpdateTrigger(prev => prev + 1);

  const token = localStorage.getItem('adminToken');
  console.log('App rendering, current path:', window.location.pathname, 'token:', !!token);

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />
    </Routes>
  );
}

// Export the force update function so login can call it
export { forceUpdate };

export default App;
