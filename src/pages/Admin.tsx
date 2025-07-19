import React, { useState, useEffect } from 'react';
import { URLItem } from '../types';
import { getItem, setItem } from '../utils/storage';
import { addMockDataToUrls } from '../utils/mockData';
import { useAuth } from '../contexts/AuthContext';
import { checkPasswordStrength } from '../utils/crypto';
import PageLayout from '../components/PageLayout';
import MonitorCharacter from '../components/MonitorCharacter';
import './Admin.css';

interface AdminProps {
  onUrlsChange: (urls: URLItem[]) => void;
}

const Admin: React.FC<AdminProps> = ({ onUrlsChange }) => {
  const { changePassword } = useAuth();
  const [urls, setUrls] = useState<URLItem[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newInterval, setNewInterval] = useState(60);
  const [errors, setErrors] = useState<{url?: string; title?: string}>({});
  
  // パスワード変更関連の状態
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const savedUrls = getItem('monitoredUrls');
    if (savedUrls) {
      const parsedUrls = savedUrls.map((url: any) => ({
        ...url,
        lastChecked: new Date(url.lastChecked),
        lastModified: url.lastModified ? new Date(url.lastModified) : null
      }));
      setUrls(parsedUrls);
      onUrlsChange(parsedUrls);
    }
  }, [onUrlsChange]);

  const saveUrls = (updatedUrls: URLItem[]) => {
    setItem('monitoredUrls', updatedUrls);
    setUrls(updatedUrls);
    onUrlsChange(updatedUrls);
  };

  const addUrl = () => {
    const newErrors: {url?: string; title?: string} = {};
    
    // URLバリデーション
    if (!newUrl.trim()) {
      newErrors.url = 'URLを入力してください';
    } else {
      try {
        new URL(newUrl.trim());
      } catch {
        newErrors.url = '有効なURLを入力してください';
      }
    }
    
    // タイトルバリデーション
    if (!newTitle.trim()) {
      newErrors.title = 'タイトルを入力してください';
    }
    
    setErrors(newErrors);
    
    // エラーがある場合は処理を中止
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const newUrlItem: URLItem = {
      id: Date.now().toString(),
      url: newUrl.trim(),
      title: newTitle.trim(),
      lastChecked: new Date(),
      lastModified: null,
      status: 'checking',
      checkInterval: newInterval
    };

    const updatedUrls = [...urls, newUrlItem];
    saveUrls(updatedUrls);
    
    setNewUrl('');
    setNewTitle('');
    setNewInterval(60);
    setErrors({});
  };

  const addTestData = () => {
    const updatedUrls = addMockDataToUrls(urls);
    saveUrls(updatedUrls);
  };

  const removeUrl = (id: string) => {
    const updatedUrls = urls.filter(url => url.id !== id);
    saveUrls(updatedUrls);
  };

  const updateUrl = (id: string, updates: Partial<URLItem>) => {
    const updatedUrls = urls.map(url => 
      url.id === id ? { ...url, ...updates } : url
    );
    saveUrls(updatedUrls);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('新しいパスワードが一致しません');
      return;
    }

    const passwordStrength = checkPasswordStrength(newPassword);
    if (!passwordStrength.isValid) {
      setPasswordError('パスワードの強度が不十分です');
      return;
    }

    try {
      const success = await changePassword(oldPassword, newPassword);
      if (success) {
        setPasswordSuccess('パスワードが正常に変更されました');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => {
          setShowPasswordChange(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError('現在のパスワードが正しくありません');
      }
    } catch (error) {
      setPasswordError('パスワード変更に失敗しました');
    }
  };

  return (
    <PageLayout 
      title="更新確認君ベータ - URL管理" 
      subtitle="更新確認したいURLを登録・管理できます"
    >
      <div className="admin-container">
        <div className="admin-header-with-character">
          <MonitorCharacter 
            size="small" 
            mood={urls.length > 0 ? 'watching' : 'sleeping'}
            message={urls.length > 0 ? `${urls.length}件を確認中` : 'URLを追加してね！'}
          />
        </div>
        
        <div className="add-url-form">
          <h2>新しいURLを追加</h2>
          <div className="form-group">
            <label>URL:</label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => {
                setNewUrl(e.target.value);
                if (errors.url) setErrors({...errors, url: undefined});
              }}
              placeholder="https://example.com"
              className={errors.url ? 'error' : ''}
              required
            />
            {errors.url && <span className="error-message">{errors.url}</span>}
          </div>
          <div className="form-group">
            <label>タイトル:</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (errors.title) setErrors({...errors, title: undefined});
              }}
              placeholder="サイト名"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
          <div className="form-group">
            <label>チェック間隔（分）:</label>
            <input
              type="number"
              value={newInterval}
              onChange={(e) => setNewInterval(Number(e.target.value))}
              min="1"
              max="1440"
            />
          </div>
          <div className="button-group">
            <button onClick={addUrl} className="add-button">追加</button>
            <button onClick={addTestData} className="test-button">
              テストデータ追加
            </button>
          </div>
        </div>

        <div className="security-settings">
          <h2>セキュリティ設定</h2>
          <button 
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="password-change-toggle"
          >
            🔒 パスワード変更
          </button>
          
          {showPasswordChange && (
            <div className="password-change-form">
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label>現在のパスワード:</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>新しいパスワード:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>新しいパスワード（確認）:</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
                {passwordError && (
                  <div className="error-message">{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div className="success-message">{passwordSuccess}</div>
                )}
                <div className="button-group">
                  <button type="submit" className="add-button">
                    変更
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowPasswordChange(false)}
                    className="cancel-button"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="url-list">
          <h2>登録済みURL</h2>
          {urls.length === 0 ? (
            <p className="no-urls">登録されたURLはありません</p>
          ) : (
            <div className="url-grid">
              {urls.map((url) => (
                <div key={url.id} className="url-card">
                  <div className="url-header">
                    <h3>{url.title}</h3>
                    <button 
                      onClick={() => removeUrl(url.id)}
                      className="remove-button"
                    >
                      削除
                    </button>
                  </div>
                  <p className="url-link">
                    <a href={url.url} target="_blank" rel="noopener noreferrer">
                      {url.url}
                    </a>
                  </p>
                  <div className="url-info">
                    <p>チェック間隔: {url.checkInterval}分</p>
                    <p>最終チェック: {url.lastChecked.toLocaleString()}</p>
                    <p>ステータス: 
                      <span className={`status ${url.status}`}>
                        {url.status === 'checking' ? 'チェック中' :
                         url.status === 'updated' ? '更新あり' :
                         url.status === 'unchanged' ? '変更なし' : 'エラー'}
                      </span>
                    </p>
                  </div>
                  <div className="url-actions">
                    <input
                      type="number"
                      value={url.checkInterval}
                      onChange={(e) => updateUrl(url.id, { checkInterval: Number(e.target.value) })}
                      min="1"
                      max="1440"
                      className="interval-input"
                    />
                    <label>分間隔</label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Admin;