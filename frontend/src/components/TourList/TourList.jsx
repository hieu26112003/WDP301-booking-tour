import React, { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import TourCard from "../../shared/TourCard";
import useFetch from "../../hooks/useFetch";
import { BASE_URL } from "../../utils/config";

const TourList = () => {
  const {
    data: categoriesResponse,
    loading: categoriesLoading,
    error: categoriesError,
  } = useFetch(`${BASE_URL}/categories`);

  // Handle both response formats: { success: true, data: [...] } or direct array
  const categories = categoriesResponse?.success
    ? categoriesResponse.data
    : Array.isArray(categoriesResponse)
    ? categoriesResponse
    : null;

  console.log("Categories Response:", categoriesResponse);
  console.log("Categories:", categories);

  return (
    <>
      {categoriesLoading && (
        <Container>
          <Row>
            <Col lg="12" className="text-center">
              <h4>Loading categories...</h4>
            </Col>
          </Row>
        </Container>
      )}
      {categoriesError && (
        <Container>
          <Row>
            <Col lg="12" className="text-center">
              <h4>Error: {categoriesError}</h4>
            </Col>
          </Row>
        </Container>
      )}
      {!categoriesLoading &&
        !categoriesError &&
        categories?.length > 0 &&
        categories.map((category, index) => (
          <section
            key={category._id}
            className={index % 2 === 1 ? "mt-5 py-5" : ""}
            style={index % 2 === 1 ? { backgroundColor: "#e0e0e0" } : {}}
          >
            <Container>
              <Row>
                <Col lg="12" className="text-center mb-4">
                  <h2
                    className="section__title text-uppercase"
                    style={{ color: "#ff8000" }}
                  >
                    {category.name}
                  </h2>
                </Col>
                <CategoryTourList
                  categoryId={category._id}
                  categoryName={category.name}
                />
              </Row>
            </Container>
          </section>
        ))}
      {!categoriesLoading &&
        !categoriesError &&
        (!categories || categories.length === 0) && (
          <Container>
            <Row>
              <Col lg="12" className="text-center">
                <h4>No categories available</h4>
              </Col>
            </Row>
          </Container>
        )}
    </>
  );
};

const CategoryTourList = ({ categoryId, categoryName }) => {
  const [page, setPage] = useState(1);
  const {
    data: tourResponse,
    loading: toursLoading,
    error: toursError,
  } = useFetch(`${BASE_URL}/tours/category/${categoryId}?page=${page}&limit=6`);

  // Handle both response formats
  const tours = tourResponse?.success
    ? tourResponse.data
    : Array.isArray(tourResponse)
    ? tourResponse
    : null;
  const pagination = tourResponse?.pagination;

  console.log(`Tour Response for ${categoryName}:`, tourResponse);
  console.log(`Tours for ${categoryName}:`, tours);

  return (
    <>
      {toursLoading && (
        <Col lg="12" className="text-center">
          <h4>Loading tours for {categoryName}...</h4>
        </Col>
      )}
      {toursError && (
        <Col lg="12" className="text-center">
          <h4>Error: {toursError}</h4>
        </Col>
      )}
      {!toursLoading && !toursError && (!tours || tours.length === 0) && (
        <Col lg="12" className="text-center">
          <h4>
            {tourResponse?.message || `No tours available for ${categoryName}`}
          </h4>
        </Col>
      )}
      {!toursLoading && !toursError && tours?.length > 0 && (
        <>
          <Row>
            {tours.map((tour) => (
              <Col lg="4" md="6" sm="12" className="mb-4" key={tour._id}>
                <TourCard tour={tour} />
              </Col>
            ))}
          </Row>
          {pagination && pagination.pages > 1 && (
            <div className="text-center mt-4">
              <button
                className="btn btn-secondary mr-2"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-secondary ml-2"
                disabled={page === pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default TourList;
