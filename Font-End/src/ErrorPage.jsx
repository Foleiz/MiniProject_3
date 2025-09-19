import React from "react";
import Navbar from "./Navbar";
import pc1 from "./assets/img1.jpg";

function ErrorPage() {
  return (
    <>
      <Navbar />
      <div>
        <h2>หน้านี้ไม่พร้อมใช้งานในขณะนี้</h2>
        <img src={pc1} />
        <p>Oops! The page you're looking for doesn't exist.</p>
      </div>
    </>
  );
}

export default ErrorPage;
