import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // パスワード確認チェック
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      setSuccess('アカウントが作成されました！ログインページに移動します...');
      // 成功後、3秒後にログインページへリダイレクト
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || '登録中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>会員登録</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">ユーザー名</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="8"
          />
          <small>パスワードは8文字以上にしてください</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">パスワード（確認）</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength="8"
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? '登録中...' : '登録する'}
        </button>
      </form>
      
      <div className="auth-links">
        <p>
          すでにアカウントをお持ちの方は <Link to="/login">ログイン</Link> してください
        </p>
      </div>
    </div>
  );
};

export default Register;