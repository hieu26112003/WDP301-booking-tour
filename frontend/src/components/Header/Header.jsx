"use client"
import { useEffect, useRef, useContext, useState } from "react"
import { Container, Row, Button } from "reactstrap"
import { NavLink, Link, useNavigate } from "react-router-dom"
import Logo from "../../assets/images/logo.png"
import "./header.css"
import { AuthContext } from "../../context/AuthContext"
import Dropdown from "react-bootstrap/Dropdown"
import Swal from "sweetalert2"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faBars, faSearch, faPhone } from "@fortawesome/free-solid-svg-icons"

const nav__links = [
  {
    path: "/",
    display: "TRANG CHỦ",
  },
  {
    path: "/tours",
    display: "TOUR DU LỊCH",
    hasDropdown: true,
    dropdownItems: [
      { path: "/tours/quoc-te", display: "Tour Quốc tế" },
      { path: "/tours/trong-nuoc", display: "Tour trong nước" },
      { path: "/tours/le-tet", display: "Tour lễ tết" },
      { path: "/tours/combo", display: "Combo du lịch" },
    ],
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
  {
    path: "/about",
    display: "VỀ ASK TRAVEL",
  },
  {
    path: "/contact",
    display: "LIÊN HỆ",
  },
]

const Header = () => {
  const headerRef = useRef(null)
  const topHeaderRef = useRef(null)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const { user, dispatch } = useContext(AuthContext)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)

  const logout = () => {
    Swal.fire({
      title: "Bạn có chắc muốn đăng xuất?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch({ type: "LOGOUT" })
        navigate("/")
        Swal.fire({
          icon: "success",
          title: "Đăng xuất thành công",
          showConfirmButton: false,
          timer: 1500,
        })
      }
    })
  }

  const stickyHeaderFunc = () => {
    const handleScroll = () => {
      const scrollTop = document.body.scrollTop || document.documentElement.scrollTop

      if (scrollTop > 100) {
        if (!isScrolled) {
          setIsScrolled(true)
          headerRef.current?.classList.add("sticky__header")
          topHeaderRef.current?.classList.add("hide__top__header")
        }
      } else {
        if (isScrolled) {
          setIsScrolled(false)
          headerRef.current?.classList.remove("sticky__header")
          topHeaderRef.current?.classList.remove("hide__top__header")
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }

  useEffect(() => {
    const cleanup = stickyHeaderFunc()
    return cleanup
  }, [isScrolled])

  const toggleMenu = () => menuRef.current.classList.toggle("show__menu")

  const handleMouseEnter = (index) => {
    setActiveDropdown(index)
  }

  const handleMouseLeave = () => {
    setActiveDropdown(null)
  }

  return (
    <header className="header" ref={headerRef}>
      {/* Top Header Section */}
      <div className="top-header" ref={topHeaderRef}>
        <Container>
          <Row>
            <div className="top-header__wrapper d-flex align-items-center justify-content-between">
              {/* Logo */}
              <div className="logo">
                <Link to="/home">
                  <img src={Logo || "/placeholder.svg"} alt="ASK TRAVEL Logo" />
                </Link>
              </div>

              {/* Search Bar */}
              <div className="search-bar">
                <div className="search-input-wrapper">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input type="text" placeholder="Nhập khách sạn hoặc địa điểm muốn tìm..." className="search-input" />
                </div>
              </div>

              {/* Phone & User Section */}
              <div className="header-right d-flex align-items-center gap-4">
                <div className="phone-section">
                  <FontAwesomeIcon icon={faPhone} className="phone-icon" />
                  <div className="phone-info">
                    <div className="phone-number">Phone: 090.990.4227</div>
                    <div className="phone-subtitle">Gọi để được tư vấn ngay</div>
                  </div>
                </div>

                {/* User Section */}
                <div className="user-section">
                  {user ? (
                    <Dropdown>
                      <Dropdown.Toggle
                        id="dropdown-button-dark-example1"
                        variant="secondary"
                        className="d-flex align-items-center gap-2"
                      >
                        {user.avatar && (
                          <img src={user.avatar || "/placeholder.svg"} alt="Avatar" className="user-avatar" />
                        )}
                        <span>{user.username}</span>
                        <FontAwesomeIcon icon={faChevronDown} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item as={Link} to="/profile">
                          Profile
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/change-password">
                          Change Password
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : (
                    <>
                      <Button className="btn primary__btn">
                        <Link to="/login" className="link-btn">
                          Login
                        </Link>
                      </Button>
                      <Button className="btn primary__btn">
                        <Link to="/register" className="link-btn">
                          Register
                        </Link>
                      </Button>
                    </>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <span className="mobile__menu" onClick={toggleMenu}>
                  <FontAwesomeIcon icon={faBars} />
                </span>
              </div>
            </div>
          </Row>
        </Container>
      </div>

      {/* Navigation Bar */}
      <div className="navigation-bar">
        <Container>
          <Row>
            <div className="navigation" ref={menuRef}>
              <ul className="menu d-flex align-items-center justify-content-center gap-5">
                {nav__links.map((item, index) => (
                  <li
                    className="nav__item"
                    key={index}
                    onMouseEnter={() => item.hasDropdown && handleMouseEnter(index)}
                    onMouseLeave={() => item.hasDropdown && handleMouseLeave()}
                  >
                    {item.hasDropdown ? (
                      <div className="dropdown-wrapper">
                        <NavLink to={item.path} className={(navClass) => (navClass.isActive ? "active__link" : "")}>
                          {item.display}
                          <FontAwesomeIcon icon={faChevronDown} className="dropdown-arrow" />
                        </NavLink>
                        <div className={`dropdown-menu-custom ${activeDropdown === index ? "show" : ""}`}>
                          {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                            <Link key={dropdownIndex} to={dropdownItem.path} className="dropdown-item-custom">
                              {dropdownItem.display}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <NavLink to={item.path} className={(navClass) => (navClass.isActive ? "active__link" : "")}>
                        {item.display}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Row>
        </Container>
      </div>
    </header>
  )
}

export default Header
