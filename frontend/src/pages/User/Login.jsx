// Login.js
import React, { useContext, useState, useEffect } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import "../../styles/login.css";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"; // Thêm biểu tượng từ lucide-react
import loginImg from "../../assets/images/login.png";
import userIcon from "../../assets/images/user.png";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import Swal from "sweetalert2";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false); // Trạng thái hiển thị mật khẩu
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading cho nút

  const { dispatch, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

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
            navigate("/staff");
          } else {
            navigate("/home");
          }
        }
      } catch (err) {
        console.error("Lỗi xác thực token:", err);
      }
    };

    if (!user) {
      verifyToken();
    }
  }, [dispatch, navigate, user]);

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Bật trạng thái loading

    dispatch({ type: "LOGIN_START" });

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const result = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Đăng nhập thất bại",
          text: result.message,
          confirmButtonColor: "#d33",
        });
        setIsLoading(false);
        return;
      }

      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("refreshToken", result.refreshToken);

      dispatch({ type: "LOGIN_SUCCESS", payload: result.data });

      Swal.fire({
        icon: "success",
        title: "Đăng nhập thành công",
        showConfirmButton: false, // Tự đóng
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
          console.log("Success message closed");
          document.body.style.overflow = "auto"; // Khôi phục cuộn
        },
      }).then(() => {
        setIsLoading(false);
        if (result.data.role === "admin") {
          navigate("/admin");
        } else if (result.data.role === "staff") {
          navigate("/staff");
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
                  </FormGroup>
                  <Button
                    className="btn auth__btn"
                    type="submit"
                    disabled={isLoading}
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
