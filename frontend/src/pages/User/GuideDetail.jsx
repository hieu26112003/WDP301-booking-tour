import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./GuideDetail.css"; // Import file CSS riêng

const GuideDetail = () => {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/guides/${id}`);
        if (res.data.success) {
          setGuide(res.data.data);
        } else {
          setError("Không tìm thấy cẩm nang.");
        }
      } catch (err) {
        setError("Lỗi khi tải dữ liệu cẩm nang.");
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [id]);

  if (loading) return <p className="loading-text">Đang tải...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="guide-detail-container">
      <div
        className="guide-detail-content"
        dangerouslySetInnerHTML={{ __html: guide.content }}
      />
    </div>
  );
};

export default GuideDetail;
