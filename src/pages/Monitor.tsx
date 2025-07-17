import React, { useState, useEffect } from 'react';
import { URLItem, UpdateNotification } from '../types';
import PageLayout from '../components/PageLayout';
import './Monitor.css';

interface MonitorProps {
  urls: URLItem[];
  onUrlUpdate: (url: URLItem) => void;
  notifications: UpdateNotification[];
  onNotificationRead: (id: string) => void;
}

const Monitor: React.FC<MonitorProps> = ({ 
  urls, 
  onUrlUpdate, 
  notifications, 
  onNotificationRead 
}) => {
  const [filter, setFilter] = useState<'all' | 'updated' | 'unchanged' | 'error'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'lastChecked' | 'status'>('title');

  const filteredUrls = urls.filter(url => {
    if (filter === 'all') return true;
    return url.status === filter;
  });

  const sortedUrls = [...filteredUrls].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'lastChecked':
        return b.lastChecked.getTime() - a.lastChecked.getTime();
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checking':
        return '⏳';
      case 'updated':
        return '🟢';
      case 'unchanged':
        return '🔵';
      case 'error':
        return '🔴';
      default:
        return '❓';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'checking':
        return 'チェック中';
      case 'updated':
        return '更新あり';
      case 'unchanged':
        return '変更なし';
      case 'error':
        return 'エラー';
      default:
        return '不明';
    }
  };

  const getTimeDiff = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}日前`;
    if (hours > 0) return `${hours}時間前`;
    if (minutes > 0) return `${minutes}分前`;
    return '今';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <PageLayout 
      title="監視君ベータ - 更新監視" 
      subtitle="登録されたURLの更新状況を確認できます"
    >
      <div className="monitor-container">
        <div className="monitor-header">
          <div className="stats">
            <div className="stat-item">
              <span className="stat-number">{urls.length}</span>
              <span className="stat-label">監視中</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{urls.filter(u => u.status === 'updated').length}</span>
              <span className="stat-label">更新あり</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{unreadCount}</span>
              <span className="stat-label">未読通知</span>
            </div>
          </div>
        </div>

        <div className="controls">
          <div className="filter-controls">
            <label>フィルター:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
              <option value="all">すべて</option>
              <option value="updated">更新あり</option>
              <option value="unchanged">変更なし</option>
              <option value="error">エラー</option>
            </select>
          </div>
          <div className="sort-controls">
            <label>並び順:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="title">タイトル</option>
              <option value="lastChecked">最終チェック</option>
              <option value="status">ステータス</option>
            </select>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="notifications">
            <h2>
              通知 
              {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </h2>
            <div className="notification-list">
              {notifications.slice(0, 5).map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => onNotificationRead(notification.id)}
                >
                  <div className="notification-icon">🔔</div>
                  <div className="notification-content">
                    <p className="notification-title">{notification.title}</p>
                    <p className="notification-time">{getTimeDiff(notification.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="url-monitor-grid">
          {sortedUrls.length === 0 ? (
            <div className="no-urls">
              <p>監視中のURLがありません</p>
              <p>管理ページでURLを追加してください</p>
            </div>
          ) : (
            sortedUrls.map(url => (
              <div key={url.id} className={`url-monitor-card ${url.status}`}>
                <div className="card-header">
                  <div className="status-indicator">
                    <span className="status-icon">{getStatusIcon(url.status)}</span>
                    <span className="status-text">{getStatusText(url.status)}</span>
                  </div>
                  <div className="last-checked">
                    {getTimeDiff(url.lastChecked)}
                  </div>
                </div>
                
                <h3 className="url-title">{url.title}</h3>
                <p className="url-link">
                  <a href={url.url} target="_blank" rel="noopener noreferrer">
                    {url.url}
                  </a>
                </p>
                
                <div className="url-details">
                  <div className="detail-item">
                    <span className="detail-label">チェック間隔:</span>
                    <span className="detail-value">{url.checkInterval}分</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">最終チェック:</span>
                    <span className="detail-value">{url.lastChecked.toLocaleString()}</span>
                  </div>
                  {url.lastModified && (
                    <div className="detail-item">
                      <span className="detail-label">最終更新:</span>
                      <span className="detail-value">{url.lastModified.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                {url.status === 'updated' && (
                  <div className="update-indicator">
                    <span className="update-badge">新しい更新があります！</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Monitor;