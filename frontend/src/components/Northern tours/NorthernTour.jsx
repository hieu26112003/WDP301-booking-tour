import React from "react";
import TourCard from "../../shared/TourCard";
// import tourData from '../../assets/data/tours'
import { Col } from "reactstrap";
import useFetch from "../../hooks/useFetch";
import { BASE_URL } from "../../utils/config";

const NorthenrnTourList = () => {
  const {
    data: NorthenTours,
    loading,
    error,
  } = useFetch(`${BASE_URL}/tours/north`);
  

  return (
    <>
      {loading && <h4>Loading.....</h4>}
      {error && <h4>{error}</h4>}
      {!loading &&
        !error &&
        NorthenTours?.map((tour) => (
          <Col lg="4" md="6" sm="12" className="mb-4" key={tour._id}>
            <TourCard tour={tour} />
          </Col>
        ))}
    </>
  );
};

export default NorthenrnTourList;
