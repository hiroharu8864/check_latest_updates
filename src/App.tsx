import React, { useState, useEffect } from 'react';
import { URLItem, UpdateNotification } from './types';
import { URLChecker } from './utils/urlChecker';
import { getItem, setItem } from './utils/storage';
import Router from './router/Router';
import Popup from './components/Popup';

function App() {
  const [urls, setUrls] = useState<URLItem[]>([]);
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<UpdateNotification | null>(null);
  const urlChecker = URLChecker.getInstance();

  useEffect(() => {
    // 保存された通知を読み込み
    const savedNotifications = getItem('notifications');
    if (savedNotifications) {
      const parsedNotifications = savedNotifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(parsedNotifications);
    }

    // 保存されたURLを読み込み
    const savedUrls = getItem('monitoredUrls');
    if (savedUrls) {
      const parsedUrls = savedUrls.map((url: any) => ({
        ...url,
        lastChecked: new Date(url.lastChecked),
        lastModified: url.lastModified ? new Date(url.lastModified) : null
      }));
      setUrls(parsedUrls);
      
      // 監視を再開
      parsedUrls.forEach((url: URLItem) => {
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
    }
  }, []);

  useEffect(() => {
    // 通知をローカルストレージに保存
    if (notifications.length > 0) {
      setItem('notifications', notifications);
    }
  }, [notifications]);

  useEffect(() => {
    // URLをローカルストレージに保存
    if (urls.length > 0) {
      setItem('monitoredUrls', urls);
    }
  }, [urls]);

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
