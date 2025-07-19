import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { URLChecker } from '../utils/urlChecker';
import './Navigation.css';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      logout();
    }
  };

  const handleNavigation = () => {
    // ページ遷移時にタイマーを一時停止
    const urlChecker = URLChecker.getInstance();
    urlChecker.stopAllMonitoring();
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🔍</span>
          更新確認君ベータ
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={handleNavigation}
          >
            ホーム
          </Link>
          <Link 
            to="/admin" 
            className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            onClick={handleNavigation}
          >
            管理ページ
          </Link>
          <Link 
            to="/monitor" 
            className={`nav-link ${location.pathname === '/monitor' ? 'active' : ''}`}
            onClick={handleNavigation}
          >
            更新確認ページ
          </Link>
        </div>
        <div className="nav-auth">
          <button 
            onClick={handleLogout}
            className="logout-button"
            title="ログアウト"
          >
            🚪
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;