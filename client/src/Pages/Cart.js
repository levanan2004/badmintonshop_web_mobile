import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../Css/Style.css";
import { API_CONFIG } from "../config/api";
const Cart = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Lấy giỏ hàng từ localStorage khi load trang
  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(cartData);
    calculateTotal(cartData);
  }, []);

  // Tính tổng tiền
  const calculateTotal = (cartData) => {
    let total = 0;
    cartData.forEach((item) => {
      total += item.Price * item.Quantity;
    });
    setTotalPrice(total);
  };

  // Cập nhật số lượng
  const updateQuantity = (productId, size, newQuantity) => {
    const updatedCart = cart.map((item) => {
      if (item.ProductId === productId && item.Size === size) {
        return { ...item, Quantity: Math.max(1, newQuantity) };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeProduct = (productId, size) => {
    const updatedCart = cart.filter(
      (item) => !(item.ProductId === productId && item.Size === size)
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  };

  return (
    <div className="cart-container">
      <div className="pd-breadcrumb">
        <Link to="/home" className="pd-breadcrumb-link">
          Trang chủ
        </Link>
        <span className="pd-breadcrumb-sep">-</span>
        <Link to="/home" className="pd-breadcrumb-link">
          Giỏ hàng
        </Link>
      </div>
      <div className="cart-title">GIỎ HÀNG CỦA BẠN</div>
      <div className="cart-section-title">GIỎ HÀNG</div>
      <div className="cart-list">
        {cart.length === 0 ? (
          <div>Giỏ hàng trống.</div>
        ) : (
          cart.map((item) => (
            <div className="cart-item" key={item.ProductId + (item.Size || "")}>
              <img
                src={`${API_CONFIG.UPLOADS_URL}/uploads/${item.Avatar}`}
                alt={item.ProductName}
                className="cart-item-img"
              />
              <div className="cart-item-name">{item.ProductName}</div>
              {/* Hiển thị size nếu có */}
              {item.Size && (
                <div className="cart-item-size">
                  Size: <b>{item.Size}</b>
                </div>
              )}
              <div className="cart-item-qty">
                <button
                  onClick={() =>
                    updateQuantity(item.ProductId, item.Size, item.Quantity - 1)
                  }
                >
                  -
                </button>
                <span>{item.Quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.ProductId, item.Size, item.Quantity + 1)
                  }
                >
                  +
                </button>
              </div>
              <div className="cart-item-price">
                {item.Price.toLocaleString()} đ
              </div>
              <button
                className="cart-item-remove"
                onClick={() => removeProduct(item.ProductId, item.Size)}
                title="Xóa sản phẩm"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path
                    d="M7 7L15 15M15 7L7 15"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
      <div className="cart-total-row">
        <span className="cart-total-label">TỔNG TIỀN:</span>
        <span className="cart-total-value">
          {totalPrice.toLocaleString()} đ
        </span>
      </div>
      <a
        href="#"
        className={`cart-order-btn ${cart.length > 0 ? "" : "btn-gray"}`}
        onClick={(e) => {
          e.preventDefault();
          if (cart.length === 0) {
            alert(
              "Giỏ hàng của bạn trống. Vui lòng thêm sản phẩm để tiếp tục thanh toán."
            );
            return;
          }
          const token = localStorage.getItem("token");
          if (token) {
            window.location.href = "/checkout";
          } else {
            alert("Bạn cần đăng nhập để tiếp tục thanh toán.");
            window.location.href = "/login";
          }
        }}
      >
        Tiếp tục thanh toán
      </a>{" "}
    </div>
  );
};

export default Cart;
