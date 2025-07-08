// src/components/Layout/DefaultLayout.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../pages/Admin/components/Sidebar';

const DefaultLayout = ({ children }) => {
   const navigate = useNavigate();

   // Giả sử bạn lưu user sau khi đăng nhập vào localStorage
   const user = JSON.parse(localStorage.getItem("user"));

   useEffect(() => {
      if (!user || user.role !== "admin") {
         // Nếu chưa đăng nhập hoặc không phải admin → chuyển hướng
         navigate("/login");
      }
   }, [user, navigate]);

   if (!user || user.role !== "admin") {
      return null; // hoặc <div>Not authorized</div> nếu muốn hiển thị gì đó
   }

   return (
      <div className="d-flex">
         <Sidebar />
         <div className="flex-grow-1 p-4" style={{ background: "#f9f9f9", minHeight: "100vh" }}>
            {children}
         </div>
      </div>
   );
};

export default DefaultLayout;
