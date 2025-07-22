import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../pages/Staff/Sidebar"; // Sidebar riêng cho staff

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
    <div className="d-flex">
      <Sidebar />
      <div
        className="flex-grow-1 p-4"
        style={{ background: "#f4f6f9", minHeight: "100vh" }}
      >
        {children}
      </div>
    </div>
  );
};

export default StaffLayout;
