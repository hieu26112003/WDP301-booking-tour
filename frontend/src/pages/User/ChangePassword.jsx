// ChangePassword.jsx
import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faKey } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import "../../styles/change-password.css"; // Add custom CSS

const ChangePassword = () => {
  const { user } = useContext(AuthContext);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!user) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không có dữ liệu người dùng. Vui lòng đăng nhập.",
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

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Mật khẩu mới và xác nhận không khớp.",
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

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không tìm thấy token. Vui lòng đăng nhập lại.",
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
      const res = await axios.put(
        `http://localhost:8000/api/auth/${user._id}/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );

      console.log("Change password response:", res.data);

      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: res.data.message || "Đổi mật khẩu thành công.",
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
          document.body.style.overflow = "auto"; // Restore scroll
        },
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswords({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
      setIsLoading(false);
    } catch (err) {
      console.error("Change password error:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.response?.data?.message || "Đổi mật khẩu thất bại.",
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
    <section className="change-password__section">
      <div className="container">
        <h2 className="change-password__title">Đổi Mật Khẩu</h2>
        <div className="change-password__card">
          <div className="change-password__card-body">
            <h5 className="change-password__card-title">Cập Nhật Mật Khẩu</h5>
            <form onSubmit={handlePasswordSubmit}>
              <div className="change-password__form-group">
                <label
                  htmlFor="currentPassword"
                  className="change-password__form-label"
                >
                  Mật Khẩu Hiện Tại
                </label>
                <div className="change-password__input-wrapper">
                  <input
                    type={showPasswords.currentPassword ? "text" : "password"}
                    className="change-password__form-control"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="change-password__toggle-password"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                    aria-label={
                      showPasswords.currentPassword
                        ? "Ẩn mật khẩu"
                        : "Hiện mật khẩu"
                    }
                  >
                    <FontAwesomeIcon
                      icon={showPasswords.currentPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
              </div>
              <div className="change-password__form-group">
                <label
                  htmlFor="newPassword"
                  className="change-password__form-label"
                >
                  Mật Khẩu Mới
                </label>
                <div className="change-password__input-wrapper">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    className="change-password__form-control"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="change-password__toggle-password"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    aria-label={
                      showPasswords.newPassword
                        ? "Ẩn mật khẩu"
                        : "Hiện mật khẩu"
                    }
                  >
                    <FontAwesomeIcon
                      icon={showPasswords.newPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
              </div>
              <div className="change-password__form-group">
                <label
                  htmlFor="confirmPassword"
                  className="change-password__form-label"
                >
                  Xác Nhận Mật Khẩu Mới
                </label>
                <div className="change-password__input-wrapper">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    className="change-password__form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="change-password__toggle-password"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    aria-label={
                      showPasswords.confirmPassword
                        ? "Ẩn mật khẩu"
                        : "Hiện mật khẩu"
                    }
                  >
                    <FontAwesomeIcon
                      icon={showPasswords.confirmPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="change-password__btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faKey} className="me-1" /> Đang
                    đổi...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faKey} className="me-1" /> Đổi Mật
                    Khẩu
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChangePassword;
