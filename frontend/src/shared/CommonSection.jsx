import React, { useState, useEffect } from "react";
import "./common-section.css";
import { Container, Row, Col } from "reactstrap";

const CommonSection = ({ title, className }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (title === "Home" && className?.includes("slideshow")) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % 3);
      }, 4000); // 4 seconds per image
      return () => clearInterval(interval);
    }
  }, [title, className]);

  const handleDotClick = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <section
      className={`common__section ${
        className || ""
      } image-${currentImageIndex}`}
      data-title={title}
      aria-label="Slideshow of travel destinations"
    >
      <Container>
        <Row>
          <Col lg="12">
            <h1>{title}</h1>
            {title === "Home" && className?.includes("slideshow") && (
              <div className="slideshow-dots">
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className={`slideshow-dot ${
                      index === currentImageIndex ? "active" : ""
                    }`}
                    onClick={() => handleDotClick(index)}
                    aria-label={`Select slideshow image ${index + 1}`}
                  ></span>
                ))}
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CommonSection;
