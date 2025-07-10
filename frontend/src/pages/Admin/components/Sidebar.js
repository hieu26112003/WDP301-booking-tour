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
      <div className="logo">Admin Panel</div>

      <ul>
        <SidebarItem to="/admin" icon={<FaTachometerAlt />} label="Dashboard" />
        <SidebarItem
          to="/admin/user"
          icon={<FaUsers />}
          label="Manage Accounts"
        />
        <SidebarItem
          to="/admin/hotels"
          icon={<FaCommentDots />}
          label="Manage Hotel"
        />
        <SidebarItem
          to="/admin/tours"
          icon={<FaMapMarkedAlt />}
          label="Manage Tours"
        />
        <SidebarItem
          to="/admin/categories"
          icon={<FaTags />}
          label="Manage Categories"
        />
      </ul>

      <div className="footer">© 2025 Admin Dashboard</div>
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
