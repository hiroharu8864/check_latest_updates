import React from 'react';
import Navigation from './Navigation';
import './PageLayout.css';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="page-layout">
      <Navigation />
      <div className="page-content">
        <div className="page-header">
          <h1>{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;