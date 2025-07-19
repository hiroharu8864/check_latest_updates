import React, { useState, useEffect, useRef, useCallback } from 'react';
import { URLItem, UpdateNotification } from './types';
import { URLChecker } from './utils/urlChecker';
import { getItem, setItem } from './utils/storage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Router from './router/Router';
import Popup from './components/Popup';

function App() {
  const [urls, setUrls] = useState<URLItem[]>([]);
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<UpdateNotification | null>(null);
  const urlCheckerRef = useRef<URLChecker | null>(null);

  // URLが変更された時の監視処理（分離）
  const startMonitoringForUrls = useCallback((urlsToMonitor: URLItem[]) => {
    if (!urlCheckerRef.current) return;

    // 既存の監視を停止
    urlCheckerRef.current.stopAllMonitoring();

    // 監視が必要なURLがなければ終了
    if (urlsToMonitor.length === 0) return;

    // 新しい監視を開始
    urlsToMonitor.forEach((url: URLItem) => {
      urlCheckerRef.current!.startMonitoring(url, (updatedUrl) => {
        // 状態更新を分離
        setUrls(currentUrls => {
          const newUrls = currentUrls.map(u => u.id === updatedUrl.id ? updatedUrl : u);
          // 非同期でローカルストレージに保存
          setTimeout(() => setItem('monitoredUrls', newUrls), 0);
          return newUrls;
        });
        
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
  }, []);

  useEffect(() => {
    // URLCheckerを初期化
    if (!urlCheckerRef.current) {
      urlCheckerRef.current = URLChecker.getInstance();
    }
    
    // 保存された通知を読み込み
    const savedNotifications = getItem('notifications');
    if (savedNotifications) {
      const parsedNotifications = savedNotifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(parsedNotifications);
    }

    // 保存されたURLを読み込み（監視は開始しない）
    const savedUrls = getItem('monitoredUrls');
    if (savedUrls) {
      const parsedUrls = savedUrls.map((url: any) => ({
        ...url,
        lastChecked: new Date(url.lastChecked),
        lastModified: url.lastModified ? new Date(url.lastModified) : null
      }));
      setUrls(parsedUrls);
      // 初期化時は監視を開始しない（URL変更時に開始）
    }

    // クリーンアップ関数
    return () => {
      if (urlCheckerRef.current) {
        urlCheckerRef.current.stopAllMonitoring();
      }
    };
  }, []); // 空の依存配列で1回のみ実行

  useEffect(() => {
    // 通知をローカルストレージに保存
    if (notifications.length > 0) {
      setItem('notifications', notifications);
    }
  }, [notifications]);

  // URL配列が変更された時に監視を開始
  useEffect(() => {
    if (urls.length > 0 && urlCheckerRef.current) {
      // console.log('Starting monitoring for', urls.length, 'URLs');
      
      // 少し遅延させて確実に実行
      const timer = setTimeout(() => {
        startMonitoringForUrls(urls);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [urls.length, startMonitoringForUrls]);

  const handleUrlsChange = (newUrls: URLItem[]) => {
    // console.log('handleUrlsChange called with', newUrls.length, 'URLs');
    
    // 既存の監視を即座に停止
    if (urlCheckerRef.current) {
      urlCheckerRef.current.stopAllMonitoring();
    }
    
    // ローカルストレージに保存
    setItem('monitoredUrls', newUrls);
    
    // URLを更新（useEffectで監視開始される）
    setUrls(newUrls);
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
    <AuthProvider>
      <ProtectedRoute>
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
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
