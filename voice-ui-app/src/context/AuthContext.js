import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 認証状態の確認
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/api/auth/me', { withCredentials: true });
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error('認証状態の確認中にエラーが発生しました:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // ログアウト処理
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setCurrentUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('ログアウト中にエラーが発生しました:', error);
    }
  };

  const value = {
    currentUser,
    loading,
    logout,
    setCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};