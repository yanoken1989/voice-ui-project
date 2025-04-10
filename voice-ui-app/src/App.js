import React from "react";
import ProductionForm from "./components/ProductionForm"; // ← 音声入力UI
import HistoryList from "./components/HistoryList";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div>
      <Toaster position="top-center" />
      <main className="max-w-xl mx-auto py-8 px-4">
        <h1 className="text-xl font-bold mb-6">ようこそ、ベーカリーさん！</h1>

        <ProductionForm /> {/* ← ✅ 音声入力＋保存ボタンを復活！ */}
        <HistoryList />    {/* ← 履歴一覧・編集付き */}
      </main>
    </div>
  );
}

export default App;
