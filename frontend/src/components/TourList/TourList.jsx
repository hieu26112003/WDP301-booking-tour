// TourList.js
import React from "react";
import { Container, Row, Col } from "reactstrap";
import TourCard from "../../shared/TourCard";
import useFetch from "../../hooks/useFetch";
import { BASE_URL } from "../../utils/config";


const TourList = ({ selectedCategory, searchQuery }) => {
  const {
    data: categoriesResponse,
    loading: categoriesLoading,
    error: categoriesError,
  } = useFetch(`${BASE_URL}/categories`);

  const categories = categoriesResponse?.success
    ? categoriesResponse.data
    : Array.isArray(categoriesResponse)
    ? categoriesResponse
    : null;

  return (
    <>
      {categoriesLoading && (
        <Container>
          <Row>
            <Col lg="12" className="text-center">
              <h4>Đang tải danh mục...</h4>
            </Col>
          </Row>
        </Container>
      )}
      {categoriesError && (
        <Container>
          <Row>
            <Col lg="12" className="text-center">
              <h4>Lỗi: {categoriesError}</h4>
            </Col>
          </Row>
        </Container>
      )}
      {!categoriesLoading && !categoriesError && selectedCategory && (
        <section>
          <Container>
            <Row>
              <Col lg="12" className="text-center mb-4">
                <h2
                  className="section__title text-uppercase"
                  style={{ color: "#ff8000" }}
                >
                  {selectedCategory.name}
                </h2>
              </Col>
              <CategoryTourList
                categoryId={selectedCategory.id}
                categoryName={selectedCategory.name}
                searchQuery={searchQuery}
              />
            </Row>
          </Container>
        </section>
      )}
      {!categoriesLoading &&
        !categoriesError &&
        !selectedCategory &&
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
                  searchQuery={searchQuery}
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
                <h4>Không có danh mục nào</h4>
              </Col>
            </Row>
          </Container>
        )}
    </>
  );
};

const CategoryTourList = ({ categoryId, categoryName, searchQuery }) => {
  const [page, setPage] = React.useState(1);
  const queryString = `page=${page}&limit=6${
    searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
  }`;
  const {
    data: tourResponse,
    loading: toursLoading,
    error: toursError,
  } = useFetch(`${BASE_URL}/tours/category/${categoryId}?${queryString}`);

  const tours = tourResponse?.success
    ? tourResponse.data
    : Array.isArray(tourResponse)
    ? tourResponse
    : null;
  const pagination = tourResponse?.pagination;

  React.useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  return (
    <>
      {toursLoading && (
        <Col lg="12" className="text-center">
          <h4>Đang tải tour cho {categoryName}...</h4>
        </Col>
      )}
      {toursError && (
        <Col lg="12" className="text-center">
          <h4>Lỗi: {toursError}</h4>
        </Col>
      )}
      {!toursLoading && !toursError && (!tours || tours.length === 0) && (
        <Col lg="12" className="text-center">
          <h4>
            {tourResponse?.message ||
              `Không có tour nào cho ${categoryName}${
                searchQuery ? ` với từ khóa "${searchQuery}"` : ""
              }`}
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
