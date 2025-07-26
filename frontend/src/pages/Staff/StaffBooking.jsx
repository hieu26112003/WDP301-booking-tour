import { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  FormGroup,
  Input,
  Spinner,
  Pagination,
  PaginationItem,
  PaginationLink,
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchAllBookings = async () => {
      if (!user || user.role !== "staff") {
        Swal.fire({
          icon: "error",
          title: "Không có quyền truy cập",
          text: "Chỉ nhân viên mới có thể xem danh sách tất cả booking",
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
        if (!accessToken) {
          throw new Error("No token found. Please log in.");
        }

        const params = { page, limit: 10 };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (statusFilter) params.status = statusFilter;

        const res = await axios.get(`${BASE_URL}/bookings/all`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params,
          withCredentials: true,
        });
        setBookings(res.data.data);
        setTotalPages(res.data.pagination.pages);
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
          confirmButtonText: "OK",
          confirmButtonColor: "#d33",
        });
        setLoading(false);
      }
    };

    fetchAllBookings();
  }, [user, navigate, startDate, endDate, statusFilter, page]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    const statusDisplay = {
      pending: "Đang chờ",
      deposit_confirmed: "Đã xác nhận đặt cọc",
      completed: "Đã hoàn thành",
      cancelled: "Đã hủy",
    };

    const result = await Swal.fire({
      title: "Xác nhận cập nhật trạng thái",
      text: `Bạn muốn cập nhật trạng thái booking này thành "${statusDisplay[newStatus]}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
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
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  status: newStatus,
                  revenue: res.data.data.revenue,
                }
              : booking
          )
        );
        Swal.fire({
          icon: "success",
          title: "Cập nhật trạng thái thành công",
          showConfirmButton: false,
          timer: 1500,
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
          confirmButtonText: "OK",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc?",
      text: "Bạn muốn hủy booking này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Hủy Booking",
      cancelButtonText: "Không",
    });

    if (result.isConfirmed) {
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
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  status: "cancelled",
                  revenue: res.data.data.revenue,
                }
              : booking
          )
        );
        Swal.fire({
          icon: "success",
          title: "Hủy booking thành công",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: err.response?.data?.message || "Hủy booking thất bại",
          confirmButtonText: "OK",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const canCancelBooking = (booking) => {
    return booking.status === "deposit_confirmed";
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner color="primary" />
        <h5 className="mt-3">Đang tải dữ liệu...</h5>
      </Container>
    );
  }

  return (
    <section className="staff-bookings-section">
      <Container>
        <h2 className="staff-bookings-title">Quản Lý Đặt Tour</h2>

        {/* Bộ lọc tìm kiếm */}
        <Row className="mb-4">
          <Col md="4" sm="12" className="mb-3">
            <FormGroup>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Từ ngày"
              />
            </FormGroup>
          </Col>
          <Col md="4" sm="12" className="mb-3">
            <FormGroup>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Đến ngày"
              />
            </FormGroup>
          </Col>
          <Col md="4" sm="12" className="mb-3">
            <FormGroup>
              <Input
                type="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Đang chờ</option>
                <option value="deposit_confirmed">Đã xác nhận đặt cọc</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </Input>
            </FormGroup>
          </Col>
        </Row>

        {/* Bảng booking */}
        {bookings.length === 0 ? (
          <div className="no-bookings-message">
            <p>Chưa có booking nào.</p>
          </div>
        ) : (
          <>
            <Table responsive striped hover className="staff-bookings-table">
              <thead>
                <tr>
                  <th>Mã Booking</th>
                  <th>Tên Tour</th>
                  <th>Tên Người Dùng</th>
                  <th>Số Điện Thoại</th>
                  <th>Số Người Lớn</th>
                  <th>Số Trẻ Em</th>
                  <th>Tổng Giá</th>
                  <th>Doanh Thu</th>
                  <th>Trạng Thái</th>
                  <th>Ngày Đặt</th>
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
                      {booking.revenue
                        ? booking.revenue.toLocaleString("vi-VN")
                        : "0"}{" "}
                      đồng
                    </td>
                    <td>
                      <FormGroup>
                        <Input
                          type="select"
                          value={booking.status}
                          onChange={(e) =>
                            handleUpdateStatus(booking._id, e.target.value)
                          }
                          disabled={booking.status === "cancelled"}
                          className={`status-select status-${booking.status}`}
                        >
                          <option value="pending">Đang chờ</option>
                          <option value="deposit_confirmed">
                            Đã xác nhận đặt cọc
                          </option>
                          <option value="completed">Đã hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </Input>
                      </FormGroup>
                    </td>
                    <td>
                      {new Date(booking.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Phân trang */}
            <Pagination className="mt-4">
              <PaginationItem disabled={page === 1}>
                <PaginationLink
                  previous
                  onClick={() => handlePageChange(page - 1)}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index} active={page === index + 1}>
                  <PaginationLink onClick={() => handlePageChange(index + 1)}>
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem disabled={page === totalPages}>
                <PaginationLink
                  next
                  onClick={() => handlePageChange(page + 1)}
                />
              </PaginationItem>
            </Pagination>
          </>
        )}
      </Container>
    </section>
  );
};

export default StaffBookings;
