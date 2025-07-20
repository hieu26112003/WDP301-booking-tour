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
} from "react-icons/fa";
import "../Admin/components/index.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">Staff Panel</div>

      <ul>
        <SidebarItem to="/staff" icon={<FaTachometerAlt />} label="Dashboard" />
        <SidebarItem to="/staff/chat" icon={<FaCommentDots />} label="Inbox" />
        <SidebarItem
          to="/staff/guides"
          icon={<FaBook />}
          label="Manage Guide"
        />
        <SidebarItem
          to="/staff/bookings"
          icon={<FaBook />}
          label="Manage Tour Bookings"
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

      <div className="footer">© 2025 Staff Dashboard</div>
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
