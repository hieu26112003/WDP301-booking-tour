import React from "react";
import "../../styles/home.css";
import { Container, Row, Col, CardSubtitle } from "reactstrap";

import Subtitle from "./../../shared/subtitle";
import SearchBar from "./../../shared/SearchBar";
import ServiceList from "../../services/ServiceList";
import FeaturedTourList from "../../components/Featured-tours/FeaturedTourList";
import CommonSection from "../../shared/CommonSection";

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
            <Col lg="12" className="mb-5">
              <Subtitle subtitle={"Explore"} />
              <h2 className="featured__tour-title">Our featured tours</h2>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;
