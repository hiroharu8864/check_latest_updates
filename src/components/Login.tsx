import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkPasswordStrength } from '../utils/crypto';
import './Login.css';

const Login: React.FC = () => {
  const { login, setInitialPassword, hasPassword } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
    isValid: boolean;
  } | null>(null);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (!hasPassword) {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (hasPassword) {
        // ログイン処理
        const success = await login(username, password);
        if (!success) {
          setError('ユーザー名またはパスワードが正しくありません');
        }
      } else {
        // 初期パスワード設定
        if (password !== confirmPassword) {
          setError('パスワードが一致しません');
          setLoading(false);
          return;
        }

        if (!passwordStrength?.isValid) {
          setError('パスワードの強度が不十分です');
          setLoading(false);
          return;
        }

        if (!username.trim()) {
          setError('ユーザー名を入力してください');
          setLoading(false);
          return;
        }

        await setInitialPassword(username, password);
      }
    } catch (err) {
      setError('処理中にエラーが発生しました');
      // console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return '#dc3545';
      case 2:
        return '#fd7e14';
      case 3:
        return '#ffc107';
      case 4:
      case 5:
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getPasswordStrengthText = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return '弱い';
      case 2:
        return '普通';
      case 3:
        return '良い';
      case 4:
      case 5:
        return '強い';
      default:
        return '';
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔐</h1>
          <h2>
            {hasPassword ? '更新確認君ベータ' : '初期設定'}
          </h2>
          <p>
            {hasPassword 
              ? 'ログインが必要です' 
              : 'ユーザー名とパスワードを設定してください'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>ユーザー名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ユーザー名を入力"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="パスワードを入力"
              required
              disabled={loading}
            />
            
            {!hasPassword && passwordStrength && password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor(passwordStrength.score)
                    }}
                  />
                </div>
                <div className="strength-text">
                  強度: <span style={{ color: getPasswordStrengthColor(passwordStrength.score) }}>
                    {getPasswordStrengthText(passwordStrength.score)}
                  </span>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="strength-feedback">
                    {passwordStrength.feedback.map((feedback, index) => (
                      <li key={index}>{feedback}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {!hasPassword && (
            <div className="form-group">
              <label>パスワード確認</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="パスワードを再度入力"
                required
                disabled={loading}
              />
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading || (!hasPassword && !passwordStrength?.isValid)}
          >
            {loading ? '処理中...' : hasPassword ? 'ログイン' : '設定完了'}
          </button>
        </form>

        {!hasPassword && (
          <div className="setup-info">
            <h3>セキュリティについて</h3>
            <ul>
              <li>パスワードは暗号化してブラウザに保存されます</li>
              <li>他のユーザーからはアクセスできません</li>
              <li>パスワードは8文字以上で設定してください</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;