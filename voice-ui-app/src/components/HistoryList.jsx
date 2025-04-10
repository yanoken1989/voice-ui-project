import React, { useEffect, useState } from "react";
import { RecordRow } from "./history/RecordRow";
import toast from "react-hot-toast";

const HistoryList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // API URLを環境変数から取得（ローカル開発時はフォールバック値を使用）
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchRecords = async () => {
      const user_id = localStorage.getItem("user_id");

      try {
        const res = await fetch(`${API_URL}/records?user_id=${user_id}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setRecords(data);
        } else {
          console.warn("⚠️ recordsが配列でない:", data);
          setRecords([]);
        }
      } catch (err) {
        console.error("履歴取得エラー:", err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [API_URL]);

  const handleSave = async (id, quantity, record) => {
    try {
      const res = await fetch(`${API_URL}/records/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: record.item,
          date: record.date,
          user_id: record.user_id,
          quantity,
        }),
      });

      if (!res.ok) throw new Error("保存失敗");

      setRecords((prev) =>
        prev.map((r) =>
          r.date === record.date && r.item === record.item
            ? { ...r, quantity }
            : r
        )
      );

      toast.success("保存しました！");
    } catch (err) {
      console.error("保存失敗:", err);
      toast.error("保存に失敗しました");
    }
  };

  if (loading)
    return <p className="text-center text-gray-500">読み込み中...</p>;
  if (records.length === 0)
    return <p className="text-center text-gray-400">履歴がありません。</p>;

  const grouped = records.reduce((acc, record) => {
    if (!acc[record.date]) acc[record.date] = [];
    acc[record.date].push(record);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-center">📋 保存履歴（日付別）</h2>

      {Object.entries(grouped)
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .map(([date, entries]) => {
          const total = entries.reduce((sum, r) => sum + Number(r.quantity), 0);

          return (
            <div
              key={date}
              className="bg-white rounded-xl shadow-md p-4 space-y-3"
            >
              <h3 className="text-base font-semibold text-blue-700">
                📅 {date}（合計 {total}個）
              </h3>
              <div className="divide-y divide-gray-100">
                {entries.map((record, index) => (
                  <RecordRow
                    key={`${record.date}-${record.item}-${index}`}
                    record={{ ...record, id: `${record.date}-${record.item}-${index}` }}
                    onSave={handleSave}
                  />
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default HistoryList;