// ResetPasswordConfirm.js
import React, { useState } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import "../../styles/reset-password-confirm.css";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import registerImg from "../../assets/images/login.png";
import userIcon from "../../assets/images/user.png";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/config";

const ResetPasswordConfirm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Mật khẩu xác nhận không khớp",
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

    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const result = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
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
          console.log("Success message closed");
          document.body.style.overflow = "auto"; // Khôi phục cuộn
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
                        onChange={(e) => setNewPassword(e.target.value)}
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
                  </FormGroup>
                  <FormGroup className="input__group">
                    <div className="input__wrapper">
                      <Lock className="input__icon" size={18} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Xác nhận mật khẩu mới"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                  </FormGroup>
                  <Button
                    className="btn auth__btn"
                    type="submit"
                    disabled={isLoading}
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
