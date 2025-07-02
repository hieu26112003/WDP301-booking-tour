import React, { useContext, useState, useEffect } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import "../../styles/login.css";
import { Link, useNavigate } from "react-router-dom";
import loginImg from "../../assets/images/login.png";
import userIcon from "../../assets/images/user.png";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import Swal from "sweetalert2";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: undefined,
    password: undefined,
  });

  const { dispatch, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Kiểm tra token khi component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/getCurrentUser`, {
          method: "GET",
          credentials: "include",
        });

        const result = await res.json();

        if (res.ok && result.success) {
          dispatch({ type: "LOGIN_SUCCESS", payload: result.data });
          // Điều hướng theo vai trò
          if (result.data.role === "admin") {
            navigate("/admin");
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

    dispatch({ type: "LOGIN_START" });

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
        return;
      }

      dispatch({ type: "LOGIN_SUCCESS", payload: result.data });

      // Hiển thị thông báo thành công
      Swal.fire({
        icon: "success",
        title: "Đăng nhập thành công",
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        timer: 1500,
      }).then(() => {
        // Điều hướng theo vai trò
        if (result.role === "admin") {
          navigate("/admin");
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
      });
    }
  };

  return (
    <section>
      <Container>
        <Row>
          <Col lg="8" className="m-auto">
            <div className="login__container d-flex justify-content-between">
              <div className="login__img">
                <img src={loginImg} alt="" />
              </div>

              <div className="login__form">
                <div className="user">
                  <img src={userIcon} alt="" />
                </div>
                <h2>Login</h2>

                <Form onSubmit={handleClick}>
                  <FormGroup>
                    <input
                      type="email"
                      placeholder="Email"
                      id="email"
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <input
                      type="password"
                      placeholder="Password"
                      id="password"
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <Button
                    className="btn secondary__btn auth__btn"
                    type="submit"
                  >
                    Login
                  </Button>
                </Form>
                <p>
                  Forgot password?
                  <Link to="/reset-password">Reset password</Link>
                </p>
                <p>
                  Don't have an account? <Link to="/register">Create</Link>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Login;
