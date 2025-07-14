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
import { FaPlus, FaEdit, FaTrash, FaCheck, FaEye } from "react-icons/fa";
import ReactQuill, { Quill } from "react-quill";
import parse from "html-react-parser";
import "react-quill/dist/quill.snow.css";
import { BASE_URL } from "../../../utils/config";
import "../../../styles/manageTour.css";
import { useNavigate } from "react-router-dom";

// Thêm module image-resize cho ReactQuill
import ImageResize from "quill-image-resize-module-react";
Quill.register("modules/imageResize", ImageResize);

// Đăng ký cỡ chữ tùy chỉnh
const Size = Quill.import("attributors/style/size");
Size.whitelist = ["12px", "14px", "16px", "18px", "20px"];
Quill.register(Size, true);

const ManageTours = () => {
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    days: "",
    serviceStandards: "",
    priceChild: "",
    priceAdult: "",
    notes: "",
    cancellationPolicy: "",
    schedule: "",
    departureDate: "",
    time: "",
    categoryId: "",
    featured: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const navigate = useNavigate();

  // Mở/đóng modal
  const toggleModal = () => setModal(!modal);

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/categories`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
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

  // Lấy danh sách tour
  const fetchTours = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/tours`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setTours(result.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải tour",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchCategories();
    fetchTours();
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Xử lý thay đổi ReactQuill
  const handleQuillChange = (name) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý chọn file ảnh
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("accessToken");
    const data = new FormData();

    // Thêm các trường formData vào FormData
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    // Thêm file ảnh nếu có
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      let res;
      if (editId) {
        // Cập nhật tour
        res = await fetch(`${BASE_URL}/tours/${editId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: data,
        });
      } else {
        // Tạo tour mới
        res = await fetch(`${BASE_URL}/tours`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: data,
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

      setFormData({
        title: "",
        summary: "",
        days: "",
        serviceStandards: "",
        priceChild: "",
        priceAdult: "",
        notes: "",
        cancellationPolicy: "",
        schedule: "",
        departureDate: "",
        time: "",
        categoryId: "",
        featured: false,
      });
      setImageFile(null);
      setEditId(null);
      toggleModal();
      fetchTours();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.message || "Không thể lưu tour",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Xử lý chỉnh sửa
  const handleEdit = (tour) => {
    setFormData({
      title: tour.title,
      summary: tour.summary,
      days: tour.days,
      serviceStandards: tour.serviceStandards,
      priceChild: tour.priceChild,
      priceAdult: tour.priceAdult,
      notes: tour.notes,
      cancellationPolicy: tour.cancellationPolicy,
      schedule: tour.schedule,
      departureDate: tour.departureDate,
      time: tour.time,
      categoryId: tour.categoryId?._id || tour.categoryId,
      featured: tour.featured || false,
    });
    setImageFile(null);
    setEditId(tour._id);
    toggleModal();
  };

  // Xử lý xóa
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc?",
      text: "Bạn muốn xóa tour này?",
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
        const res = await fetch(`${BASE_URL}/tours/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
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
        fetchTours();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: err.message || "Không thể xóa tour",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  // Mở modal để thêm tour mới
  const handleAddNew = () => {
    setFormData({
      title: "",
      summary: "",
      days: "",
      serviceStandards: "",
      priceChild: "",
      priceAdult: "",
      notes: "",
      cancellationPolicy: "",
      schedule: "",
      departureDate: "",
      time: "",
      categoryId: "",
      featured: false,
    });
    setImageFile(null);
    setEditId(null);
    toggleModal();
  };

  // Xem chi tiết tour
  const handleViewDetail = (tour) => {
    navigate(`/tour-detail/${tour._id}`, { state: { tour } });
  };

  // Cấu hình module cho ReactQuill
  const quillModules = {
    toolbar: [
      [{ size: ["12px", "14px", "16px", "18px", "20px"] }],
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

  // Hàm trích xuất text thuần túy từ HTML và cắt chuỗi
  const truncateText = (html, maxLength = 100) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <section>
      <Container>
        <Row>
          <Col lg="12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Manage Tours</h2>
              <Button
                color="primary"
                onClick={handleAddNew}
                className="icon-btn"
              >
                <FaPlus />
              </Button>
            </div>

            <Modal isOpen={modal} toggle={toggleModal} size="lg">
              <ModalHeader toggle={toggleModal}>
                {editId ? "Update Tour" : "Create Tour"}
              </ModalHeader>
              <ModalBody>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="title">Title</Label>
                    <Input
                      type="text"
                      id="title"
                      name="title"
                      placeholder="Tour Title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="summary">Summary</Label>
                    <Input
                      type="textarea"
                      id="summary"
                      name="summary"
                      placeholder="Tour Summary"
                      value={formData.summary}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="days">Days</Label>
                    <Input
                      type="text"
                      id="days"
                      name="days"
                      placeholder="Number of Days (e.g., 3 days)"
                      value={formData.days}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="serviceStandards">Service Standards</Label>
                    <Input
                      type="text"
                      id="serviceStandards"
                      name="serviceStandards"
                      placeholder="Service Standards"
                      value={formData.serviceStandards}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="priceChild">Price (Child)</Label>
                    <Input
                      type="number"
                      id="priceChild"
                      name="priceChild"
                      placeholder="Price for Child"
                      value={formData.priceChild}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="priceAdult">Price (Adult)</Label>
                    <Input
                      type="number"
                      id="priceAdult"
                      name="priceAdult"
                      placeholder="Price for Adult"
                      value={formData.priceAdult}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="notes">Notes</Label>
                    <ReactQuill
                      value={formData.notes}
                      onChange={handleQuillChange("notes")}
                      modules={quillModules}
                      placeholder="Enter notes (supports HTML formatting)"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="cancellationPolicy">Cancellation Policy</Label>
                    <ReactQuill
                      value={formData.cancellationPolicy}
                      onChange={handleQuillChange("cancellationPolicy")}
                      modules={quillModules}
                      placeholder="Enter cancellation policy (supports HTML formatting)"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="schedule">Schedule</Label>
                    <Input
                      type="textarea"
                      id="schedule"
                      name="schedule"
                      placeholder="Tour Schedule"
                      value={formData.schedule}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="departureDate">Departure Date</Label>
                    <Input
                      type="text"
                      id="departureDate"
                      name="departureDate"
                      placeholder="Departure Date (e.g., 2025-08-01)"
                      value={formData.departureDate}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="time">Time</Label>
                    <Input
                      type="text"
                      id="time"
                      name="time"
                      placeholder="Time (e.g., 08:00)"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="categoryId">Category</Label>
                    <Input
                      type="select"
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label for="image">Image</Label>
                    <Input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!editId}
                    />
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        id="featured"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                      />{" "}
                      Featured
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
                  <th>No.</th>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Summary</th>
                  <th>Price (Adult)</th>
                  {/* <th>Days</th> */}
                  <th>Notes</th>
                  <th>Cancellation Policy</th>
                  <th>Category</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((tour, index) => (
                  <tr key={tour._id}>
                    <td>{index + 1}</td>
                    <td className="image-cell">
                      {tour.image ? (
                        <img
                          src={tour.image}
                          alt={tour.title}
                          className="tour-image"
                        />
                      ) : (
                        <span className="no-image">N/A</span>
                      )}
                    </td>
                    <td>{tour.title}</td>
                    <td>{tour.summary}</td>
                    <td>{tour.priceAdult}</td>
                    {/* <td>{tour.days}</td> */}
                    <td className="html-content">{truncateText(tour.notes)}</td>
                    <td className="html-content">
                      {truncateText(tour.cancellationPolicy)}
                    </td>
                    <td>{tour.categoryId?.name || "N/A"}</td>
                    <td>
                      <FaCheck
                        className={
                          tour.featured ? "active-check" : "inactive-check"
                        }
                      />
                    </td>
                    <td>
                      <Button
                        color="link"
                        className="icon-btn"
                        onClick={() => handleViewDetail(tour)}
                        title="View Details"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        color="link"
                        className="icon-btn"
                        onClick={() => handleEdit(tour)}
                        title="Edit"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        color="link"
                        className="icon-btn"
                        onClick={() => handleDelete(tour._id)}
                        title="Delete"
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

export default ManageTours;
