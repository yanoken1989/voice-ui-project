// index.js（Google Sheets連携 + Whisper + 認証 + 一括保存対応）
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const bcrypt = require("bcrypt");
const FormData = require("form-data");

const {
  getUsersFromSheet,
  appendProductionData,
  getProductionRecordsByUser,
  updateProductionQuantity,
} = require("./googleSheet");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ============================
// 🔐 ログイン認証
// ============================
app.post("/login", async (req, res) => {
  const { user_id, password } = req.body;

  try {
    const users = await getUsersFromSheet();
    const user = users.find((u) => u.user_id === user_id);

    if (!user) {
      console.log(`❌ ユーザー見つからず: ${user_id}`);
      return res.status(401).json({ message: "認証に失敗しました" });
    }

    const passwordFromSheet = user.password || user.password_hash;
    const isValid = passwordFromSheet.startsWith("$2b$")
      ? await bcrypt.compare(password, passwordFromSheet)
      : password === passwordFromSheet;

    if (!isValid) {
      console.log(`❌ パスワード不一致: ${user_id}`);
      return res.status(401).json({ message: "パスワードが違います" });
    }

    console.log(`✅ ログイン成功: ${user_id}`);
    res.json({ user_id });
  } catch (error) {
    console.error("🔴 ログインエラー:", error);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

// ============================
// 💾 単件保存
// ============================
app.post("/save", async (req, res) => {
  const { user_id, date, item, quantity } = req.body;

  if (!user_id || !date || !item || !quantity) {
    return res.status(400).json({ message: "不正なデータです" });
  }

  try {
    await appendProductionData({ user_id, date, item, quantity });
    res.json({ message: "保存完了" });
  } catch (error) {
    console.error("❌ 保存失敗:", error);
    res.status(500).json({ message: "保存に失敗しました", error: error.message });
  }
});

// ============================
// 📦 複数レコード保存（bulk）
// ============================
app.post("/records/bulk", async (req, res) => {
  const { records } = req.body;

  if (!Array.isArray(records)) {
    return res.status(400).json({ message: "配列形式で送ってください" });
  }

  try {
    for (const record of records) {
      const { user_id, date, item, quantity } = record;
      if (user_id && date && item && quantity) {
        await appendProductionData({ user_id, date, item, quantity });
      }
    }
    res.json({ message: "一括保存完了" });
  } catch (error) {
    console.error("❌ 一括保存失敗:", error);
    res.status(500).json({ message: "一括保存に失敗しました", error: error.message });
  }
});

// ============================
// 📚 履歴取得
// ============================
app.get("/records", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "user_idが必要です" });
  }

  try {
    const records = await getProductionRecordsByUser(user_id);
    res.json(records);
  } catch (error) {
    console.error("❌ 履歴取得失敗:", error);
    res.status(500).json({ message: "履歴の取得に失敗しました" });
  }
});

// ============================
// ✏️ 数量編集（更新）
// ============================
app.post("/records/update", async (req, res) => {
  const { user_id, date, item, quantity } = req.body;

  if (!user_id || !date || !item || typeof quantity !== "number") {
    return res.status(400).json({ message: "不正なデータです" });
  }

  try {
    const result = await updateProductionQuantity({ user_id, date, item, quantity });

    if (result?.updated) {
      res.json({ message: "更新完了" });
    } else {
      res.status(404).json({ message: "更新対象が見つかりません" });
    }
  } catch (error) {
    console.error("❌ 更新失敗:", error);
    res.status(500).json({ message: "更新に失敗しました", error: error.message });
  }
});

// ============================
// 🎙️ Whisper音声→テキスト変換
// ============================
const upload = multer({ storage: multer.memoryStorage() });

app.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const formData = new FormData();
    formData.append("file", req.file.buffer, "voice.webm");
    formData.append("model", "whisper-1");

    const whisperRes = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...formData.getHeaders(),
        },
      }
    );

    const text = whisperRes.data.text;
    console.log("📝 Whisper出力:", text);

    // パン名と個数の抽出
    const pattern =
      /([\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ーa-zA-Z0-9]+?)\s*(\d{1,3})個(?:、|。|\s|$)/gu;
    const matches = [...text.matchAll(pattern)];

    const items = matches.map((m) => ({
      item: m[1].trim(),
      quantity: parseInt(m[2], 10),
    }));

    res.json({ items, text });
  } catch (err) {
    console.error("Whisper API error:", err.message);
    res.status(500).json({ error: "音声の変換に失敗しました" });
  }
});

// ============================
// 🚀 サーバー起動
// ============================
app.listen(PORT, () => {
  console.log(`✅ サーバー起動完了: http://localhost:${PORT}`);
});
