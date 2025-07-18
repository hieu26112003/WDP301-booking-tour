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
  const [imageFile, setImageFile] = useState(null); // For first image upload
  const [imageUrls, setImageUrls] = useState([""]); // Start with one URL input
  const [existingImages, setExistingImages] = useState([]); // For edit mode
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Mở/đóng modal
  const toggleModal = () => {
    if (!isLoading) {
      setModal(!modal);
      if (!modal) {
        setImageFile(null);
        setImageUrls([""]);
        setExistingImages([]);
      }
    }
  };

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/categories`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
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

  // Lấy danh sách tour
  const fetchTours = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/tours`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Không thể tải tour");
      console.log(
        "Fetched tours:",
        result.data.map((t) => ({ id: t._id, images: t.images }))
      ); // Debugging log
      setTours(result.data);
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

  // Xử lý thay đổi URL ảnh
  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  // Thêm input URL mới
  const handleAddImageUrl = () => {
    if (imageUrls.length < 4) {
      setImageUrls([...imageUrls, ""]);
    }
  };

  // Xóa ảnh hiện có trong edit mode
  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (imageFile) {
      data.append("image", imageFile); // First image via file upload
    }

    // Gửi danh sách URL ảnh
    const validUrls = imageUrls.filter((url) => url.trim());
    if (validUrls.length > 0) {
      data.append("imageUrls", JSON.stringify(validUrls));
    }

    // Gửi danh sách ảnh hiện có khi cập nhật
    if (editId && existingImages.length > 0) {
      data.append("existingImages", JSON.stringify(existingImages));
    }

    // Kiểm tra xem có ít nhất một ảnh (mới, URL, hoặc hiện có)
    if (!editId && !imageFile && validUrls.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "At least one image is required",
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
      setIsLoading(false);
      return;
    }

    try {
      let res;
      if (editId) {
        res = await fetch(`${BASE_URL}/tours/${editId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: data,
        });
      } else {
        res = await fetch(`${BASE_URL}/tours`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: data,
        });
      }

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Không thể lưu tour");

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
        setImageUrls([""]);
        setExistingImages([]);
        setEditId(null);
        toggleModal();
        fetchTours();
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
    setImageUrls([""]);
    setExistingImages(tour.images || []);
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
        const res = await fetch(`${BASE_URL}/tours/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const result = await res.json();
        console.log("Delete tour response:", result);

        if (!res.ok) {
          throw new Error(result.message || "Không thể xóa tour");
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
          fetchTours();
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
    setImageUrls([""]);
    setExistingImages([]);
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
    <section className="manage-tours-section">
      <Container>
        <Row>
          <Col lg="12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Manage Tours</h2>
              <Button
                color="primary"
                onClick={handleAddNew}
                className="icon-btn"
                disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="notes">Notes</Label>
                    <ReactQuill
                      value={formData.notes}
                      onChange={handleQuillChange("notes")}
                      modules={quillModules}
                      placeholder="Enter notes (supports HTML formatting)"
                      readOnly={isLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="cancellationPolicy">Cancellation Policy</Label>
                    <ReactQuill
                      value={formData.cancellationPolicy}
                      onChange={handleQuillChange("cancellationPolicy")}
                      modules={quillModules}
                      placeholder="Enter cancellation policy (supports HTML formatting)"
                      readOnly={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                    <Label for="image">First Image (Upload)</Label>
                    <Input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!editId && !imageUrls.some((url) => url.trim())}
                      disabled={isLoading}
                    />
                    {imageFile && (
                      <div className="mt-2">
                        <p>Selected file: {imageFile.name}</p>
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label>Additional Images (URLs)</Label>
                    {imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center mb-2"
                      >
                        <Input
                          type="text"
                          placeholder={`Image URL ${index + 1}`}
                          value={url}
                          onChange={(e) =>
                            handleImageUrlChange(index, e.target.value)
                          }
                          disabled={isLoading}
                          className="me-2"
                        />
                        {index === imageUrls.length - 1 &&
                          imageUrls.length < 4 && (
                            <Button
                              color="primary"
                              size="sm"
                              onClick={handleAddImageUrl}
                              disabled={isLoading}
                            >
                              <FaPlus />
                            </Button>
                          )}
                      </div>
                    ))}
                  </FormGroup>
                  {editId && existingImages.length > 0 && (
                    <FormGroup>
                      <Label>Existing Images</Label>
                      <div className="d-flex flex-wrap">
                        {existingImages.map((image, index) => (
                          <div key={index} className="position-relative m-2">
                            <img
                              src={image}
                              alt={`Existing image ${index + 1}`}
                              style={{ maxWidth: "100px", height: "auto" }}
                              onError={(e) =>
                                console.error(
                                  "Existing image load error:",
                                  image
                                )
                              }
                            />
                            <Button
                              color="danger"
                              size="sm"
                              className="position-absolute top-0 end-0"
                              onClick={() => handleRemoveExistingImage(index)}
                              disabled={isLoading}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </FormGroup>
                  )}
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        id="featured"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        disabled={isLoading}
                      />{" "}
                      Featured
                    </Label>
                  </FormGroup>
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {editId ? "Update" : "Create"}
                </Button>{" "}
                <Button
                  color="secondary"
                  onClick={toggleModal}
                  disabled={isLoading}
                >
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
                  <th>Notes</th>
                  <th>Cancellation Policy</th>
                  <th>Category</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((tour, index) => {
                  const firstImage =
                    tour.images && tour.images.length > 0
                      ? tour.images[0]
                      : "/placeholder.jpg";
                  return (
                    <tr key={tour._id}>
                      <td>{index + 1}</td>
                      <td className="image-cell">
                        <img
                          src={firstImage}
                          alt={tour.title}
                          className="tour-image"
                          onError={(e) =>
                            console.error("Image load error:", firstImage)
                          }
                        />
                      </td>
                      <td>{tour.title}</td>
                      <td>{tour.summary}</td>
                      <td>{tour.priceAdult}</td>
                      <td className="html-content">
                        {truncateText(tour.notes)}
                      </td>
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
                          disabled={isLoading}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          color="link"
                          className="icon-btn"
                          onClick={() => handleEdit(tour)}
                          title="Edit"
                          disabled={isLoading}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          color="link"
                          className="icon-btn"
                          onClick={() => handleDelete(tour._id)}
                          title="Delete"
                          disabled={isLoading}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ManageTours;
