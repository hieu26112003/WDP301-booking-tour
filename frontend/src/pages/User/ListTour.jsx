"use client"

import { useEffect, useState } from "react"
import { Container, Row, Col, Input, InputGroup, InputGroupText } from "reactstrap"
import { useParams } from "react-router-dom"
import axios from "axios"
import TourCard from "../../shared/TourCard"
import { BASE_URL } from "../../utils/config"
import { FaSearch, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import "./ListTour.css"

const TOURS_PER_PAGE = 6

const ListTour = () => {
  const [originalTours, setOriginalTours] = useState([])
  const [filteredTours, setFilteredTours] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [priceRange, setPriceRange] = useState(10000000) // Default max price 10 million VND
  const [maxPrice, setMaxPrice] = useState(10000000) // Track the maximum price from tours
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { slug } = useParams() // /tours/:slug

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true)
      try {
        let url = `${BASE_URL}/tours`
        if (slug) {
          url = `${BASE_URL}/tours/filter/${encodeURIComponent(slug)}`
        }
        const res = await axios.get(url)
        if (res.data?.success) {
          const tourData = res.data.data || []
          setOriginalTours(tourData)
          setFilteredTours(tourData)

          // Calculate max price from tours
          if (tourData.length > 0) {
            const maxTourPrice = Math.max(...tourData.map((tour) => tour.priceAdult || 0))
            const adjustedMaxPrice = maxTourPrice + 500000 // Add 500,000 VND
            setMaxPrice(adjustedMaxPrice)
            setPriceRange(adjustedMaxPrice) // Set initial range to max
          }
        } else {
          setError("Không lấy được danh sách tour")
        }
      } catch (err) {
        setError("Lỗi tải tour: " + (err.response?.data?.message || err.message))
      } finally {
        setLoading(false)
      }
    }
    fetchTours()
  }, [slug])

  // Filter tours by search term and price range
  useEffect(() => {
    let filtered = [...originalTours]

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter((tour) => tour.title?.toLowerCase().includes(searchTerm.toLowerCase().trim()))
    }

    // Filter by price range
    filtered = filtered.filter((tour) => (tour.priceAdult || 0) <= priceRange)

    setFilteredTours(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [priceRange, originalTours, searchTerm])

  const clearSearch = () => {
    setSearchTerm("")
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredTours.length / TOURS_PER_PAGE)
  const startIndex = (currentPage - 1) * TOURS_PER_PAGE
  const endIndex = startIndex + TOURS_PER_PAGE
  const currentTours = filteredTours.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="listtour-page">
      <Container>
        <h2 className="listtour-heading">Danh sách Tour</h2>

        {/* Search and Sort Section */}
        <div className="filter-section mb-4">
          {/* Search Box */}
          <div className="search-box">
            <label htmlFor="search" className="search-label">
              Tìm kiếm tour:
            </label>
            <InputGroup className="search-input-group">
              <InputGroupText className="search-icon">
                <FaSearch />
              </InputGroupText>
              <Input
                id="search"
                type="text"
                placeholder="Nhập tên tour để tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <InputGroupText className="clear-search" onClick={clearSearch}>
                  <FaTimes />
                </InputGroupText>
              )}
            </InputGroup>
          </div>

          {/* Price Range Box */}
          <div className="price-range-box">
            <label htmlFor="priceRange" className="price-range-label">
              Lọc theo giá tối đa: <span className="price-value">{priceRange.toLocaleString("vi-VN")} VNĐ</span>
            </label>
            <div className="price-slider-container">
              <input
                id="priceRange"
                type="range"
                min="0"
                max={maxPrice}
                step="100000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number.parseInt(e.target.value))}
                className="price-range-slider"
                style={{
                  "--progress": maxPrice > 0 ? (priceRange / maxPrice) * 100 : 0,
                }}
              />
              <div className="price-range-labels">
                <span>0 VNĐ</span>
                <span>{maxPrice.toLocaleString("vi-VN")} VNĐ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info - Only show when searching */}
        {!loading && searchTerm && (
          <div className="results-info">
            <p>
              Tìm thấy <strong>{filteredTours.length}</strong> tour cho từ khóa "{searchTerm}"
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && <div className="listtour-loading">Đang tải...</div>}

        {/* Error */}
        {error && <div className="listtour-error">{error}</div>}

        {/* Empty States */}
        {!loading && filteredTours.length === 0 && !searchTerm && (
          <div className="listtour-empty">Chưa có tour nào.</div>
        )}

        {!loading && filteredTours.length === 0 && searchTerm && (
          <div className="listtour-empty">
            Không tìm thấy tour nào với từ khóa "{searchTerm}".
            <button onClick={clearSearch} className="clear-search-btn">
              Xóa tìm kiếm
            </button>
          </div>
        )}

        {/* Tours Grid */}
        {!loading && currentTours.length > 0 && (
          <>
            <Row>
              {currentTours.map((tour) => (
                <Col lg="4" md="6" sm="6" className="mb-4" key={tour._id}>
                  <TourCard tour={tour} />
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-wrapper">
                  {/* Previous Button */}
                  <button
                    className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <FaChevronLeft />
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      className={`pagination-btn ${page === currentPage ? "active" : ""} ${page === "..." ? "dots" : ""}`}
                      onClick={() => page !== "..." && handlePageChange(page)}
                      disabled={page === "..."}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    className={`pagination-btn ${currentPage === totalPages ? "disabled" : ""}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <FaChevronRight />
                  </button>
                </div>

                {/* Page Info */}
                <div className="page-info">
                  Trang {currentPage} / {totalPages}
                  {!searchTerm && (
                    <span>
                      {" "}
                      - Hiển thị {currentTours.length} / {filteredTours.length} tour
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  )
}

export default ListTour
