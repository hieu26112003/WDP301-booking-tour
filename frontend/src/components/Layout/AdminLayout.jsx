import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../pages/Admin/components/Sidebar";
import "../../styles/defaultLayout.css";

const DefaultLayout = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
};

export default DefaultLayout;
