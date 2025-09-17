import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Link,
  useNavigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "../Pages/Admin/Dashboard";
import ItemProduct from "../Pages/Admin/ProductList";
import AddProductForm from "../Pages/Admin/AddItem";
import EditProductForm from "../Pages/Admin/EditProduct";
import Orders from "../Pages/Admin/Order";
import Brand from "../Pages/Admin/Brand";
import Branch from "../Pages/Admin/Branch";
import SlotTime from "../Pages/Admin/SlotTime";
import Court from "../Pages/Admin/Court";
import BookingAdmin from "../Pages/Admin/BookingAdmin";
import Category from "../Pages/Admin/Category";
import ProfileAdmin from "../Pages/Admin/ProfileAdmin";
import AccountManagement from "../Pages/Admin/AccountManagement";
import Login from "../Pages/Login/Login";
import DetailAccount from "../Pages/Admin/AccountManagementDetail";
import "../Pages/Admin/admincss/Style.css";
import OrderDetails from "../Pages/Admin/OrderDetail";
import RevenuePages from "../Pages/Admin/Revenue";
import CommentManagement from "../Pages/Admin/CommentManagement";
const { decodeJWT } = require("../../src/Pages/Common");

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "/Login"; // Đúng route đăng nhập frontend của bạn
}

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra quyền truy cập của người dùng
    // Nếu không có token hoặc không phải là admin, chuyển hướng đến trang notfound
    const token = localStorage.getItem("token");
    let idGroup = null;
    if (token) {
      try {
        const decodedToken = decodeJWT(token);
        idGroup = decodedToken.idgroup;
      } catch (e) {
        idGroup = null;
      }
    }
    //trang notfound
    if (!token || idGroup !== 1) {
      navigate("/notfound");
    }
  }, [navigate]);

  const Sidebar = () => {
    return (
      <div>
        <aside className="left-sidebar">
          <div>
            <nav className="sidebar-nav scroll-sidebar" data-simplebar="">
              <ul id="sidebarnav">
                <li className="nav-small-cap">
                  <i className="ti ti-dots nav-small-cap-icon fs-4"></i>
                  <span className="hide-menu">Trang chủ</span>
                </li>
                <li className="sidebar-item">
                  <Link className="sidebar-link" to="/privatesite/dashboard">
                    <span>
                      <i className="ti ti-layout-dashboard"></i>
                    </span>
                    <span className="hide-menu">Dashboard</span>
                  </Link>
                </li>
                <li className="nav-small-cap">
                  <i className="ti ti-dots nav-small-cap-icon fs-4"></i>
                  <span className="hide-menu">Sản phẩm</span>
                </li>
                <li className="sidebar-item">
                  <Link className="sidebar-link" to="/privatesite/AddProduct">
                    <span>
                      <i className="ti ti-settings"></i>
                    </span>
                    <span className="hide-menu">Thêm sản phẩm</span>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link className="sidebar-link" to="/privatesite/ProductList">
                    <span>
                      <i className="ti ti-settings"></i>
                    </span>
                    <span className="hide-menu">Danh sách sản phẩm</span>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link className="sidebar-link" to="/privatesite/brand">
                    <span>
                      <i className="ti ti-settings"></i>
                    </span>
                    <span className="hide-menu">Thương hiệu</span>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link className="sidebar-link" to="/privatesite/categories">
                    <span>
                      <i className="ti ti-settings"></i>
                    </span>
                    <span className="hide-menu">Thể loại</span>
                  </Link>
                </li>
                <li className="nav-small-cap">
                  <i className="ti ti-dots nav-small-cap-icon fs-4"></i>
                  <span className="hide-menu">Đơn hàng</span>
                </li>
                <li className="sidebar-item">
                  <Link className="sidebar-link" to="/privatesite/order">
                    <span>
                      <i className="ti ti-settings"></i>
                    </span>
                    <span className="hide-menu">Danh sách đơn hàng</span>
                  </Link>
                </li>
                <li className="nav-small-cap">
                  <i className="ti ti-dots nav-small-cap-icon fs-4"></i>
                  <span className="hide-menu">Quản lý</span>
                </li>
                <li className="sidebar-item">
                  <Link
                    className="sidebar-link"
                    to="/privatesite/AccountManagement"
                  >
                    <span>
                      <i className="ti ti-settings"></i>
                    </span>
                    <span className="hide-menu">Tài khoản</span>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link className="sidebar-link" to="/privatesite/Revenue">
                    <span>
                      <i className="ti ti-settings"></i>
                    </span>
                    <span className="hide-menu">Doanh thu</span>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link className="sidebar-link" to="/privatesite/comment">
                    <span>
                      <i className="ti ti-settings"></i>
                    </span>
                    <span className="hide-menu">Bình luận</span>
                  </Link>
                </li>
                <li className="nav-small-cap">
                  <i className="ti ti-dots nav-small-cap-icon fs-4"></i>
                  <span className="hide-menu">Quản lý sân cầu</span>
                </li>
                <li className="sidebar-item">
                  <Link className="sidebar-link" to="/privatesite/branch">
                    <span>
                      <i className="ti ti-settings"></i>
                    </span>
                    <span className="hide-menu">Chi nhánh</span>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link className="sidebar-link" to="/privatesite/slot-times">
                    <span>
                      <i className="ti ti-settings"></i>
                    </span>
                    <span className="hide-menu">Khung giờ</span>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link className="sidebar-link" to="/privatesite/courts">
                    <span>
                      <i className="ti ti-settings"></i>
                    </span>
                    <span className="hide-menu">Sân</span>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link className="sidebar-link" to="/privatesite/booking">
                    <span>
                      <i className="ti ti-settings"></i>
                    </span>
                    <span className="hide-menu">Đơn đặt sân</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </aside>
      </div>
    );
  };
  const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Đóng dropdown khi click ra ngoài
    React.useEffect(() => {
      const handleClickOutside = (e) => {
        if (!e.target.closest(".user-dropdown")) setDropdownOpen(false);
      };
      if (dropdownOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    return (
      <header className="app-header">
        <nav className="navbar navbar-expand-lg navbar-light">
          <ul className="navbar-nav">
            <li className="nav-item d-block d-xl-none">
              <button
                className="nav-link sidebartoggler nav-icon-hover"
                id="headerCollapse"
                onClick={(e) => e.preventDefault()}
              >
                <i className="ti ti-menu-2"></i>
              </button>
            </li>
          </ul>
          <div
            className="navbar-collapse justify-content-end px-0"
            id="navbarNav"
          >
            <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-end">
              <li
                className="nav-item dropdown user-dropdown"
                style={{ position: "relative" }}
              >
                <a
                  href="#"
                  className="nav-link nav-icon-hover"
                  id="drop2"
                  aria-expanded={dropdownOpen}
                  onClick={(e) => {
                    e.preventDefault();
                    setDropdownOpen((open) => !open);
                  }}
                >
                  <img
                    src="https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
                    alt="Profile"
                    width="35"
                    height="35"
                    className="rounded-circle"
                    style={{ cursor: "pointer" }}
                  />
                </a>
                {dropdownOpen && (
                  <ul
                    className="dropdown-menu dropdown-menu-end show"
                    aria-labelledby="drop2"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "100%",
                      minWidth: 150,
                      zIndex: 1000,
                    }}
                  >
                    <li>
                      <a
                        href="#"
                        onClick={handleLogout}
                        className="dropdown-item text-danger"
                      >
                        Logout
                      </a>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>
        </nav>
      </header>
    );
  };

  return (
    <div
      className="Pages-wrapper"
      id="main-wrapper"
      data-layout="vertical"
      data-navbarbg="skin6"
      data-sidebartype="full"
      data-sidebar-position="fixed"
      data-header-position="fixed"
    >
      <Sidebar />
      <div className="body-wrapper">
        <Header />
        <Routes>
          <Route path="Dashboard" element={<Dashboard />} />
          <Route path="ProductList" element={<ItemProduct />} />
          <Route path="AddProduct" element={<AddProductForm />} />
          <Route path="addproduct/:id" element={<AddProductForm />} />
          <Route path="edit" element={<EditProductForm />} />
          <Route path="brand" element={<Brand />} />
          <Route path="branch" element={<Branch />} />
          <Route path="booking" element={<BookingAdmin />} />
          <Route path="slot-times" element={<SlotTime />} />
          <Route path="courts" element={<Court />} />
          <Route path="categories" element={<Category />} />
          <Route path="Order" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="profile" element={<ProfileAdmin />} />
          <Route path="AccountManagement" element={<AccountManagement />} />
          <Route path="AccountManagement/:id" element={<DetailAccount />} />
          <Route path="revenue" element={<RevenuePages />} />
          <Route path="comment" element={<CommentManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminLayout;
