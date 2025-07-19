import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();

  // 認証状態が初期化されていない場合はローディング表示
  if (!isInitialized) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  // 認証されていない場合はログイン画面を表示
  if (!isAuthenticated) {
    return <Login />;
  }

  // 認証済みの場合は子要素を表示
  return <>{children}</>;
};

export default ProtectedRoute;