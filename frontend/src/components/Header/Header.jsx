import React, { useEffect, useRef, useContext, useState } from "react";
import { Container } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { Search, Phone, ChevronDown, Menu, User, Bell, X } from "lucide-react";
import "./header.css";
import { AuthContext } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { getCategories } from "../../services/categoryService";
import { BASE_URL } from "../../utils/config";
import axios from "axios";

const Header = ({ onCategorySelect, onSearch }) => {
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, accessToken, refreshToken, dispatch } = useContext(AuthContext);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [menuCategories, setMenuCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Hàm debounce
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Xử lý tìm kiếm với debounce
  const debouncedSearch = debounce(onSearch, 300);

  // Lấy danh mục
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getCategories();
        setCategories(res.data?.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể tải danh mục",
          confirmButtonColor: "#d33",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lấy thông báo
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !accessToken) {
        console.warn(
          "Không có người dùng hoặc token truy cập, bỏ qua lấy thông báo"
        );
        return;
      }
      setNotificationLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/notifications`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setNotifications(res.data.data || []);
      } catch (error) {
        if (error.response?.status === 401) {
          // Thử làm mới token
          try {
            const refreshRes = await axios.post(`${BASE_URL}/auth/refresh`, {
              refreshToken,
            });
            if (refreshRes.data.success) {
              dispatch({
                type: "REFRESH_TOKEN_SUCCESS",
                payload: {
                  accessToken: refreshRes.data.accessToken,
                  user: refreshRes.data.data || user,
                },
              });
              // Thử lại lấy thông báo
              const retryRes = await axios.get(`${BASE_URL}/notifications`, {
                headers: {
                  Authorization: `Bearer ${refreshRes.data.accessToken}`,
                },
              });
              setNotifications(retryRes.data.data || []);
            } else {
              throw new Error(refreshRes.data.message);
            }
          } catch (refreshError) {
            console.error("Làm mới token thất bại:", refreshError);
            Swal.fire({
              icon: "error",
              title: "Phiên đăng nhập hết hạn",
              text: "Vui lòng đăng nhập lại",
              confirmButtonColor: "#3085d6",
            }).then(() => {
              dispatch({ type: "LOGOUT" });
              navigate("/login");
            });
          }
        } else {
          console.error("Lỗi khi lấy thông báo:", error);
          Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: error.response?.data?.message || "Không thể tải thông báo",
            confirmButtonColor: "#d33",
          });
        }
      } finally {
        setNotificationLoading(false);
      }
    };
    fetchNotifications();
  }, [user, accessToken, refreshToken, dispatch, navigate]);

  // Xử lý xóa thông báo
  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    Swal.fire({
      title: "Bạn có chắc muốn xóa thông báo này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${BASE_URL}/notifications/${id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setNotifications((prev) => prev.filter((notif) => notif._id !== id));
          Swal.fire({
            icon: "success",
            title: "Xóa thành công",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          if (error.response?.status === 401) {
            // Thử làm mới token
            try {
              const refreshRes = await axios.post(`${BASE_URL}/auth/refresh`, {
                refreshToken,
              });
              if (refreshRes.data.success) {
                dispatch({
                  type: "REFRESH_TOKEN_SUCCESS",
                  payload: {
                    accessToken: refreshRes.data.accessToken,
                    user: refreshRes.data.data || user,
                  },
                });
                // Thử lại xóa thông báo
                await axios.delete(`${BASE_URL}/notifications/${id}`, {
                  headers: {
                    Authorization: `Bearer ${refreshRes.data.accessToken}`,
                  },
                });
                setNotifications((prev) =>
                  prev.filter((notif) => notif._id !== id)
                );
                Swal.fire({
                  icon: "success",
                  title: "Xóa thành công",
                  timer: 1500,
                  showConfirmButton: false,
                });
              } else {
                throw new Error(refreshRes.data.message);
              }
            } catch (refreshError) {
              console.error("Làm mới token thất bại:", refreshError);
              Swal.fire({
                icon: "error",
                title: "Phiên đăng nhập hết hạn",
                text: "Vui lòng đăng nhập lại",
                confirmButtonColor: "#3085d6",
              }).then(() => {
                dispatch({ type: "LOGOUT" });
                navigate("/login");
              });
            }
          } else {
            console.error("Lỗi khi xóa thông báo:", error);
            Swal.fire({
              icon: "error",
              title: "Lỗi",
              text: error.response?.data?.message || "Không thể xóa thông báo",
              confirmButtonColor: "#d33",
            });
          }
        }
      }
    });
  };

  // Xử lý nhấn vào thông báo
  const handleNotificationClick = (id, bookingId) => {
    if (!id || !bookingId) return;
    navigate(`/bookings/${bookingId}`);
    setActiveDropdown(null);
  };

  const nav__links = [
    { path: "/home", display: "TRANG CHỦ" },
    {
      path: "/tours",
      display: "TOUR DU LỊCH",
      hasDropdown: true,
      dropdownItems:
        categories.length > 0
          ? [
              {
                display: "Tất cả danh mục",
                onClick: () => onCategorySelect(null, "Tất cả danh mục"),
              },
              ...categories.map((cat) => ({
                display: cat.name,
                onClick: () => onCategorySelect(cat._id, cat.name),
              })),
            ]
          : [],
    },
    {
      path: "/cam-nang",
      display: "CẨM NANG DU LỊCH",
      hasDropdown: true,
      dropdownItems: menuCategories.map((cat) => ({
        path: `/cam-nang/${cat.slug}`,
        display: cat.name,
      })),
    },
    { path: "/about", display: "VỀ ASK TRAVEL" },
    { path: "/contact", display: "LIÊN HỆ" },
  ];

  const logout = () => {
    Swal.fire({
      title: "Bạn có chắc muốn đăng xuất?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      backdrop: true,
      allowOutsideClick: true,
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        content: "custom-swal-content",
        confirmButton: "custom-swal-confirm",
        cancelButton: "custom-swal-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch({ type: "LOGOUT" });
        navigate("/home");
        Swal.fire({
          icon: "success",
          title: "Đăng xuất thành công",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          backdrop: true,
          allowOutsideClick: true,
          customClass: {
            popup: "custom-swal-popup",
            title: "custom-swal-title",
            content: "custom-swal-content",
          },
          willClose: () => {
            document.body.style.overflow = "auto";
          },
        });
      }
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        document.body.scrollTop > 50 ||
        document.documentElement.scrollTop > 50
      ) {
        headerRef.current.classList.add("sticky__header");
      } else {
        headerRef.current.classList.remove("sticky__header");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    if (menuRef.current) {
      menuRef.current.classList.toggle("show__menu");
    }
  };

  const handleMouseEnter = (index) => setActiveDropdown(index);
  const handleMouseLeave = () => setActiveDropdown(null);
  const handleDropdownClick = (index) =>
    setActiveDropdown(index === activeDropdown ? null : index);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const userDropdownItems = [
    { path: "/profile", display: "Hồ sơ" },
    { path: "/change-password", display: "Đổi mật khẩu" },
    ...(user?.role === "admin"
      ? [{ path: "/admin", display: "Admin Dashboard" }]
      : user?.role === "staff"
      ? [{ path: "/staff", display: "Staff Dashboard" }]
      : [{ path: "/my-bookings", display: "Danh Sách Tour Đã Đặt" }]),
    { display: "Đăng xuất", onClick: logout },
  ];

  return (
    <header className="header-redesign" ref={headerRef}>
      <div className="top-header-redesign">
        <Container>
          <div className="top-header-wrapper-redesign">
            <div className="logo-redesign">
              <Link to="/home" className="logo-link-redesign">
                <div className="logo-icon-redesign">
                  <span className="logo-text-redesign">🥥</span>
                </div>
                <div className="logo-content-redesign">
                  <div className="logo-title-redesign">ASK TRAVEL</div>
                  <div className="logo-subtitle-redesign">
                    Khám phá trải nghiệm
                  </div>
                </div>
              </Link>
            </div>

            <div className="search-bar-redesign">
              <div className="search-wrapper-redesign">
                <Search className="search-icon-redesign" size={14} />
                <input
                  type="text"
                  placeholder="Tìm tour, địa điểm..."
                  className="search-input-redesign"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                {searchQuery && (
                  <button
                    className="clear-search-btn-redesign"
                    onClick={() => {
                      setSearchQuery("");
                      debouncedSearch("");
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="header-right-redesign">
              <div className="phone-section-redesign">
                <Phone className="phone-icon-redesign" size={14} />
                <div className="phone-content-redesign">
                  <div className="phone-number-redesign">090.990.4227</div>
                  <div className="phone-subtitle-redesign">Tư vấn ngay</div>
                </div>
              </div>

              {/* Phần thông báo */}
              {user && (
                <div
                  className="notification-section-redesign"
                  onMouseEnter={() => handleMouseEnter("notifications")}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleDropdownClick("notifications")}
                >
                  <div className="notification-toggle-redesign">
                    <Bell className="notification-icon-redesign" size={14} />
                    {notifications.length > 0 && (
                      <span className="notification-badge-redesign">
                        {notifications.length}
                      </span>
                    )}
                  </div>
                  <div
                    className={`notification-dropdown-redesign ${
                      activeDropdown === "notifications" ? "show" : ""
                    }`}
                  >
                    <div className="notification-dropdown-content-redesign">
                      {notificationLoading ? (
                        <div className="notification-loading-redesign">
                          Đang tải...
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className="notification-item-redesign"
                            onClick={() =>
                              handleNotificationClick(
                                notif._id,
                                notif.bookingId
                              )
                            }
                          >
                            <div className="notification-content-redesign">
                              <div className="notification-message-redesign">
                                {notif.message ||
                                  (notif.type === "booking"
                                    ? user.role === "staff"
                                      ? `Người dùng ${
                                          notif.userId?.username || "Unknown"
                                        } đã đặt tour ${
                                          notif.tourId?.title || "Unknown"
                                        }`
                                      : `Bạn đã đặt tour ${
                                          notif.tourId?.title || "Unknown"
                                        } thành công`
                                    : notif.type === "cancellation"
                                    ? user.role === "staff"
                                      ? `Người dùng ${
                                          notif.userId?.username || "Unknown"
                                        } đã hủy tour ${
                                          notif.tourId?.title || "Unknown"
                                        }`
                                      : `Bạn đã hủy tour ${
                                          notif.tourId?.title || "Unknown"
                                        }`
                                    : user.role === "staff"
                                    ? `Người dùng ${
                                        notif.userId?.username || "Unknown"
                                      } xác nhận booking cho tour ${
                                        notif.tourId?.title || "Unknown"
                                      }`
                                    : `Booking của bạn cho tour ${
                                        notif.tourId?.title || "Unknown"
                                      } đã được xác nhận`)}
                              </div>
                              <div className="notification-meta-redesign">
                                <span>{notif.tourId?.title || "Unknown"}</span>{" "}
                                |{" "}
                                <span>
                                  {new Date(notif.createdAt).toLocaleString()}
                                </span>{" "}
                                |{" "}
                                <span>
                                  {notif.read ? "Đã đọc" : "Chưa đọc"}
                                </span>
                              </div>
                            </div>
                            <button
                              className="notification-delete-btn-redesign"
                              onClick={(e) =>
                                handleDeleteNotification(notif._id, e)
                              }
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="notification-empty-redesign">
                          Không có thông báo
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="user-section-redesign">
                {user ? (
                  <div
                    className="user-menu-redesign"
                    onMouseEnter={() => handleMouseEnter("user")}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleDropdownClick("user")}
                  >
                    <div className="user-toggle-redesign">
                      <div className="user-avatar-redesign">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt="User Avatar"
                            className="user-avatar-img-redesign"
                          />
                        ) : (
                          <User className="user-icon-redesign" size={14} />
                        )}
                      </div>
                      <span className="user-name-redesign">
                        {user.username}
                      </span>
                      <ChevronDown
                        className="chevron-down-redesign"
                        size={12}
                      />
                    </div>
                    <div
                      className={`user-dropdown-redesign ${
                        activeDropdown === "user" ? "show" : ""
                      }`}
                    >
                      {userDropdownItems.map((item, index) => (
                        <div
                          key={index}
                          className="user-dropdown-item-redesign"
                        >
                          {item.onClick ? (
                            <button
                              onClick={item.onClick}
                              className="user-dropdown-button-redesign"
                            >
                              {item.display}
                            </button>
                          ) : (
                            <Link
                              to={item.path}
                              className="user-dropdown-link-redesign"
                            >
                              {item.display}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="auth-buttons-redesign">
                    <Link to="/login" className="login-btn-redesign">
                      Đăng nhập
                    </Link>
                    <Link to="/register" className="register-btn-redesign">
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>

              <button
                onClick={toggleMenu}
                className="mobile-menu-toggle-redesign"
              >
                <Menu className="mobile-menu-icon-redesign" size={16} />
              </button>
            </div>
          </div>
        </Container>
      </div>

      <div className="navigation-bar-redesign">
        <Container>
          <nav className="navigation-redesign" ref={menuRef}>
            <ul className="menu-redesign">
              {nav__links.map((item, index) => (
                <li
                  key={index}
                  className="nav-item-redesign"
                  onMouseEnter={() =>
                    item.hasDropdown && handleMouseEnter(index)
                  }
                  onMouseLeave={() => item.hasDropdown && handleMouseLeave()}
                  onClick={() => item.hasDropdown && handleDropdownClick(index)}
                >
                  {item.hasDropdown ? (
                    <div className="dropdown-wrapper-redesign">
                      <Link to={item.path} className="nav-link-redesign">
                        {item.display}
                        <ChevronDown
                          className="dropdown-arrow-redesign"
                          size={10}
                        />
                      </Link>
                      <div
                        className={`dropdown-menu-redesign ${
                          activeDropdown === index ? "show" : ""
                        }`}
                      >
                        <div className="dropdown-content-redesign">
                          {isLoading ? (
                            <div className="dropdown-loading-redesign">
                              Đang tải...
                            </div>
                          ) : item.dropdownItems.length > 0 ? (
                            item.dropdownItems.map(
                              (dropdownItem, dropdownIndex) => (
                                <div
                                  key={dropdownIndex}
                                  className="dropdown-item-redesign"
                                  onClick={dropdownItem.onClick}
                                >
                                  {dropdownItem.display}
                                </div>
                              )
                            )
                          ) : (
                            <div className="dropdown-empty-redesign">
                              Không có danh mục
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link to={item.path} className="nav-link-redesign">
                      {item.display}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>

      <div className="mobile-menu-redesign">
        <div className="mobile-menu-overlay-redesign">
          <div className="mobile-menu-content-redesign">
            <div className="mobile-menu-header-redesign">
              <div className="mobile-menu-title-redesign">Menu</div>
              <button
                onClick={toggleMenu}
                className="mobile-menu-close-redesign"
              >
                ×
              </button>
            </div>
            <ul className="mobile-menu-list-redesign">
              {nav__links.map((item, index) => (
                <li key={index} className="mobile-menu-item-redesign">
                  <Link to={item.path} className="mobile-menu-link-redesign">
                    {item.display}
                  </Link>
                  {item.hasDropdown && item.dropdownItems.length > 0 && (
                    <ul className="mobile-submenu-redesign">
                      {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                        <li
                          key={dropdownIndex}
                          className="mobile-submenu-item-redesign"
                        >
                          <div
                            className="mobile-submenu-link-redesign"
                            onClick={dropdownItem.onClick}
                          >
                            {dropdownItem.display}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
