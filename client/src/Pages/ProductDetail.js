import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { API_CONFIG } from "../config/api";
import "../Css/Style.css";

export default function ProductDetail() {
  const { id } = useParams();
  const [productDetails, setProductDetails] = useState(null);
  const [images, setImages] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [largeImage, setLargeImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // State
  const [openReplies, setOpenReplies] = useState({});
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [replyInput, setReplyInput] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replies, setReplies] = useState({});
  const [selectedSize, setSelectedSize] = useState(null);
  // Gọi API chi tiết sản phẩm
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(API_CONFIG.ENDPOINTS.PRODUCT_DETAILS(id));
        if (!response.ok) throw new Error("Failed to fetch product details");
        const data = await response.json();
        setProductDetails(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  // Gọi API lấy ảnh sản phẩm
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/products/${id}/images`
        );
        if (!response.ok) throw new Error("Failed to fetch images");
        const data = await response.json();
        setImages(data.data || []);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchImages();
  }, [id]);

  // Gọi API lấy thông số kỹ thuật
  useEffect(() => {
    const fetchSpecifications = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/products/${id}/specifications`
        );
        if (!response.ok) throw new Error("Failed to fetch specifications");
        const data = await response.json();
        setSpecifications(data.data || []);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchSpecifications();
  }, [id]);

  // Cập nhật ảnh lớn khi Avatar thay đổi
  useEffect(() => {
    if (productDetails?.Avatar) {
      setLargeImage(
        `${API_CONFIG.UPLOADS_URL}/uploads/${productDetails.Avatar}`
      );
    }
  }, [productDetails?.Avatar]);

  // Hàm đổi ảnh lớn khi bấm vào ảnh nhỏ
  const handleSmallImageClick = (imageUrl) => {
    setLargeImage(`${API_CONFIG.UPLOADS_URL}/uploads/${imageUrl}`);
  };

  // Lấy bình luận khi vào trang
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(API_CONFIG.ENDPOINTS.COMMENTS(id));
        if (!response.ok) throw new Error("Failed to fetch comments");
        const data = await response.json();
        setComments(data);

        // Fetch replies cho tất cả comment
        data.forEach((c) => {
          fetchReplies(c.CommentId);
        });
      } catch (error) {
        setComments([]);
      }
    };
    fetchComments();
  }, [id]);

  // Gửi bình luận
  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để bình luận.");
      window.location.href = "/login";
      return;
    }
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.ADD_COMMENT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ProductId: id,
          Content: commentInput,
        }),
      });
      if (!response.ok) throw new Error("Thêm bình luận thất bại");
      setCommentInput("");
      // Load lại bình luận
      const fetchComments = async () => {
        try {
          const response = await fetch(API_CONFIG.ENDPOINTS.COMMENTS(id));
          if (!response.ok) throw new Error("Failed to fetch comments");
          const data = await response.json();
          setComments(data);
        } catch (error) {
          setComments([]);
        }
      };
      fetchComments();
    } catch (error) {
      alert("Đã xảy ra lỗi khi thêm bình luận");
    }
  };

  // Hàm lấy replies
  const fetchReplies = async (commentId) => {
    try {
      const res = await fetch(API_CONFIG.ENDPOINTS.GET_REPLIES(commentId));
      const data = await res.json();
      setReplies((prev) => ({ ...prev, [commentId]: data }));
    } catch (e) {
      setReplies((prev) => ({ ...prev, [commentId]: [] }));
    }
  };

  // Hàm gửi reply
  const handleReply = async (commentId) => {
    if (!replyInput[commentId] || !replyInput[commentId].trim()) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để trả lời.");
      window.location.href = "/login";
      return;
    }
    try {
      const res = await fetch(API_CONFIG.ENDPOINTS.ADD_REPLY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          CommentId: commentId,
          Content: replyInput[commentId],
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Thêm phản hồi thất bại");
      }
      setReplyInput({ ...replyInput, [commentId]: "" });
      fetchReplies(commentId);
      setReplyingTo(null);
      setOpenReplies((prev) => ({
        ...prev,
        [commentId]: true,
      }));
    } catch (e) {
      alert("Đã xảy ra lỗi khi thêm phản hồi: " + (e.message || ""));
    }
  };

  const handleAddToCart = () => {
    // Nếu sản phẩm có size mà chưa chọn thì báo lỗi
    if (
      ((Array.isArray(productDetails.ClothingSizes) &&
        productDetails.ClothingSizes.length > 0) ||
        (Array.isArray(productDetails.ShoeSizes) &&
          productDetails.ShoeSizes.length > 0)) &&
      !selectedSize
    ) {
      alert("Vui lòng chọn size trước khi thêm vào giỏ hàng!");
      return;
    }

    try {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      // Nếu sản phẩm có size, lưu cả size đã chọn
      const cartItem = {
        Avatar: productDetails.Avatar,
        ProductId: productDetails.ProductId,
        ProductName: productDetails.ProductName,
        Price: productDetails.Price,
        Quantity: 1,
        Size: selectedSize || null,
      };
      // Kiểm tra sản phẩm (và size) đã có trong giỏ chưa
      const existingProductIndex = cart.findIndex(
        (item) =>
          item.ProductId === cartItem.ProductId && item.Size === cartItem.Size
      );
      if (existingProductIndex !== -1) {
        cart[existingProductIndex].Quantity += 1;
      } else {
        cart.push(cartItem);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      alert("Sản phẩm đã được thêm vào giỏ hàng!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Thêm sản phẩm vào giỏ hàng thất bại");
    }
  };

  if (isLoading) return <div>Đang tải...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!productDetails) return null;

  return (
    <div className="pd-container pd-large">
      {/* Breadcrumb */}
      <div className="pd-breadcrumb">
        <Link to="/home" className="pd-breadcrumb-link">
          Trang chủ
        </Link>
        <span className="pd-breadcrumb-sep">-</span>
        <Link to="/home" className="pd-breadcrumb-link">
          Chi tiết sản phẩm
        </Link>
      </div>
      <div className="pd-main pd-main-large">
        {/* Ảnh sản phẩm */}
        <div className="pd-images pd-images-large">
          <div className="pd-main-image pd-main-image-large">
            <img src={largeImage} alt="Sản phẩm" />
          </div>
          <div className="pd-sub-images">
            <div className="product-small-image-grid">
              <div className="row">
                {/* Ảnh đại diện (Avatar) */}
                {productDetails?.Avatar && (
                  <div className="col-3">
                    <div className="small-image-wrapper">
                      <img
                        src={`${API_CONFIG.UPLOADS_URL}/uploads/${productDetails.Avatar}`}
                        alt="Avatar"
                        className={`img-fluid${
                          largeImage.endsWith(productDetails.Avatar)
                            ? " active"
                            : ""
                        }`}
                        onClick={() =>
                          setLargeImage(
                            `${API_CONFIG.UPLOADS_URL}/uploads/${productDetails.Avatar}`
                          )
                        }
                      />
                    </div>
                  </div>
                )}
                {/* Ảnh con từ API */}
                {images.map((image, index) => (
                  <div className="col-3" key={index}>
                    <div className="small-image-wrapper">
                      <img
                        src={`${API_CONFIG.UPLOADS_URL}/uploads/${image.ImageUrl}`}
                        alt={`Product small thumbnail ${index + 1}`}
                        className={`img-fluid${
                          largeImage.endsWith(image.ImageUrl) ? " active" : ""
                        }`}
                        onClick={() => handleSmallImageClick(image.ImageUrl)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Thông tin sản phẩm */}
        <div className="pd-info pd-info-large">
          <h2 className="pd-name">{productDetails.ProductName}</h2>
          <div className="pd-info-extra">
            <span className="pd-info-brand">
              Thương hiệu: <b>{productDetails.Brand?.BrandName}</b>
            </span>
            <span className="pd-info-status">
              Tình trạng: <b>Còn hàng</b>
            </span>
            <span className="pd-info-sku">
              Mã SP: <b>{productDetails.ProductId}</b>
            </span>
          </div>
          <div className="pd-extra-info" style={{ marginBottom: 0 }}>
            <div className="pd-discount">
              Mua online tặng ngay quấn cán Yonex
            </div>
          </div>
          <div className="pd-price">
            {Number(productDetails.Price).toLocaleString()}₫
          </div>
          {/* Hiển thị size cho quần áo */}
          {productDetails.Category?.CategoryName === "Quần áo" &&
            Array.isArray(productDetails.ClothingSizes) &&
            productDetails.ClothingSizes.length > 0 && (
              <div className="pd-size-list">
                <span className="pd-size-label">Size quần áo: </span>
                {productDetails.ClothingSizes.map((item, idx) => (
                  <span
                    key={idx}
                    className={`pd-size-item${
                      selectedSize === item.Size ? " selected" : ""
                    }`}
                    onClick={() => setSelectedSize(item.Size)}
                  >
                    {item.Size} ({item.Quantity})
                  </span>
                ))}
              </div>
            )}

          {productDetails.Category?.CategoryName === "Giày" &&
            Array.isArray(productDetails.ShoeSizes) &&
            productDetails.ShoeSizes.length > 0 && (
              <div className="pd-size-list">
                <span className="pd-size-label">Size giày: </span>
                {productDetails.ShoeSizes.map((item, idx) => (
                  <span
                    key={idx}
                    className={`pd-size-item${
                      selectedSize === item.Size ? " selected" : ""
                    }`}
                    onClick={() => setSelectedSize(item.Size)}
                  >
                    {item.Size} ({item.Quantity})
                  </span>
                ))}
              </div>
            )}
          <button
            className="pd-add-to-cart-btn pd-add-to-cart-btn-large"
            onClick={handleAddToCart}
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      {/* Thông số kỹ thuật */}
      <div className="pd-specs-section">
        <h3>Thông số kỹ thuật</h3>
        <div className="pd-specs-table pd-specs-table-vertical">
          {specifications.map((spec, idx) => (
            <div className="pd-spec-row" key={idx}>
              <div className="pd-spec-cell pd-spec-label">
                {spec.SpecificationName}
              </div>
              <div className="pd-spec-cell">{spec.SpecificationContent}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bình luận giữ nguyên */}
      <div className="pd-comments-section pd-comments-fullwidth">
        <h3>Bình luận</h3>
        <div className="pd-comments-list pd-comments-list-full">
          {Array.isArray(comments) && comments.length > 0 ? (
            comments.map((c) => (
              <div
                key={c.CommentId}
                className="pd-comment-item pd-comment-item-full"
              >
                <div className="pd-comment-header">
                  <span className="pd-comment-user">
                    {c.Account?.Email || c.Account?.Username || "Khách"}
                  </span>
                  <span className="pd-comment-time">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleString("vi-VN")
                      : ""}
                  </span>
                </div>
                <div className="pd-comment-content">{c.Content}</div>
                <button
                  className="pd-reply-btn"
                  onClick={() => {
                    setReplyingTo(
                      replyingTo === c.CommentId ? null : c.CommentId
                    );
                    if (replyingTo !== c.CommentId) fetchReplies(c.CommentId);
                  }}
                >
                  Trả lời
                </button>

                {/* Nút xem phản hồi */}
                {Array.isArray(replies[c.CommentId]) &&
                  replies[c.CommentId].length > 0 && (
                    <button
                      className="pd-toggle-replies-btn"
                      style={{
                        marginLeft: 8,
                        color: "#007bff",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (!openReplies[c.CommentId])
                          fetchReplies(c.CommentId);
                        setOpenReplies((prev) => ({
                          ...prev,
                          [c.CommentId]: !prev[c.CommentId],
                        }));
                      }}
                    >
                      {openReplies[c.CommentId] ? "Ẩn" : "Xem"}{" "}
                      {replies[c.CommentId].length} phản hồi
                    </button>
                  )}

                {/* Hiển thị replies nếu đang mở */}
                {openReplies[c.CommentId] &&
                  Array.isArray(replies[c.CommentId]) &&
                  replies[c.CommentId].length > 0 && (
                    <div className="pd-comment-replies">
                      {replies[c.CommentId].map((r) => (
                        <div key={r.ReplyId} className="pd-reply-item">
                          <span className="pd-reply-user">
                            {r.Account?.Username || r.Account?.Email || "Khách"}
                          </span>
                          <span className="pd-reply-time">
                            {r.CreatedAt
                              ? new Date(r.CreatedAt).toLocaleString("vi-VN")
                              : ""}
                          </span>
                          <div className="pd-reply-content">{r.Content}</div>
                        </div>
                      ))}
                    </div>
                  )}

                {/* box trả lời */}
                {replyingTo === c.CommentId && (
                  <div className="pd-reply-box">
                    <input
                      type="text"
                      placeholder="Nhập trả lời..."
                      value={replyInput[c.CommentId] || ""}
                      onChange={(e) =>
                        setReplyInput({
                          ...replyInput,
                          [c.CommentId]: e.target.value,
                        })
                      }
                      style={{ width: "70%", marginRight: 8 }}
                    />
                    <button onClick={() => handleReply(c.CommentId)}>
                      Gửi
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div>Không có bình luận nào.</div>
          )}
        </div>
        <div className="pd-add-comment-box pd-add-comment-box-full">
          <textarea
            rows={3}
            placeholder="Nhập bình luận..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="pd-comment-textarea"
          />
          <button onClick={handleAddComment}>Gửi bình luận</button>
        </div>
      </div>
    </div>
  );
}
