import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import Swal from "sweetalert2";
import { FaPlus, FaEdit, FaTrash, FaCheck } from "react-icons/fa";
import { BASE_URL } from "../../../utils/config";
import "../../../styles/manageCategories.css";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);

  const toggleModal = () => setModal(!modal);

  const fetchCategories = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/categories`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setCategories(result.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh mục",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("accessToken");
    try {
      let res;
      if (editId) {
        // Cập nhật danh mục
        res = await fetch(`${BASE_URL}/categories/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Tạo danh mục mới
        res = await fetch(`${BASE_URL}/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        });
      }

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      Swal.fire({
        icon: "success",
        title: editId ? "Cập nhật thành công" : "Tạo thành công",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        timer: 1500,
      });

      setFormData({ name: "", description: "", isActive: true });
      setEditId(null);
      toggleModal();
      fetchCategories();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.message || "Không thể lưu danh mục",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Xử lý chỉnh sửa
  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    });
    setEditId(category._id);
    toggleModal();
  };

  // Xử lý xóa
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc?",
      text: "Bạn muốn xóa danh mục này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${BASE_URL}/categories/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        Swal.fire({
          icon: "success",
          title: "Xóa thành công",
          confirmButtonText: "OK",
          confirmButtonColor: "#3085d6",
          timer: 1500,
        });
        fetchCategories();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: err.message || "Không thể xóa danh mục",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  // Mở modal để thêm danh mục mới
  const handleAddNew = () => {
    setFormData({ name: "", description: "", isActive: true });
    setEditId(null);
    toggleModal();
  };

  return (
    <section>
      <Container>
        <Row>
          <Col lg="12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Manage Categories</h2>
              <Button
                color="primary"
                onClick={handleAddNew}
                className="icon-btn"
              >
                <FaPlus />
              </Button>
            </div>

            <Modal isOpen={modal} toggle={toggleModal}>
              <ModalHeader toggle={toggleModal}>
                {editId ? "Update Category" : "Create Category"}
              </ModalHeader>
              <ModalBody>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="name">Name</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Category Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="description">Description</Label>
                    <Input
                      type="textarea"
                      id="description"
                      name="description"
                      placeholder="Category Description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                      />{" "}
                      Active
                    </Label>
                  </FormGroup>
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onClick={handleSubmit}>
                  {editId ? "Update" : "Create"}
                </Button>{" "}
                <Button color="secondary" onClick={toggleModal}>
                  Cancel
                </Button>
              </ModalFooter>
            </Modal>

            <Table striped>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>{category.description}</td>
                    <td>
                      <FaCheck
                        className={
                          category.isActive ? "active-check" : "inactive-check"
                        }
                      />
                    </td>
                    <td>
                      <Button
                        color="link"
                        className="icon-btn"
                        onClick={() => handleEdit(category)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        color="link"
                        className="icon-btn"
                        onClick={() => handleDelete(category._id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ManageCategories;
