import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../pages/Staff/Sidebar"; // Sidebar riêng cho staff
import "../../styles/defaultLayout.css";
const StaffLayout = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role !== "staff") {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user || user.role !== "staff") {
    return null;
  }

  return (
    <div className="staff-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
};

export default StaffLayout;
