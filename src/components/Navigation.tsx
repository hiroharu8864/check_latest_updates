import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🔍</span>
          監視君ベータ
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            ホーム
          </Link>
          <Link 
            to="/admin" 
            className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            管理ページ
          </Link>
          <Link 
            to="/monitor" 
            className={`nav-link ${location.pathname === '/monitor' ? 'active' : ''}`}
          >
            監視ページ
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;