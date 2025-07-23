"use client";

import { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Table, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/config";
import "../../styles/myBookings.css";

// Utility function to format Date to DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const MyBookings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user || !user._id) {
        Swal.fire({
          icon: "error",
          title: "Bạn phải đăng nhập để xem danh sách đặt tour",
          showConfirmButton: true,
          confirmButtonText: "Đăng nhập",
          confirmButtonColor: "#3085d6",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/login");
          }
        });
        setLoading(false);
        return;
      }

      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await axios.get(`${BASE_URL}/bookings`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });
        console.log("Bookings API response:", res);
        setBookings(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error(
          "Error fetching user bookings:",
          err.response?.status,
          err.response?.data
        );
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text:
            err.response?.data?.message || "Không thể lấy danh sách đặt tour",
          confirmButtonColor: "#d33",
        });
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [user, navigate]);

  const handleCancelBooking = async (bookingId) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await axios.put(
        `${BASE_URL}/bookings/${bookingId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );
      console.log("Cancel booking response:", res);
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );
      Swal.fire({
        icon: "success",
        title: "Hủy tour thành công",
        confirmButtonColor: "#3085d6",
      });
    } catch (err) {
      console.error(
        "Error cancelling booking:",
        err.response?.status,
        err.response?.data
      );
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.response?.data?.message || "Hủy tour thất bại",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Check if cancellation is allowed (more than 48 hours until departure)
  const canCancelBooking = (departureDate) => {
    if (!departureDate) return false;
    const now = new Date();
    const depDate = new Date(departureDate);
    if (isNaN(depDate.getTime())) return false;
    const hoursUntilDeparture = (depDate - now) / (1000 * 60 * 60);
    return hoursUntilDeparture > 48;
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center pt-5">
          <h4>ĐANG TẢI...</h4>
        </div>
      </Container>
    );
  }

  return (
    <section className="my-bookings-section">
      <Container>
        <Row>
          <Col lg="12">
            <h2 className="my-bookings-title">Danh Sách Tour Đã Đặt</h2>
            {bookings.length === 0 ? (
              <div className="no-bookings-message">
                <p>Bạn chưa đặt tour nào.</p>
                <Button
                  color="primary"
                  onClick={() => navigate("/tours")}
                  className="mt-3"
                >
                  Xem các tour
                </Button>
              </div>
            ) : (
              <Table responsive striped hover className="my-bookings-table">
                <thead>
                  <tr>
                    <th>Tên Tour</th>
                    <th>Số Người Lớn</th>
                    <th>Số Trẻ Em</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Ngày Đặt</th>
                    <th>Ngày Khởi Hành</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.tourId?.title || "N/A"}</td>
                      <td>{booking.numberOfAdults}</td>
                      <td>{booking.numberOfChildren}</td>
                      <td>{booking.totalPrice.toLocaleString("vi-VN")} đồng</td>
                      <td>
                        {booking.status === "pending"
                          ? "Đang chờ"
                          : booking.status === "confirmed"
                          ? "Đã xác nhận"
                          : "Đã hủy"}
                      </td>
                      <td>{formatDate(booking.createdAt)}</td>
                      <td>{formatDate(booking.tourId?.departureDate)}</td>
                      <td>
                        {(booking.status === "pending" ||
                          (booking.status === "confirmed" &&
                            canCancelBooking(
                              booking.tourId?.departureDate
                            ))) && (
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => handleCancelBooking(booking._id)}
                          >
                            Hủy
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default MyBookings;
