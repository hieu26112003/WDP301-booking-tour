import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Container, Table } from "reactstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";

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
                <h4>Đang tải...</h4>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <h3 className="mb-3">Danh sách góp ý</h3>
            <Table bordered hover responsive>
                <thead className="table-light">
                    <tr>
                        <th>Họ tên</th>
                        <th>Góp ý</th>
                        <th>Email</th>
                        <th>Địa chỉ</th>
                        <th>SĐT</th>
                        <th>Ngày gửi</th>
                    </tr>
                </thead>
                <tbody>
                    {feedbacks.map((item) => (
                        <tr key={item._id}>
                            <td>{item.name || "-"}</td>
                            <td>{item.feedback || "-"}</td>
                            <td>{item.email || "-"}</td>
                            <td>{item.address || "-"}</td>
                            <td>{item.phone}</td>
                            <td>{new Date(item.createdAt).toLocaleString("vi-VN")}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default FeedbackList;
