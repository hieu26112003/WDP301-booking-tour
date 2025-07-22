// src/pages/Staff/ManageComments.jsx
import React, { useEffect, useState } from "react";
import { Container, Table, Button } from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../utils/config";

const ManageComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách comment
 useEffect(() => {
  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${BASE_URL}/comment`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy comment:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchComments(); // gọi lần đầu
  const interval = setInterval(fetchComments, 5000); // gọi lại mỗi 5 giây

  return () => clearInterval(interval); // clear khi unmount
}, []);

  // Xóa comment
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Bạn chắc chắn muốn xóa?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("accessToken");
          await axios.delete(`${BASE_URL}/comment/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setComments(comments.filter((c) => c._id !== id));
          Swal.fire("Đã xóa!", "Bình luận đã được xóa.", "success");
        } catch (err) {
          Swal.fire("Lỗi", "Không thể xóa bình luận.", "error");
        }
      }
    });
  };

  if (loading) return <p className="text-center mt-4">Đang tải bình luận...</p>;

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Quản lý bình luận</h2>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Nội dung</th>
            <th>Tour</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <tr key={comment._id}>
                <td>{index + 1}</td>
                <td>{comment.content}</td>
                <td>{comment.tourId?.title || "N/A"}</td>
                <td>{new Date(comment.createdAt).toLocaleString("vi-VN")}</td>
                <td>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => handleDelete(comment._id)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                Không có bình luận nào
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default ManageComments;
