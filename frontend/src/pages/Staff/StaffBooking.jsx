"use client";

import { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  FormGroup,
  Input,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/config";
import "../../styles/staffBookings.css";

const StaffBookings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllBookings = async () => {
      if (!user || user.role !== "staff") {
        Swal.fire({
          icon: "error",
          title: "Không có quyền truy cập",
          text: "Chỉ nhân viên mới có thể xem danh sách tất cả booking",
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
        const res = await axios.get(`${BASE_URL}/bookings/all`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });
        console.log("All bookings API response:", res);
        setBookings(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error(
          "Error fetching all bookings:",
          err.response?.status,
          err.response?.data
        );
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text:
            err.response?.data?.message || "Không thể lấy danh sách booking",
          confirmButtonColor: "#d33",
        });
        setLoading(false);
      }
    };

    fetchAllBookings();
  }, [user, navigate]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await axios.put(
        `${BASE_URL}/bookings/${bookingId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );
      console.log("Update booking status response:", res);
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );
      Swal.fire({
        icon: "success",
        title: "Cập nhật trạng thái thành công",
        confirmButtonColor: "#3085d6",
      });
    } catch (err) {
      console.error(
        "Error updating booking status:",
        err.response?.status,
        err.response?.data
      );
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.response?.data?.message || "Cập nhật trạng thái thất bại",
        confirmButtonColor: "#d33",
      });
    }
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
    <section className="staff-bookings-section">
      <Container>
        <Row>
          <Col lg="12">
            <h2 className="staff-bookings-title">Quản Lý Đặt Tour</h2>
            {bookings.length === 0 ? (
              <div className="no-bookings-message">
                <p>Chưa có booking nào.</p>
              </div>
            ) : (
              <Table responsive striped hover className="staff-bookings-table">
                <thead>
                  <tr>
                    <th>Mã Booking</th>
                    <th>Tên Tour</th>
                    <th>Tên Người Dùng</th>
                    <th>Số Điện Thoại</th>
                    <th>Số Người Lớn</th>
                    <th>Số Trẻ Em</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Ngày Đặt</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking._id}</td>
                      <td>{booking.tourId?.title || "N/A"}</td>
                      <td>{booking.userId?.fullname || "N/A"}</td>
                      <td>{booking.userId?.phone || "N/A"}</td>
                      <td>{booking.numberOfAdults}</td>
                      <td>{booking.numberOfChildren}</td>
                      <td>{booking.totalPrice.toLocaleString("vi-VN")} đồng</td>
                      <td>
                        <Input
                          type="select"
                          value={booking.status}
                          onChange={(e) =>
                            handleUpdateStatus(booking._id, e.target.value)
                          }
                          disabled={booking.status === "cancelled"}
                        >
                          <option value="pending">Đang chờ</option>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="cancelled">Đã hủy</option>
                        </Input>
                      </td>
                      <td>
                        {new Date(booking.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                      <td>
                        <Button
                          color="primary"
                          size="sm"
                          onClick={() =>
                            navigate(`/tours/${booking.tourId?._id}`)
                          }
                        >
                          Xem Tour
                        </Button>
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

export default StaffBookings;
