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
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { FaPhoneAlt } from "react-icons/fa"

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

  const { data: tour, loading, error } = useFetch(`${BASE_URL}/tours/${id}`)
  const tourImages = tour?.images || []

  const [activeIndex, setActiveIndex] = useState(0)
  const [nav1, setNav1] = useState(null)
  const [nav2, setNav2] = useState(null)
  const slider1 = useRef(null)
  const slider2 = useRef(null)
   const [phone, setPhone] = useState("")

  const SampleNextArrow = (props) => {
    const { className, style, onClick } = props
    return <div className={className} style={{ ...style, display: "block", right: 10, zIndex: 2 }} onClick={onClick} />
  }

  const SamplePrevArrow = (props) => {
    const { className, style, onClick } = props
    return <div className={className} style={{ ...style, display: "block", left: 10, zIndex: 2 }} onClick={onClick} />
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

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return
      try {
        const res = await axios.get(`${BASE_URL}/booking`, { withCredentials: true })
        setBookings(res.data.data.filter((b) => title === b.tourName))
      } catch (err) {
        console.error("Error fetching bookings:", err)
      }
    }
    fetchBookings()
    window.scrollTo(0, 0)
  }, [tour, user, title])

  useEffect(() => {
    if (slider2.current) slider2.current.slickGoTo(activeIndex)
  }, [activeIndex])

  const userCanReview = bookings.some((b) => b.userId === user?._id && b.status === "confirmed")

  const submitHandler = async (e) => {
    e.preventDefault()
    const reviewText = reviewMsgRef.current.value

    if (!user || !user._id) {
      Swal.fire({
        icon: "error",
        title: "Bạn phải đăng nhập để đánh giá",
        showConfirmButton: true,
        confirmButtonText: "Đăng nhập",
        confirmButtonColor: "#3085d6",
      })
      return
    }

    try {
      const res = await fetch(`${BASE_URL}/review/${id}`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: user.username, reviewText, rating: tourRating }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)

      Swal.fire({ icon: "success", title: "Đánh giá thành công", confirmButtonColor: "#3085d6" })
      navigate("/tours")
    } catch (err) {
      alert(err.message)
    }
  }

   const handleCallBackSubmit = async (e) => {
    e.preventDefault()
    const phoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/
    const trimmedPhone = phoneNumber.trim()
    if (!phoneRegex.test(trimmedPhone)) {
      Swal.fire("Lỗi", "Số điện thoại không hợp lệ!", "error")
      return
    }

    try {
      const res = await fetch(`${BASE_URL}/call-request`, {
        phoneNumber: trimmedPhone,
      })
      Swal.fire("Thành công", "Chúng tôi sẽ gọi lại cho bạn sớm!", "success")
      setPhoneNumber("")
    } catch (err) {
      Swal.fire(
        "Lỗi khi gửi yêu cầu!",
        err.response?.data?.message || "Lỗi không xác định",
        "error"
      )
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
                <Slider {...settingsMain} ref={slider1} nextArrow={<SampleNextArrow />} prevArrow={<SamplePrevArrow />}>
                  {tourImages.map((img, index) => (
                    <div key={index}><img src={img} className="w-100" style={{ height: 400, objectFit: "cover", borderRadius: 10 }} /></div>
                  ))}
                </Slider>
                <div className="mt-3">
                  <Slider {...settingsThumbs} ref={slider2}>
                    {tourImages.map((img, index) => (
                      <div key={index} className="px-1" onClick={() => { setActiveIndex(index); slider1.current?.slickGoTo(index) }}>
                        <img src={img} style={{ height: 80, objectFit: "cover", borderRadius: 6, width: "100%", opacity: index === activeIndex ? 1 : 0.5, border: index === activeIndex ? "2px solid #2196f3" : "none" }} />
                      </div>
                    ))}
                  </Slider>
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
                        <div style={{ maxHeight: showMore ? "none" : 500, overflow: "hidden", position: "relative" }}>
                          <div dangerouslySetInnerHTML={{ __html: notes }} />
                          {!showMore && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, white)" }} />}
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
                    {safeReviews.map((r, i) => (
                      <div key={i} className="review mb-3">
                        <strong>{r.username}</strong>
                        <p className="mb-1">Đánh giá: {r.rating} sao</p>
                        <p>{r.reviewText}</p>
                      </div>
                    ))}
                    <hr />
                    <Form onSubmit={submitHandler} className="mt-4">
                      <h6>Hãy là người đầu tiên nhận xét “{title}”</h6>
                      <FormGroup>
                        <Label>Đánh giá của bạn *</Label>
                        <div className="d-flex gap-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Button key={s} type="button" color={tourRating >= s ? "warning" : "secondary"} onClick={() => setTourRating(s)}>{s} <FaStar className="mb-1" /></Button>
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
                <h4 style={{ fontWeight: "bold", backgroundColor: "white", color: "#2196f3", padding: 10, borderRadius: 5 }}>
                  {priceAdult?.toLocaleString("vi-VN")} đồng
                </h4>
              </div>
              <Button color="danger" className="w-100 mb-3 fw-bold">ĐẶT TOUR NGAY</Button>
              <p className="small text-center mb-2">Liên hệ càng sớm - Giá càng rẻ</p>
              <p className="small text-center mb-3">Hoặc để lại số điện thoại, chúng tôi sẽ gọi lại cho bạn sau ít phút!</p>
              <Form onSubmit={handleCallBackSubmit}>
                <Input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Số điện thoại của tôi là"
                  className="mb-3"
                />
                <Button color="warning" className="w-100 fw-bold" type="submit">YÊU CẦU GỌI LẠI</Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default TourDetails
