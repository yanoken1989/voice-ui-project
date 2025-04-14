import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <h1>ダッシュボード</h1>
      <p>ようこそ、{currentUser.username}さん！</p>
      
      <div className="user-info">
        <h3>ユーザー情報</h3>
        <p><strong>ユーザー名:</strong> {currentUser.username}</p>
        <p><strong>メールアドレス:</strong> {currentUser.email}</p>
      </div>
      
      <button onClick={logout} className="logout-button">
        ログアウト
      </button>
    </div>
  );
};

export default Dashboard;