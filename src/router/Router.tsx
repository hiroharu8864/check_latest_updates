import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { URLItem, UpdateNotification } from '../types';
import Home from '../pages/Home';
import Admin from '../pages/Admin';
import Monitor from '../pages/Monitor';
import NotFound from '../NotFound';

interface RouterProps {
  urls: URLItem[];
  onUrlsChange: (urls: URLItem[]) => void;
  notifications: UpdateNotification[];
  onNotificationRead: (id: string) => void;
}

const Router: React.FC<RouterProps> = ({ 
  urls, 
  onUrlsChange, 
  notifications, 
  onNotificationRead 
}) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/admin" 
          element={<Admin onUrlsChange={onUrlsChange} />} 
        />
        <Route 
          path="/monitor" 
          element={
            <Monitor 
              urls={urls}
              onUrlUpdate={(url) => {
                const updatedUrls = urls.map(u => u.id === url.id ? url : u);
                onUrlsChange(updatedUrls);
              }}
              notifications={notifications}
              onNotificationRead={onNotificationRead}
            />
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;