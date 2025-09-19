import { NavLink, Outlet } from "react-router-dom";
import "./index.css";

export default function Home() {
  return (
    <div className="container">
      {/* Sidebar */}
      <div className="menu-main">
        <h1 className="logo">Shuttle Bus</h1>

        <div className="menu-sub">
          <p className="menu-title">ระบบบริหารสิทธิผู้ใช้งาน</p>
          <ul>
            <li>
              <NavLink to="manage-user" className="menu-btn">
                การจัดการสิทธิ์
              </NavLink>
            </li>
            <li>
              <NavLink to="manage-roles" className="menu-btn">
                การกำหนดบทบาท
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="menu-sub">
          <p className="menu-title">ระบบการเดินรถ</p>
          <ul>
            <li>
              <NavLink to="routes-manage" className="menu-btn">
                การจัดการเส้นทาง
              </NavLink>
            </li>
            <li>
              <NavLink to="driver-schedule" className="menu-btn">
                การจัดตารางคนขับ
              </NavLink>
            </li>
            <li>
              <NavLink to="vehicle-info" className="menu-btn">
                ข้อมูลรถ
              </NavLink>
            </li>
            <li>
              <NavLink to="vehicle-type" className="menu-btn">
                ประเภทรถ
              </NavLink>
            </li>
          </ul>
        </div>

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

        <div className="menu-sub">
          <button className="logout-btn">ออกจากระบบ</button>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        <h2>🏠 หน้าหลักระบบ Shuttle Bus</h2>
        <p>เลือกเมนูจากด้านซ้ายเพื่อจัดการระบบ</p>
        <Outlet />
      </div>
    </div>
  );
}
