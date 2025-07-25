import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../utils/config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import "../../../styles/ManageBooking.css";

const ManageBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [userEmailFilter, setUserEmailFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit });
      if (startDate && endDate) {
        params.append("startDate", startDate.toISOString());
        params.append("endDate", endDate.toISOString());
      }
      if (userEmailFilter.trim()) {
        params.append("userEmail", userEmailFilter.trim());
      }
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/bookings/allbooking?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setBookings(result.data);
      setTotalPages(result.pagination.pages);
    } catch (err) {
      Swal.fire("Lỗi", err.message || "Không thể tải danh sách booking", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, startDate, endDate, userEmailFilter]);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'status-badge status-confirmed';
      case 'pending':
        return 'status-badge status-pending';
      case 'cancelled':
        return 'status-badge status-cancelled';
      default:
        return 'status-badge status-pending';
    }
  };

  return (
    <div className="manage-booking-container">
      <h3>📄 Danh sách đặt tour</h3>
      
      <div className="filter-section">
        <div className="filter-controls">
          <div className="date-range">
            <div className="date-input-group">
              <label>Từ ngày:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                placeholderText="Chọn ngày"
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <div className="date-input-group">
              <label>Đến ngày:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                placeholderText="Chọn ngày"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>
          
          <div className="email-input-group">
            <label>Nhập Email:</label>
            <input
              type="text"
              value={userEmailFilter}
              onChange={(e) => {
                setUserEmailFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo email"
              className="form-control"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Email người dùng</th>
                  <th>Tour</th>
                  <th>Người lớn</th>
                  <th>Trẻ em</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking, index) => (
                    <tr key={booking._id}>
                      <td>{(page - 1) * limit + index + 1}</td>
                      <td>
                        {booking.userId
                          ? booking.userId.email || booking.userId._id
                          : "Không có người dùng"}
                      </td>
                      <td>{booking.tourId?.title || booking.tourId?._id}</td>
                      <td>{booking.numberOfAdults}</td>
                      <td>{booking.numberOfChildren}</td>
                      <td>{booking.totalPrice.toLocaleString()} đ</td>
                      <td>
                        <span className={getStatusClass(booking.status)}>
                          {booking.status}
                        </span>
                      </td>
                      <td>{new Date(booking.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="pagination-container">
        <button
          className="pagination-btn"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          ← Trước
        </button>
        <span className="pagination-info">
          Trang {page} / {totalPages}
        </span>
        <button
          className="pagination-btn"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
        >
          Sau →
        </button>
      </div>
    </div>
  );
};

export default ManageBooking;