import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://localhost:3001/login", {
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
  container: {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "2rem",
    textAlign: "center"
  },
  heading: {
    fontSize: "1.5rem",
    marginBottom: "1rem"
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1.1rem",
    marginBottom: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: "1rem",
    fontSize: "1.2rem",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px"
  }
};

export default Login;
