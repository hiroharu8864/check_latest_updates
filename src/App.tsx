import React, { useState, useEffect } from 'react';
import { URLItem, UpdateNotification } from './types';
import { URLChecker } from './utils/urlChecker';
import Router from './router/Router';
import Popup from './components/Popup';

function App() {
  const [urls, setUrls] = useState<URLItem[]>([]);
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<UpdateNotification | null>(null);
  const urlChecker = URLChecker.getInstance();

  useEffect(() => {
    // 保存された通知を読み込み
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(parsedNotifications);
    }
  }, []);

  useEffect(() => {
    // 通知をローカルストレージに保存
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const handleUrlsChange = (newUrls: URLItem[]) => {
    setUrls(newUrls);
    
    // 既存の監視を停止
    urlChecker.stopAllMonitoring();
    
    // 新しい監視を開始
    newUrls.forEach(url => {
      urlChecker.startMonitoring(url, (updatedUrl) => {
        setUrls(prev => prev.map(u => u.id === updatedUrl.id ? updatedUrl : u));
        
        // 更新があった場合、通知を作成
        if (updatedUrl.status === 'updated') {
          const notification: UpdateNotification = {
            id: Date.now().toString(),
            urlId: updatedUrl.id,
            title: updatedUrl.title,
            url: updatedUrl.url,
            timestamp: new Date(),
            read: false
          };
          
          setNotifications(prev => [notification, ...prev]);
          setCurrentNotification(notification);
        }
      });
    });
  };

  const handleNotificationRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handlePopupClose = () => {
    setCurrentNotification(null);
  };

  return (
    <>
      <Router 
        urls={urls}
        onUrlsChange={handleUrlsChange}
        notifications={notifications}
        onNotificationRead={handleNotificationRead}
      />
      <Popup 
        notification={currentNotification}
        onClose={handlePopupClose}
        onMarkAsRead={handleNotificationRead}
      />
    </>
  );
}

export default App;
