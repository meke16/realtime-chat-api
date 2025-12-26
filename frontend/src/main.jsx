import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { getToken } from './lib/api.js'
import './index.css'

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login onSuccess={() => location.assign('/dashboard')} />} />
        <Route path="/signup" element={<Signup onSuccess={() => location.assign('/dashboard')} />} />
        <Route path="/dashboard" element={<DashboardWrapper />} />
      </Routes>
    </BrowserRouter>
  )
}

function DashboardWrapper() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  React.useEffect(() => {
    if (!getToken()) navigate('/login');
    fetch('/api/user', { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(u => setUser(u)).catch(() => navigate('/login'));
  }, []);
  if (!user) return <div className="p-6">Loading...</div>;
  return <Dashboard user={user} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
