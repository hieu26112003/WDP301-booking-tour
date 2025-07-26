import { Link } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";

import {
  FaTachometerAlt,
  FaTags,
  FaUsers,
  FaCommentDots,
  FaMapMarkedAlt,
  FaCalendarCheck,
  FaBook,
} from "react-icons/fa";
import "./index.css";
const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">Admin</div>

      <ul>
        <SidebarItem to="/admin" icon={<FaTachometerAlt />} label="Thống Kê" />
        <SidebarItem
          to="/admin/user"
          icon={<FaUsers />}
          label="Quản Lý Người Dùng"
        />
        <SidebarItem
          to="/admin/staff"
          icon={<FaUsers />}
          label="Quản Lý Nhân Viên"
        />
        <SidebarItem
          to="/admin/booking"
          icon={<FaCalendarCheck />}
          label="Quản Lý Đặt Tour"
        />
        {/* <SidebarItem
          to="/admin/hotels"
          icon={<FaCommentDots />}
          label="Manage Hotel"
        /> */}
        <SidebarItem
          to="/admin/tours"
          icon={<FaMapMarkedAlt />}
          label="Quản Lý Tour"
        />
        <SidebarItem
          to="/staff/guides"
          icon={<FaBook />}
          label="Quản Lý Cẩm Năng"
        />
        <SidebarItem
          to="/admin/categories"
          icon={<FaTags />}
          label="Quản Lý Danh Mục Tour"
        />
        <SidebarItem
          to="/admin/category-guides"
          icon={<FaBookOpen />}
          label="Danh Mục Hướng Dẫn"
        />
      </ul>

      <div className="footer">© 2025 Admin</div>
    </div>
  );
};

const SidebarItem = ({ to, icon, label }) => {
  return (
    <li>
      <Link to={to}>
        <span>{icon}</span>
        {label}
      </Link>
    </li>
  );
};

export default Sidebar;
