import React, { useState } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import "../../styles/reset-password-confirm.css";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import registerImg from "../../assets/images/login.png";
import userIcon from "../../assets/images/user.png";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/config";

// Regex để xác thực mật khẩu
const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

const ResetPasswordConfirm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { newPassword: "", confirmPassword: "" };

    // Xác thực newPassword
    if (!newPassword) {
      newErrors.newPassword = "Mật khẩu mới là bắt buộc";
      isValid = false;
    } else if (!passwordRegex.test(newPassword)) {
      newErrors.newPassword =
        "Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất 1 ký tự đặc biệt (VD: @, #, $, v.v.)";
      isValid = false;
    } else if (newPassword.length > 255) {
      newErrors.newPassword = "Mật khẩu không được vượt quá 255 ký tự";
      isValid = false;
    }

    // Xác thực confirmPassword
    if (!confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    setErrors((prev) => ({ ...prev, newPassword: "" }));
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const result = await res.json();

      if (!res.ok) {
        let errorMessage = result.message;
        if (result.message.includes("Mật khẩu")) {
          setErrors((prev) => ({ ...prev, newPassword: result.message }));
        } else {
          errorMessage = result.message || "Đặt lại mật khẩu thất bại";
        }

        Swal.fire({
          icon: "error",
          title: "Lỗi",
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
        title: "Thành công",
        text: result.message,
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
        navigate("/login");
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
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
    <section className="reset-password-confirm__section">
      <Container>
        <Row>
          <Col lg="10" md="12" className="m-auto">
            <div className="reset-password-confirm__container">
              <div className="reset-password-confirm__img">
                <img
                  src={registerImg}
                  alt="Reset Password Confirm Illustration"
                />
              </div>
              <div className="reset-password-confirm__form">
                <div className="user">
                  <img src={userIcon} alt="User Icon" />
                </div>
                <h2>Đặt Mật Khẩu Mới</h2>
                <Form onSubmit={handleSubmit}>
                  <FormGroup className="input__group">
                    <div className="input__wrapper">
                      <Lock className="input__icon" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu mới"
                        id="newPassword"
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        required
                      />
                      <button
                        type="button"
                        className="toggle__password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <span className="error__message">
                        {errors.newPassword}
                      </span>
                    )}
                  </FormGroup>
                  <FormGroup className="input__group">
                    <div className="input__wrapper">
                      <Lock className="input__icon" size={18} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Xác nhận mật khẩu mới"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                      />
                      <button
                        type="button"
                        className="toggle__password"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="error__message">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </FormGroup>
                  <Button
                    className="btn auth__btn"
                    type="submit"
                    disabled={
                      isLoading || errors.newPassword || errors.confirmPassword
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="spinner" size={18} />
                        Đang đặt lại...
                      </>
                    ) : (
                      "Đặt Lại Mật Khẩu"
                    )}
                  </Button>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ResetPasswordConfirm;
