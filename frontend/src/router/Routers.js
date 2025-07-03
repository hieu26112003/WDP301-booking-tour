import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/User/Home";
import Admin from "../pages/Admin/components/Sidebar"
import ManagerUser from "../pages/Admin/components/managerAccount"

import AdminLayout from "../components/Layout/AdminLayout";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      {/* <Route path="/admin" element={<Admin />} /> */}
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <h2>Admin</h2> {/* Hoặc là một <h2>Dashboard</h2> tạm thời */}
          </AdminLayout>
        }
      />
      <Route
        path="/admin/user"
        element={
          <AdminLayout>
            <ManagerUser />
          </AdminLayout>
        }
      />
      {/* <Route path="/admin/user" element={<ManagerUser />} /> */}
    </Routes>
  );
};

export default Routers;
