import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProductionForm from "./components/ProductionForm"; // 音声入力UI
import HistoryList from "./components/HistoryList";
import { Toaster } from "react-hot-toast";
import './styles/auth.css';

function Dashboard() {
  return (
    <div>
      <Toaster position="top-center" />
      <main className="max-w-xl mx-auto py-8 px-4">
        <h1 className="text-xl font-bold mb-6">ようこそ、ベーカリーさん！</h1>

        <ProductionForm /> {/* 音声入力＋保存ボタン */}
        <HistoryList />    {/* 履歴一覧・編集付き */}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;