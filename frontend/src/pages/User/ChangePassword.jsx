import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faKey } from "@fortawesome/free-solid-svg-icons";

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

    if (!user) {
      setError("No user data available. Please log in.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setError("No access token found. Please log in.");
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

      setSuccess(res.data.message || "Password changed successfully");
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
    } catch (err) {
      console.error("Change password error:", err);
      setError(err.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Change Password</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Update Password</h5>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <label htmlFor="currentPassword" className="form-label">
                Current Password
              </label>
              <div className="input-group">
                <input
                  type={showPasswords.currentPassword ? "text" : "password"}
                  className="form-control"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => togglePasswordVisibility("currentPassword")}
                  aria-label={
                    showPasswords.currentPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <FontAwesomeIcon
                    icon={showPasswords.currentPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <div className="input-group">
                <input
                  type={showPasswords.newPassword ? "text" : "password"}
                  className="form-control"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => togglePasswordVisibility("newPassword")}
                  aria-label={
                    showPasswords.newPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <FontAwesomeIcon
                    icon={showPasswords.newPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <div className="input-group">
                <input
                  type={showPasswords.confirmPassword ? "text" : "password"}
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  aria-label={
                    showPasswords.confirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <FontAwesomeIcon
                    icon={showPasswords.confirmPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <FontAwesomeIcon icon={faKey} className="me-1" /> Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
