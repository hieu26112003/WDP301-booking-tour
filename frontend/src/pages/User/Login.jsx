import React, { useContext, useState, useEffect } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import "../../styles/login.css";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import loginImg from "../../assets/images/login.png";
import userIcon from "../../assets/images/user.png";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import Swal from "sweetalert2";
import { FcGoogle } from "react-icons/fc";

// Regex để xác thực email
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]\w+)*(\.\w{2,3})+$/;

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { dispatch, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return; // Thoát sớm nếu không có token

      try {
        const res = await fetch(`${BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const result = await res.json();

        if (res.ok && result.success) {
          dispatch({ type: "LOGIN_SUCCESS", payload: result.data });

          if (result.data.role === "admin") {
            navigate("/admin");
          } else if (result.data.role === "staff") {
            navigate("/staff/chat");
          } else {
            navigate("/home");
          }
        } else {
          // Xóa token nếu không hợp lệ
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } catch (err) {
        console.error("Lỗi xác thực token:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    };

    if (!user && localStorage.getItem("accessToken")) {
      verifyToken();
    }
  }, [dispatch, navigate, user]);

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    // Xác thực email
    if (!credentials.email) {
      newErrors.email = "Email là bắt buộc";
      isValid = false;
    } else if (!emailRegex.test(credentials.email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    } else if (credentials.email.length > 100) {
      newErrors.email = "Email không được vượt quá 100 ký tự";
      isValid = false;
    }

    // Xác thực password
    if (!credentials.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
      isValid = false;
    } else if (credentials.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
      isValid = false;
    } else if (credentials.password.length > 255) {
      newErrors.password = "Mật khẩu không được vượt quá 255 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setCredentials((prev) => ({ ...prev, [id]: value }));
    // Xóa lỗi khi người dùng nhập lại
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    dispatch({ type: "LOGIN_START" });

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const result = await res.json();

      if (!res.ok) {
        // Xử lý lỗi cụ thể từ server
        let errorMessage = result.message;
        if (result.message.includes("Email")) {
          setErrors((prev) => ({ ...prev, email: result.message }));
        } else if (result.message.includes("Mật khẩu")) {
          setErrors((prev) => ({ ...prev, password: result.message }));
        } else {
          errorMessage = result.message || "Đăng nhập thất bại";
        }

        Swal.fire({
          icon: "error",
          title: "Đăng nhập thất bại",
          text: errorMessage,
          confirmButtonColor: "#d33",
          backdrop: true,
          allowOutsideClick: true,
          customClass: {
            popup: "custom-swal-popup",
            title: "custom-swal-title",
            content: "custom-swal-content",
            confirmButton: "custom-swal-confirm",
          },
        });
        setIsLoading(false);
        dispatch({ type: "LOGIN_FAILURE", payload: result.message });
        return;
      }

      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("refreshToken", result.refreshToken);

      dispatch({ type: "LOGIN_SUCCESS", payload: result.data });

      Swal.fire({
        icon: "success",
        title: "Đăng nhập thành công",
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
      }).then(() => {
        setIsLoading(false);
        if (result.data.role === "admin") {
          navigate("/admin");
        } else if (result.data.role === "staff") {
          navigate("/staff/chat");
        } else {
          navigate("/home");
        }
      });
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: err.message });

      Swal.fire({
        icon: "error",
        title: "Lỗi đăng nhập",
        text: err.message,
        confirmButtonColor: "#d33",
        backdrop: true,
        allowOutsideClick: true,
        customClass: {
          popup: "custom-swal-popup",
          title: "custom-swal-title",
          content: "custom-swal-content",
          confirmButton: "custom-swal-confirm",
        },
      });
      setIsLoading(false);
    }
  };

  return (
    <section className="login__section">
      <Container>
        <Row>
          <Col lg="10" md="12" className="m-auto">
            <div className="login__container">
              <div className="login__img">
                <img src={loginImg} alt="Login Illustration" />
              </div>

              <div className="login__form">
                <div className="user">
                  <img src={userIcon} alt="User Icon" />
                </div>
                <h2>Đăng Nhập</h2>

                <Form onSubmit={handleClick}>
                  <FormGroup className="input__group">
                    <div className="input__wrapper">
                      <Mail className="input__icon" size={20} />
                      <input
                        type="email"
                        placeholder="Email"
                        id="email"
                        value={credentials.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {errors.email && (
                      <span className="error__message">{errors.email}</span>
                    )}
                  </FormGroup>
                  <FormGroup className="input__group">
                    <div className="input__wrapper">
                      <Lock className="input__icon" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu"
                        id="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="toggle__password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <span className="error__message">{errors.password}</span>
                    )}
                  </FormGroup>
                  <Button
                    className="btn auth__btn"
                    type="submit"
                    disabled={isLoading || errors.email || errors.password}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="spinner" size={20} />
                        Đang đăng nhập...
                      </>
                    ) : (
                      "Đăng Nhập"
                    )}
                  </Button>
                </Form>

                <div className="social__login-wrapper">
                  <div className="social__divider">Hoặc</div>
                  <a href="http://localhost:8000/auth/google" className="google-btn">
                    <FcGoogle className="google-icon" />
                    <span>Đăng nhập với Google</span>
                  </a>
                </div>
                <div className="login__links">
                  <p>
                    Quên mật khẩu?{" "}
                    <Link to="/reset-password">Đặt lại mật khẩu</Link>
                  </p>
                  <p>
                    Chưa có tài khoản? <Link to="/register">Tạo tài khoản</Link>
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Login;
