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
import StaffComment from "../pages/Staff/StaffComment";
import Guide from "../pages/User/Guide";
import ManageGuide from "../pages/Staff/ManageGuide";
import AboutUs from "../components/About/About";
import Contact from "../components/Contact/ContactPage";
import TourDetails from "../pages/User/TourDetails";
import ListTour from "../pages/User/ListTour";
import TourDetail from "../pages/Admin/components/TourDetail";
import MyBookings from "../pages/User/MyBookings";
import StaffBookings from "../pages/Staff/StaffBooking";
import CallbackList from "../pages/Staff/CallbackList";
import FeedbackList from "../pages/Staff/FeedbackList";
import GuideDetail from "../pages/User/GuideDetail";
import NotificationList from "../components/Notification/Notification";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cam-nang/guide/:id" element={<GuideDetail />} />
      <Route path="/cam-nang/:slug" element={<CamNang />} />
      <Route path="/cam-nang" element={<CamNang />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/tours/:id" element={<TourDetails />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-password/:token" element={<ResetPasswordConfirm />} />
      <Route path="/Guide" element={<Guide />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/tours/" element={<ListTour />} />
      
      <Route path="/tours/filter/:slug" element={<ListTour />} />

      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/notifications" element={<NotificationList />} />
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
        path="/staff/comment"
        element={
          <StaffLayout>
            <StaffComment />
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

      <Route
        path="/staff/bookings"
        element={
          <StaffLayout>
            <StaffBookings />
          </StaffLayout>
        }
      />

      <Route
        path="/staff/feedbacks"
        element={
          <StaffLayout>
            <FeedbackList />
          </StaffLayout>
        }
      />

      <Route
        path="/staff/callbacks"
        element={
          <StaffLayout>
            <CallbackList />
          </StaffLayout>
        }
      />
    </Routes>
  );
};

export default Routers;
