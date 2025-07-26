import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Row,
  Col,
  Spinner,
} from "reactstrap";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import "./AdminStatistics.css";

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const AdminStatistics = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStaff: 0,
    totalTours: 0,
    totalRevenue: 0,
    totalCancellationRevenue: 0,
    topTour: null,
    bookingStatus: [],
    bookingsByCategory: [],
    totalComments: 0,
    revenueByDay: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy dữ liệu thống kê từ API
  useEffect(() => {
    const fetchStatistics = async () => {
      if (!user || user.role !== "admin") {
        Swal.fire({
          icon: "error",
          title: "Không có quyền truy cập",
          text: "Chỉ admin mới có thể xem thống kê",
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

        const response = await axios.get(`${BASE_URL}/admin/statistic`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        });

        setStats(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể lấy dữ liệu thống kê",
        });
      }
    };
    fetchStatistics();
  }, [user, navigate]);

  // Dữ liệu cho biểu đồ trạng thái booking (Pie Chart)
  const bookingStatusData = {
    labels: ["Đang chờ", "Đã xác nhận đặt cọc", "Đã hoàn thành", "Đã hủy"],
    datasets: [
      {
        label: "Trạng thái Booking",
        data: [
          stats.bookingStatus.find((s) => s._id === "pending")?.count || 0,
          stats.bookingStatus.find((s) => s._id === "deposit_confirmed")
            ?.count || 0,
          stats.bookingStatus.find((s) => s._id === "completed")?.count || 0,
          stats.bookingStatus.find((s) => s._id === "cancelled")?.count || 0,
        ],
        backgroundColor: ["#FFCE56", "#28a745", "#007bff", "#FF6384"],
        borderColor: ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
        borderWidth: 1,
      },
    ],
  };

  // Dữ liệu cho biểu đồ booking theo danh mục (Bar Chart)
  const bookingsByCategoryData = {
    labels: stats.bookingsByCategory.map((cat) => cat.categoryName),
    datasets: [
      {
        label: "Bookings theo Danh mục",
        data: stats.bookingsByCategory.map((cat) => cat.bookingCount),
        backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
        borderColor: ["#FFFFFF", "#FFFFFF", "#FFFFFF"],
        borderWidth: 1,
      },
    ],
  };

  // Dữ liệu cho biểu đồ doanh thu theo ngày (Line Chart, completed bookings + cancellation revenue)
  const revenueByDayData = {
    labels: stats.revenueByDay.map((day) => day._id),
    datasets: [
      {
        label: "Doanh Thu (VND)",
        data: stats.revenueByDay.map((day) => day.totalRevenue),
        fill: false,
        borderColor: "#36A2EB",
        backgroundColor: "#36A2EB",
        tension: 0.1,
      },
    ],
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner color="primary" />
        <h5 className="mt-3">Đang tải dữ liệu...</h5>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 text-center">
        <h5 className="text-danger">Lỗi: {error}</h5>
      </Container>
    );
  }

  return (
    <Container className="admin-statistics mt-5">
      <h1 className="text-center mb-5">Bảng Thống Kê Admin</h1>

      {/* Thông số thống kê */}
      <Row className="stats-container mb-5">
        <Col md="3" sm="6" className="mb-4">
          <Card className="stat-card">
            <CardBody>
              <CardTitle tag="h3">Tổng Người Dùng</CardTitle>
              <CardText>{stats.totalUsers}</CardText>
            </CardBody>
          </Card>
        </Col>
        <Col md="3" sm="6" className="mb-4">
          <Card className="stat-card">
            <CardBody>
              <CardTitle tag="h3">Tổng Nhân Viên</CardTitle>
              <CardText>{stats.totalStaff}</CardText>
            </CardBody>
          </Card>
        </Col>
        <Col md="3" sm="6" className="mb-4">
          <Card className="stat-card">
            <CardBody>
              <CardTitle tag="h3">Tổng Tour</CardTitle>
              <CardText>{stats.totalTours}</CardText>
            </CardBody>
          </Card>
        </Col>
        <Col md="3" sm="6" className="mb-4">
          <Card className="stat-card">
            <CardBody>
              <CardTitle tag="h3">Tổng Doanh Thu</CardTitle>
              <CardText>
                {stats.totalRevenue.toLocaleString("vi-VN")} VND
              </CardText>
            </CardBody>
          </Card>
        </Col>
        <Col md="3" sm="6" className="mb-4">
          <Card className="stat-card">
            <CardBody>
              <CardTitle tag="h3">Doanh Thu Hủy Tour</CardTitle>
              <CardText>
                {stats.totalCancellationRevenue.toLocaleString("vi-VN")} VND
              </CardText>
            </CardBody>
          </Card>
        </Col>
        <Col md="3" sm="6" className="mb-4">
          <Card className="stat-card">
            <CardBody>
              <CardTitle tag="h3">Tour Phổ Biến Nhất</CardTitle>
              <CardText>
                {stats.topTour ? stats.topTour.title : "Không có"}
              </CardText>
            </CardBody>
          </Card>
        </Col>
        <Col md="3" sm="6" className="mb-4">
          <Card className="stat-card">
            <CardBody>
              <CardTitle tag="h3">Tổng Bình Luận</CardTitle>
              <CardText>{stats.totalComments}</CardText>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ trạng thái booking */}
      <div className="chart-container mb-5">
        <h2 className="text-center">Phân Bố Trạng Thái Booking</h2>
        <Pie
          data={bookingStatusData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top", labels: { font: { size: 14 } } },
              title: {
                display: true,
                text: "Phân Bố Trạng Thái Booking",
                font: { size: 18 },
              },
            },
          }}
        />
      </div>

      {/* Biểu đồ booking theo danh mục */}
      <div className="chart-container mb-5">
        <h2 className="text-center">Booking Theo Danh Mục</h2>
        <Bar
          data={bookingsByCategoryData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top", labels: { font: { size: 14 } } },
              title: {
                display: true,
                text: "Booking Theo Danh Mục",
                font: { size: 18 },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Số Lượng Booking",
                  font: { size: 14 },
                },
              },
            },
          }}
        />
      </div>

      {/* Biểu đồ doanh thu theo ngày */}
      <div className="chart-container">
        <h2 className="text-center">Doanh Thu Theo Ngày</h2>
        <Line
          data={revenueByDayData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top", labels: { font: { size: 14 } } },
              title: {
                display: true,
                text: "Doanh Thu Theo Ngày (Hoàn Thành + Hủy Tour)",
                font: { size: 18 },
              },
            },
            scales: {
              x: {
                title: { display: true, text: "Ngày", font: { size: 14 } },
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Doanh Thu (VND)",
                  font: { size: 14 },
                },
              },
            },
          }}
        />
      </div>
    </Container>
  );
};

export default AdminStatistics;
