import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Contact = () => {
    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} className="text-center">
                    <h2 className="text-primary mb-4">Liên hệ với Touristic</h2>
                    <p className="mb-3">Chúng tôi luôn sẵn sàng hỗ trợ và lắng nghe ý kiến từ bạn. Đừng ngần ngại liên hệ với chúng tôi qua các kênh sau:</p>

                    <div className="mb-3">
                        <h5>📍 Địa chỉ</h5>
                        <p>Thạch Hòa, Hòa Lạc, Hà Nội, Việt Nam</p>
                    </div>

                    <div className="mb-3">
                        <h5>📞 Điện thoại</h5>
                        <p>0909 999 999</p>
                    </div>

                    <div className="mb-3">
                        <h5>✉️ Email</h5>
                        <p>touristic@gmail.com</p>
                    </div>

                    <div className="mb-3">
                        <h5>🌐 Website</h5>
                        <p>www.touristic.vn</p>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Contact;
