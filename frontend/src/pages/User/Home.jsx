import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Carousel } from "react-bootstrap";
import "../../styles/home.css";
import Subtitle from "./../../shared/subtitle";
import CommonSection from "../../shared/CommonSection";
import ChatWidget from "../../components/Chat/ChatWidget";
import NorthenrnTourList from "../../components/Northern tours/NorthernTour";
import SouthTourList from "../../components/South tour/SouthTour";
import ComboTourList from "../../components/Combo Tour/ComboTours";

// 🖼️ Ảnh slide
const sliderImages = [
  "/home_images/banner1.jpg",
  "/home_images/banner2.jpg",
  "/home_images/banner3.jpg"
];

const Home = () => {
  return (
    <>
      {/* 🖼️ Slider trước CommonSection */}
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
        {/* Tiêu đề nằm trên slide */}
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

      {/* Nội dung trang */}
      <section>
        <Container>
          <Row></Row>
        </Container>
      </section>
      <section>
        <Container>
          <Row>
            <Col lg="12" className="text-center mb-4">
              <h2 className="section__title text-uppercase" style={{ color: "#ff8000" }}>
                TOUR MIỀN BẮC
              </h2>
            </Col>
            <NorthenrnTourList />
          </Row>
        </Container>

        <section className="mt-5 py-5" style={{ backgroundColor: "#e0e0e0" }}>
          <Container>
            <Row>
              <Col lg="12" className="text-center mb-4">
                <h2 className="section__title text-uppercase" style={{ color: "#ff8000" }}>
                  TOUR MIỀN NAM
                </h2>
              </Col>
              <SouthTourList />
            </Row>
          </Container>
        </section>

        <Container className="mt-5 py-5">
          <Row>
            <Col lg="12" className="text-center mb-4">
              <h2 className="section__title text-uppercase" style={{ color: "#ff8000" }}>
                COMBO TOUR
              </h2>
            </Col>
            <ComboTourList />
          </Row>
        </Container>
      </section>
      <ChatWidget />
    </>
  );
};

export default Home;
