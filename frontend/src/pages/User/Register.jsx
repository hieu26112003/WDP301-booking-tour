import React, { useState, useContext } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import "../../styles/login.css";
import { Link, useNavigate } from "react-router-dom";
import registerImg from "../../assets/images/login.png";
import userIcon from "../../assets/images/user.png";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import Swal from "sweetalert2";

const Register = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    fullname: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    avatar: null, // Thay đổi từ string thành null để xử lý file
  });

  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (id === "avatar") {
      setCredentials((prev) => ({ ...prev, avatar: files[0] }));
    } else {
      setCredentials((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleClick = async (e) => {
    Swal.fire({
      icon: "success",
      title: "Đăng ký thành công",
      showConfirmButton: true,
      confirmButtonText: "OK",
      confirmButtonColor: "#3085d6",
      timer: 1500,
    });
    e.preventDefault();

    const formData = new FormData();
    for (const key in credentials) {
      formData.append(key, credentials[key]);
    }

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message);
      } else {
        dispatch({ type: "REGISTER_SUCCESS" });
        navigate("/login");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section>
      <Container>
        <Row>
          <Col lg="8" className="m-auto">
            <div className="login__container d-flex justify-content-between">
              <div className="login__img">
                <img src={registerImg} alt="" />
              </div>

              <div className="login__form">
                <div className="user">
                  <img src={userIcon} alt="" />
                </div>
                <h2>Register</h2>

                <Form onSubmit={handleClick}>
                  <FormGroup>
                    <input
                      type="text"
                      placeholder="Username"
                      id="username"
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <input
                      type="text"
                      placeholder="Full Name"
                      id="fullname"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <input
                      type="text"
                      placeholder="Address"
                      id="address"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <input
                      type="text"
                      placeholder="Phone"
                      id="phone"
                      onChange={handleChange}
                    />
                  </FormGroup>
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
                    Create Account
                  </Button>
                </Form>
                <p>
                  Already have an account? <Link to="/login">Login</Link>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Register;
