import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/User/Home";
import Login from "../pages/User/Login";
import Register from "../pages/User/Register";
import CamNang from "../pages/User/CamNang";
import ManagerUser from "../pages/Admin/components/managerAccount";

import ManageStaff from "../pages/Admin/components/ManageStaff"; // Thêm import ManageStaff


import AdminLayout from "../components/Layout/AdminLayout";
import Profile from "../pages/User/Profile";
import ChangePassword from "../pages/User/ChangePassword";
import ResetPassword from "../pages/User/ResetPassword";
import ResetPasswordConfirm from "../pages/User/ResetPasswordConfirm";
import ManageTours from "../pages/Admin/components/ManageTours";
import ManageCategories from "../pages/Admin/components/ManageCategories";
import StaffLayout from "../components/Layout/StaffLayout";
import StaffChatPage from "../pages/Staff/StaffChatPage";
import Guide from "../pages/User/Guide";
import ManageGuide from "../pages/Staff/ManageGuide";
import AboutUs from "../components/About/About";
import Contact from "../components/Contact/Contact";
import TourDetails from "../pages/User/TourDetails"


import TourDetail from "../pages/Admin/components/TourDetail";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cam-nang" element={<CamNang />} />
      <Route path="/cam-nang/:slug" element={<CamNang />} />
      <Route path="/login" element={<Login />} />
      <Route path="/tours/:id" element={<TourDetails/>} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-password/:token" element={<ResetPasswordConfirm />} />
      <Route path="/Guide" element={<Guide />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      
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
      {/* <Route
        path="/admin/hotels"
        element={
          <AdminLayout>
            <ManageHotels />
          </AdminLayout>
        }
      /> */}
      <Route
        path="/tour-detail/:id"
        element={
          <AdminLayout>
            <TourDetail />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/tours"
        element={
          <AdminLayout>
            <ManageTours />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <AdminLayout>
            <ManageStaff />
          </AdminLayout>
        }
      />
      <Route
        path="/staff/guides"
        element={
          <StaffLayout>
            <ManageGuide />
          </StaffLayout>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminLayout>
            <ManageCategories />
          </AdminLayout>
        }
      />
      <Route
        path="/staff"
        element={
          <StaffLayout>
            <h1>Dashboard</h1>
          </StaffLayout>
        }
      />
      <Route
        path="/staff/chat"
        element={
          <StaffLayout>
            <StaffChatPage />
          </StaffLayout>
        }
      />
    </Routes>
  );
};

export default Routers;

