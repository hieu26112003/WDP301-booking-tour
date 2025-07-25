// import React from "react";
// import { Link } from "react-router-dom";
import { FaBook } from "react-icons/fa";

// const Sidebar = () => {
//     return (
//         <div style={{ width: "200px", backgroundColor: "#fff", padding: "10px", borderRight: "1px solid #ddd" }}>
//             <h4>Nhân viên</h4>
//             <Link to="/staff/chat">💬 Hộp thư</Link>
//         </div>
//     );
// };

// export default Sidebar;
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaTags,
  FaUsers,
  FaCommentDots,
  FaMapMarkedAlt,
  FaComments
} from "react-icons/fa";
import "../Admin/components/index.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">Staff</div>

      <ul>
        {/* <SidebarItem to="/staff" icon={<FaTachometerAlt />} label="Dashboard" /> */}
        <SidebarItem to="/staff/chat" icon={<FaCommentDots />} label="Hộp Thư" />

        <SidebarItem
          to="/staff/bookings"
          icon={<FaBook />}
          label="Quản Lý Đặt Tour"
        />
        <SidebarItem
          to="/staff/feedbacks"
          icon={<FaBook />}
          label="Phản Hồi"
        />
        <SidebarItem
          to="/staff/callbacks"
          icon={<FaBook />}
          label="Yêu Cầu Gọi Lại"
        />
        <SidebarItem
          to="/staff/comment"
          icon={<FaComments />}
          label="Quản Lý Bình Luận"
        />


        {/* <SidebarItem
          to="/admin/tours"
          icon={<FaMapMarkedAlt />}
          label="Manage Tours"
        />
        <SidebarItem
          to="/admin/categories"
          icon={<FaTags />}
          label="Manage Categories"
        /> */}
      </ul>

      <div className="footer">© 2025 Staff</div>
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
