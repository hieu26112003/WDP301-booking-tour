import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import { Link, useParams } from "react-router-dom"; // <-- thêm useParams
import { BASE_URL } from "../../utils/config";
import "../../styles/CamNang.css"; // CSS giữ nguyên

const CamNang = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState("");

  const { slug } = useParams(); // lấy slug từ URL (/cam-nang/:slug)

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        let url = `${BASE_URL}/guides`;
        if (slug) {
          // Nếu có slug -> truyền query param để filter
          url += `?category=${encodeURIComponent(slug)}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          setGuides(data.data || []);
        } else {
          console.error("Fetch guides fail:", data.message);
        }
      } catch (err) {
        console.error("Lỗi tải cẩm nang:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, [slug]); // reload khi slug thay đổi

  useEffect(() => {
    const fetchCategoryTitle = async () => {
      if (!slug) return;
      try {
        const res = await fetch(`${BASE_URL}/category-guides/categoriesguide/${slug}`);
        const data = await res.json();
        if (data.success) {
          setCategoryTitle(data.data.name); // name là tên tiếng Việt như "Ẩm thực"
        }
      } catch (err) {
        console.error("Lỗi khi tải category:", err);
      }
    };

    fetchCategoryTitle();
  }, [slug]);

  return (
    <div className="camnang-page">
      <Container>
        <h2 className="camnang-heading">
          <h2 className="camnang-heading">
            {slug ? `Cẩm nang: ${categoryTitle}` : "Cẩm nang du lịch"}
          </h2>
        </h2>

        {loading && <div className="camnang-loading">Đang tải...</div>}

        {!loading && guides.length === 0 && (
          <div className="camnang-empty">Chưa có bài viết.</div>
        )}

        <ul className="camnang-list">
          {guides.map((guide) => (
            <li key={guide._id} className="camnang-item">
              <Link to={`/cam-nang/guide/${guide._id}`} className="camnang-card">
                <div className="camnang-card-imgwrap">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="camnang-card-img"
                  />
                </div>
                <div className="camnang-card-body">
                  <h3 className="camnang-card-title">{guide.title}</h3>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
};

export default CamNang;
