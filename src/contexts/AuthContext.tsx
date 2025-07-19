import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { hashPassword, verifyPassword, generateSalt } from '../utils/crypto';
import { getItem, setItem, isClient } from '../utils/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasPassword: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setInitialPassword: (username: string, password: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

interface AuthData {
  username: string;
  passwordHash: string;
  salt: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    if (!isClient) return;

    const initAuth = async () => {
      // セッションストレージから認証状態を復元
      const sessionAuth = sessionStorage.getItem('auth_session');
      if (sessionAuth) {
        const { timestamp, authenticated } = JSON.parse(sessionAuth);
        // 24時間以内なら認証状態を維持
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000 && authenticated) {
          setIsAuthenticated(true);
        }
      }

      // パスワードが設定されているかチェック
      const authData = getItem('auth_data');
      if (authData) {
        setHasPassword(true);
      }

      setIsInitialized(true);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const authData: AuthData = getItem('auth_data');
    
    if (!authData) {
      return false;
    }

    try {
      const isValid = await verifyPassword(password, authData.passwordHash, authData.salt);
      
      if (isValid && authData.username === username) {
        setIsAuthenticated(true);
        
        // セッションストレージに認証状態を保存
        sessionStorage.setItem('auth_session', JSON.stringify({
          timestamp: Date.now(),
          authenticated: true
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('auth_session');
  };

  const setInitialPassword = async (username: string, password: string): Promise<void> => {
    try {
      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);
      
      const authData: AuthData = {
        username,
        passwordHash,
        salt
      };
      
      setItem('auth_data', authData);
      setHasPassword(true);
      setIsAuthenticated(true);
      
      // セッションストレージに認証状態を保存
      sessionStorage.setItem('auth_session', JSON.stringify({
        timestamp: Date.now(),
        authenticated: true
      }));
    } catch (error) {
      console.error('Password setup error:', error);
      throw new Error('パスワード設定に失敗しました');
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    const authData: AuthData = getItem('auth_data');
    
    if (!authData) {
      return false;
    }

    try {
      const isValidOld = await verifyPassword(oldPassword, authData.passwordHash, authData.salt);
      
      if (!isValidOld) {
        return false;
      }
      
      const salt = generateSalt();
      const passwordHash = await hashPassword(newPassword, salt);
      
      const newAuthData: AuthData = {
        ...authData,
        passwordHash,
        salt
      };
      
      setItem('auth_data', newAuthData);
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isInitialized,
    hasPassword,
    login,
    logout,
    setInitialPassword,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};