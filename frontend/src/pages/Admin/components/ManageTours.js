import React, { useState, useEffect, useCallback, useContext } from "react";
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
import "react-quill/dist/quill.snow.css";
import { BASE_URL } from "../../../utils/config";
import "../../../styles/manageTour.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";

// Thêm module image-resize cho ReactQuill
import ImageResize from "quill-image-resize-module-react";
Quill.register("modules/imageResize", ImageResize);

// Đăng ký cỡ chữ tùy chỉnh
const Size = Quill.import("attributors/style/size");
Size.whitelist = ["12px", "14px", "16px", "18px", "20px"];
Quill.register(Size, true);

const ManageTours = () => {
  const { api, dispatch } = useContext(AuthContext); // Use api from AuthContext
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staffs, setStaffs] = useState([]);
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
    staffId: "",
    featured: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imageUrls, setImageUrls] = useState([""]);
  const [existingImages, setExistingImages] = useState([]);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");

  const navigate = useNavigate();

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

  // ------------------ FETCH HELPERS ------------------
  const getToken = () => localStorage.getItem("accessToken");

  const fetchCategories = async () => {
    try {
      const accessToken = getToken();
      if (!accessToken) {
        showError("No access token found. Please log in again.");
        return;
      }
      const res = await api.get("/categories", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCategories(res.data.data);
    } catch (err) {
      showError(err.response?.data?.message || "Không thể tải danh mục");
    }
  };

  const fetchStaffs = useCallback(async () => {
    try {
      const accessToken = getToken();
      if (!accessToken) {
        console.warn("No access token found for fetchStaffs");
        showError("No access token found. Please log in again.");
        return;
      }
      const res = await api.get("/admin/staff", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("fetchStaffs response:", res.data);
      const staffList = res.data.filter((user) => user.role === "staff");
      if (staffList.length === 0) {
        console.warn("No staff members found in response");
      }
      setStaffs(staffList);
    } catch (err) {
      console.error("Error in fetchStaffs:", err);
      showError(err.response?.data?.message || "Failed to fetch staff list");
    }
  }, []);

  const fetchTours = async () => {
    try {
      const accessToken = getToken();
      if (!accessToken) {
        showError("No access token found. Please log in again.");
        return;
      }
      const res = await api.get("/tours", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setTours(res.data.data);
    } catch (err) {
      showError(err.response?.data?.message || "Không thể tải tour");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStaffs();
    fetchTours();
  }, [fetchStaffs]);

  // ------------------ UI HELPERS ------------------
  const showError = (msg) => {
    Swal.fire({
      icon: "error",
      title: "Lỗi",
      text: msg,
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
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuillChange = (name) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  const handleAddImageUrl = () => {
    if (imageUrls.length < 4) {
      setImageUrls([...imageUrls, ""]);
    }
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate required fields
    if (!formData.title) {
      showError("Title is required");
      setIsLoading(false);
      return;
    }
    if (!formData.summary) {
      showError("Summary is required");
      setIsLoading(false);
      return;
    }
    if (!formData.days) {
      showError("Days is required");
      setIsLoading(false);
      return;
    }
    if (!formData.serviceStandards) {
      showError("Service standards is required");
      setIsLoading(false);
      return;
    }
    if (!formData.priceChild) {
      showError("Price for child is required");
      setIsLoading(false);
      return;
    }
    if (!formData.priceAdult) {
      showError("Price for adult is required");
      setIsLoading(false);
      return;
    }
    if (!formData.notes) {
      showError("Notes is required");
      setIsLoading(false);
      return;
    }
    if (!formData.cancellationPolicy) {
      showError("Cancellation policy is required");
      setIsLoading(false);
      return;
    }
    if (!formData.schedule) {
      showError("Schedule is required");
      setIsLoading(false);
      return;
    }
    if (!formData.departureDate) {
      showError("Departure date is required");
      setIsLoading(false);
      return;
    }
    if (!formData.time) {
      showError("Time is required");
      setIsLoading(false);
      return;
    }
    if (!formData.categoryId) {
      showError("Category is required");
      setIsLoading(false);
      return;
    }

    const parsedDate = new Date(formData.departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(parsedDate.getTime())) {
      showError("Invalid departure date format");
      setIsLoading(false);
      return;
    }
    if (parsedDate < today) {
      showError("Departure date cannot be earlier than today");
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = formData[key];
      if (val === undefined || val === null) return;
      data.append(key, typeof val === "boolean" ? String(val) : val);
    });

    if (imageFile) {
      data.append("image", imageFile);
    }

    const validUrls = imageUrls.filter((url) => url.trim());
    if (validUrls.length > 0) {
      data.append("imageUrls", JSON.stringify(validUrls));
    }

    if (editId && existingImages.length > 0) {
      data.append("existingImages", JSON.stringify(existingImages));
    }

    if (!editId && !imageFile && validUrls.length === 0) {
      showError("At least one image is required");
      setIsLoading(false);
      return;
    }

    try {
      let res;
      if (editId) {
        res = await api.put(`/tours/${editId}`, data, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
      } else {
        res = await api.post("/tours", data, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
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
        resetForm();
        toggleModal();
        fetchTours();
      });
    } catch (err) {
      if (err.response?.status === 401 && !err.config._retry) {
        // Let the interceptor handle 401 errors
        return;
      }
      showError(err.response?.data?.message || "Không thể lưu tour");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
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
      staffId: "",
      featured: false,
    });
    setImageFile(null);
    setImageUrls([""]);
    setExistingImages([]);
    setEditId(null);
  };

  const handleEdit = (tour) => {
    const formattedDate = tour.departureDate
      ? new Date(tour.departureDate).toISOString().split("T")[0]
      : "";
    setFormData({
      title: tour.title || "",
      summary: tour.summary || "",
      days: tour.days || "",
      serviceStandards: tour.serviceStandards || "",
      priceChild: tour.priceChild || "",
      priceAdult: tour.priceAdult || "",
      notes: tour.notes || "",
      cancellationPolicy: tour.cancellationPolicy || "",
      schedule: tour.schedule || "",
      departureDate: formattedDate,
      time: tour.time || "",
      categoryId: tour.categoryId?._id || tour.categoryId || "",
      staffId: tour.staffId?._id || tour.staffId || "",
      featured: tour.featured || false,
    });
    setImageFile(null);
    setImageUrls([""]);
    setExistingImages(tour.images || []);
    setEditId(tour._id);
    toggleModal();
  };

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
        const accessToken = getToken();
        if (!accessToken) {
          showError("No access token found. Please log in again.");
          return;
        }
        await api.delete(`/tours/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
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
        if (err.response?.status === 401 && !err.config._retry) {
          // Let the interceptor handle 401 errors
          return;
        }
        showError(err.response?.data?.message || "Không thể xóa tour");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddNew = () => {
    resetForm();
    toggleModal();
  };


  const handleViewDetail = (tour) => {
    navigate(`/tours/${tour._id}`); // <-- chuyển đến trang user
  };
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleCategoryChange = (e) => setSelectedCategory(e.target.value);
  const handleStaffFilterChange = (e) => setSelectedStaff(e.target.value);

  const filteredTours = tours.filter((tour) => {
    const matchesSearch = tour.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? tour.categoryId?._id === selectedCategory ||
      tour.categoryId === selectedCategory
      : true;
    const matchesStaff = selectedStaff
      ? tour.staffId?._id === selectedStaff || tour.staffId === selectedStaff
      : true;
    return matchesSearch && matchesCategory && matchesStaff;
  });

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
              <div className="w-100">
                <h2>Quản Lý Tour</h2>
                <div className="d-flex align-items-center mt-2 flex-wrap gap-2">
                  <FormGroup
                    className="me-3 mb-0"
                    style={{ minWidth: "200px" }}
                  >
                    <Input
                      type="select"
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      disabled={isLoading}
                    >
                      <option value="">All Categories</option>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No categories available
                        </option>
                      )}
                    </Input>
                  </FormGroup>

                  <FormGroup
                    className="me-3 mb-0"
                    style={{ minWidth: "200px" }}
                  >
                    <Input
                      type="select"
                      value={selectedStaff}
                      onChange={handleStaffFilterChange}
                      disabled={isLoading || staffs.length === 0}
                    >
                      <option value="">All Staff</option>
                      {staffs.length > 0 ? (
                        staffs.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.fullName || s.name || s.email || "Unknown"}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No staff available
                        </option>
                      )}
                    </Input>
                  </FormGroup>

                  <FormGroup
                    className="me-3 mb-0"
                    style={{ flex: 1, minWidth: "200px" }}
                  >
                    <Input
                      type="text"
                      placeholder="Search by tour title..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      disabled={isLoading}
                    />
                  </FormGroup>

                  <Button
                    color="primary"
                    onClick={handleAddNew}
                    className="icon-btn"
                    disabled={isLoading}
                  >
                    <FaPlus />
                  </Button>
                </div>
              </div>
            </div>

            <Modal isOpen={modal} toggle={toggleModal} size="lg">
              <ModalHeader toggle={toggleModal}>
                {editId ? "Update Tour" : "Create Tour"}
              </ModalHeader>
              <ModalBody>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="title">Title (Required)</Label>
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
                    <Label for="summary">Summary (Required)</Label>
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
                    <Label for="days">Days (Required)</Label>
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
                    <Label for="serviceStandards">
                      Service Standards (Required)
                    </Label>
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
                    <Label for="priceChild">Price (Child) (Required)</Label>
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
                    <Label for="priceAdult">Price (Adult) (Required)</Label>
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
                    <Label for="notes">Notes (Required)</Label>
                    <ReactQuill
                      value={formData.notes}
                      onChange={handleQuillChange("notes")}
                      modules={quillModules}
                      placeholder="Enter notes (supports HTML formatting)"
                      readOnly={isLoading}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="cancellationPolicy">
                      Cancellation Policy (Required)
                    </Label>
                    <ReactQuill
                      value={formData.cancellationPolicy}
                      onChange={handleQuillChange("cancellationPolicy")}
                      modules={quillModules}
                      placeholder="Enter cancellation policy (supports HTML formatting)"
                      readOnly={isLoading}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="schedule">Schedule (Required)</Label>
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
                    <Label for="departureDate">Departure Date (Required)</Label>
                    <Input
                      type="date"
                      id="departureDate"
                      name="departureDate"
                      value={formData.departureDate}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="time">Time (Required)</Label>
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
                    <Label for="categoryId">Category (Required)</Label>
                    <Input
                      type="select"
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                      disabled={isLoading || categories.length === 0}
                    >
                      <option value="">Select Category</option>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No categories available
                        </option>
                      )}
                    </Input>
                  </FormGroup>

                  <FormGroup>
                    <Label for="staffId">Staff (Optional)</Label>
                    <Input
                      type="select"
                      id="staffId"
                      name="staffId"
                      value={formData.staffId}
                      onChange={handleChange}
                      disabled={isLoading || staffs.length === 0}
                    >
                      <option value="">Select Staff</option>
                      {staffs.length > 0 ? (
                        staffs.map((staff) => (
                          <option key={staff._id} value={staff._id}>
                            {staff.fullName ||
                              staff.name ||
                              staff.email ||
                              "Unknown"}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No staff available
                        </option>
                      )}
                    </Input>
                  </FormGroup>

                  <FormGroup>
                    <Label for="image">
                      First Image (Upload){" "}
                      {editId ? "(Optional)" : "(Required)"}
                    </Label>
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
                              onError={(e) => {
                                console.error(
                                  "Existing image load error:",
                                  image
                                );
                                e.target.src = "/placeholder.jpg";
                              }}
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
                  <th>Staff</th>
                  <th>Departure Date</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTours.length > 0 ? (
                  filteredTours.map((tour, index) => {
                    const firstImage =
                      tour.images && tour.images.length > 0
                        ? tour.images[0]
                        : "/placeholder.jpg";
                    const staffName =
                      tour.staffId?.fullName ||
                      tour.staffId?.name ||
                      tour.staffId?.email ||
                      "N/A";
                    return (
                      <tr key={tour._id}>
                        <td>{index + 1}</td>
                        <td className="image-cell">
                          <img
                            src={firstImage}
                            alt={tour.title}
                            className="tour-image"
                            onError={(e) => {
                              console.error("Image load error:", firstImage);
                              e.target.src = "/placeholder.jpg";
                            }}
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
                        <td>{staffName}</td>
                        <td>
                          {tour.departureDate
                            ? new Date(tour.departureDate).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )
                            : "N/A"}
                        </td>
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
                  })
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center">
                      No tours found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ManageTours;
