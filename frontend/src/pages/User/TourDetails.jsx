import { useState, useRef, useEffect, useContext } from "react";
import "../../styles/tourDetail.css";
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
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import calculateAvgRating from "../../utils/avgRating";
import useFetch from "../../hooks/useFetch";
import { BASE_URL } from "../../utils/config";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import { FaChevronDown, FaChevronUp, FaStar, FaPhoneAlt } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Utility function to format Date to DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return "Đang cập nhật";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Đang cập nhật";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const reviewMsgRef = useRef("");
  const [tourRating, setTourRating] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [bookings, setBookings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [modal, setModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [bookingData, setBookingData] = useState({
    numberOfAdults: 1,
    numberOfChildren: 0,
  });

  const {
    data: tour,
    loading,
    error,
  } = useFetch(`${BASE_URL}/tours/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  const tourImages = tour?.images || [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const slider1 = useRef(null);
  const slider2 = useRef(null);

  const SampleNextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", right: 10, zIndex: 2 }}
        onClick={onClick}
      />
    );
  };

  const SamplePrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", left: 10, zIndex: 2 }}
        onClick={onClick}
      />
    );
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user._id) {
      Swal.fire("Lỗi", "Bạn cần đăng nhập để bình luận", "error");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/comment`,
        { content: commentText, tourId: id }, // gửi đúng dữ liệu backend yêu cầu
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (res.data.success) {
        setComments([...comments, res.data.data]); // backend trả về data: comment
        setCommentText("");
      }
    } catch (err) {
      Swal.fire("Lỗi", err.message, "error");
    }
  };

  const settingsMain = {
    asNavFor: nav2,
    ref: (slider) => setNav1(slider),
    arrows: true,
    fade: true,
    beforeChange: (oldIndex, newIndex) => setActiveIndex(newIndex),
  };

  const settingsThumbs = {
    asNavFor: nav1,
    ref: (slider) => setNav2(slider),
    slidesToShow: 4,
    swipeToSlide: true,
    focusOnSelect: true,
    centerMode: false,
    arrows: false,
  };

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
  } = tour || {};

  const safeReviews = reviews || [];
  const { totalRating, avgRating } = calculateAvgRating(safeReviews);

  const totalPrice =
    bookingData.numberOfAdults * (priceAdult || 0) +
    bookingData.numberOfChildren * (priceChild || 0);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await axios.get(`${BASE_URL}/booking`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setBookings(res.data.data.filter((b) => title === b.tourName));
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/comment/tour/${id}`);
        console.log("COMMENTS API RESPONSE:", res.data);
        // Nếu API trả thẳng mảng:
        if (Array.isArray(res.data)) {
          setComments(res.data);
        } else if (res.data?.data) {
          setComments(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    fetchBookings();
    fetchComments();
    window.scrollTo(0, 0);
  }, [tour, user, title, id]);

  useEffect(() => {
    if (slider2.current) slider2.current.slickGoTo(activeIndex);
  }, [activeIndex]);

  const userCanReview = bookings.some(
    (b) => b.userId === user?._id && b.status === "confirmed"
  );

  

  const handleCallBackSubmit = async (e) => {
    e.preventDefault();
    const phoneRegex =
      /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    const trimmedPhone = phoneNumber.trim();
    if (!phoneRegex.test(trimmedPhone)) {
      Swal.fire("Lỗi", "Số điện thoại không hợp lệ!", "error");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/call-request`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ phoneNumber: trimmedPhone }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      Swal.fire("Thành công", "Chúng tôi sẽ gọi lại cho bạn sớm!", "success");
      setPhoneNumber("");
    } catch (err) {
      Swal.fire(
        "Lỗi khi gửi yêu cầu!",
        err.message || "Lỗi không xác định",
        "error"
      );
    }
  };

  const toggleModal = () => setModal(!modal);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user._id) {
      Swal.fire({
        icon: "error",
        title: "Bạn phải đăng nhập để đặt tour",
        showConfirmButton: true,
        confirmButtonText: "Đăng nhập",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (bookingData.numberOfAdults < 1) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Số lượng người lớn phải ít nhất là 1",
        confirmButtonColor: "#d33",
      });
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
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
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      Swal.fire({
        icon: "success",
        title: "Đặt tour thành công",
        text: "Cảm ơn bạn đã đặt tour. Chúng tôi sẽ gửi email xác nhận.",
        confirmButtonColor: "#3085d6",
      });
      toggleModal();
      navigate("/tours");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.message || "Đặt tour thất bại",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: Math.max(0, parseInt(value) || 0),
    }));
  };

  if (loading)
    return (
      <Container>
        <div className="text-center pt-5">
          <h4>LOADING.........</h4>
        </div>
      </Container>
    );
  if (error)
    return (
      <Container>
        <div className="text-center pt-5">
          <h4 className="text-danger">{error}</h4>
        </div>
      </Container>
    );
  if (!tour) return null;

  return (
    <section>
      <Container>
        <Row>
          <Col lg="8">
            <div className="tour__content">
              <div className="tour__image-carousel mb-4">
                <Slider
                  {...settingsMain}
                  ref={slider1}
                  nextArrow={<SampleNextArrow />}
                  prevArrow={<SamplePrevArrow />}
                >
                  {tourImages.map((img, index) => (
                    <div key={index}>
                      <img
                        src={img}
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
                          setActiveIndex(index);
                          slider1.current?.slickGoTo(index);
                        }}
                      >
                        <img
                          src={img}
                          style={{
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 6,
                            width: "100%",
                            opacity: index === activeIndex ? 1 : 0.5,
                            border:
                              index === activeIndex
                                ? "2px solid #2196f3"
                                : "none",
                          }}
                        />
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>

              <div className="card p-3 mb-4">
                <div className="d-flex gap-2 mb-3">
                  <Button
                    color={
                      activeTab === "description" ? "primary" : "secondary"
                    }
                    onClick={() => setActiveTab("description")}
                  >
                    Mô Tả
                  </Button>
                  <Button
                    color={activeTab === "reviews" ? "primary" : "secondary"}
                    onClick={() => setActiveTab("reviews")}
                  >
                    Đánh Giá ({safeReviews.length})
                  </Button>
                </div>
                <hr />
                {activeTab === "description" && (
                  <div className="tour__details">
                    {notes && (
                      <div className="mt-4">
                        <div
                          style={{
                            maxHeight: showMore ? "none" : 500,
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <div dangerouslySetInnerHTML={{ __html: notes }} />
                          {!showMore && (
                            <div
                              style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 60,
                                background:
                                  "linear-gradient(transparent, white)",
                              }}
                            />
                          )}
                        </div>
                        <div className="text-center">
                          <Button
                            color="outline-primary"
                            onClick={() => setShowMore(!showMore)}
                          >
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
                          className="comment-item mb-3 p-2 border rounded"
                        >
                          <p>{c.content}</p>
                          <small className="text-muted">
                            {new Date(c.createdAt).toLocaleString("vi-VN")}
                          </small>
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
                          rows="2"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          required
                        />
                      </FormGroup>
                      <Button color="primary" type="submit">
                        Gửi bình luận
                      </Button>
                    </Form>
                  </div>
                )}
                1
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
              <h5 className="fw-bold text-uppercase mb-4 text-center">
                Đăng ký tư vấn
              </h5>
              <ul className="list-unstyled text-white small mb-4">
                <li className="mb-2">
                  <strong>Ngày khởi hành:</strong> {formatDate(departureDate)}
                </li>
                <li className="mb-2">
                  <strong>Thời gian:</strong> {time || "Đang cập nhật"}
                </li>
                <li className="mb-2">
                  <strong>Lịch trình:</strong> {schedule || "Đang cập nhật"}
                </li>
              </ul>
              <div className="text-center mb-3">
                <h4
                  style={{
                    fontWeight: "bold",
                    backgroundColor: "white",
                    color: "#2196f3",
                    padding: 10,
                    borderRadius: 5,
                  }}
                >
                  {priceAdult?.toLocaleString("vi-VN")} đồng
                </h4>
              </div>
              <Button
                color="danger"
                className="w-100 mb-3 fw-bold"
                onClick={toggleModal}
              >
                ĐẶT TOUR NGAY
              </Button>
              <p className="small text-center mb-2">
                Liên hệ càng sớm - Giá càng rẻ
              </p>
              <p className="small text-center mb-3">
                Hoặc để lại số điện thoại, chúng tôi sẽ gọi lại cho bạn sau ít
                phút!
              </p>
              <Form onSubmit={handleCallBackSubmit}>
                <Input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Số điện thoại của tôi là"
                  className="mb-3"
                />
                <Button color="warning" className="w-100 fw-bold" type="submit">
                  YÊU CẦU GỌI LẠI
                </Button>
              </Form>
            </div>
          </Col>
        </Row>

        <Modal
          isOpen={modal}
          toggle={toggleModal}
          className="tour-booking-modal"
        >
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
            <Button
              color="primary"
              onClick={handleBookingSubmit}
              className="px-4"
            >
              Xác nhận đặt tour
            </Button>{" "}
            <Button color="secondary" onClick={toggleModal} className="px-4">
              Hủy
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </section>
  );
};

export default TourDetails;
