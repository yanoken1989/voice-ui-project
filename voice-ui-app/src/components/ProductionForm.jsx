import React, { useState } from "react";

const ProductionForm = () => {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // 'YYYY-MM-DD'
  });

  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  
  // API URLを環境変数から取得
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const handleVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");
        formData.append("model", "whisper-1");
        formData.append("language", "ja");

        try {
          // 直接OpenAI APIを呼び出す代わりにバックエンドのエンドポイントを使用
          const res = await fetch(`${API_URL}/transcribe`, {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          setText(data.text || ""); // 認識されたテキストを反映
        } catch (err) {
          console.error("Whisper API エラー:", err);
          alert("音声認識に失敗しました");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach((track) => track.stop());
      }, 10000); // 10秒で録音停止
    } catch (err) {
      console.error("録音エラー:", err);
      alert("マイクの利用が許可されていません");
    }
  };

  const handleSave = async () => {
    const user_id = localStorage.getItem("user_id") || "demo_user";
    const items = [];

    const cleanedText = text.replace(/、|。|\n/g, " "); // 読点や改行をスペースに
    const pattern =
      /([\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ーa-zA-Z0-9]+?)\s*([0-9０-９一二三四五六七八九十百千万〇]+)[個ヶけケ]?/gu;

    let match;
    while ((match = pattern.exec(cleanedText)) !== null) {
      const item = match[1].trim();
      const rawQty = match[2].trim();
      const quantity = parseJapaneseNumber(rawQty);
      if (item && !isNaN(quantity)) {
        items.push({ item, quantity, date, user_id });
      }
    }

    if (items.length === 0) {
      alert("パン名と個数のセットが見つかりませんでした");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/records/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: items }),
      });

      if (!res.ok) throw new Error("保存に失敗しました");

      alert("保存完了！");
      setText("");
    } catch (err) {
      console.error("保存エラー:", err);
      alert("保存できませんでした");
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mb-6 space-y-4">
      {/* 🔴 録音中メッセージ */}
      {isRecording && (
        <div className="text-center py-2 px-4 bg-red-100 text-red-800 rounded-lg shadow animate-pulse">
          🎙️ 録音中です... しばらくお待ちください
        </div>
      )}

      {/* 製造日 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">製造日</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* 音声入力テキスト */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">音声入力結果</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg text-sm"
          placeholder="例: カレーパン 30個 アンパンマン 20個"
        />
      </div>

      {/* ボタンエリア */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleVoiceInput}
          disabled={isRecording}
          className={`flex-1 py-2 rounded-lg text-sm transition ${
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
          }`}
        >
          {isRecording ? "録音中..." : "🎤 音声で入力"}
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition"
        >
          💾 保存
        </button>
      </div>
    </div>
  );
};

export default ProductionForm;

function parseJapaneseNumber(str) {
  const zenkaku = "０１２３４５６７８９";
  const hankaku = "0123456789";
  str = str.replace(/[０-９]/g, (s) => hankaku[zenkaku.indexOf(s)]);

  const kanjiMap = {
    一: 1, 二: 2, 三: 3, 四: 4, 五: 5,
    六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
    百: 100, 千: 1000, 万: 10000, 〇: 0
  };

  if (/^[一二三四五六七八九十百千万〇]+$/.test(str)) {
    let num = 0, temp = 0;
    for (const char of str) {
      const val = kanjiMap[char];
      if (val >= 10) {
        temp = temp === 0 ? 1 : temp;
        num += temp * val;
        temp = 0;
      } else {
        temp = temp * 10 + val;
      }
    }
    return num + temp;
  }

  return parseInt(str, 10);
}