import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import DashboardLayout from './components/DashboardLayout';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Check if user is already logged in when the app loads
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (jwtToken, userData) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // If no token, show the Login/Auth screen
  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  // Render the professional Dashboard Shell
  return <DashboardLayout user={user} onLogout={handleLogout} />;
}

export default App;