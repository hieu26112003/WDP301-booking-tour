"use client"

import { useState, useRef, useEffect, useContext } from "react"
import "../../styles/tourDetail.css"
import { Container, Row, Col, Form, Button, Input, FormGroup, Label } from "reactstrap"
import { useNavigate, useParams } from "react-router-dom"
import calculateAvgRating from "../../utils/avgRating"
import useFetch from "../../hooks/useFetch"
import { BASE_URL } from "../../utils/config"
import { AuthContext } from "../../context/AuthContext"
import axios from "axios"
import Swal from "sweetalert2"
import { FaChevronDown, FaChevronUp, FaStar } from "react-icons/fa"

const TourDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const reviewMsgRef = useRef("")

  const [tourRating, setTourRating] = useState(null)
  const [activeTab, setActiveTab] = useState("description")
  const [bookings, setBookings] = useState([])
  const [showMore, setShowMore] = useState(false)

  const { data: tour, loading, error } = useFetch(`${BASE_URL}/tours/${id}`)
  const tourImages = tour?.image ? [tour.image] : []

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
  const safeAvgRating = typeof avgRating === "number" ? avgRating : 0

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return
      try {
        const bookingsResponse = await axios.get(`${BASE_URL}/booking`, {
          withCredentials: true,
        })
        setBookings(bookingsResponse.data.data.filter((b) => title === b.tourName))
      } catch (error) {
        console.error("Error fetching bookings:", error)
      }
    }
    fetchBookings()
    window.scrollTo(0, 0)
  }, [tour, user, title])

  const userCanReview = bookings.some((booking) => booking.userId === user?._id && booking.status === "confirmed")

  const submitHandler = async (e) => {
    e.preventDefault()
    const reviewText = reviewMsgRef.current.value

    try {
      if (!user || !user._id) {
        Swal.fire({
          icon: "error",
          title: "Bạn phải đăng nhập để đánh giá",
          showConfirmButton: true,
          confirmButtonText: "Đăng nhập",
          confirmButtonColor: "#3085d6",
          timer: 1500,
        })
        return
      }

      const reviewObj = {
        username: user?.username,
        reviewText,
        rating: tourRating,
      }

      const res = await fetch(`${BASE_URL}/review/${id}`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(reviewObj),
      })

      const result = await res.json()
      if (!res.ok) return alert(result.message)

      Swal.fire({
        icon: "success",
        title: "Đánh giá thành công",
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        timer: 1500,
      })
      navigate("/tours")
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) return <Container><div className="text-center pt-5"><h4>LOADING.........</h4></div></Container>
  if (error) return <Container><div className="text-center pt-5"><h4 className="text-danger">{error}</h4></div></Container>
  if (!tour) return null

  return (
    <section>
      <Container>
        <Row>
          <Col lg="8">
            <div className="tour__content">
              <div className="tour__image-carousel mb-4">
                <div className="main-image-container position-relative">
                  {tourImages[0] && (
                    <img src={tourImages[0]} alt="Tour Main" className="w-100" style={{ height: "400px", objectFit: "cover", borderRadius: "8px" }} />
                  )}
                </div>
              </div>

              <div className="card p-3 mb-4">
                <div className="d-flex gap-2 mb-3">
                  <Button color={activeTab === "description" ? "primary" : "secondary"} onClick={() => setActiveTab("description")}>Mô Tả</Button>
                  <Button color={activeTab === "reviews" ? "primary" : "secondary"} onClick={() => setActiveTab("reviews")}>Đánh Giá ({safeReviews.length})</Button>
                </div>

                <hr />

                {activeTab === "description" && (
                  <div className="tour__details">
               
                    {notes && (
                      <div className="mt-4">
                        <div style={{ maxHeight: showMore ? "none" : "500px", overflow: "hidden", position: "relative" }}>
                          <div dangerouslySetInnerHTML={{ __html: notes }} />
                          {!showMore && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60px", background: "linear-gradient(transparent, white)" }}></div>}
                        </div>
                        <div className="text-center">
                          <Button color="outline-primary" onClick={() => setShowMore(!showMore)}>
                            {showMore ? <>Ẩn bớt <FaChevronUp /></> : <>Xem thêm <FaChevronDown /></>}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="tour__reviews mt-4">
                    <h5>Đánh giá</h5>
                    {safeReviews.length === 0 && <p className="text-muted">Chưa có đánh giá nào.</p>}
                    {safeReviews.map((review, index) => (
                      <div key={index} className="review mb-3">
                        <strong>{review.username}</strong>
                        <p className="mb-1">Đánh giá: {review.rating} sao</p>
                        <p>{review.reviewText}</p>
                      </div>
                    ))}

                    <hr />

                    <Form onSubmit={submitHandler} className="mt-4">
                      <h6>Hãy là người đầu tiên nhận xét “{title}”</h6>
                      <FormGroup>
                        <Label>Đánh giá của bạn *</Label>
                        <div className="d-flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Button
                              key={star}
                              type="button"
                              color={tourRating >= star ? "warning" : "secondary"}
                              onClick={() => setTourRating(star)}
                              style={{ padding: "5px 10px" }}
                            >
                              {star} <FaStar className="mb-1" />
                            </Button>
                          ))}
                        </div>
                      </FormGroup>
                      <FormGroup>
                        <Label for="review">Nhận xét của bạn *</Label>
                        <Input id="review" type="textarea" rows="3" innerRef={reviewMsgRef} required />
                      </FormGroup>
                      <Button color="primary" type="submit">Gửi đi</Button>
                    </Form>
                  </div>
                )}
              </div>
            </div>
          </Col>

          <Col lg="4">
            <div className="tour__booking-card p-4" style={{ backgroundColor: "#2196f3", borderRadius: "10px", color: "white" }}>
              <h5 className="fw-bold text-uppercase mb-4 text-center">Đăng ký tư vấn</h5>
              <ul className="list-unstyled text-white small mb-4">
                <li className="mb-2"><strong>Ngày khởi hành:</strong> {departureDate || "Đang cập nhật"}</li>
                <li className="mb-2"><strong>Thời gian:</strong> {time || "Đang cập nhật"}</li>
                <li className="mb-2"><strong>Lịch trình:</strong> {schedule || "Đang cập nhật"}</li>
              </ul>
              <div className="text-center mb-3">
                <h4 style={{ fontWeight: "bold", backgroundColor: "white", color: "#2196f3", padding: "10px", borderRadius: "5px" }}>
                  {priceAdult?.toLocaleString("vi-VN")} đồng
                </h4>
              </div>
              <Button color="danger" className="w-100 mb-3 fw-bold">ĐẶT TOUR NGAY</Button>
              <p className="small text-center mb-2">Liên hệ càng sớm - Giá càng rẻ</p>
              <p className="small text-center mb-3">Hoặc để lại số điện thoại, chúng tôi sẽ gọi lại cho bạn sau ít phút!</p>
              <Form>
                <Input type="text" placeholder="Số điện thoại của tôi là" className="mb-3" />
                <Button color="warning" className="w-100 fw-bold">YÊU CẦU GỌI LẠI</Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default TourDetails
