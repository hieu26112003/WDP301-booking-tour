// Header.js (với debounce)
import React, { useEffect, useRef, useContext, useState } from "react";
import { Container } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { Search, Phone, ChevronDown, Menu, User } from "lucide-react";
import "./header.css";
import { AuthContext } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { getCategories } from "../../services/categoryService";

const Header = ({ onCategorySelect, onSearch }) => {
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, dispatch } = useContext(AuthContext);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Debounced search handler
  const debouncedSearch = debounce(onSearch, 300);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getCategories();
        setCategories(res.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
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
      dropdownItems: [
        { path: "/cam-nang/kinh-nghiem", display: "Kinh nghiệm" },
        { path: "/cam-nang/am-thuc", display: "Ẩm thực" },
        { path: "/cam-nang/review", display: "Review" },
        { path: "/cam-nang/xu-huong", display: "Xu hướng" },
      ],
    },
    { path: "/about", display: "VỀ ASK TRAVEL" },
    { path: "/contact", display: "LIÊN HỆ" },
  ];

  // Header.js (chỉ cập nhật hàm logout)
  const logout = () => {
    Swal.fire({
      title: "Bạn có chắc muốn đăng xuất?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      backdrop: true, // Đảm bảo backdrop hiển thị
      allowOutsideClick: true, // Cho phép click bên ngoài
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
          backdrop: true, // Đảm bảo backdrop
          allowOutsideClick: true, // Cho phép click bên ngoài
          customClass: {
            popup: "custom-swal-popup",
            title: "custom-swal-title",
            content: "custom-swal-content",
          },
          willClose: () => {
            console.log("Success message closed"); // Debug
            // Đảm bảo khôi phục cuộn
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
                      <Link
                        to="/profile"
                        className="user-dropdown-item-redesign"
                      >
                        Hồ sơ
                      </Link>
                      <Link
                        to="/change-password"
                        className="user-dropdown-item-redesign"
                      >
                        Đổi mật khẩu
                      </Link>
                      <div className="user-dropdown-divider-redesign"></div>
                      <button
                        onClick={logout}
                        className="user-dropdown-item-redesign"
                      >
                        Đăng xuất
                      </button>
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
