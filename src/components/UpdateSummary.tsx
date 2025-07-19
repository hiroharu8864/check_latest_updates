import React, { useState } from 'react';
import { URLItem, UpdateDiff } from '../types';
import './UpdateSummary.css';

interface UpdateSummaryProps {
  url: URLItem;
  updateDiffs?: UpdateDiff[];
}

const UpdateSummary: React.FC<UpdateSummaryProps> = ({ url, updateDiffs = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getChangeTypeIcon = (changeType?: string) => {
    switch (changeType) {
      case 'content':
        return '📝';
      case 'structure':
        return '🏗️';
      case 'metadata':
        return '🏷️';
      default:
        return '🔄';
    }
  };

  const getChangeTypeName = (changeType?: string) => {
    switch (changeType) {
      case 'content':
        return 'コンテンツ変更';
      case 'structure':
        return '構造変更';
      case 'metadata':
        return 'メタデータ変更';
      default:
        return '不明な変更';
    }
  };

  const formatSummary = (summary?: string) => {
    if (!summary) return '更新内容の詳細情報がありません';
    
    // 長い文章を短縮
    if (summary.length > 100) {
      return summary.substring(0, 100) + '...';
    }
    return summary;
  };

  const getLatestUpdate = () => {
    if (updateDiffs.length === 0) return null;
    return updateDiffs[0]; // 最新の更新
  };

  const latestUpdate = getLatestUpdate();

  if (url.status !== 'updated' && !latestUpdate) {
    return null;
  }

  return (
    <div className="update-summary">
      <div className="update-summary-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="update-info">
          <span className="change-icon">
            {getChangeTypeIcon(url.changeType || latestUpdate?.changeType)}
          </span>
          <div className="update-details">
            <span className="change-type">
              {getChangeTypeName(url.changeType || latestUpdate?.changeType)}
            </span>
            <span className="update-time">
              {url.lastModified?.toLocaleString() || '時刻不明'}
            </span>
          </div>
        </div>
        <button className="expand-button">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      <div className="update-summary-content">
        <p className="summary-text">
          {formatSummary(url.updateSummary || latestUpdate?.summary)}
        </p>
      </div>

      {isExpanded && (
        <div className="update-details-expanded">
          {latestUpdate && (
            <>
              <div className="change-details">
                <h4>変更詳細</h4>
                {latestUpdate.details.added && latestUpdate.details.added.length > 0 && (
                  <div className="change-section">
                    <span className="change-label added">追加:</span>
                    <ul>
                      {latestUpdate.details.added.slice(0, 3).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                      {latestUpdate.details.added.length > 3 && (
                        <li>...他{latestUpdate.details.added.length - 3}件</li>
                      )}
                    </ul>
                  </div>
                )}
                
                {latestUpdate.details.removed && latestUpdate.details.removed.length > 0 && (
                  <div className="change-section">
                    <span className="change-label removed">削除:</span>
                    <ul>
                      {latestUpdate.details.removed.slice(0, 3).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                      {latestUpdate.details.removed.length > 3 && (
                        <li>...他{latestUpdate.details.removed.length - 3}件</li>
                      )}
                    </ul>
                  </div>
                )}

                {latestUpdate.details.modified && latestUpdate.details.modified.length > 0 && (
                  <div className="change-section">
                    <span className="change-label modified">変更:</span>
                    <ul>
                      {latestUpdate.details.modified.slice(0, 3).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                      {latestUpdate.details.modified.length > 3 && (
                        <li>...他{latestUpdate.details.modified.length - 3}件</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {updateDiffs.length > 1 && (
                <div className="update-history">
                  <h4>更新履歴 ({updateDiffs.length}件)</h4>
                  <div className="history-list">
                    {updateDiffs.slice(1, 4).map((diff) => (
                      <div key={diff.id} className="history-item">
                        <span className="history-icon">
                          {getChangeTypeIcon(diff.changeType)}
                        </span>
                        <span className="history-time">
                          {diff.timestamp.toLocaleString()}
                        </span>
                        <span className="history-summary">
                          {formatSummary(diff.summary)}
                        </span>
                      </div>
                    ))}
                    {updateDiffs.length > 4 && (
                      <div className="history-more">
                        ...他{updateDiffs.length - 4}件の更新
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UpdateSummary;