import React from 'react';
import './NotFound.css';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-container">
      <div className="mascot">
        <div className="mascot-body">
          <div className="mascot-head">
            <div className="eyes">
              <div className="eye left-eye">
                <div className="pupil"></div>
              </div>
              <div className="eye right-eye">
                <div className="pupil"></div>
              </div>
            </div>
            <div className="mouth"></div>
            <div className="blush left-blush"></div>
            <div className="blush right-blush"></div>
          </div>
          <div className="mascot-arms">
            <div className="arm left-arm"></div>
            <div className="arm right-arm"></div>
          </div>
        </div>
      </div>
      
      <div className="error-content">
        <h1>404</h1>
        <h2>ページが見つかりません</h2>
        <p>お探しのページは存在しないか、移動された可能性があります。</p>
        <button onClick={() => window.location.href = '/'} className="home-button">
          ホームに戻る
        </button>
      </div>
    </div>
  );
};

export default NotFound;