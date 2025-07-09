import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/User/Home";
import Login from "../pages/User/Login";
import Register from "../pages/User/Register";
import ManagerUser from "../pages/Admin/components/managerAccount";

import AdminLayout from "../components/Layout/AdminLayout";
import Profile from "../pages/User/Profile";
import ChangePassword from "../pages/User/ChangePassword";
import ResetPassword from "../pages/User/ResetPassword";
import ResetPasswordConfirm from "../pages/User/ResetPasswordConfirm";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-password/:token" element={<ResetPasswordConfirm />} />
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <h2>Admin!</h2>
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
    </Routes>
  );
};

export default Routers;
