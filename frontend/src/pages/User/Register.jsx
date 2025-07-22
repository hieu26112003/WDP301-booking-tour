// Register.js
import React, { useContext, useState } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import "../../styles/register.css"; // Sử dụng register.css
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  MapPin,
  Phone,
} from "lucide-react"; // Thêm biểu tượng
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
    avatar: null,
  });
  const [showPassword, setShowPassword] = useState(false); // Trạng thái hiển thị mật khẩu
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading

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
    e.preventDefault();
    setIsLoading(true); // Bật loading

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
        Swal.fire({
          icon: "error",
          title: "Đăng ký thất bại",
          text: result.message,
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
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Đăng ký thành công",
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
          console.log("Success message closed");
          document.body.style.overflow = "auto"; // Khôi phục cuộn
        },
      }).then(() => {
        dispatch({ type: "REGISTER_SUCCESS" });
        navigate("/login");
        setIsLoading(false);
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi đăng ký",
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
    <section className="register__section">
      <Container>
        <Row>
          <Col lg="10" md="12" className="m-auto">
            <div className="register__container">
              <div className="register__img">
                <img src={registerImg} alt="Register Illustration" />
              </div>

              <div className="register__form">
                <div className="user">
                  <img src={userIcon} alt="User Icon" />
                </div>
                <h2>Đăng Ký</h2>

                <Form onSubmit={handleClick}>
                  <FormGroup className="input__group">
                    <div className="input__wrapper">
                      <User className="input__icon" size={20} />
                      <input
                        type="text"
                        placeholder="Tên đăng nhập"
                        id="username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </FormGroup>
                  <FormGroup className="input__group">
                    <div className="input__wrapper">
                      <User className="input__icon" size={20} />
                      <input
                        type="text"
                        placeholder="Họ và tên"
                        id="fullname"
                        value={credentials.fullname}
                        onChange={handleChange}
                      />
                    </div>
                  </FormGroup>
                  <FormGroup className="input__group">
                    <div className="input__wrapper">
                      <MapPin className="input__icon" size={20} />
                      <input
                        type="text"
                        placeholder="Địa chỉ"
                        id="address"
                        value={credentials.address}
                        onChange={handleChange}
                      />
                    </div>
                  </FormGroup>
                  <FormGroup className="input__group">
                    <div className="input__wrapper">
                      <Phone className="input__icon" size={20} />
                      <input
                        type="text"
                        placeholder="Số điện thoại"
                        id="phone"
                        value={credentials.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </FormGroup>
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
                  {/* <FormGroup className="input__group">
                    <div className="input__wrapper">
                      <input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={handleChange}
                      />
                    </div>
                  </FormGroup> */}
                  <Button
                    className="btn auth__btn"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="spinner" size={20} />
                        Đang tạo tài khoản...
                      </>
                    ) : (
                      "Tạo Tài Khoản"
                    )}
                  </Button>
                </Form>
                <div className="register__links">
                  <p>
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
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

export default Register;
