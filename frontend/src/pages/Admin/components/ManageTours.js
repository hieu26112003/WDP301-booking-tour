"use client"

import { useState, useEffect, useCallback, useContext } from "react"
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
} from "reactstrap"
import Swal from "sweetalert2"
import { FaPlus, FaEdit, FaTrash, FaEye, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import ReactQuill, { Quill } from "react-quill"
import "react-quill/dist/quill.snow.css"
import "../../../styles/manageTour.css"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../../context/AuthContext"

// Thêm module image-resize cho ReactQuill
import ImageResize from "quill-image-resize-module-react"
Quill.register("modules/imageResize", ImageResize)

// Đăng ký cỡ chữ tùy chỉnh
const Size = Quill.import("attributors/style/size")
Size.whitelist = ["12px", "14px", "16px", "18px", "20px"]
Quill.register(Size, true)

const TOURS_PER_PAGE = 5

const ManageTours = () => {
  const { api, dispatch } = useContext(AuthContext)
  const [tours, setTours] = useState([])
  const [categories, setCategories] = useState([])
  const [staffs, setStaffs] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
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
  })
  const [imageFile, setImageFile] = useState(null)
  const [imageUrls, setImageUrls] = useState([""])
  const [existingImages, setExistingImages] = useState([])
  const [editId, setEditId] = useState(null)
  const [modal, setModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStaff, setSelectedStaff] = useState("")
  const navigate = useNavigate()

  const toggleModal = () => {
    if (!isLoading) {
      setModal(!modal)
      if (!modal) {
        setImageFile(null)
        setImageUrls([""])
        setExistingImages([])
      }
    }
  }

  // ------------------ FETCH HELPERS ------------------
  const getToken = () => localStorage.getItem("accessToken")

  const fetchCategories = async () => {
    try {
      const accessToken = getToken()
      if (!accessToken) {
        showError("No access token found. Please log in again.")
        return
      }
      const res = await api.get("/categories", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      setCategories(res.data.data)
    } catch (err) {
      showError(err.response?.data?.message || "Không thể tải danh mục")
    }
  }

  const fetchStaffs = useCallback(async () => {
    try {
      const accessToken = getToken()
      if (!accessToken) {
        console.warn("No access token found for fetchStaffs")
        showError("No access token found. Please log in again.")
        return
      }
      const res = await api.get("/admin/staff", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      console.log("fetchStaffs response:", res.data)
      const staffList = res.data.filter((user) => user.role === "staff")
      if (staffList.length === 0) {
        console.warn("No staff members found in response")
      }
      setStaffs(staffList)
    } catch (err) {
      console.error("Error in fetchStaffs:", err)
      showError(err.response?.data?.message || "Failed to fetch staff list")
    }
  }, [])

  const fetchTours = async () => {
    try {
      const accessToken = getToken()
      if (!accessToken) {
        showError("No access token found. Please log in again.")
        return
      }
      const res = await api.get("/tours", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      setTours(res.data.data)
    } catch (err) {
      showError(err.response?.data?.message || "Không thể tải tour")
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchStaffs()
    fetchTours()
  }, [fetchStaffs])

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
        document.body.style.overflow = "auto"
      },
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleQuillChange = (name) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0])
  }

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls]
    newImageUrls[index] = value
    setImageUrls(newImageUrls)
  }

  const handleAddImageUrl = () => {
    if (imageUrls.length < 4) {
      setImageUrls([...imageUrls, ""])
    }
  }

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate required fields
    if (!formData.title) {
      showError("Tiêu đề là bắt buộc")
      setIsLoading(false)
      return
    }
    if (!formData.summary) {
      showError("Tóm tắt là bắt buộc")
      setIsLoading(false)
      return
    }
    if (!formData.days) {
      showError("Số ngày là bắt buộc")
      setIsLoading(false)
      return
    }
    if (!formData.serviceStandards) {
      showError("Tiêu chuẩn dịch vụ là bắt buộc")
      setIsLoading(false)
      return
    }
    if (!formData.priceChild) {
      showError("Giá trẻ em là bắt buộc")
      setIsLoading(false)
      return
    }
    if (!formData.priceAdult) {
      showError("Giá người lớn là bắt buộc")
      setIsLoading(false)
      return
    }
    if (!formData.notes) {
      showError("Ghi chú là bắt buộc")
      setIsLoading(false)
      return
    }
    if (!formData.cancellationPolicy) {
      showError("Chính sách hủy là bắt buộc")
      setIsLoading(false)
      return
    }
    if (!formData.schedule) {
      showError("Lịch trình là bắt buộc")
      setIsLoading(false)
      return
    }
    if (!formData.departureDate) {
      showError("Ngày khởi hành là bắt buộc")
      setIsLoading(false)
      return
    }
    if (!formData.time) {
      showError("Thời gian là bắt buộc")
      setIsLoading(false)
      return
    }
    if (!formData.categoryId) {
      showError("Danh mục là bắt buộc")
      setIsLoading(false)
      return
    }

    const parsedDate = new Date(formData.departureDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (isNaN(parsedDate.getTime())) {
      showError("Định dạng ngày khởi hành không hợp lệ")
      setIsLoading(false)
      return
    }

    if (parsedDate < today) {
      showError("Ngày khởi hành không thể sớm hơn hôm nay")
      setIsLoading(false)
      return
    }

    const data = new FormData()
    Object.keys(formData).forEach((key) => {
      const val = formData[key]
      if (val === undefined || val === null) return
      data.append(key, val)
    })

    if (imageFile) {
      data.append("image", imageFile)
    }

    const validUrls = imageUrls.filter((url) => url.trim())
    if (validUrls.length > 0) {
      data.append("imageUrls", JSON.stringify(validUrls))
    }

    if (editId && existingImages.length > 0) {
      data.append("existingImages", JSON.stringify(existingImages))
    }

    if (!editId && !imageFile && validUrls.length === 0) {
      showError("Ít nhất một hình ảnh là bắt buộc")
      setIsLoading(false)
      return
    }

    try {
      let res
      if (editId) {
        res = await api.put(`/tours/${editId}`, data, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
      } else {
        res = await api.post("/tours", data, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
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
          document.body.style.overflow = "auto"
        },
      }).then(() => {
        resetForm()
        toggleModal()
        fetchTours()
        setCurrentPage(1) // Reset to first page after adding/updating
      })
    } catch (err) {
      if (err.response?.status === 401 && !err.config._retry) {
        return
      }
      showError(err.response?.data?.message || "Không thể lưu tour")
    } finally {
      setIsLoading(false)
    }
  }

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
    })
    setImageFile(null)
    setImageUrls([""])
    setExistingImages([])
    setEditId(null)
  }

  const handleEdit = (tour) => {
    const formattedDate = tour.departureDate ? new Date(tour.departureDate).toISOString().split("T")[0] : ""

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
    })

    setImageFile(null)
    setImageUrls([""])
    setExistingImages(tour.images || [])
    setEditId(tour._id)
    toggleModal()
  }

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
    })

    if (result.isConfirmed) {
      setIsLoading(true)
      try {
        const accessToken = getToken()
        if (!accessToken) {
          showError("No access token found. Please log in again.")
          return
        }

        await api.delete(`/tours/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

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
            document.body.style.overflow = "auto"
          },
        }).then(() => {
          fetchTours()
          // Adjust current page if necessary
          const newTotalPages = Math.ceil((tours.length - 1) / TOURS_PER_PAGE)
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages)
          }
        })
      } catch (err) {
        if (err.response?.status === 401 && !err.config._retry) {
          return
        }
        showError(err.response?.data?.message || "Không thể xóa tour")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddNew = () => {
    resetForm()
    toggleModal()
  }

  const handleViewDetail = (tour) => {
    navigate(`/tours/${tour._id}`)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleStaffFilterChange = (e) => {
    setSelectedStaff(e.target.value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const filteredTours = tours.filter((tour) => {
    const matchesSearch = tour.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory
      ? tour.categoryId?._id === selectedCategory || tour.categoryId === selectedCategory
      : true
    const matchesStaff = selectedStaff ? tour.staffId?._id === selectedStaff || tour.staffId === selectedStaff : true

    return matchesSearch && matchesCategory && matchesStaff
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredTours.length / TOURS_PER_PAGE)
  const startIndex = (currentPage - 1) * TOURS_PER_PAGE
  const endIndex = startIndex + TOURS_PER_PAGE
  const currentTours = filteredTours.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

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
  }

  const truncateText = (html, maxLength = 100) => {
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
    const text = tempDiv.textContent || tempDiv.innerText || ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <section className="manage-tours-section">
      <Container>
        <Row>
          <Col lg="12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="w-100">
                <h2>Quản Lý Tour</h2>
                <div className="d-flex align-items-center mt-2 flex-wrap gap-2">
                  <FormGroup className="me-3 mb-0" style={{ minWidth: "200px" }}>
                    <Input type="select" value={selectedCategory} onChange={handleCategoryChange} disabled={isLoading}>
                      <option value="">Tất cả danh mục</option>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Không có danh mục
                        </option>
                      )}
                    </Input>
                  </FormGroup>
                  <FormGroup className="me-3 mb-0" style={{ minWidth: "200px" }}>
                    <Input
                      type="select"
                      value={selectedStaff}
                      onChange={handleStaffFilterChange}
                      disabled={isLoading || staffs.length === 0}
                    >
                      <option value="">Tất cả nhân viên</option>
                      {staffs.length > 0 ? (
                        staffs.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.fullName || s.name || s.email || "Unknown"}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Không có nhân viên
                        </option>
                      )}
                    </Input>
                  </FormGroup>
                  <FormGroup className="me-3 mb-0" style={{ flex: 1, minWidth: "200px" }}>
                    <Input
                      type="text"
                      placeholder="Tìm kiếm theo tên tour..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      disabled={isLoading}
                    />
                  </FormGroup>
                  <Button color="primary" onClick={handleAddNew} className="icon-btn" disabled={isLoading}>
                    <FaPlus />
                  </Button>
                </div>
              </div>
            </div>

            <Modal isOpen={modal} toggle={toggleModal} size="lg">
              <ModalHeader toggle={toggleModal}>{editId ? "Cập nhật Tour" : "Tạo Tour"}</ModalHeader>
              <ModalBody>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="title">Tiêu đề (Bắt buộc)</Label>
                    <Input
                      type="text"
                      id="title"
                      name="title"
                      placeholder="Tiêu đề tour"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="summary">Tóm tắt (Bắt buộc)</Label>
                    <Input
                      type="textarea"
                      id="summary"
                      name="summary"
                      placeholder="Tóm tắt tour"
                      value={formData.summary}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="days">Số ngày (Bắt buộc)</Label>
                    <Input
                      type="text"
                      id="days"
                      name="days"
                      placeholder="Số ngày (ví dụ: 3 ngày)"
                      value={formData.days}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="serviceStandards">Tiêu chuẩn dịch vụ (Bắt buộc)</Label>
                    <Input
                      type="text"
                      id="serviceStandards"
                      name="serviceStandards"
                      placeholder="Tiêu chuẩn dịch vụ"
                      value={formData.serviceStandards}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="priceChild">Giá trẻ em (Bắt buộc)</Label>
                    <Input
                      type="number"
                      id="priceChild"
                      name="priceChild"
                      placeholder="Giá cho trẻ em"
                      value={formData.priceChild}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="priceAdult">Giá người lớn (Bắt buộc)</Label>
                    <Input
                      type="number"
                      id="priceAdult"
                      name="priceAdult"
                      placeholder="Giá cho người lớn"
                      value={formData.priceAdult}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="notes">Ghi chú (Bắt buộc)</Label>
                    <ReactQuill
                      value={formData.notes}
                      onChange={handleQuillChange("notes")}
                      modules={quillModules}
                      placeholder="Nhập ghi chú (hỗ trợ định dạng HTML)"
                      readOnly={isLoading}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="cancellationPolicy">Chính sách hủy (Bắt buộc)</Label>
                    <ReactQuill
                      value={formData.cancellationPolicy}
                      onChange={handleQuillChange("cancellationPolicy")}
                      modules={quillModules}
                      placeholder="Nhập chính sách hủy (hỗ trợ định dạng HTML)"
                      readOnly={isLoading}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="schedule">Lịch trình (Bắt buộc)</Label>
                    <Input
                      type="textarea"
                      id="schedule"
                      name="schedule"
                      placeholder="Lịch trình tour"
                      value={formData.schedule}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="departureDate">Ngày khởi hành (Bắt buộc)</Label>
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
                    <Label for="time">Thời gian (Bắt buộc)</Label>
                    <Input
                      type="text"
                      id="time"
                      name="time"
                      placeholder="Thời gian (ví dụ: 08:00)"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="categoryId">Danh mục (Bắt buộc)</Label>
                    <Input
                      type="select"
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                      disabled={isLoading || categories.length === 0}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Không có danh mục
                        </option>
                      )}
                    </Input>
                  </FormGroup>

                  <FormGroup>
                    <Label for="staffId">Nhân viên (Tùy chọn)</Label>
                    <Input
                      type="select"
                      id="staffId"
                      name="staffId"
                      value={formData.staffId}
                      onChange={handleChange}
                      disabled={isLoading || staffs.length === 0}
                    >
                      <option value="">Chọn nhân viên</option>
                      {staffs.length > 0 ? (
                        staffs.map((staff) => (
                          <option key={staff._id} value={staff._id}>
                            {staff.fullName || staff.name || staff.email || "Unknown"}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Không có nhân viên
                        </option>
                      )}
                    </Input>
                  </FormGroup>

                  <FormGroup>
                    <Label for="image">Hình ảnh đầu tiên (Tải lên) {editId ? "(Tùy chọn)" : "(Bắt buộc)"}</Label>
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
                        <p>Tệp đã chọn: {imageFile.name}</p>
                      </div>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Hình ảnh bổ sung (URLs)</Label>
                    {imageUrls.map((url, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                        <Input
                          type="text"
                          placeholder={`URL hình ảnh ${index + 1}`}
                          value={url}
                          onChange={(e) => handleImageUrlChange(index, e.target.value)}
                          disabled={isLoading}
                          className="me-2"
                        />
                        {index === imageUrls.length - 1 && imageUrls.length < 4 && (
                          <Button color="primary" size="sm" onClick={handleAddImageUrl} disabled={isLoading}>
                            <FaPlus />
                          </Button>
                        )}
                      </div>
                    ))}
                  </FormGroup>

                  {editId && existingImages.length > 0 && (
                    <FormGroup>
                      <Label>Hình ảnh hiện có</Label>
                      <div className="d-flex flex-wrap">
                        {existingImages.map((image, index) => (
                          <div key={index} className="position-relative m-2">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Hình ảnh hiện có ${index + 1}`}
                              style={{ maxWidth: "100px", height: "auto" }}
                              onError={(e) => {
                                console.error("Existing image load error:", image)
                                e.target.src = "/placeholder.jpg"
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
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onClick={handleSubmit} disabled={isLoading}>
                  {editId ? "Cập nhật" : "Tạo"}
                </Button>{" "}
                <Button color="secondary" onClick={toggleModal} disabled={isLoading}>
                  Hủy
                </Button>
              </ModalFooter>
            </Modal>

            <Table striped>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Hình ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Tóm tắt</th>
                  <th>Giá người lớn</th>
                  <th>Ghi chú</th>
                  <th>Chính sách hủy</th>
                  <th>Danh mục</th>
                  <th>Nhân viên</th>
                  <th>Ngày khởi hành</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentTours.length > 0 ? (
                  currentTours.map((tour, index) => {
                    const firstImage = tour.images && tour.images.length > 0 ? tour.images[0] : "/placeholder.jpg"
                    const staffName = tour.staffId?.fullName || tour.staffId?.name || tour.staffId?.email || "N/A"
                    const globalIndex = startIndex + index + 1

                    return (
                      <tr key={tour._id}>
                        <td>{globalIndex}</td>
                        <td className="image-cell">
                          <img
                            src={firstImage || "/placeholder.svg"}
                            alt={tour.title}
                            className="tour-image"
                            onError={(e) => {
                              console.error("Image load error:", firstImage)
                              e.target.src = "/placeholder.jpg"
                            }}
                          />
                        </td>
                        <td>{tour.title}</td>
                        <td>{tour.summary}</td>
                        <td>{tour.priceAdult?.toLocaleString("vi-VN")} VNĐ</td>
                        <td className="html-content">{truncateText(tour.notes)}</td>
                        <td className="html-content">{truncateText(tour.cancellationPolicy)}</td>
                        <td>{tour.categoryId?.name || "N/A"}</td>
                        <td>{staffName}</td>
                        <td>
                          {tour.departureDate
                            ? new Date(tour.departureDate).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>
                        <td>
                          <Button
                            color="link"
                            className="icon-btn"
                            onClick={() => handleViewDetail(tour)}
                            title="Xem chi tiết"
                            disabled={isLoading}
                          >
                            <FaEye />
                          </Button>
                          <Button
                            color="link"
                            className="icon-btn"
                            onClick={() => handleEdit(tour)}
                            title="Chỉnh sửa"
                            disabled={isLoading}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            color="link"
                            className="icon-btn"
                            onClick={() => handleDelete(tour._id)}
                            title="Xóa"
                            disabled={isLoading}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center">
                      Không tìm thấy tour nào
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container d-flex justify-content-center align-items-center mt-4">
                <div className="pagination-wrapper d-flex align-items-center">
                  {/* Previous Button */}
                  <Button
                    color="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <FaChevronLeft />
                  </Button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, index) => (
                    <Button
                      key={index}
                      color={page === currentPage ? "primary" : "outline-primary"}
                      size="sm"
                      className="me-1"
                      onClick={() => page !== "..." && handlePageChange(page)}
                      disabled={page === "..." || isLoading}
                    >
                      {page}
                    </Button>
                  ))}

                  {/* Next Button */}
                  <Button
                    color="outline-primary"
                    size="sm"
                    className="ms-1"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    <FaChevronRight />
                  </Button>
                </div>

                {/* Page Info */}
                <div className="ms-3 text-muted">
                  Trang {currentPage} / {totalPages} - Hiển thị {currentTours.length} / {filteredTours.length} tour
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default ManageTours
