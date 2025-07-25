import React, { useContext, useState } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import "../../styles/register.css";
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
} from "lucide-react";
import registerImg from "../../assets/images/login.png";
import userIcon from "../../assets/images/user.png";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import Swal from "sweetalert2";

// Regex để xác thực email, số điện thoại, và mật khẩu
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const phoneRegex = /^(\+84|0)[35789][0-9]{8}$/;
const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

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
  const [errors, setErrors] = useState({
    username: "",
    fullname: "",
    address: "",
    phone: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  // Hàm xử lý chỉ cho phép nhập số và dấu +
  const handlePhoneKeyPress = (e) => {
    const char = e.key;
    // Cho phép số, dấu +, và các phím điều khiển (Backspace, Delete, Arrow keys, v.v.)
    if (!/[0-9+]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(char)) {
      e.preventDefault();
    }
    // Chỉ cho phép dấu + ở vị trí đầu tiên
    if (char === "+" && e.target.value.length > 0) {
      e.preventDefault();
    }
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      fullname: "",
      address: "",
      phone: "",
      email: "",
      password: "",
    };

    // Xác thực username
    if (!credentials.username) {
      newErrors.username = "Tên đăng nhập là bắt buộc";
      isValid = false;
    } else if (credentials.username.length > 50) {
      newErrors.username = "Tên đăng nhập không được vượt quá 50 ký tự";
      isValid = false;
    }

    // Xác thực fullname
    if (!credentials.fullname) {
      newErrors.fullname = "Họ và tên là bắt buộc";
      isValid = false;
    } else if (credentials.fullname.length > 100) {
      newErrors.fullname = "Họ và tên không được vượt quá 100 ký tự";
      isValid = false;
    }

    // Xác thực address
    if (!credentials.address) {
      newErrors.address = "Địa chỉ là bắt buộc";
      isValid = false;
    } else if (credentials.address.length > 255) {
      newErrors.address = "Địa chỉ không được vượt quá 255 ký tự";
      isValid = false;
    }

    // Xác thực phone
    if (!credentials.phone) {
      newErrors.phone = "Số điện thoại là bắt buộc";
      isValid = false;
    } else if (!phoneRegex.test(credentials.phone)) {
      newErrors.phone =
        "Số điện thoại không hợp lệ (VD: +84987654321 hoặc 0987654321)";
      isValid = false;
    } else if (credentials.phone.length > 20) {
      newErrors.phone = "Số điện thoại không được vượt quá 20 ký tự";
      isValid = false;
    }

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
    } else if (!passwordRegex.test(credentials.password)) {
      newErrors.password =
        "Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất 1 ký tự đặc biệt (VD: @, #, $, v.v.)";
      isValid = false;
    } else if (credentials.password.length > 50) {
      newErrors.password = "Mật khẩu không được vượt quá 50 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (id === "avatar") {
      setCredentials((prev) => ({ ...prev, avatar: files[0] }));
    } else {
      setCredentials((prev) => ({ ...prev, [id]: value }));
      // Xóa lỗi khi người dùng nhập lại
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

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
        // Xử lý lỗi cụ thể từ server
        let errorMessage = result.message;
        if (result.message.includes("Email đã tồn tại")) {
          setErrors((prev) => ({ ...prev, email: result.message }));
        } else if (result.message.includes("Tên đăng nhập đã tồn tại")) {
          setErrors((prev) => ({ ...prev, username: result.message }));
        } else if (result.message.includes("Số điện thoại đã được sử dụng")) {
          setErrors((prev) => ({ ...prev, phone: result.message }));
        } else if (result.message.includes("bắt buộc")) {
          const field = result.message.split(" ")[0].toLowerCase();
          setErrors((prev) => ({ ...prev, [field]: result.message }));
        } else {
          errorMessage = result.message || "Đăng ký thất bại";
        }

        Swal.fire({
          icon: "error",
          title: "Đăng ký thất bại",
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
          document.body.style.overflow = "auto";
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
                      {errors.username && (
                        <span className="error__message">
                          {errors.username}
                        </span>
                      )}
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
                        required
                      />
                      {errors.fullname && (
                        <span className="error__message">
                          {errors.fullname}
                        </span>
                      )}
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
                        required
                      />
                      {errors.address && (
                        <span className="error__message">{errors.address}</span>
                      )}
                    </div>
                  </FormGroup>
                  <FormGroup className="input__group">
                    <div className="input__wrapper">
                      <Phone className="input__icon" size={20} />
                      <input
                        type="tel"
                        placeholder="Số điện thoại"
                        id="phone"
                        value={credentials.phone}
                        onChange={handleChange}
                        onKeyPress={handlePhoneKeyPress}
                        required
                      />
                      {errors.phone && (
                        <span className="error__message">{errors.phone}</span>
                      )}
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
                      {errors.email && (
                        <span className="error__message">{errors.email}</span>
                      )}
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
                    {errors.password && (
                      <span className="error__message">{errors.password}</span>
                    )}
                  </FormGroup>
                  <Button
                    className="btn auth__btn"
                    type="submit"
                    disabled={
                      isLoading ||
                      errors.username ||
                      errors.fullname ||
                      errors.address ||
                      errors.phone ||
                      errors.email ||
                      errors.password
                    }
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
