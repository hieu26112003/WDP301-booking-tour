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

  return (
    <div className="p-4">
      <h3>📄 Danh sách đặt tour</h3>

      <div className="flex gap-4 mb-4">
        <div className="date-range">
  <div>
    <label>Từ ngày:</label>
    <DatePicker
      selected={startDate}
      onChange={(date) => setStartDate(date)}
      placeholderText="Chọn ngày"
      dateFormat="dd/MM/yyyy"
    />
  </div>

  <div>
    <label>Đến ngày:</label>
    <DatePicker
      selected={endDate}
      onChange={(date) => setEndDate(date)}
      placeholderText="Chọn ngày"
      dateFormat="dd/MM/yyyy"
    />
  </div>
<h1></h1>
</div>

        <div>
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

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="thead-dark">
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
                  <td colSpan="8">Không có dữ liệu</td>
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
                    <td>{booking.status}</td>
                    <td>{new Date(booking.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-4">
        <button
          className="btn btn-primary"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          ← Trước
        </button>

        <span>Trang {page} / {totalPages}</span>

        <button
          className="btn btn-primary"
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
