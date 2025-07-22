import React, { useState, useEffect, useContext } from "react";
import { Container, Table, Button } from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import { useNavigate } from "react-router-dom";
import "./notification.css";
const NotificationList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/notifications`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setNotifications(res.data.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể tải thông báo",
          confirmButtonColor: "#d33",
        });
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Bạn có chắc muốn xóa thông báo này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${BASE_URL}/notifications/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setNotifications((prev) => prev.filter((notif) => notif._id !== id));
          Swal.fire({
            icon: "success",
            title: "Xóa thành công",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error("Lỗi khi xóa thông báo:", error);
          Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: "Không thể xóa thông báo",
            confirmButtonColor: "#d33",
          });
        }
      }
    });
  };

  const handleNotificationClick = (id, bookingId) => {
    if (!id || !bookingId) return;
    navigate(`/bookings/${bookingId}`);
  };

  return (
    <Container className="my-5">
      <h2>Danh sách thông báo</h2>
      <Table striped className="mt-3">
        <thead>
          <tr>
            <th>Loại</th>
            <th>Nội dung</th>
            <th>Tour</th>
            <th>Thời gian</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <tr
                key={notif._id}
                onClick={() =>
                  handleNotificationClick(notif._id, notif.bookingId)
                }
                style={{ cursor: "pointer" }}
              >
                <td>
                  {notif.type === "booking"
                    ? "Đặt tour"
                    : notif.type === "cancellation"
                    ? "Hủy tour"
                    : "Xác nhận"}
                </td>
                <td>
                  {notif.message ||
                    (notif.type === "booking"
                      ? user.role === "staff"
                        ? `Người dùng ${
                            notif.userId?.username || "Unknown"
                          } đã đặt tour ${notif.tourId?.title || "Unknown"}`
                        : `Bạn đã đặt tour ${
                            notif.tourId?.title || "Unknown"
                          } thành công`
                      : notif.type === "cancellation"
                      ? user.role === "staff"
                        ? `Người dùng ${
                            notif.userId?.username || "Unknown"
                          } đã hủy tour ${notif.tourId?.title || "Unknown"}`
                        : `Bạn đã hủy tour ${notif.tourId?.title || "Unknown"}`
                      : user.role === "staff"
                      ? `Người dùng ${
                          notif.userId?.username || "Unknown"
                        } xác nhận booking cho tour ${
                          notif.tourId?.title || "Unknown"
                        }`
                      : `Booking của bạn cho tour ${
                          notif.tourId?.title || "Unknown"
                        } đã được xác nhận`)}
                </td>
                <td>{notif.tourId?.title || "Unknown"}</td>
                <td>{new Date(notif.createdAt).toLocaleString()}</td>
                <td>{notif.read ? "Đã đọc" : "Chưa đọc"}</td>
                <td>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif._id);
                    }}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                Không có thông báo
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default NotificationList;
