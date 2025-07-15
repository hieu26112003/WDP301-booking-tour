import React from "react";
import "../../styles/home.css";
import { Container, Row, Col, } from "reactstrap";

import Subtitle from "./../../shared/subtitle";

import CommonSection from "../../shared/CommonSection";
import ChatWidget from "../../components/Chat/ChatWidget";
import NorthenrnTourList from "../../components/Northern tours/NorthernTour";
import SouthTourList from "../../components/South tour/SouthTour";
import ComboTourList from "../../components/Combo Tour/ComboTours";

const Home = () => {
  return (
    <>
      <CommonSection title={"Home"} />
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
            <ComboTourList/>
          </Row>
        </Container>
      </section>
      <ChatWidget />
    </>
  );
};

export default Home;
