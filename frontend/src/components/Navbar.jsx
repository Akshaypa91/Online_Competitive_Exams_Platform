import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div style={{ fontWeight: 600, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
        {title || 'Dashboard'}
      </div>
      <div className="flex items-center gap-4">
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {user?.name || user?.email}
        </span>
        <button className="btn btn-outline" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
