import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import TourCard from "../../shared/TourCard"; // import TourCard
import { BASE_URL } from "../../utils/config";
import "./ListTour.css";

const ListTour = () => {
  const [tours, setTours] = useState([]);
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
          setTours(res.data.data || []);
        } else {
          setError("Không lấy được danh sách tour");
        }
      } catch (err) {
        setError(
          "Lỗi tải tour: " + (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [slug]);

  return (
    <div className="listtour-page">
      <Container>
        <h2 className="listtour-heading">
          {slug ? `Tour: ${slug.replace("-", " ")}` : "Danh sách Tour"}
        </h2>

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
