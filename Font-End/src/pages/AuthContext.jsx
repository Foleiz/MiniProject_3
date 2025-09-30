import React, { useState, useEffect } from "react";
import { AuthContext } from "./useAuth";

const API_BASE_URL = "http://localhost:3000";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    permissions: [],
    isLoggedIn: false,
  });
  const [loading, setLoading] = useState(true); // เพิ่ม state สำหรับ loading

  useEffect(() => {
    // โหลดข้อมูลจาก localStorage เมื่อเปิดแอป
    try {
      const storedUser = localStorage.getItem("user");
      const storedPermissions = localStorage.getItem("permissions");
      if (storedUser && storedPermissions) {
        setAuth({
          user: JSON.parse(storedUser),
          permissions: JSON.parse(storedPermissions),
          isLoggedIn: true,
        });
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      // หากข้อมูลใน localStorage มีปัญหา ให้ทำการ logout เพื่อเคลียร์ข้อมูล
      logout();
    } finally {
      setLoading(false); // ตั้งค่า loading เป็น false เมื่อตรวจสอบเสร็จสิ้น
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

  const value = { ...auth, loading, login, logout, refreshPermissions }; // ส่ง loading ไปกับ context

  // แสดงหน้า loading ขณะที่กำลังตรวจสอบข้อมูล
  if (loading) {
    return <div>Loading...</div>; // หรือจะสร้างเป็น Component สวยๆ ก็ได้
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
