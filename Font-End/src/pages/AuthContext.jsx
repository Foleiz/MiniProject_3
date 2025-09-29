import React, { createContext, useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:3000";
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    permissions: [],
    isLoggedIn: false,
  });

  useEffect(() => {
    // โหลดข้อมูลจาก localStorage เมื่อเปิดแอป
    const storedUser = localStorage.getItem("user");
    const storedPermissions = localStorage.getItem("permissions");
    if (storedUser && storedPermissions) {
      setAuth({
        user: JSON.parse(storedUser),
        permissions: JSON.parse(storedPermissions),
        isLoggedIn: true,
      });
    }
  }, []);

  const login = (userData, perms) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("permissions", JSON.stringify(perms));
    setAuth({ user: userData, permissions: perms, isLoggedIn: true });
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    setAuth({ user: null, permissions: [], isLoggedIn: false });
  };

  // ฟังก์ชันสำหรับ refresh ข้อมูลสิทธิ์
  const refreshPermissions = async () => {
    if (!auth.user?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh/${auth.user.id}`);
      if (res.ok) {
        const { permissions: newPermissions } = await res.json();
        localStorage.setItem("permissions", JSON.stringify(newPermissions));
        setAuth((prev) => ({ ...prev, permissions: newPermissions }));
        console.log("Permissions refreshed successfully!");
      } else {
        console.error("Failed to refresh permissions");
      }
    } catch (error) {
      console.error("Error refreshing permissions:", error);
    }
  };

  const value = { ...auth, login, logout, refreshPermissions };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
