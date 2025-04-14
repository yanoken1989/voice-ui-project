const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// 会員登録
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 入力検証
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'すべてのフィールドを入力してください' });
    }

    // 既存ユーザーの確認
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'そのユーザー名またはメールアドレスは既に使用されています' });
    }

    // パスワードのハッシュ化
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ユーザー作成
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ 
      message: 'ユーザーが正常に登録されました',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('登録エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ログイン
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ユーザー検索
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'メールアドレスまたはパスワードが無効です' });
    }

    // パスワード検証
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'メールアドレスまたはパスワードが無効です' });
    }

    // JWTトークン生成
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // HTTPOnly Cookieでトークンを設定
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1日
    });

    res.status(200).json({
      message: 'ログイン成功',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ログアウト
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'ログアウト成功' });
});

// 現在のユーザー情報を取得
router.get('/me', authenticateToken, (req, res) => {
  res.status(200).json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

module.exports = router;