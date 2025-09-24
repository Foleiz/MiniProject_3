import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/LoginPage.css";

const API_BASE_URL = "http://localhost:3000";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username || !password) {
      setErrorMsg("กรุณากรอก Username และ Password");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.message || "Login failed");
        return;
      }

      const data = await res.json();
      const { user, permissions } = data;

      if (!permissions || permissions.length === 0) {
        setErrorMsg("บัญชีผู้ใช้ไม่มีสิทธิ์เข้าถึงระบบ");
        return;
      }

      // Save user info in localStorage
      sessionStorage.setItem("user", JSON.stringify({ ...user, permissions }));

      // Redirect to Home
      navigate("/");
    } catch (err) {
      console.error(err);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Staff Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && <div className="error-msg">{errorMsg}</div>}

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
