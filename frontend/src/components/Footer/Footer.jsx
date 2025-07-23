import React from "react";
import { Container, Row, Col } from "reactstrap";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer-custom text-white text-center">
      <Container>
        <section className="pt-1">
          <Row className="gx-2 gy-2 justify-content-center">
            <Col xs="12" sm="4">
              <h6 className="text-uppercase fw-bold">About</h6>
              <p className="mb-1">Explore Vietnam with our trusted tour service.</p>
            </Col>
            <Col xs="12" sm="4">
              <h6 className="text-uppercase fw-bold">Contact</h6>
              <p className="mb-1">📍 123 Thach Hoa, Hoa Lac, Hanoi, Vietnam</p>
              <p className="mb-1">📞 +84 984272586</p>
              <p className="mb-1">📧 info@travelnest.vn</p>
            </Col>
            <Col xs="12" sm="4">
              <h6 className="text-uppercase fw-bold">Follow Us</h6>
              <a href="" className="me-2"><i className="fab fa-facebook-f"></i></a>
              <a href="" className="me-2"><i className="fab fa-twitter"></i></a>
              <a href="" className="me-2"><i className="fab fa-instagram"></i></a>
              <a href=""><i className="fab fa-linkedin-in"></i></a>
            </Col>
          </Row>
        </section>
      </Container>
    </footer>
  );
};

export default Footer;
