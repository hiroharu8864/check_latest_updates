import React, { useState, useEffect } from 'react';
import { URLItem } from '../types';
import PageLayout from '../components/PageLayout';
import './Admin.css';

interface AdminProps {
  onUrlsChange: (urls: URLItem[]) => void;
}

const Admin: React.FC<AdminProps> = ({ onUrlsChange }) => {
  const [urls, setUrls] = useState<URLItem[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newInterval, setNewInterval] = useState(60);
  const [errors, setErrors] = useState<{url?: string; title?: string}>({});

  useEffect(() => {
    const savedUrls = localStorage.getItem('monitoredUrls');
    if (savedUrls) {
      const parsedUrls = JSON.parse(savedUrls).map((url: any) => ({
        ...url,
        lastChecked: new Date(url.lastChecked),
        lastModified: url.lastModified ? new Date(url.lastModified) : null
      }));
      setUrls(parsedUrls);
      onUrlsChange(parsedUrls);
    }
  }, [onUrlsChange]);

  const saveUrls = (updatedUrls: URLItem[]) => {
    localStorage.setItem('monitoredUrls', JSON.stringify(updatedUrls));
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

  return (
    <PageLayout 
      title="監視君ベータ - URL管理" 
      subtitle="監視したいURLを登録・管理できます"
    >
      <div className="admin-container">
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
          <button onClick={addUrl} className="add-button">追加</button>
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