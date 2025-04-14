const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ミドルウェア
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// MongoDB接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voice_ui_db')
  .then(() => console.log('MongoDB接続成功'))
  .catch(err => console.error('MongoDB接続エラー:', err));

// ルート
app.get('/', (req, res) => {
  res.send('APIサーバーが動作中です');
});

// サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`サーバーがポート ${PORT} で起動しました`));

// ルート
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('APIサーバーが動作中です');
});