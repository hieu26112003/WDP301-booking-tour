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
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { BASE_URL } from "../../utils/config";

// Quill module resize
import ImageResize from "quill-image-resize-module-react";
Quill.register("modules/imageResize", ImageResize);

const quillModules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
  ],
  imageResize: {
    parchment: Quill.import("parchment"),
    modules: ["Resize", "DisplaySize"],
  },
};

const CATEGORY_OPTIONS = [
  { value: "kinh-nghiem", label: "Kinh nghiệm" },
  { value: "am-thuc", label: "Ẩm thực" },
  { value: "review", label: "Review" },
  { value: "xu-huong", label: "Xu hướng" },
];

const ManageGuide = () => {
  const [guides, setGuides] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const openCreateModal = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({ title: "", content: "", category: "" });
    setImageFile(null);
    setModal(true);
  };

  const openEditModal = (guide) => {
    setIsEdit(true);
    setEditId(guide._id);
    setFormData({
      title: guide.title || "",
      content: guide.content || "",
      category: guide.category || "",
    });
    setImageFile(null); // user chọn ảnh mới nếu muốn đổi
    setModal(true);
  };

  const closeModal = () => setModal(false);

  const fetchGuides = async () => {
    try {
      const res = await fetch(`${BASE_URL}/guides`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setGuides(result.data);
    } catch (err) {
      Swal.fire("Lỗi", err.message || "Không thể tải guides", "error");
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("category", formData.category);
    if (imageFile) data.append("image", imageFile);

    try {
      const url = isEdit ? `${BASE_URL}/guides/${editId}` : `${BASE_URL}/guides`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, { method, body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      Swal.fire("Thành công", isEdit ? "Đã cập nhật bài viết" : "Đã tạo bài viết", "success");
      closeModal();
      fetchGuides();
    } catch (err) {
      Swal.fire("Lỗi", err.message || (isEdit ? "Không thể cập nhật bài viết" : "Không thể tạo bài viết"), "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn muốn xóa bài viết này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${BASE_URL}/guides/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        Swal.fire("Đã xóa", "Bài viết đã được xóa", "success");
        fetchGuides();
      } catch (err) {
        Swal.fire("Lỗi", err.message || "Không thể xóa", "error");
      }
    }
  };

  const renderCategory = (value) => {
    const found = CATEGORY_OPTIONS.find((opt) => opt.value === value);
    return found ? found.label : value || "-";
  };

  return (
    <Container>
      <Row>
        <Col lg="12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Quản lý Cẩm nang</h2>
            <Button color="primary" onClick={openCreateModal}>
              <FaPlus /> Thêm bài viết
            </Button>
          </div>

          {/* Modal thêm / sửa guide */}
          <Modal isOpen={modal} toggle={closeModal} size="lg">
            <ModalHeader toggle={closeModal}>
              {isEdit ? "Cập nhật bài viết" : "Tạo bài viết mới"}
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="title">Tiêu đề</Label>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="category">Loại cẩm nang</Label>
                  <Input
                    type="select"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Chọn loại --</option>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Input>
                </FormGroup>

                <FormGroup>
                  <Label for="image">Ảnh {isEdit && <small>(để trống nếu giữ ảnh cũ)</small>}</Label>
                  <Input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    required={!isEdit} // tạo mới bắt buộc, update thì không
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="content">Nội dung</Label>
                  <ReactQuill
                    value={formData.content}
                    onChange={handleQuillChange}
                    modules={quillModules}
                    placeholder="Nhập nội dung hướng dẫn"
                  />
                </FormGroup>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={handleSubmit}>
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </Button>
              <Button color="secondary" onClick={closeModal}>
                Hủy
              </Button>
            </ModalFooter>
          </Modal>

          {/* Bảng hiển thị bài viết */}
          <Table bordered responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Loại</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((guide, index) => (
                <tr key={guide._id}>
                  <td>{index + 1}</td>
                  <td>
                    {guide.image ? (
                      <img
                        src={guide.image}
                        alt={guide.title}
                        style={{
                          width: "80px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "6px",
                        }}
                      />
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>{guide.title}</td>
                  <td>{renderCategory(guide.category)}</td>
                  <td className="d-flex gap-2">
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={() => openEditModal(guide)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => handleDelete(guide._id)}
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
  );
};

export default ManageGuide;
