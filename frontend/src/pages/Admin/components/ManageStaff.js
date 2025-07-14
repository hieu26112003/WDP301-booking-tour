import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const ManageStaff = () => {
  const [staffs, setStaffs] = useState([]);
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // <== Thêm search state

  const token = localStorage.getItem("accessToken");

  const fetchStaffs = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const staffList = res.data.filter((user) => user.role === "staff");
      setStaffs(staffList);
    } catch (err) {
      console.error("Lỗi khi fetch staffs:", err);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const normalUsers = res.data.filter((user) => user.role === "user");
      setUsers(normalUsers);
    } catch (err) {
      console.error("Lỗi khi fetch users:", err);
    }
  }, [token]);

  const handleDemote = async (staffId) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return;

    try {
      await axios.patch(
        `http://localhost:8000/api/admin/users/${staffId}/demote`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Đã xóa nhân viên");
      fetchStaffs();
    } catch (err) {
      console.error("Lỗi khi xóa staff:", err);
      alert("Xóa thất bại");
    }
  };

  const promoteToStaff = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn đôn người này lên staff?")) return;

    try {
      await axios.patch(
        `http://localhost:8000/api/admin/users/${userId}/promote`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Thêm thành công!");
      fetchStaffs();
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi đôn lên staff:", err);
      alert("Thêm thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  const openUserList = async () => {
    await fetchUsers();
    setShowUserList(true);
  };

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  // ✅ Lọc theo từ khóa tìm kiếm
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Quản lý nhân viên (Staff)</h2>
        <button className="btn btn-primary" onClick={openUserList}>
          + Thêm staff
        </button>
      </div>

      <table className="table table-bordered table-hover mt-3">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Username</th>
            <th>Fullname</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {staffs.map((staff, index) => (
            <tr key={staff._id}>
              <td>{index + 1}</td>
              <td>{staff.username}</td>
              <td>{staff.fullname}</td>
              <td>{staff.email}</td>
              <td>{staff.phone}</td>
              <td>{new Date(staff.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDemote(staff._id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showUserList && (
        <div className="mt-4 p-3 border rounded bg-light">
          <h4>Danh Sách User</h4>

          {/* ✅ Thanh tìm kiếm */}
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Email</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => promoteToStaff(user._id)}
                      >
                        Thêm staff
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    Không tìm thấy người dùng
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <button
            className="btn btn-secondary mt-2"
            onClick={() => setShowUserList(false)}
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;
