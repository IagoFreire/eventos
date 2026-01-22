import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">✝</span>
          <span className="logo-text">Igreja</span>
        </Link>
        
        <nav className="nav">
          <Link to="/" className="nav-link">Início</Link>
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className="nav-link">Administração</Link>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="nav-link logout-btn">
              Sair
            </button>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
