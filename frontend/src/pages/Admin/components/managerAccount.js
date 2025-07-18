import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
} from "reactstrap";
import { FaEdit, FaTrash, FaCheck } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import "./index.css";
const ManageAccounts = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [modal, setModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullname: "",
    phone: "",
    status: "active",
    role: "user",
  });

  const token = localStorage.getItem("accessToken");

  const toggleModal = () => setModal(!modal);

  const fetchUsers = () => {
    axios
      .get("http://localhost:8000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.error("Failed to fetch users", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleEditClick = (user) => {
    setEditFormData({
      fullname: user.fullname,
      phone: user.phone,
      status: user.status,
      role: user.role || "user",
    });
    setEditUserId(user._id);
    setModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "active" : "inactive") : value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8000/api/admin/users/${editUserId}`,
        editFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchUsers();
      toggleModal();
    } catch (err) {
      Swal.fire("Lỗi", "Không thể cập nhật người dùng", "error");
    }
  };

  const handleDelete = async (userId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc?",
      text: "Bạn muốn xóa người dùng này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8000/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Xóa thành công", "", "success");
        fetchUsers();
      } catch (err) {
        Swal.fire("Lỗi", "Không thể xóa người dùng", "error");
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/admin/users/${userId}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers();
    } catch (err) {
      Swal.fire("Lỗi", "Không thể đổi trạng thái", "error");
    }
  };

  return (
    <section className="manage-accounts-section">
      <Container>
        <Row>
          <Col lg="12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Manage Accounts</h2>
              <Input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "300px" }}
              />
            </div>

            <Table striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fullname</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{user.fullname}</td>
                    <td>{user.phone}</td>
                    <td>
                      <FaCheck
                        className={
                          user.status === "active"
                            ? "active-check"
                            : "inactive-check"
                        }
                      />
                    </td>
                    <td>{user.role}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          color="link"
                          className="icon-btn"
                          onClick={() => handleEditClick(user)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          color="link"
                          className="icon-btn"
                          onClick={() => handleToggleStatus(user._id)}
                        >
                          <FaCheck />
                        </Button>
                        <Button
                          color="link"
                          className="icon-btn"
                          onClick={() => handleDelete(user._id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Modal chỉnh sửa */}
            <Modal isOpen={modal} toggle={toggleModal}>
              <ModalHeader toggle={toggleModal}>Update User</ModalHeader>
              <ModalBody>
                <Form>
                  <FormGroup>
                    <Label for="fullname">Fullname</Label>
                    <Input
                      type="text"
                      name="fullname"
                      value={editFormData.fullname}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="phone">Phone</Label>
                    <Input
                      type="text"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        name="status"
                        checked={editFormData.status === "active"}
                        onChange={handleInputChange}
                      />{" "}
                      Active
                    </Label>
                  </FormGroup>
                  <FormGroup className="mt-2">
                    <Label for="role">Role</Label>
                    <Input
                      type="select"
                      name="role"
                      value={editFormData.role}
                      onChange={handleInputChange}
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="user">User</option>
                    </Input>
                  </FormGroup>
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onClick={handleUpdate}>
                  Update
                </Button>{" "}
                <Button color="secondary" onClick={toggleModal}>
                  Cancel
                </Button>
              </ModalFooter>
            </Modal>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ManageAccounts;
