import React from 'react';
import './MonitorCharacter.css';

interface MonitorCharacterProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  mood?: 'watching' | 'alert' | 'sleeping' | 'happy';
}

const MonitorCharacter: React.FC<MonitorCharacterProps> = ({ 
  size = 'small', 
  message,
  mood = 'watching' 
}) => {
  const getEyeExpression = () => {
    switch (mood) {
      case 'alert':
        return '👁️👁️';
      case 'sleeping':
        return '😴';
      case 'happy':
        return '😊';
      case 'watching':
      default:
        return '👀';
    }
  };

  const getCharacterEmoji = () => {
    switch (mood) {
      case 'alert':
        return '🕵️‍♂️';
      case 'sleeping':
        return '😴';
      case 'happy':
        return '🤖';
      case 'watching':
      default:
        return '🔍';
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (mood) {
      case 'alert':
        return '更新を発見しました！';
      case 'sleeping':
        return 'zzz... 監視中...';
      case 'happy':
        return 'すべて順調です！';
      case 'watching':
      default:
        return 'サイトを監視中...';
    }
  };

  return (
    <div className={`monitor-character ${size} ${mood}`}>
      <div className="character-body">
        <div className="character-face">
          <span className="character-emoji">{getCharacterEmoji()}</span>
          <span className="character-eyes">{getEyeExpression()}</span>
        </div>
        <div className="character-message">
          {getMessage()}
        </div>
      </div>
      <div className="character-shadow"></div>
    </div>
  );
};

export default MonitorCharacter;