import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Collapse } from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";
import parse from "html-react-parser";
import { BASE_URL } from "../../../utils/config";
import Swal from "sweetalert2";
import "../../../styles/tourDetail.css";

const TourDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [tour, setTour] = useState(state?.tour || null);
  const [activeSection, setActiveSection] = useState(null); // Trạng thái để toggle nội dung

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  useEffect(() => {
    if (!tour) {
      const fetchTour = async () => {
        try {
          const accessToken = localStorage.getItem("accessToken");
          const tourId = window.location.pathname.split("/")[2];
          const res = await fetch(`${BASE_URL}/tours/${tourId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);
          setTour(result.data);
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load tour details",
            confirmButtonColor: "#d33",
          });
        }
      };
      fetchTour();
    }
  }, [tour]);

  if (!tour) return <div>Loading...</div>;

  const sections = [
    { key: "summary", label: "Summary", content: tour.summary },
    {
      key: "allDetails",
      label: "All Details",
      content: (
        <ul>
          <li>
            <strong>Days:</strong> {tour.days}
          </li>
          <li>
            <strong>Service Standards:</strong> {tour.serviceStandards}
          </li>
          <li>
            <strong>Price (Adult):</strong> ${tour.priceAdult}
          </li>
          <li>
            <strong>Price (Child):</strong> ${tour.priceChild}
          </li>
          <li>
            <strong>Departure Date:</strong> {tour.departureDate}
          </li>
          <li>
            <strong>Time:</strong> {tour.time}
          </li>
          <li>
            <strong>Category:</strong> {tour.categoryId?.name || "N/A"}
          </li>
          <li>
            <strong>Featured:</strong> {tour.featured ? "Yes" : "No"}
          </li>
        </ul>
      ),
    },
    { key: "schedule", label: "Schedule", content: tour.schedule },
    { key: "notes", label: "Notes", content: parse(tour.notes) },
    {
      key: "cancellationPolicy",
      label: "Cancellation Policy",
      content: parse(tour.cancellationPolicy),
    },
  ];

  return (
    <section className="tour-detail-section">
      <Container>
        <Row>
          <Col lg="12" className="mb-4">
            <div className="header-section d-flex justify-content-between align-items-center">
              <h1 className="tour-title">{tour.title}</h1>
              <Button color="secondary" onClick={() => navigate(-1)}>
                Back
              </Button>
            </div>
            {tour.image && (
              <div className="tour-image-container">
                <img src={tour.image} alt={tour.title} className="tour-image" />
                <div className="image-overlay"></div>
              </div>
            )}
          </Col>
          <Col lg="12">
            <div className="tour-details">
              <div className="section-panel">
                {sections.map((section, index) => (
                  <div
                    key={section.key}
                    className={`section-item ${
                      index < 3 ? "top-row" : "bottom-row"
                    }`}
                  >
                    <h4
                      className="section-title"
                      onClick={() => toggleSection(section.key)}
                    >
                      {section.label}
                    </h4>
                  </div>
                ))}
              </div>
              <div className="detail-content">
                {sections.map((section) => (
                  <Collapse
                    isOpen={activeSection === section.key}
                    key={section.key}
                  >
                    <div className="content">{section.content}</div>
                  </Collapse>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default TourDetail;
