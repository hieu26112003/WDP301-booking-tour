import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Container, Table, Spinner, Card, CardBody } from "reactstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaUser } from "react-icons/fa";

const FeedbackList = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeedbacks = async () => {
            if (!user || user.role !== "staff") {
                Swal.fire({
                    icon: "error",
                    title: "Không có quyền truy cập",
                    text: "Chỉ nhân viên mới có thể xem danh sách góp ý",
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
                const res = await axios.get(`${BASE_URL}/contact/feedbacks`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    withCredentials: true,
                });
                setFeedbacks(res.data);
            } catch (err) {
                console.error("Lỗi khi lấy feedback:", err);
                Swal.fire({
                    icon: "error",
                    title: "Lỗi",
                    text: "Không thể lấy danh sách góp ý",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, [user, navigate]);

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner color="primary" />
                <h5 className="mt-3">Đang tải dữ liệu góp ý...</h5>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <div className="text-center mb-4">
                <h3 className="fw-bold">📝 Danh sách góp ý của khách hàng</h3>
            </div>

            <Table bordered responsive hover className="shadow-sm">
                <thead className="table-info text-center">
                    <tr>
                        <th><FaUser /> Họ tên</th>
                        <th>✉️ Góp ý</th>
                        <th><FaEnvelope /> Email</th>
                        <th><FaMapMarkerAlt /> Địa chỉ</th>
                        <th><FaPhoneAlt /> SĐT</th>
                        <th>📅 Ngày</th>
                    </tr>
                </thead>
                <tbody>
                    {feedbacks.length > 0 ? (
                        feedbacks.map((item) => (
                            <tr key={item._id}>
                                <td>{item.name || "-"}</td>
                                <td style={{ maxWidth: "300px", whiteSpace: "pre-wrap" }}>{item.feedback || "-"}</td>
                                <td>{item.email || "-"}</td>
                                <td>{item.address || "-"}</td>
                                <td>{item.phone || "-"}</td>
                                <td>{new Date(item.createdAt).toLocaleString("vi-VN")}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center text-muted">
                                Không có góp ý nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default FeedbackList;
