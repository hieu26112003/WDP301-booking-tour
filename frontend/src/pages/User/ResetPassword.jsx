// ResetPassword.js
import React, { useState } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import "../../styles/reset-password.css"; // Sử dụng CSS riêng
import { useNavigate } from "react-router-dom";
import { Mail, Loader2 } from "lucide-react"; // Thêm biểu tượng
import registerImg from "../../assets/images/login.png";
import userIcon from "../../assets/images/user.png";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/config";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
    <section className="reset-password__section">
      <Container>
        <Row>
          <Col lg="10" md="12" className="m-auto">
            <div className="reset-password__container">
              <div className="reset-password__img">
                <img src={registerImg} alt="Reset Password Illustration" />
              </div>
              <div className="reset-password__form">
                <div className="user">
                  <img src={userIcon} alt="User Icon" />
                </div>
                <h2>Đặt Lại Mật Khẩu</h2>
                <Form onSubmit={handleSubmit}>
                  <FormGroup className="input__group">
                    <div className="input__wrapper">
                      <Mail className="input__icon" size={18} />
                      <input
                        type="email"
                        placeholder="Nhập email của bạn"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
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
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi Liên Kết Đặt Lại"
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

export default ResetPassword;
