import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import TourCard from "../../shared/TourCard";
import { BASE_URL } from "../../utils/config";
import "./ListTour.css";

const ListTour = () => {
  const [originalTours, setOriginalTours] = useState([]);
  const [tours, setTours] = useState([]);
  const [sortOrder, setSortOrder] = useState(""); // asc | desc
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { slug } = useParams(); // /tours/:slug

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        let url = `${BASE_URL}/tours`;
        if (slug) {
          url = `${BASE_URL}/tours/filter/${encodeURIComponent(slug)}`;
        }

        const res = await axios.get(url);
        if (res.data?.success) {
          const tourData = res.data.data || [];
          setOriginalTours(tourData);
          setTours(tourData);
        } else {
          setError("Không lấy được danh sách tour");
        }
      } catch (err) {
        setError("Lỗi tải tour: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [slug]);

  useEffect(() => {
    let sorted = [...originalTours];
    if (sortOrder === "asc") {
      sorted.sort((a, b) => a.priceAdult - b.priceAdult);
    } else if (sortOrder === "desc") {
      sorted.sort((a, b) => b.priceAdult - a.priceAdult);
    }
    setTours(sorted);
  }, [sortOrder, originalTours]);

  return (
    <div className="listtour-page">
      <Container>
        <h2 className="listtour-heading">Danh sách Tour</h2>

        <div className="sort-select mb-4">
          <label htmlFor="sort">Sắp xếp theo giá:</label>
          <select
            id="sort"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ marginLeft: "10px", padding: "4px" }}
          >
            <option value="">-- Chọn --</option>
            <option value="asc">Giá tăng dần</option>
            <option value="desc">Giá giảm dần</option>
          </select>
        </div>

        {loading && <div className="listtour-loading">Đang tải...</div>}
        {error && <div className="listtour-error">{error}</div>}

        {!loading && tours.length === 0 && (
          <div className="listtour-empty">Chưa có tour nào.</div>
        )}

        <Row>
          {tours.map((tour) => (
            <Col lg="4" md="6" sm="6" className="mb-4" key={tour._id}>
              <TourCard tour={tour} />
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default ListTour;
