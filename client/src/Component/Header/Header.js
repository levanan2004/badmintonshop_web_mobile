import React, { useState, useRef, useEffect } from "react";
import "./Header.css";
import {
  FaSearch,
  FaShoppingCart,
  FaUserCircle,
  FaChevronDown,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { API_CONFIG } from "../../config/api";
import { FaRegUser } from "react-icons/fa";
const { decodeJWT } = require("../../Pages/Common");

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const [productDropdown, setProductDropdown] = useState(false);
  const [hoveredType, setHoveredType] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Kiểm tra trạng thái đăng nhập
  const [idGroup, setIdGroup] = useState(0);
  const [username, setUsername] = useState(""); // Lưu tên người dùng
  const [cartItems, setCartItems] = useState([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    // Xóa thêm các thông tin khác nếu có
    setIsLoggedIn(false);
    setIdGroup(2);
    setUsername("");
    window.location.href = "/Login";
  }

  const fetchSearchResults = async (query) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.SERVER_URL}/products/search?q=${query}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (debounceTimer) clearTimeout(debounceTimer);

    if (value.length > 0) {
      const timer = setTimeout(() => {
        fetchSearchResults(value);
      }, 300);
      setDebounceTimer(timer);
    } else {
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      const decodedToken = decodeJWT(token);
      setIdGroup(decodedToken.idgroup);
      // console.log(decodedToken.idgroup)
      setUsername(localStorage.getItem("username"));
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
  }, []);

  useEffect(() => {
    fetch(`${API_CONFIG.SERVER_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));

    fetch(`${API_CONFIG.SERVER_URL}/brands`)
      .then((res) => res.json())
      .then((data) => setBrands(data))
      .catch(() => setBrands([]));
  }, []);

  // Đóng search và dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
        setFocused(false);
        setSearch("");
        setSearchResults([]);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProductDropdown(false);
        setHoveredType(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = searchResults;

  const handleViewDetails = (productId) => {
    setSearchOpen(false);
    setSearch("");
    setSearchResults([]);
    navigate(`/products/productdetails/${productId}`);
  };
  return (
    <header className="modern-header">
      <div className="header-logo">
        <Link to="/home">
          <img src="Images/AT.png" alt="Logo" className="logo-img" />
          <span className="logo-text">AT BADMINTON</span>
        </Link>
      </div>
      <nav className="header-nav">
        <ul>
          <li>
            <Link to="/home">
              <a href="#">Home</a>
            </Link>
          </li>
          <li
            className="dropdown-parent"
            ref={dropdownRef}
            onMouseEnter={() => setProductDropdown(true)}
            onMouseLeave={() => {
              setProductDropdown(false);
              setHoveredType(null);
            }}
          >
            <Link
              to="/allproducts"
              className=""
              onClick={() => {
                setProductDropdown(false);
                setHoveredType(null);
              }}
              style={{ display: "block", width: "100%" }}
            >
              Products
            </Link>
            <div className={`dropdown-menu${productDropdown ? " show" : ""}`}>
              <div className="dropdown-level1">
                {categories.map((cat, idx) => (
                  <Link
                    key={cat.CategoryId}
                    to={`/allproducts?category=${cat.CategoryId}`}
                    className={`dropdown-level1-item${
                      hoveredType === idx ? " active" : ""
                    }`}
                    onMouseEnter={() => setHoveredType(idx)}
                    style={{ display: "block" }}
                  >
                    {cat.CategoryName}
                  </Link>
                ))}
              </div>
              {hoveredType !== null && categories[hoveredType] && (
                <div className="dropdown-level2">
                  <div className="dropdown-level2-title">
                    {categories[hoveredType].CategoryName}
                  </div>
                  <ul className="dropdown-level2-list">
                    {brands
                      .filter(
                        (brand) =>
                          brand.CategoryId ===
                          categories[hoveredType].CategoryId
                      )
                      .map((brand) => (
                        <li key={brand.BrandId}>
                          <Link
                            to={`/allproducts?category=${categories[hoveredType].CategoryId}&brand=${brand.BrandId}`}
                          >
                            {brand.BrandName}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </li>
          <li>
            <Link to="/aboutus">
              <a href="#">About Us</a>
            </Link>
          </li>
          <li>
            <Link to="/booking">
              <a href="#">Đặt sân</a>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="header-actions">
        <div className="search-container" ref={searchRef}>
          {searchOpen && (
            <div className="search-box-brown">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={handleSearchChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                autoFocus
              />
              {focused && (
                <ul className="suggestions-list">
                  {isLoading ? (
                    <li className="suggestion-no-result">Đang tìm kiếm...</li>
                  ) : filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((item, idx) => (
                      <li
                        key={idx}
                        className="suggestion-product-item"
                        onClick={() => handleViewDetails(item.ProductId)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={`${API_CONFIG.UPLOADS_URL}/uploads/${item.Avatar}`}
                          alt={item.ProductName}
                          className="suggestion-product-img"
                        />
                        <div className="suggestion-product-info">
                          <div className="suggestion-product-name">
                            {item.ProductName}
                          </div>
                          <div className="suggestion-product-price">
                            {Number(item.Price).toLocaleString()} VNĐ
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="suggestion-no-result">
                      Không tìm thấy sản phẩm phù hợp.
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
          <button
            className="search-btn"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Search"
          >
            <FaSearch />
          </button>
        </div>
        <Link to="/cart">
          <button className="icon-btn" aria-label="Cart">
            <FaShoppingCart />
          </button>
        </Link>
        <div className="user-dropdown-container" ref={userDropdownRef}>
          {!isLoggedIn ? (
            <button
              className="icon-btn"
              aria-label="Profile"
              onClick={() => (window.location.href = "/Login")}
            >
              <FaRegUser />
            </button>
          ) : (
            <div
              className="user-avatar-btn"
              onClick={() => setUserDropdownOpen((v) => !v)}
              tabIndex={0}
            >
              <img
                src="/Images/user2.png"
                alt="User Avatar"
                className="user-avatar-img"
              />
              <span className="username">{username}</span>
              <FaChevronDown style={{ marginLeft: 4, fontSize: 13 }} />
              {userDropdownOpen && (
                <div className="user-dropdown-menu">
                  <ul>
                    {idGroup === 1 || idGroup === 3 ? ( // Cho cả admin và nhân viên
                      <>
                        <li>
                          <Link to="/Privatesite/Dashboard">
                            Trang quản trị
                          </Link>
                        </li>
                        <li>
                          <a href="#" onClick={handleLogout}>
                            Logout
                          </a>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <Link to="/UserProfile">Thông tin</Link>
                        </li>
                        <li>
                          <a href="#" onClick={handleLogout}>
                            Logout
                          </a>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
