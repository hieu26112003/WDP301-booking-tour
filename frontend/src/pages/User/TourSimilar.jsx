import React from 'react';
import Slider from 'react-slick';
import TourCard from './../../shared/TourCard';
import '../../styles/tour-similar.css';
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
const PrevArrow = ({ onClick, currentSlide }) => (
  <div
    className={`custom-arrow prev-arrow ${currentSlide === 0 ? "disabled" : ""}`}
    onClick={currentSlide === 0 ? null : onClick}
  >
    <FaChevronLeft size={24} />
  </div>
)

const NextArrow = ({ onClick, currentSlide, slideCount, slidesToShow = 3 }) => (
  <div
    className={`custom-arrow next-arrow ${currentSlide >= slideCount - slidesToShow ? "disabled" : ""}`}
    onClick={currentSlide >= slideCount - slidesToShow ? null : onClick}
  >
    <FaChevronRight size={24} />
  </div>
)

const TourSimilar = ({ tours }) => {
  const settings = {
    dots: false,
    infinite: false, // để có thể xác định đầu/cuối
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow slidesToShow={3} />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 4 },
      },
      {
        breakpoint: 992,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
      {
        breakpoint: 576,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className="similar-tours-section">
      <div className="section-divider">
        <h2 className="similar-tours-title">SẢN PHẨM TƯƠNG TỰ</h2>
      </div>
      <Slider {...settings}>
        {tours.map((tour) => (
          <div key={tour._id} className="tour-slide">
            <TourCard tour={tour} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TourSimilar;
