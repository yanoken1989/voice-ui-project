import axios from 'axios';

// 本番環境と開発環境で異なるベースURLを設定
const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://voice-ui-project-api.onrender.com' // RenderにデプロイしているバックエンドのURL
  : 'http://localhost:3001'; // 開発環境用

  const instance = axios.create({
    baseURL: 'https://voice-ui-project-api.onrender.com', // `/api`を含めない
    // 認証情報の設定に応じて
    // withCredentials: true または false
});

export default instance;