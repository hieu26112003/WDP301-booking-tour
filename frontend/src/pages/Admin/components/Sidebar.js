import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaTags,
  FaUsers,
  FaCommentDots,
  FaMapMarkedAlt,
} from "react-icons/fa";
import "./index.css";
const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="logo">Admin Panel</div>

      {/* Menu Items */}
      <ul>
        <SidebarItem to="/Admin" icon={<FaTachometerAlt />} label="Dashboard" />
        <SidebarItem
          to="/manage-accounts"
          icon={<FaUsers />}
          label="Manage Accounts"
        />
        <SidebarItem
          to="/manage-hotels"
          icon={<FaCommentDots />}
          label="Manage Hotel"
        />
        <SidebarItem
          to="/manage-tours"
          icon={<FaMapMarkedAlt />}
          label="Manage Tours"
        />
        <SidebarItem
          to="/manage-categories"
          icon={<FaTags />}
          label="Manage Categories"
        />
      </ul>

      {/* Footer */}
      <div className="footer">© 2025 Admin Dashboard</div>
    </div>
  );
};

// Component cho từng mục menu
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
