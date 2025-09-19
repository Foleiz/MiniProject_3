import React from "react";
import "./Navbar.css"; // นําเข้า Navbar.css สําหรับการตกแต่ง
import { Link } from "react-router-dom"; //เปลี่ยนมาใช้ link เพื่อให้สามารถส่งค่าข้ามฟอร์มได้ปกติ

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Menu Shop</div>
      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/bmical">BMI Calculator</Link>
        </li>
        <li>
          <Link to="/gradecal">GradeCalculator</Link>
        </li>
        <li>
          <Link to="/mytable">My Table</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
        <li>
          <Link to="/Detail">Etc</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
