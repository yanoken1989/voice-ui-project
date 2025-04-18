import axios from 'axios';

// 開発環境と本番環境で異なるURLを使用
const baseURL = process.env.NODE_ENV === 'production' 
  ? '' // 本番環境では相対パスを使用
  : 'http://localhost:3001'; // 開発環境では正しいポート番号を使用

const instance = axios.create({
  baseURL,
  withCredentials: true
});

export default instance;