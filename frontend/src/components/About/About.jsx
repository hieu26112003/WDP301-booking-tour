import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const AboutUs = () => {
    return (
        <Container className="py-5">
            <Row className="mb-4">
                <Col>
                    <h2 className="text-primary mb-3">Về chúng tôi</h2>
                    <p>
                        <strong>Touristic</strong> là công ty du lịch chuyên nghiệp với nhiều năm kinh nghiệm trong lĩnh vực du lịch trải nghiệm.
                        Chúng tôi cung cấp các gói tour độc đáo, được thiết kế riêng nhằm mang đến cho khách hàng những hành trình khám phá tuyệt vời và đáng nhớ.
                    </p>
                    <p>
                        Với đội ngũ nhân viên tận tâm và giàu kinh nghiệm, <strong>Touristic</strong> cam kết mang đến dịch vụ chất lượng cao với mức giá hợp lý,
                        luôn đặt sự hài lòng và an toàn của khách hàng lên hàng đầu.
                        Chúng tôi đồng hành cùng bạn trên mỗi hành trình, đảm bảo trải nghiệm trọn vẹn, suôn sẻ và đầy cảm xúc.
                    </p>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <h2 className="text-primary mb-3">Sứ mệnh</h2>
                    <p>
                        Chúng tôi không ngừng nỗ lực để tạo ra những chương trình du lịch sáng tạo, mang đậm dấu ấn cá nhân.
                        Sứ mệnh của <strong>Touristic</strong> là mang đến cho khách hàng không chỉ những chuyến đi đến các điểm đến nổi tiếng,
                        mà còn là cơ hội khám phá những điều mới mẻ, văn hóa đặc sắc và những khoảnh khắc đáng nhớ.
                    </p>
                    <p>
                        Thông qua mỗi chuyến đi, <strong>Touristic</strong> mong muốn khơi dậy cảm hứng, niềm vui và lưu giữ những ký ức đẹp trong lòng khách hàng.
                    </p>
                </Col>
            </Row>

            <Row>
                <Col>
                    <h2 className="text-primary mb-3">Giá trị cốt lõi</h2>
                    <p>
                        <strong>Touristic</strong> xây dựng thương hiệu dựa trên 3 giá trị cốt lõi – <strong>3T: Tôn trọng, Trách nhiệm, Tâm huyết</strong>.
                    </p>
                    <ul>
                        <li><strong>Tôn trọng:</strong> Luôn lắng nghe, thấu hiểu và đặt khách hàng làm trung tâm trong mọi quyết định và dịch vụ.</li>
                        <li><strong>Trách nhiệm:</strong> Cam kết hành động có trách nhiệm với khách hàng, đối tác, cộng đồng và môi trường – hướng tới phát triển du lịch bền vững.</li>
                        <li><strong>Tâm huyết:</strong> Mỗi chương trình tour đều được xây dựng bằng sự đam mê và tận tâm, nhằm mang lại những trải nghiệm tốt nhất cho khách hàng.</li>
                    </ul>
                </Col>
            </Row>
        </Container>
    );
};

export default AboutUs;
