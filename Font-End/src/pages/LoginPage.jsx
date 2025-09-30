import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import "../css/LoginPage.css";

const API_BASE_URL = "http://localhost:3000";

export default function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/"); // ถ้าล็อกอินอยู่แล้ว ให้ไปหน้าหลัก
    }
  }, [isLoggedIn, navigate]);

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
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.message || err.error || "Login failed");
        return;
      }

      const data = await res.json();
      const { user, permissions } = data;

      if (!permissions || permissions.length === 0) {
        setErrorMsg("บัญชีผู้ใช้ไม่มีสิทธิ์เข้าถึงระบบ");
        return;
      }

      // Use the login function from context
      login(user, permissions);

      // Redirect to Home
      navigate("/");
    } catch (err) {
      console.error(err);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  // ไม่ต้องแสดงฟอร์มถ้าผู้ใช้ล็อกอินอยู่แล้ว (รอ useEffect ทำงาน)
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>staff Login</h2>
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
