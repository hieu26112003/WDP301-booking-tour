import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";

const Profile = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    avatar: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
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
      setError("No access token found. Please log in.");
      return;
    }

    const data = new FormData();
    data.append("fullname", formData.fullname);
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
        throw new Error("Invalid user data in response");
      }

      dispatch({ type: "UPDATE_PROFILE", payload: updatedUser });
      setFormData({
        fullname: updatedUser.fullname || "",
        phone: updatedUser.phone || "",
        avatar: null,
      });
      setSuccess("Profile updated successfully");
      setEditMode(false);
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="container mt-4">
      <h2>User Profile</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : !user ? (
        <div className="alert alert-warning">
          No user data available. Please log in.
        </div>
      ) : (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Profile Details</h5>
            {editMode ? (
              <form onSubmit={handleProfileSubmit}>
                <div className="mb-3">
                  <label htmlFor="fullname" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Phone
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="avatar" className="form-label">
                    Avatar
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="avatar"
                    name="avatar"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary me-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditMode(false)}
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="me-1" />{" "}
                  Cancel
                </button>
              </form>
            ) : (
              <div>
                <p>
                  <strong>Full Name:</strong> {user.fullname || "Not set"}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phone || "Not provided"}
                </p>
                <p>
                  <strong>Avatar:</strong>{" "}
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "Not set"
                  )}
                </p>
                <button
                  className="btn btn-warning"
                  onClick={() => setEditMode(true)}
                >
                  <FontAwesomeIcon icon={faPencil} className="me-1" /> Edit
                  Profile
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
