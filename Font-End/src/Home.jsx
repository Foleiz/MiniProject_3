import React, { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./pages/useAuth";
import "./css/index.css"; // เปลี่ยนมาใช้ index.css

const menuCategories = [
  {
    title: "ระบบบริหารสิทธิ์ผู้ใช้",
    items: [
      {
        label: "การจัดการพนักงานและผู้ใช้",
        path: "/manage-employees-users",
        permission: "CanManageEmployee",
      },
      {
        label: "การจัดการสิทธิ์",
        path: "/manage-roles",
        permission: "CanManagePermissions",
      },
    ],
  },
  {
    title: "ระบบการเดินรถ",
    items: [
      {
        label: "จัดการเส้นทาง",
        path: "/manage-routes",
        permission: "CanManageRoutes",
      },
      {
        label: "จัดตารางคนขับ",
        path: "/driver-schedule",
        permission: "CanManageDriver",
      },
      {
        label: "ข้อมูลรถ",
        path: "/vehicle-info",
        permission: "CanManageRoutes",
      },
      {
        label: "ประเภทรถ",
        path: "/vehicle-type",
        permission: "CanManageRoutes",
      },
    ],
  },
  {
    title: "รายงาน",
    items: [
      { label: "ข้อมูลรายงาน", path: "/report", permission: "CanViewReports" },
    ],
  },
];

export default function Home() {
  const { user, permissions, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/staff");
    }
  }, [isLoggedIn, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/staff");
  };

  const hasPermission = (perm) => permissions?.includes(perm) ?? false;

  if (!isLoggedIn) {
    return null; // หรือแสดงหน้า Loading
  }

  return (
    <div className="container">
      <nav className="menu-main">
        <div className="logo">Shuttle Bus</div>
        {user && (
          <div className="profile-header">
            <div className="profile-icon-header">👤</div>
            <div className="profile-details">
              <span className="profile-username">{user.username}</span>
              <span className="profile-department">{user.department}</span>
            </div>
          </div>
        )}
        {menuCategories.map((category) => {
          const visibleItems = category.items.filter((item) =>
            hasPermission(item.permission)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={category.title} className="menu-sub">
              <div className="menu-title">{category.title}</div>
              <ul>
                {visibleItems.map(({ label, path }) => (
                  <li key={path}>
                    <NavLink to={path} className="menu-btn">
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <div className="menu-sub1">
          <button onClick={handleLogout} className="logout-btn">
            ออกจากระบบ
          </button>
        </div>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
