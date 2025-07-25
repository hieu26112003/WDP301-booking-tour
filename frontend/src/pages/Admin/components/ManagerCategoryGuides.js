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
  InputGroup,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InputGroupText,
} from "reactstrap";
import Swal from "sweetalert2";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaSearch } from "react-icons/fa";
import { BASE_URL } from "../../../utils/config";
import "../../../styles/managerGuides.css";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [validationErrors, setValidationErrors] = useState({});

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
        ? category.isActive
        : !category.isActive;
    return matchesSearch && matchesStatus;
  });

  const toggleModal = () => {
    if (!isLoading) {
      setValidationErrors({});
      setModal(!modal);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}/category-guides`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Không thể tải loại cẩm nang");
      setCategories(result.data);
    } catch (err) {
      Swal.fire("Lỗi", err.message, "error");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
  const errors = {};
  const trimmedName = formData.name.trim();

  if (!trimmedName) {
    errors.name = "Tên không được để trống.";
  } else if (trimmedName.length < 2 || trimmedName.length > 100) {
    errors.name = "Tên phải từ 2 đến 100 ký tự.";
  } else if (/^\d+$/.test(trimmedName)) {
    errors.name = "Tên không được chỉ chứa số.";
  }

  if (formData.description && formData.description.trim().length > 500) {
    errors.description = "Mô tả không được vượt quá 500 ký tự.";
  }

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let res;
      if (editId) {
        res = await fetch(`${BASE_URL}/category-guides/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch(`${BASE_URL}/category-guides`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Không thể lưu loại cẩm nang");

      Swal.fire("Thành công", editId ? "Đã cập nhật" : "Đã tạo", "success");
      setFormData({ name: "", description: "", isActive: true });
      setEditId(null);
      toggleModal();
      fetchCategories();
    } catch (err) {
  const message = err.message;
  if (message.includes("đã tồn tại") || message.includes("exist")) {
    setValidationErrors({ name: message });
  } else {
    Swal.fire("Lỗi", message, "error");
  }

    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    });
    setEditId(category._id);
    toggleModal();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc?",
      text: "Bạn muốn xóa danh mục hướng dẫn viên này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      backdrop: true,
      allowOutsideClick: true,
    });
    if (!result.isConfirmed) return;

    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/category-guides/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMessage =
          data.message ===
          "Cannot delete category guide because it has associated guides"
            ? "Không thể xóa danh mục vì có hướng dẫn viên liên quan"
            : data.message || "Không thể xóa danh mục";
        throw new Error(errorMessage);
      }
      Swal.fire({
        icon: "success",
        title: "Xóa thành công",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        fetchCategories();
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.message,
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({ name: "", description: "", isActive: true });
    setEditId(null);
    toggleModal();
  };

  return (
    <section className="manage-categories-section">
      <Container>
        <Row>
          <Col lg="12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Manager Categories Guides</h2>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div style={{ flex: "1", maxWidth: "400px" }}>
                    <InputGroup>
                      <InputGroupText>
                        <FaSearch className="text-muted" />
                      </InputGroupText>
                      <Input
                        type="text"
                        placeholder="Tìm theo tên danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </div>
                  <div style={{ width: "200px" }}>
                    <Input
                      type="select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Input>
                  </div>
                </div>
              </div>
              <Button
                color="primary"
                onClick={handleAddNew}
                className="icon-btn"
                disabled={isLoading}
              >
                <FaPlus />
              </Button>
            </div>

            <Modal isOpen={modal} toggle={toggleModal}>
              <ModalHeader toggle={toggleModal}>
                {editId ? "Update Category" : "Tạo loại mới"}
              </ModalHeader>
              <ModalBody>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="name">Tên</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Nhập tên loại"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      invalid={!!validationErrors.name}
                    />
                    {validationErrors.name && (
  <div className="text-danger small mt-1">{validationErrors.name}</div>
)}
                  </FormGroup>
                  <FormGroup>
                    <Label for="description">Miêu tả</Label>
                    <Input
                      type="textarea"
                      id="description"
                      name="description"
                      placeholder="Nhập mô tả"
                      value={formData.description}
                      onChange={handleChange}
                      disabled={isLoading}
                      invalid={!!validationErrors.description}
                    />
                    {validationErrors.description && (
                      <div className="text-danger small mt-1">
                        {validationErrors.description}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label for="isActive">Trạng Thái</Label>
                    <Input
                      type="select"
                      name="isActive"
                      id="isActive"
                      value={formData.isActive ? "active" : "inactive"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.value === "active",
                        }))
                      }
                      disabled={isLoading}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Input>
                  </FormGroup>
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onClick={handleSubmit} disabled={isLoading}>
                  {editId ? "Update" : "Tạo mới"}
                </Button>
                <Button color="secondary" onClick={toggleModal} disabled={isLoading}>
                  Hủy
                </Button>
              </ModalFooter>
            </Modal>

            <Table striped responsive>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Miêu tả</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td style={{ whiteSpace: "pre-wrap" }}>{category.description}</td>
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
                        disabled={isLoading}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        color="link"
                        className="icon-btn"
                        onClick={() => handleDelete(category._id)}
                        disabled={isLoading}
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
