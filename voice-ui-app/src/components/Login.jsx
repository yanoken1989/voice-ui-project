import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  // API URLを環境変数から取得（他のコンポーネントと同様）
  const API_URL = process.env.REACT_APP_API_URL || '';

  const handleLogin = async () => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user_id", data.user_id);
      alert("ログイン成功！");
      onLogin();
    } else {
      alert("ログイン失敗：" + data.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>ログイン</h2>
      <input
        type="text"
        placeholder="店舗ID（例：b001）"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={styles.input}
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleLogin} style={styles.button}>ログイン</button>
    </div>
  );
};

const styles = {
  // スタイル定義は変更なし
};

export default Login;