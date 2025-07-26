"use client"

import { useState, useRef, useEffect, useContext } from "react"
import "../../styles/tourDetail.css"
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Input,
  FormGroup,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap"
import { useNavigate, useParams } from "react-router-dom"
import calculateAvgRating from "../../utils/avgRating"
import useFetch from "../../hooks/useFetch"
import { BASE_URL } from "../../utils/config"
import { AuthContext } from "../../context/AuthContext"
import axios from "axios"
import Swal from "sweetalert2"
import { FaChevronDown, FaChevronUp, FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import html2pdf from "html2pdf.js"
import TourSimilar from "../User/TourSimilar"

// Utility function to format Date to DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return "Đang cập nhật"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Đang cập nhật"
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const TourDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const reviewMsgRef = useRef("")
  const [tourRating, setTourRating] = useState(null)
  const [activeTab, setActiveTab] = useState("description")
  const [bookings, setBookings] = useState([])
  const [showMore, setShowMore] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [modal, setModal] = useState(false)
  const [comments, setComments] = useState([])
  const contentRef = useRef(null)
  const [commentText, setCommentText] = useState("")
  const [editingComment, setEditingComment] = useState(null)
  const [editText, setEditText] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState({})
  const [bookingData, setBookingData] = useState({
    numberOfAdults: 1,
    numberOfChildren: 0,
  })

  const {
    data: tour,
    loading,
    error,
  } = useFetch(`${BASE_URL}/tours/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  })

  const tourImages = tour?.images || []
  const [activeIndex, setActiveIndex] = useState(0)
  const [nav1, setNav1] = useState(null)
  const [nav2, setNav2] = useState(null)
  const slider1 = useRef(null)
  const slider2 = useRef(null)
  const [similarTours, setSimilarTours] = useState([])

  useEffect(() => {
  const fetchSimilarTours = async () => {
    if (!tour?._id) return
    try {
      const res = await axios.get(`${BASE_URL}/tours`)
      const allTours = res.data?.data || []
      const similar = allTours.filter((t) => t._id !== tour._id).slice(0, 6)
      setSimilarTours(similar)
    } catch (err) {
      console.error("Error fetching tours:", err)
    }
  }
  fetchSimilarTours()
}, [tour])

const removeImagesFromHTML = (html) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  // Xoá tất cả thẻ <img>
  const images = doc.querySelectorAll("img")
  images.forEach((img) => img.remove())
  // Trả lại chuỗi HTML đã được xử lý
  return doc.body.innerHTML
}

const exportPDF = () => {
  setShowMore(true)
  setTimeout(() => {
    if (!contentRef.current) return
    // Xoá ảnh khỏi HTML
    const cleanHTML = `
      <h2 style="text-align: center; margin-bottom: 1rem;">Viet Travel</h2>
      ${removeImagesFromHTML(notes || "")}
    `
    contentRef.current.innerHTML = cleanHTML
    const opt = {
      margin: 0.3,
      filename: "lich-trinh-tour.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: contentRef.current.scrollWidth,
      },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    }
    html2pdf().set(opt).from(contentRef.current).save()
  }, 300)
}

  const SampleNextArrow = (props) => {
    const { className, style, onClick } = props
    return <div className={className} style={{ ...style, display: "block", right: 10, zIndex: 2 }} onClick={onClick} />
  }

  const SamplePrevArrow = (props) => {
    const { className, style, onClick } = props
    return <div className={className} style={{ ...style, display: "block", left: 10, zIndex: 2 }} onClick={onClick} />
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!user || !user._id) {
      Swal.fire("Lỗi", "Bạn cần đăng nhập để bình luận", "error")
      return
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/comment`,
        { content: commentText, tourId: id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      )
      if (res.data.success) {
        // Refresh comments list
        fetchComments()
        setCommentText("")
        Swal.fire("Thành công", "Bình luận đã được thêm", "success")
      }
    } catch (err) {
      Swal.fire("Lỗi", err.response?.data?.message || "Có lỗi xảy ra", "error")
    }
  }

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) {
      Swal.fire("Lỗi", "Nội dung bình luận không được để trống", "error")
      return
    }

    try {
      const res = await axios.put(
        `${BASE_URL}/comment/${commentId}`,
        { content: editText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      )
      if (res.data.success) {
        fetchComments()
        setEditingComment(null)
        setEditText("")
        Swal.fire("Thành công", "Bình luận đã được cập nhật", "success")
      }
    } catch (err) {
      Swal.fire("Lỗi", err.response?.data?.message || "Có lỗi xảy ra", "error")
    }
  }

  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa bình luận này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    })

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${BASE_URL}/comment/${commentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        if (res.data.success) {
          fetchComments()
          Swal.fire("Thành công", "Bình luận đã được xóa", "success")
        }
      } catch (err) {
        Swal.fire("Lỗi", err.response?.data?.message || "Có lỗi xảy ra", "error")
      }
    }
  }

  const toggleDropdown = (commentId) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }))
  }

  const startEdit = (comment) => {
    setEditingComment(comment._id)
    setEditText(comment.content)
    setDropdownOpen({})
  }

  const cancelEdit = () => {
    setEditingComment(null)
    setEditText("")
  }

  const settingsMain = {
    asNavFor: nav2,
    ref: (slider) => setNav1(slider),
    arrows: true,
    fade: true,
    beforeChange: (oldIndex, newIndex) => setActiveIndex(newIndex),
  }

  const settingsThumbs = {
    asNavFor: nav1,
    ref: (slider) => setNav2(slider),
    slidesToShow: 4,
    swipeToSlide: true,
    focusOnSelect: true,
    centerMode: false,
    arrows: false,
  }

  const {
    title,
    summary,
    days,
    time,
    schedule,
    departureDate,
    priceAdult,
    priceChild,
    notes,
    cancellationPolicy,
    reviews = [],
    serviceStandards,
  } = tour || {}

  const safeReviews = reviews || []
  const { totalRating, avgRating } = calculateAvgRating(safeReviews)

  const totalPrice = bookingData.numberOfAdults * (priceAdult || 0) + bookingData.numberOfChildren * (priceChild || 0)

  const fetchComments = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/comment/tour/${id}`)
    console.log("COMMENTS API RESPONSE:", res.data)
    
    let commentsData = []
    if (Array.isArray(res.data)) {
      commentsData = res.data
    } else if (res.data?.data) {
      commentsData = res.data.data
    }

    // Debug: Kiểm tra từng comment
    commentsData.forEach((comment, index) => {
      console.log(`Comment ${index}:`, comment)
      console.log(`UserId object:`, comment.userId)
      console.log(`Username:`, comment.userId?.username)
    })

    setComments(commentsData)
  } catch (err) {
    console.error("Error fetching comments:", err)
  }
}

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return
      try {
        const accessToken = localStorage.getItem("accessToken")
        const res = await axios.get(`${BASE_URL}/booking`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        setBookings(res.data.data.filter((b) => title === b.tourName))
      } catch (err) {
        console.error("Error fetching bookings:", err)
      }
    }

    fetchBookings()
    fetchComments()
    window.scrollTo(0, 0)
  }, [tour, user, title, id])

  useEffect(() => {
    if (slider2.current) slider2.current.slickGoTo(activeIndex)
  }, [activeIndex])

  const userCanReview = bookings.some((b) => b.userId === user?._id && b.status === "confirmed")

  const toggleModal = () => setModal(!modal)

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    if (!user || !user._id) {
      Swal.fire({
        icon: "error",
        title: "Bạn phải đăng nhập để đặt tour",
        showConfirmButton: true,
        confirmButtonText: "Đăng nhập",
        confirmButtonColor: "#3085d6",
      })
      return
    }

    if (bookingData.numberOfAdults < 1) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Số lượng người lớn phải ít nhất là 1",
        confirmButtonColor: "#d33",
      })
      return
    }

    try {
      const accessToken = localStorage.getItem("accessToken")
      const res = await fetch(`${BASE_URL}/bookings`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          userId: user._id,
          tourId: id,
          numberOfAdults: bookingData.numberOfAdults,
          numberOfChildren: bookingData.numberOfChildren,
          totalPrice,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.message)

      Swal.fire({
        icon: "success",
        title: "Đặt tour thành công",
        text: "Cảm ơn bạn đã đặt tour. Chúng tôi sẽ gửi email xác nhận.",
        confirmButtonColor: "#3085d6",
      })
      toggleModal()
      navigate("/tours")
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.message || "Đặt tour thất bại",
        confirmButtonColor: "#d33",
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBookingData((prev) => ({
      ...prev,
      [name]: Math.max(0, Number.parseInt(value) || 0),
    }))
  }

  if (loading)
    return (
      <Container>
        <div className="text-center pt-5">
          <h4>LOADING.........</h4>
        </div>
      </Container>
    )

  if (error)
    return (
      <Container>
        <div className="text-center pt-5">
          <h4 className="text-danger">{error}</h4>
        </div>
      </Container>
    )

  if (!tour) return null

  return (
    <section>
      <Container>
        <Row>
          <Col lg="8">
            <div className="tour__content">
              <div className="tour__image-carousel mb-4">
                <Slider {...settingsMain} ref={slider1} nextArrow={<SampleNextArrow />} prevArrow={<SamplePrevArrow />}>
                  {tourImages.map((img, index) => (
                    <div key={index}>
                      <img
                        src={img || "/placeholder.svg"}
                        className="w-100"
                        style={{
                          height: 400,
                          objectFit: "cover",
                          borderRadius: 10,
                        }}
                      />
                    </div>
                  ))}
                </Slider>
                <div className="mt-3">
                  <Slider {...settingsThumbs} ref={slider2}>
                    {tourImages.map((img, index) => (
                      <div
                        key={index}
                        className="px-1"
                        onClick={() => {
                          setActiveIndex(index)
                          slider1.current?.slickGoTo(index)
                        }}
                      >
                        <img
                          src={img || "/placeholder.svg"}
                          style={{
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 6,
                            width: "100%",
                            opacity: index === activeIndex ? 1 : 0.5,
                            border: index === activeIndex ? "2px solid #2196f3" : "none",
                          }}
                        />
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>

              <div className="card p-3 mb-4">
                <div className="tour-tab-wrapper">
                  <button
                    className={`tour-tab ${activeTab === "description" ? "active" : ""}`}
                    onClick={() => setActiveTab("description")}
                  >
                    Mô tả
                  </button>
                  <button
                    className={`tour-tab ${activeTab === "cancellation" ? "active" : ""}`}
                    onClick={() => setActiveTab("cancellation")}
                  >
                    Điều kiện hoàn hủy
                  </button>
                  <button
                    className={`tour-tab ${activeTab === "reviews" ? "active" : ""}`}
                    onClick={() => setActiveTab("reviews")}
                  >
                    Bình luận ({comments.length})
                  </button>
                </div>

                <hr />

                {activeTab === "cancellation" && <div dangerouslySetInnerHTML={{ __html: tour?.cancellationPolicy }} />}

                {activeTab === "description" && (
                  <div className="tour__details">
                    <button onClick={exportPDF} style={{ marginBottom: "10px" }}>
                      Xuất PDF Lịch trình
                    </button>
                    {notes && (
                      <div className="mt-4"  ref={contentRef}>
                        <div
                          style={{
                            maxHeight: showMore ? "none" : 500,
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <div ref={contentRef} className="pdf-export">
  <h2>Viet Travel</h2>
  <div dangerouslySetInnerHTML={{ __html: notes }} />
</div>
                          {!showMore && (
                            <div
                              style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 60,
                                background: "linear-gradient(transparent, white)",
                              }}
                            />
                          )}
                        </div>
                        <div className="text-center">
                          <Button color="outline-primary" onClick={() => setShowMore(!showMore)}>
                            {showMore ? (
                              <>
                                Ẩn bớt <FaChevronUp />
                              </>
                            ) : (
                              <>
                                Xem thêm <FaChevronDown />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="tour__comments mt-4">
                    <h5>Bình luận</h5>
                    {comments.length === 0 ? (
                      <p className="text-muted">Chưa có bình luận nào.</p>
                    ) : (
                      comments.map((c) => (
                        <div
                          key={c._id}
                          className="comment-item mb-3 p-3 border rounded"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="comment-header">
                              <strong className="text-primary">
                                {/* Kiểm tra nếu là user hiện tại thì hiển thị "Tôi", không thì hiển thị username */}
                                {user && c.userId?._id === user._id
                                  ? "Tôi"
                                  : (c.userId?.username || "Người dùng ẩn danh")
                                }
                              </strong>
                              <small className="text-muted ms-2">
                                {new Date(c.createdAt).toLocaleString("vi-VN")}
                              </small>
                            </div>
                            {user && (user._id === c.userId?._id || user.role === "admin") && (
                              <Dropdown isOpen={dropdownOpen[c._id]} toggle={() => toggleDropdown(c._id)}>
                                <DropdownToggle tag="button" className="btn btn-sm btn-outline-secondary">
                                  <FaEllipsisV />
                                </DropdownToggle>
                                <DropdownMenu>
                                  <DropdownItem onClick={() => startEdit(c)}>
                                    <FaEdit className="me-2" /> Sửa
                                  </DropdownItem>
                                  <DropdownItem onClick={() => handleDeleteComment(c._id)}>
                                    <FaTrash className="me-2" /> Xóa
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            )}
                          </div>

                          {editingComment === c._id ? (
                            <div>
                              <Input
                                type="textarea"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows="3"
                                className="mb-2"
                              />
                              <div>
                                <Button
                                  color="primary"
                                  size="sm"
                                  onClick={() => handleEditComment(c._id)}
                                  className="me-2"
                                >
                                  Lưu
                                </Button>
                                <Button color="secondary" size="sm" onClick={cancelEdit}>
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="mb-0">{c.content}</p>
                          )}
                        </div>
                      ))
                    )}

                    {/* Form gửi bình luận */}
                    <Form onSubmit={handleCommentSubmit} className="mt-3">
                      <FormGroup>
                        <Label for="comment">Bình luận của bạn *</Label>
                        <Input
                          id="comment"
                          type="textarea"
                          rows="3"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          required
                          placeholder="Nhập bình luận của bạn..."
                        />
                      </FormGroup>
                      <Button color="primary" type="submit" disabled={!commentText.trim()}>
                        Gửi bình luận
                      </Button>
                    </Form>
                  </div>
                )}
              </div>
            </div>
          </Col>

          <Col lg="4">
            <div
              className="tour__booking-card p-4"
              style={{
                backgroundColor: "#2196f3",
                borderRadius: "10px",
                color: "white",
              }}
            >
              <div
                style={{
                  backgroundColor: "#2196f3",
                  color: "white",
                  borderRadius: "10px",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <div className="consult-box">
                  <h5 className="title">ĐĂNG KÝ TƯ VẤN</h5>
                  <div className="info-row">
                    <span className="label">Ngày khởi hành:</span>
                    <span className="value">{formatDate(departureDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Thời gian:</span>
                    <span className="value">{time || "Đang cập nhật"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Lịch trình:</span>
                    <span className="value">{schedule || "Đang cập nhật"}</span>
                  </div>
                  <div className="price-box adult">Người lớn: {priceAdult?.toLocaleString("vi-VN")} đồng</div>
                  <div className="price-box child">Trẻ em: {priceChild?.toLocaleString("vi-VN")} đồng</div>
                  <Button color="danger" className="w-100 fw-bold mt-3" onClick={toggleModal}>
                    ĐẶT TOUR NGAY
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Modal isOpen={modal} toggle={toggleModal} className="tour-booking-modal">
          <ModalHeader toggle={toggleModal}>Đặt Tour: {title}</ModalHeader>
          <ModalBody>
            <Form onSubmit={handleBookingSubmit}>
              <FormGroup>
                <Label for="priceAdult" className="fw-bold">
                  Giá người lớn
                </Label>
                <Input
                  type="text"
                  id="priceAdult"
                  value={`${(priceAdult || 0).toLocaleString("vi-VN")} đồng`}
                  readOnly
                  className="bg-light"
                />
              </FormGroup>
              <FormGroup>
                <Label for="priceChild" className="fw-bold">
                  Giá trẻ em
                </Label>
                <Input
                  type="text"
                  id="priceChild"
                  value={`${(priceChild || 0).toLocaleString("vi-VN")} đồng`}
                  readOnly
                  className="bg-light"
                />
              </FormGroup>
              <FormGroup>
                <Label for="numberOfAdults" className="fw-bold">
                  Số lượng người lớn
                </Label>
                <Input
                  type="number"
                  id="numberOfAdults"
                  name="numberOfAdults"
                  value={bookingData.numberOfAdults}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label for="numberOfChildren" className="fw-bold">
                  Số lượng trẻ em
                </Label>
                <Input
                  type="number"
                  id="numberOfChildren"
                  name="numberOfChildren"
                  value={bookingData.numberOfChildren}
                  onChange={handleInputChange}
                  min="0"
                />
              </FormGroup>
              <FormGroup>
                <Label for="totalPrice" className="fw-bold">
                  Tổng tiền
                </Label>
                <Input
                  type="text"
                  id="totalPrice"
                  value={`${totalPrice.toLocaleString("vi-VN")} đồng`}
                  readOnly
                  className="bg-light fw-bold"
                />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleBookingSubmit} className="px-4">
              Xác nhận đặt tour
            </Button>{" "}
            <Button color="secondary" onClick={toggleModal} className="px-4">
              Hủy
            </Button>
          </ModalFooter>
        </Modal>

        {similarTours.length > 0 && <TourSimilar tours={similarTours} />}
      </Container>
    </section>
  )
}

export default TourDetails
