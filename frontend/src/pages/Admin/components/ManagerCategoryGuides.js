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

  const toggleModal = () => {
    if (!isLoading) setModal(!modal);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let res;
      if (editId) {
        res = await fetch(`${BASE_URL}/category-guides/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch(`${BASE_URL}/category-guides`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
      Swal.fire("Lỗi", err.message, "error");
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
    const confirm = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn chắc chắn muốn xóa?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${BASE_URL}/category-guides/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Xóa thất bại");
      Swal.fire("Đã xóa", "", "success");
      fetchCategories();
    } catch (err) {
      Swal.fire("Lỗi", err.message, "error");
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
              <h2>Manager Categories Guides </h2>
              <Button color="primary" onClick={handleAddNew} className="icon-btn" disabled={isLoading}>
                <FaPlus />
              </Button>
            </div>

            <Modal isOpen={modal} toggle={toggleModal}>
              <ModalHeader toggle={toggleModal}>{editId ? "Update Category" : "Tạo loại mới"}</ModalHeader>
              <ModalBody>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="name">Name</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Nhập tên loại"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="description">Description</Label>
                    <Input
                      type="textarea"
                      id="description"
                      name="description"
                      placeholder="Nhập mô tả"
                      value={formData.description}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="isActive">Status</Label>
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
                </Button>{" "}
                <Button color="secondary" onClick={toggleModal} disabled={isLoading}>
                  Cancel
                </Button>
              </ModalFooter>
            </Modal>

            <Table striped responsive>
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>SLUG</th>
                  <th>DESCRIPTION</th>
                  <th>ACTIVE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td style={{ whiteSpace: "pre-wrap" }}>{category.description}</td>
                    <td>
                      <FaCheck
                        className={
                          category.isActive ? "active-check" : "inactive-check"
                        }
                      />
                    </td>
                    <td>
                      <Button color="link" className="icon-btn" onClick={() => handleEdit(category)} disabled={isLoading}>
                        <FaEdit />
                      </Button>
                      <Button color="link" className="icon-btn" onClick={() => handleDelete(category._id)} disabled={isLoading}>
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
