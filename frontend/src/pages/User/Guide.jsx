import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Guide = () => {
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/guides");
        if (res.data.success) {
          setGuides(res.data.data);
        } else {
          console.error("API không trả về success");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchGuides();
  }, []);

  return (
    <div className="guide-page">
      <h1 className="guide-title">Cẩm nang du lịch</h1>
      <div className="guide-list">
        {guides.map((guide) => (
          <div className="guide-card" key={guide._id}>
            <Link to={`/cam-nang/guide/${guide._id}`}>
              <img
                src={guide.image}
                alt={guide.title}
                className="guide-image"
              />
            </Link>
            <div className="guide-content">
              <h3>{guide.title}</h3>
              <p>{guide.category?.name || "Chưa phân loại"}</p>
              <Link to={`/cam-nang/guide/${guide._id}`} className="read-more">
                Đọc tiếp
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Guide;
