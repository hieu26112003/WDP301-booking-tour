import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
// import "../User/Guide.css";

const Guide = () => {
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/guides");
        setGuides(res.data);
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
            <img src={guide.image} alt={guide.title} className="guide-image" />
            <div className="guide-content">
              <h3>{guide.title}</h3>
              <p>{guide.category}</p>
              <Link to={`/guides/${guide.slug}`} className="read-more">
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
