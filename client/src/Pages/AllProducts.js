import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_CONFIG } from "../config/api";
import "../Css/Style.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const priceOptions = [
  { label: "Giá dưới 500.000đ", value: "under500k", min: 0, max: 500000 },
  { label: "500.000đ - 1 triệu", value: "500k-1m", min: 500000, max: 1000000 },
  { label: "1 - 2 triệu", value: "1m-2m", min: 1000000, max: 2000000 },
  { label: "2 - 3 triệu", value: "2m-3m", min: 2000000, max: 3000000 },
  { label: "Giá trên 3 triệu", value: "above3m", min: 3000000, max: Infinity },
];

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priceFilters, setPriceFilters] = useState({});
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("default");
  const [sortBoxFocus, setSortBoxFocus] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const query = useQuery();
  const categoryParam = query.get("category");
  const brandParam = query.get("brand");

  // Fetch data
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`${API_CONFIG.SERVER_URL}/products`).then((res) => res.json()),
      fetch(`${API_CONFIG.SERVER_URL}/brands`).then((res) => res.json()),
      fetch(`${API_CONFIG.SERVER_URL}/categories`).then((res) => res.json()),
    ])
      .then(([prod, br, cat]) => {
        setProducts(prod);
        setBrands(br);
        setCategories(cat);
        setFilteredProducts(prod);
        setIsLoading(false);
        // console.log("products sample:", prod[0]);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = products;
    // Lọc theo query param nếu có
    if (categoryParam) {
      filtered = filtered.filter(
        (p) => String(p.CategoryId) === String(categoryParam)
      );
    }
    if (brandParam) {
      filtered = filtered.filter(
        (p) => String(p.IdBrand) === String(brandParam)
      );
    }
    // Lọc theo filter sidebar
    if (selectedCategories.length > 0)
      filtered = filtered.filter((p) =>
        selectedCategories.includes(Number(p.CategoryId))
      );
    if (selectedBrands.length > 0)
      filtered = filtered.filter((p) => selectedBrands.includes(p.IdBrand));
    const activePrices = Object.keys(priceFilters).filter(
      (k) => priceFilters[k]
    );
    if (activePrices.length > 0) {
      filtered = filtered.filter((p) =>
        activePrices.some((key) => {
          const opt = priceOptions.find((o) => o.value === key);
          return p.Price >= opt.min && p.Price < opt.max;
        })
      );
    }
    setFilteredProducts(filtered);
  }, [
    selectedBrands,
    selectedCategories,
    priceFilters,
    products,
    categoryParam,
    brandParam,
  ]);

  // Sắp xếp sản phẩm
  useEffect(() => {
    let sorted = [...filteredProducts];
    if (sortOption === "price-asc") {
      sorted.sort((a, b) => a.Price - b.Price);
    } else if (sortOption === "price-desc") {
      sorted.sort((a, b) => b.Price - a.Price);
    } else if (sortOption === "az") {
      sorted.sort((a, b) => a.ProductName.localeCompare(b.ProductName));
    } else if (sortOption === "za") {
      sorted.sort((a, b) => b.ProductName.localeCompare(a.ProductName));
    }
    setFilteredProducts(sorted);
    // eslint-disable-next-line
  }, [sortOption]);

  // Handlers
  const handleBrandChange = (id) =>
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  const handleCategoryChange = (id) =>
    setSelectedCategories((prev) =>
      prev.includes(Number(id))
        ? prev.filter((c) => c !== Number(id))
        : [...prev, Number(id)]
    );
  const handlePriceChange = (key) =>
    setPriceFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  const handleReset = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPriceFilters({});
  };

  // Refs and hover handlers for cart button animation
  const cartRefs = useRef([]);
  const handleCartHover = (idx) => {
    const el = cartRefs.current[idx];
    if (!el) return;
    el.style.transition = "transform 0.18s ease";
    el.style.transform = "translateY(-4px) scale(1.06)";
  };
  const handleCartLeave = (idx) => {
    const el = cartRefs.current[idx];
    if (!el) return;
    el.style.transform = "";
  };

  return (
    <div
      style={{ background: "#f7f7f7", minHeight: "100vh", padding: "32px 0" }}
    >
      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto",
          display: "flex",
          gap: 24,
        }}
      >
        {/* Sidebar bộ lọc */}
        <aside
          style={{
            background: "#eaf4fb",
            borderRadius: 16,
            boxShadow: "0 2px 12px #0001",
            border: "1px solid #b6d4ef",
            padding: 24,
            minWidth: 260,
            maxWidth: 320,
            flex: "0 0 280px",
            height: "fit-content",
          }}
        >
          {/* Nút xem tất cả sản phẩm */}
          <button
            style={{
              width: "100%",
              background: "linear-gradient(20deg, #5f9bd8 0%, #d9dde2 100%)",
              color: "#000000ff",
              border: "none",
              borderRadius: 6,
              padding: "10px 0",
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 18,
              cursor: "pointer",
            }}
            onClick={() => navigate("/allproducts")}
          >
            Xem tất cả sản phẩm
          </button>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>
            CHỌN MỨC GIÁ
          </div>
          <div style={{ marginBottom: 24 }}>
            {priceOptions.map((opt) => (
              <div key={opt.value} style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={priceFilters[opt.value] || false}
                    onChange={() => handlePriceChange(opt.value)}
                  />
                  <span style={{ marginLeft: 8 }}>{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
            THƯƠNG HIỆU
          </div>
          <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 24 }}>
            {brands.map((brand) => (
              <div key={brand.BrandId} style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.BrandId)}
                    onChange={() => handleBrandChange(brand.BrandId)}
                  />
                  <span style={{ marginLeft: 8 }}>{brand.BrandName}</span>
                </label>
              </div>
            ))}
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
            THỂ LOẠI
          </div>
          <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 24 }}>
            {categories.map((cat) => (
              <div key={cat.CategoryId} style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(
                      Number(cat.CategoryId)
                    )}
                    onChange={() => handleCategoryChange(cat.CategoryId)}
                  />
                  <span style={{ marginLeft: 8 }}>{cat.CategoryName}</span>
                </label>
              </div>
            ))}
          </div>
          <button
            className="view-all-btn"
            style={{
              background: "#fff",
              color: "#007bff",
              border: "1px solid #007bff",
              borderRadius: 6,
              padding: "6px 18px",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: 8,
            }}
            onClick={handleReset}
          >
            Bỏ lọc
          </button>
        </aside>
        <main
          style={{
            flex: 1,
            background: "#eaf4fb",
            borderRadius: 16,
            boxShadow: "0 2px 12px #0001",
            border: "1px solid #b6d4ef",
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                background: "#f5faff",
                border:
                  sortBoxFocus || sortDropdownOpen
                    ? "2px solid #007bff"
                    : "2px solid #b6d4ef",
                borderRadius: 10,
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                boxShadow: "none",
                transition: "border-color 0.18s",
              }}
            >
              <span style={{ fontWeight: 500, fontSize: 15, marginRight: 8 }}>
                Sắp xếp:
              </span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                onFocus={() => setSortBoxFocus(true)}
                onBlur={() => {
                  setSortBoxFocus(false);
                  setTimeout(() => setSortDropdownOpen(false), 150);
                }}
                onMouseDown={() => setSortDropdownOpen(true)}
                style={{
                  border:
                    sortBoxFocus || sortDropdownOpen
                      ? "1.5px solid #007bff"
                      : "1px solid #ddd",
                  borderRadius: 6,
                  padding: "4px 12px",
                  outline: "none",
                  transition: "border-color 0.18s",
                }}
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>
            </div>
          </div>
          {/* Tiêu đề */}
          <div
            style={{
              fontWeight: 700,
              fontSize: 22,
              color: "#222",
              marginBottom: 18,
            }}
          >
            TẤT CẢ SẢN PHẨM
          </div>
          {/* Lưới sản phẩm */}
          <div
            className="product-list"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 24,
            }}
          >
            {isLoading ? (
              <div
                style={{ color: "#222", fontWeight: 500, gridColumn: "1/-1" }}
              >
                Đang tải sản phẩm...
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product, idx) => (
                <div
                  className="product-card"
                  key={product.ProductId}
                  style={{
                    borderRadius: 12,
                    border: "1px solid #eee",
                    background: "#fff",
                    boxShadow: "0 2px 8px #0001",
                    transition: "box-shadow .2s",
                  }}
                >
                  <div
                    className="product-img-wrap"
                    style={{
                      background: "#fafafa",
                      borderRadius: 8,
                      height: 160,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Link to={`/products/productdetails/${product.ProductId}`}>
                      <img
                        src={`${API_CONFIG.UPLOADS_URL}/uploads/${product.Avatar}`}
                        alt={product.ProductName}
                        style={{
                          maxHeight: 140,
                          maxWidth: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Link>
                  </div>
                  <div
                    className="product-info"
                    style={{ padding: "0 8px 8px" }}
                  >
                    <div
                      className="product-name"
                      style={{
                        fontWeight: 500,
                        fontSize: 15,
                        marginBottom: 4,
                        minHeight: 40,
                        color: "#222",
                      }}
                    >
                      {product.ProductName}
                    </div>
                    <div
                      className="product-price"
                      style={{
                        color: "#e60023",
                        fontWeight: 700,
                        fontSize: 17,
                      }}
                    >
                      {Number(product.Price).toLocaleString()} đ
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Link
                        to={`/products/productdetails/${product.ProductId}`}
                      >
                        <button
                          className="add-to-cart-btn"
                          onMouseEnter={() => handleCartHover(idx)}
                          onMouseLeave={() => handleCartLeave(idx)}
                          style={{
                            background:
                              "linear-gradient(90deg,#5f9bd8,#3da0f0)",
                            color: "#fff",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            role="img"
                            aria-label="cart"
                            ref={(el) => (cartRefs.current[idx] = el)}
                            style={{ display: "inline-block" }}
                          >
                            🧺
                          </span>
                          Xem chi tiết
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  color: "#c42241",
                  fontWeight: 500,
                  marginTop: 32,
                  gridColumn: "1/-1",
                }}
              >
                Không có sản phẩm nào phù hợp với bộ lọc của bạn.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AllProducts;
