import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { FaTrash, FaUserPlus } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import "./index.css"; // dùng chung CSS với ManageAccounts nếu có

const ManageStaff = () => {
  const [staffs, setStaffs] = useState([]);
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    const confirm = await Swal.fire({
      title: "Bạn có chắc?",
      text: "Bạn muốn xóa nhân viên này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.patch(
          `http://localhost:8000/api/admin/users/${staffId}/demote`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("Xóa thành công!", "", "success");
        fetchStaffs();
      } catch (err) {
        Swal.fire("Lỗi", "Xóa thất bại", "error");
      }
    }
  };

  const promoteToStaff = async (userId) => {
    const confirm = await Swal.fire({
      title: "Bạn có chắc?",
      text: "Bạn muốn đôn người dùng này lên staff?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.patch(
          `http://localhost:8000/api/admin/users/${userId}/promote`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("Thành công!", "Đã đôn lên staff.", "success");
        fetchStaffs();
        fetchUsers();
      } catch (err) {
        Swal.fire("Lỗi", err.response?.data?.message || "Thêm thất bại", "error");
      }
    }
  };

  const openUserList = async () => {
    await fetchUsers();
    setShowUserList(true);
  };

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="manage-accounts-section">
      <Container>
        <Row>
          <Col lg="12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Quản lý Nhân viên</h2>
              <Button color="primary" onClick={openUserList}>
                <FaUserPlus className="me-2" />
                Thêm staff
              </Button>
            </div>

            <Table striped responsive>
              <thead>
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
                      <Button
                        color="link"
                        className="icon-btn"
                        onClick={() => handleDemote(staff._id)}
                      >
                        <FaTrash color="red" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* User List Modal */}
            <Modal isOpen={showUserList} toggle={() => setShowUserList(false)} size="lg">
              <ModalHeader toggle={() => setShowUserList(false)}>
                Danh sách User để thăng lên Staff
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  className="mb-3"
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <Table bordered>
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
                            <Button
                              size="sm"
                              color="success"
                              onClick={() => promoteToStaff(user._id)}
                            >
                              <FaUserPlus className="me-1" />
                              Thêm staff
                            </Button>
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
                </Table>
              </ModalBody>
            </Modal>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ManageStaff;
