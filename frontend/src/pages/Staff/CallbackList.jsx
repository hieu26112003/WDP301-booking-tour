import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Container, Table, Spinner, ButtonGroup, Button } from "reactstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import { FaPhone, FaCheckCircle } from "react-icons/fa";

const CallbackList = () => {
    const [callbacks, setCallbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // 'all', 'called', 'uncalled'
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCallbacks = async () => {
            if (!user || user.role !== "staff") {
                Swal.fire({
                    icon: "error",
                    title: "Không có quyền truy cập",
                    text: "Chỉ nhân viên mới có thể xem danh sách yêu cầu gọi lại",
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
                const res = await axios.get(`${BASE_URL}/contact/callbacks`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    withCredentials: true,
                });
                setCallbacks(res.data);
            } catch (err) {
                console.error("Lỗi khi lấy callback:", err);
                Swal.fire({
                    icon: "error",
                    title: "Lỗi",
                    text: "Không thể lấy danh sách callback",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCallbacks();
    }, [user, navigate]);

    const handleMarkCalled = async (id) => {
        const accessToken = localStorage.getItem("accessToken");

        try {
            const res = await axios.put(
                `${BASE_URL}/contact/callback/${id}/call`,
                { staffId: user._id },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    withCredentials: true,
                }
            );

            setCallbacks((prev) =>
                prev.map((item) => (item._id === id ? res.data : item))
            );
        } catch (err) {
            console.error("Lỗi khi đánh dấu đã gọi:", err);
            Swal.fire("Lỗi", "Không thể cập nhật trạng thái đã gọi", "error");
        }
    };

    const filteredCallbacks = callbacks.filter((item) => {
        if (filter === "called") return item.called;
        if (filter === "uncalled") return !item.called;
        return true; // all
    });

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner color="primary" />
                <h5 className="mt-3">Đang tải dữ liệu...</h5>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <div className="text-center mb-4">
                <h3 className="fw-bold">📞 Danh sách yêu cầu gọi lại</h3>
            </div>

            <div className="mb-3 text-center">
                <ButtonGroup>
                    <Button
                        color={filter === "all" ? "primary" : "outline-primary"}
                        onClick={() => setFilter("all")}
                    >
                        Tất cả
                    </Button>
                    <Button
                        color={filter === "called" ? "success" : "outline-success"}
                        onClick={() => setFilter("called")}
                    >
                        Đã gọi
                    </Button>
                    <Button
                        color={filter === "uncalled" ? "danger" : "outline-danger"}
                        onClick={() => setFilter("uncalled")}
                    >
                        Chưa gọi
                    </Button>
                </ButtonGroup>
            </div>

            <Table bordered responsive hover className="shadow-sm">
                <thead className="table-primary text-center">
                    <tr>
                        <th>SĐT</th>
                        <th>Ngày gửi</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCallbacks.length > 0 ? (
                        filteredCallbacks.map((item) => (
                            <tr key={item._id} className="align-middle">
                                <td className="fw-semibold">{item.phone}</td>
                                <td>{new Date(item.createdAt).toLocaleString("vi-VN")}</td>
                                <td>
                                    {item.called ? (
                                        <span className="badge bg-success d-inline-flex align-items-center">
                                            <FaCheckCircle className="me-1" />
                                            Đã gọi bởi {item.calledBy?.fullname || "Không rõ"}
                                        </span>
                                    ) : (
                                        <button
                                            className="btn btn-outline-primary btn-sm d-inline-flex align-items-center"
                                            onClick={() => handleMarkCalled(item._id)}
                                        >
                                            <FaPhone className="me-1" />
                                            Đánh dấu đã gọi
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center text-muted">
                                Không có dữ liệu phù hợp.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default CallbackList;
