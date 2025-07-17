import React, { useEffect, useState } from 'react';
import { UpdateNotification } from '../types';
import './Popup.css';

interface PopupProps {
  notification: UpdateNotification | null;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

const Popup: React.FC<PopupProps> = ({ notification, onClose, onMarkAsRead }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // 5秒後に自動的に閉じる
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // アニメーション完了後にクローズ
  };

  const handleMarkAsRead = () => {
    if (notification) {
      onMarkAsRead(notification.id);
    }
    handleClose();
  };

  const handleVisitUrl = () => {
    if (notification) {
      window.open(notification.url, '_blank');
      handleMarkAsRead();
    }
  };

  if (!notification) return null;

  return (
    <div className={`popup-overlay ${isVisible ? 'visible' : ''}`}>
      <div className={`popup-container ${isVisible ? 'visible' : ''}`}>
        <div className="popup-header">
          <div className="popup-icon">🔔</div>
          <h3>更新通知</h3>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="popup-content">
          <h4>{notification.title}</h4>
          <p className="popup-url">{notification.url}</p>
          <p className="popup-time">
            {notification.timestamp.toLocaleString()}
          </p>
          <p className="popup-message">
            このサイトに新しい更新があります！
          </p>
        </div>
        
        <div className="popup-actions">
          <button 
            className="action-button primary" 
            onClick={handleVisitUrl}
          >
            サイトを開く
          </button>
          <button 
            className="action-button secondary" 
            onClick={handleMarkAsRead}
          >
            確認済み
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;