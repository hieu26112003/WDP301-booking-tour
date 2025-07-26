"use client"

import { useEffect, useState } from "react"
import { Container, Row, Col, Input, InputGroup, InputGroupText } from "reactstrap"
import { useParams } from "react-router-dom"
import axios from "axios"
import TourCard from "../../shared/TourCard"
import { BASE_URL } from "../../utils/config"
import { FaSearch, FaTimes } from "react-icons/fa"
import "./ListTour.css"

const ListTour = () => {
  const [originalTours, setOriginalTours] = useState([])
  const [tours, setTours] = useState([])
  const [sortOrder, setSortOrder] = useState("") // asc | desc
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
          setTours(tourData)
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

  // Filter and sort tours
  useEffect(() => {
    let filtered = [...originalTours]

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter((tour) => tour.title?.toLowerCase().includes(searchTerm.toLowerCase().trim()))
    }

    // Sort by price
    if (sortOrder === "asc") {
      filtered.sort((a, b) => a.priceAdult - b.priceAdult)
    } else if (sortOrder === "desc") {
      filtered.sort((a, b) => b.priceAdult - a.priceAdult)
    }

    setTours(filtered)
  }, [sortOrder, originalTours, searchTerm])

  const clearSearch = () => {
    setSearchTerm("")
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

          {/* Sort Box */}
          <div className="sort-box">
            <label htmlFor="sort" className="sort-label">
              Sắp xếp theo giá:
            </label>
            <select
              id="sort"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="sort-select-input"
            >
              <option value="">-- Chọn --</option>
              <option value="asc">Giá tăng dần</option>
              <option value="desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        {!loading && (
          <div className="results-info">
            {searchTerm ? (
              <p>
                Tìm thấy <strong>{tours.length}</strong> tour cho từ khóa "{searchTerm}"
              </p>
            ) : (
              <p>
                Hiển thị <strong>{tours.length}</strong> tour
              </p>
            )}
          </div>
        )}

        {loading && <div className="listtour-loading">Đang tải...</div>}
        {error && <div className="listtour-error">{error}</div>}
        {!loading && tours.length === 0 && !searchTerm && <div className="listtour-empty">Chưa có tour nào.</div>}
        {!loading && tours.length === 0 && searchTerm && (
          <div className="listtour-empty">
            Không tìm thấy tour nào với từ khóa "{searchTerm}".
            <button onClick={clearSearch} className="clear-search-btn">
              Xóa tìm kiếm
            </button>
          </div>
        )}

        <Row>
          {tours.map((tour) => (
            <Col lg="4" md="6" sm="6" className="mb-4" key={tour._id}>
              <TourCard tour={tour} />
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  )
}

export default ListTour
