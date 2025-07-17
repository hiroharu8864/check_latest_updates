import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import logo from '../logo.svg';
import '../App.css';

const Home: React.FC = () => {
  return (
    <div className="App">
      <Navigation />
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>監視君ベータ</h1>
        <p>
          Webサイトの更新を自動的に監視し、変更があった場合に通知します。
        </p>
        <div className="nav-links">
          <Link to="/admin" className="App-link">
            管理ページ
          </Link>
          <Link to="/monitor" className="App-link">
            監視ページ
          </Link>
        </div>
        <div className="features">
          <h3>主な機能</h3>
          <ul>
            <li>URLの登録と管理</li>
            <li>定期的な更新チェック</li>
            <li>リアルタイム通知</li>
            <li>更新履歴の確認</li>
          </ul>
        </div>
      </header>
    </div>
  );
};

export default Home;