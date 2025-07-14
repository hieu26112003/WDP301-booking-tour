import React from "react";
import TourCard from "../../shared/TourCard";
// import tourData from '../../assets/data/tours'
import { Col } from "reactstrap";
import useFetch from "../../hooks/useFetch";
import { BASE_URL } from "../../utils/config";

const SouthTourList = () => {
    const {
        data: SouthTours,
        loading,
        error,
    } = useFetch(`${BASE_URL}/tours/south`);
   // console.log(SouthTours)

    return (
        <>
            {loading && <h4>Loading.....</h4>}
            {error && <h4>{error}</h4>}
            {!loading &&
                !error &&
                SouthTours?.map((tour) => (
                    <Col lg="4" md="6" sm="12" className="mb-4" key={tour._id}>
                        <TourCard tour={tour} />
                    </Col>
                ))}
        </>
    );
};

export default SouthTourList;
