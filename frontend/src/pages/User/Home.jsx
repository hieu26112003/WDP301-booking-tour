import React, { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { Carousel } from "react-bootstrap";
import "../../styles/home.css";
import Header from "../../components/Header/Header";
import TourList from "../../components/TourList/TourList";
import ChatWidget from "../../components/Chat/ChatWidget";

const sliderImages = [
  "/home_images/banner1.jpg",
  "/home_images/banner2.jpg",
  "/home_images/banner3.jpg",
];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (categoryId, categoryName) => {
    setSelectedCategory(
      categoryId ? { id: categoryId, name: categoryName } : null
    );
  };

  return (
    <>
      <Header onCategorySelect={handleCategorySelect} />
      <div style={{ position: "relative" }}>
        <Carousel interval={3000}>
          {sliderImages.map((src, idx) => (
            <Carousel.Item key={idx}>
              <img
                className="d-block w-100"
                src={src}
                alt={`Slide ${idx + 1}`}
                style={{ height: "600px", objectFit: "cover" }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
        <h2
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "3rem",
            fontWeight: "bold",
            textShadow: "2px 2px 8px rgba(0,0,0,0.7)",
          }}
        >
          HOME
        </h2>
      </div>

      <section>
        <Container>
          <Row>
            <TourList selectedCategory={selectedCategory} />
          </Row>
        </Container>
      </section>

      <ChatWidget />
    </>
  );
};

export default Home;
