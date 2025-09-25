import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./css/index.css";
import { useEffect, useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (!stored) {
      navigate("/staff"); // redirect to login if not logged in
      return;
    }
    setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/staff");
  };

  if (!user) return null;

  const hasPermission = (perm) => user.permissions?.includes(perm) ?? false;

  return (
    <div className="container">
      <div className="menu-main">
        <div className="profile-header">
          <div className="profile-icon-header">
            <span role="img" aria-label="user-icon">
              👤
            </span>
          </div>
          <div className="profile-details">
            <span className="profile-username">{user.username}</span>
            <span className="profile-department">
              {user.department || user.position}
            </span>
          </div>
        </div>

        {hasPermission("CanManagePermissions") ||
        hasPermission("CanManageEmployee") ||
        hasPermission("CanManageUsers") ? (
          <div className="menu-sub">
            <p className="menu-title">ระบบบริหารสิทธิผู้ใช้งาน</p>
            <ul>
              {hasPermission("CanManageUsers") && (
                <li>
                  <NavLink to="manage-employees-users" className="menu-btn">
                    ข้อมูลผู้ใช้งานในระบบ
                  </NavLink>
                </li>
              )}
              {hasPermission("CanManagePermissions") && (
                <li>
                  <NavLink to="manage-roles" className="menu-btn">
                    จัดการสิทธิ์
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        ) : null}

        {(hasPermission("CanManageRoutes") ||
          hasPermission("CanManageDriver") ||
          hasPermission("DriverPermission") ||
          hasPermission("CanManageReservations")) && (
          <div className="menu-sub">
            <p className="menu-title">ระบบการเดินรถ</p>
            <ul>
              {hasPermission("CanManageRoutes") && (
                <li>
                  <NavLink to="manage-routes" className="menu-btn">
                    จัดการเส้นทาง
                  </NavLink>
                </li>
              )}
              {hasPermission("CanManageDriver") && (
                <li>
                  <NavLink to="driver-schedule" className="menu-btn">
                    จัดตารางคนขับ
                  </NavLink>
                </li>
              )}
              {hasPermission("CanManageRoutes") && (
                <li>
                  <NavLink to="vehicle-info" className="menu-btn">
                    ข้อมูลรถ
                  </NavLink>
                </li>
              )}
              {hasPermission("CanManageRoutes") && (
                <li>
                  <NavLink to="vehicle-type" className="menu-btn">
                    ประเภทรถ
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        )}

        {hasPermission("CanViewReports") && (
          <div className="menu-sub">
            <p className="menu-title">รายงาน</p>
            <ul>
              <li>
                <NavLink to="report" className="menu-btn">
                  ข้อมูลรายงาน
                </NavLink>
              </li>
            </ul>
          </div>
        )}

        <div className="menu-sub1">
          <button className="logout-btn" onClick={handleLogout}>
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
