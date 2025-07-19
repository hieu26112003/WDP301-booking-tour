// Profile.jsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import "../../styles/profile.css";

const Profile = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullname: "",
    address: "",
    phone: "",
    avatar: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        fullname: user.fullname || "",
        address: user.address || "",
        phone: user.phone || "",
        avatar: null,
      });
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, avatar: e.target.files[0] }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
      return;
    }

    const data = new FormData();
    data.append("fullname", formData.fullname);
    data.append("address", formData.address);
    data.append("phone", formData.phone);
    if (formData.avatar) data.append("avatar", formData.avatar);

    try {
      const res = await axios.put(
        `http://localhost:8000/api/auth/${user._id}/profile`,
        data,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );

      console.log("Profile update response:", res.data);

      const updatedUser = res.data.data;
      if (!updatedUser || !updatedUser._id) {
        throw new Error("Dữ liệu người dùng không hợp lệ.");
      }

      dispatch({ type: "UPDATE_PROFILE", payload: updatedUser });
      setFormData({
        username: updatedUser.username || "",
        email: updatedUser.email || "",
        fullname: updatedUser.fullname || "",
        address: updatedUser.address || "",
        phone: updatedUser.phone || "",
        avatar: null,
      });
      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công",
        text: "Hồ sơ của bạn đã được cập nhật.",
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
          document.body.style.overflow = "auto";
        },
      });
      setEditMode(false);
    } catch (err) {
      console.error("Update profile error:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.response?.data?.message || "Cập nhật hồ sơ thất bại.",
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
    }
  };

  return (
    <section className="profile__section">
      <div className="container">
        <h2 className="profile__title">Hồ Sơ Người Dùng</h2>
        {loading ? (
          <div className="profile__loading">Đang tải...</div>
        ) : !user ? (
          <div className="profile__warning">
            Không có dữ liệu người dùng. Vui lòng đăng nhập.
          </div>
        ) : (
          <div className="profile__card">
            <div className="profile__card-body">
              <h5 className="profile__card-title">Thông Tin Hồ Sơ</h5>
              {editMode ? (
                <form onSubmit={handleProfileSubmit}>
                  <div className="profile__form-group">
                    <label htmlFor="username" className="profile__form-label">
                      Tên Đăng Nhập
                    </label>
                    <div className="profile__input-wrapper">
                      <input
                        type="text"
                        className="profile__form-control profile__form-control--readonly"
                        id="username"
                        name="username"
                        value={formData.username}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="profile__form-group">
                    <label htmlFor="email" className="profile__form-label">
                      Email
                    </label>
                    <div className="profile__input-wrapper">
                      <input
                        type="email"
                        className="profile__form-control profile__form-control--readonly"
                        id="email"
                        name="email"
                        value={formData.email}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="profile__form-group">
                    <label htmlFor="fullname" className="profile__form-label">
                      Họ và Tên
                    </label>
                    <div className="profile__input-wrapper">
                      <input
                        type="text"
                        className="profile__form-control"
                        id="fullname"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="profile__form-group">
                    <label htmlFor="address" className="profile__form-label">
                      Địa Chỉ
                    </label>
                    <div className="profile__input-wrapper">
                      <input
                        type="text"
                        className="profile__form-control"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="profile__form-group">
                    <label htmlFor="phone" className="profile__form-label">
                      Số Điện Thoại
                    </label>
                    <div className="profile__input-wrapper">
                      <input
                        type="text"
                        className="profile__form-control"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="profile__form-group">
                    <label htmlFor="avatar" className="profile__form-label">
                      Ảnh Đại Diện
                    </label>
                    <div className="profile__input-wrapper">
                      <input
                        type="file"
                        className="profile__form-control"
                        id="avatar"
                        name="avatar"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                  <div className="profile__button-group">
                    <button
                      type="submit"
                      className="profile__btn profile__btn-save"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="me-1" />{" "}
                      Lưu
                    </button>
                    <button
                      type="button"
                      className="profile__btn profile__btn-cancel"
                      onClick={() => setEditMode(false)}
                    >
                      <FontAwesomeIcon icon={faTimesCircle} className="me-1" />{" "}
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile__info">
                  <p>
                    <strong>Tên Đăng Nhập:</strong>{" "}
                    {user.username || "Chưa thiết lập"}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email || "Chưa thiết lập"}
                  </p>
                  <p>
                    <strong>Họ và Tên:</strong>{" "}
                    {user.fullname || "Chưa thiết lập"}
                  </p>
                  <p>
                    <strong>Địa Chỉ:</strong> {user.address || "Chưa cung cấp"}
                  </p>
                  <p>
                    <strong>Số Điện Thoại:</strong>{" "}
                    {user.phone || "Chưa cung cấp"}
                  </p>
                  <p>
                    <strong>Ảnh Đại Diện:</strong>{" "}
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="profile__avatar"
                      />
                    ) : (
                      "Chưa thiết lập"
                    )}
                  </p>
                  <button
                    className="profile__btn profile__btn-edit"
                    onClick={() => setEditMode(true)}
                  >
                    <FontAwesomeIcon icon={faPencil} className="me-1" /> Chỉnh
                    Sửa Hồ Sơ
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;
