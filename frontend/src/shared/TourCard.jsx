import { Card, CardBody } from "reactstrap"
import { Link } from "react-router-dom"
import "./tour-card.css"

const TourCard = ({ tour }) => {
  // Destructure các trường cần thiết từ dữ liệu mới
  const {
    _id,
    title,
    images = [],
    schedule,
    priceAdult = 0,
    days,
    time,
  } = tour

  // Hàm định dạng giá tiền VND
  const formatPrice = (num) => {
    return typeof num === "number"
      ? num.toLocaleString("vi-VN")
      : Number(num || 0).toLocaleString("vi-VN")
  }
    const firstImage = images.length > 0 ? images[0] : "/placeholder.jpg"
  return (
    <div className="tour__card">
      <Card>
        <div className="tour__img">
           <img src={firstImage} alt={title} />
        </div>

        <CardBody>
          <h5 className="tour__title">
            <Link to={`/tours/${_id}`}>{title}</Link>
          </h5>

          <div className="card__details mt-2">
            <span className="tour__duration d-flex align-items-center">
              <i className="ri-time-line"></i> {time || `${days} ngày`}
            </span>

            <span className="tour__location d-flex align-items-center mt-1">
              <i className="ri-map-pin-line"></i> {schedule}
            </span>
          </div>

          <div className="card__bottom d-flex align-items-center justify-content-between mt-3">
            <h5 className="tour__price">
              {formatPrice(priceAdult)} <span>đồng</span>
            </h5>

            <Link to={`/tours/${_id}`}>
              <button className="booking__btn">XEM CHI TIẾT</button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default TourCard
