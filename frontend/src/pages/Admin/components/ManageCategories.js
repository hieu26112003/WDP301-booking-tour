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
  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleModal = () => {
    if (!isLoading) {
      setModal(!modal);
      if (!modal) {
        // Reset errors when opening modal
        setErrors({ name: "", description: "" });
      }
    }
  };

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
      if (!res.ok) throw new Error(result.message || "Không thể tải danh mục");
      setCategories(result.data);
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
        willClose: () => {
          document.body.style.overflow = "auto";
        },
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { name: "", description: "" };

    // Xác thực name
    if (!formData.name) {
      newErrors.name = "Tên danh mục là bắt buộc";
      isValid = false;
    } else if (formData.name.length > 100) {
      newErrors.name = "Tên danh mục không được vượt quá 100 ký tự";
      isValid = false;
    }

    // Xác thực description
    if (!formData.description) {
      newErrors.description = "Mô tả là bắt buộc";
      isValid = false;
    } else if (formData.description.length > 500) {
      newErrors.description = "Mô tả không được vượt quá 500 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    // Xóa lỗi khi người dùng nhập lại
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateInputs()) {
      setIsLoading(false);
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    try {
      let res;
      if (editId) {
        res = await fetch(`${BASE_URL}/categories/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
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
      if (!res.ok) {
        let errorMessage = result.message || "Không thể lưu danh mục";
        if (result.message.includes("name")) {
          setErrors((prev) => ({ ...prev, name: "Tên danh mục đã tồn tại" }));
        } else {
          errorMessage = result.message;
        }

        throw new Error(errorMessage);
      }

      Swal.fire({
        icon: "success",
        title: editId ? "Cập nhật thành công" : "Tạo thành công",
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
          document.body.style.overflow = "auto";
        },
      }).then(() => {
        setFormData({ name: "", description: "", isActive: true });
        setEditId(null);
        setErrors({ name: "", description: "" });
        toggleModal();
        fetchCategories();
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
        willClose: () => {
          document.body.style.overflow = "auto";
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    });
    setErrors({ name: "", description: "" });
    setEditId(category._id);
    toggleModal();
  };

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
      backdrop: true,
      allowOutsideClick: true,
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        content: "custom-swal-content",
        confirmButton: "custom-swal-confirm",
        cancelButton: "custom-swal-cancel",
      },
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${BASE_URL}/categories/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const result = await res.json();

        if (!res.ok) {
          const errorMessage =
            result.message ===
            "Cannot delete category because it has associated tours"
              ? "Không thể xóa danh mục vì có các tour liên quan"
              : result.message || "Không thể xóa danh mục";
          throw new Error(errorMessage);
        }

        Swal.fire({
          icon: "success",
          title: "Xóa thành công",
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
            document.body.style.overflow = "auto";
          },
        }).then(() => {
          fetchCategories();
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
          willClose: () => {
            document.body.style.overflow = "auto";
          },
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddNew = () => {
    setFormData({ name: "", description: "", isActive: true });
    setErrors({ name: "", description: "" });
    setEditId(null);
    toggleModal();
  };

  return (
    <section className="manage-categories-section">
      <Container>
        <Row>
          <Col lg="12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Quản Lý Danh Mục Tour</h2>
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
                {editId ? "Cập Nhật Danh Mục" : "Tạo Danh Mục"}
              </ModalHeader>
              <ModalBody>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="name">Tên Danh Mục</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Nhập tên danh mục"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <span className="error__message">{errors.name}</span>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label for="description">Mô Tả</Label>
                    <Input
                      type="textarea"
                      id="description"
                      name="description"
                      placeholder="Nhập mô tả danh mục"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                    {errors.description && (
                      <span className="error__message">
                        {errors.description}
                      </span>
                    )}
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        disabled={isLoading}
                      />{" "}
                      Trạng Thái
                    </Label>
                  </FormGroup>
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onClick={handleSubmit}
                  disabled={isLoading || errors.name || errors.description}
                >
                  {editId ? "Cập Nhật" : "Tạo"}
                </Button>{" "}
                <Button
                  color="secondary"
                  onClick={toggleModal}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
              </ModalFooter>
            </Modal>

            <Table striped>
              <thead>
                <tr>
                  <th>Tên Danh Mục</th>
                  <th>Mô Tả</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td className="description-content">
                      {category.description}
                    </td>
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
