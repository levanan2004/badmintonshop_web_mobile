import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_CONFIG } from "../config/api";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/order/${orderId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Không thể lấy chi tiết đơn hàng");
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId, token]);

  if (isLoading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!order) return <div>Đơn hàng không tồn tại.</div>;

  const { order: orderInfo, customer, details } = order;

  const hasSize =
    details && details.some((item) => item.Size && item.Size !== "");

  const formatPrice = (price) =>
    typeof price === "number" && !isNaN(price)
      ? price.toLocaleString() + " đ"
      : "0 đ";
  return (
    <div
      className="order-detail-container"
      style={{
        maxWidth: 900,
        margin: "32px auto",
        padding: 24,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px #0001",
      }}
    >
      <h2 style={{ color: "#2563eb", marginBottom: 24 }}>
        Chi tiết đơn hàng #{orderInfo?.OrderId}
      </h2>
      <div
        style={{
          marginBottom: 24,
          background: "#f6f8fa",
          padding: 16,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
        }}
      >
        <h4 style={{ marginBottom: 12 }}>Thông tin khách hàng</h4>
        <div>
          <b>Họ tên:</b> {customer?.Firstname} {customer?.Lastname}
        </div>
        <div>
          <b>Địa chỉ:</b> {customer?.Address}
        </div>
        <div>
          <b>Số điện thoại:</b> {customer?.Mobile}
        </div>
        <div>
          <b>Email:</b> {customer?.Email}
        </div>
      </div>

      <div
        style={{
          marginBottom: 24,
          background: "#f6f8fa",
          padding: 16,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
        }}
      >
        <h4 style={{ marginBottom: 12 }}>Thông tin đơn hàng</h4>
        <div>
          <b>Ngày đặt:</b>{" "}
          {orderInfo?.CreateAt
            ? new Date(orderInfo.CreateAt).toLocaleString()
            : ""}
        </div>
        <div>
          <b>Phương thức thanh toán:</b>{" "}
          {orderInfo?.PaymentMethod === "cod"
            ? "Thanh toán khi nhận hàng"
            : "Chuyển khoản"}
        </div>
        <div>
          <b>Trạng thái:</b>{" "}
          {orderInfo?.OrderStatusName
            ? orderInfo.OrderStatusName
            : orderInfo?.OrderStatusId === 1
            ? "Thành công"
            : orderInfo?.OrderStatusId === 2
            ? "Thất bại"
            : orderInfo?.OrderStatusId === 3
            ? "Đang xử lý"
            : orderInfo?.OrderStatusId === 5
            ? "Đang vận chuyển"
            : "Đã hủy"}
        </div>
      </div>
      <div>
        <h4 style={{ marginBottom: 12 }}>Sản phẩm</h4>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
            }}
          >
            <thead>
              <tr style={{ background: "#e5e7eb" }}>
                <th style={{ padding: 10, border: "1px solid #ddd" }}>Ảnh</th>
                <th style={{ padding: 10, border: "1px solid #ddd" }}>
                  Tên sản phẩm
                </th>
                {hasSize && (
                  <th style={{ padding: 10, border: "1px solid #ddd" }}>
                    Size
                  </th>
                )}
                <th style={{ padding: 10, border: "1px solid #ddd" }}>
                  Số lượng
                </th>
                <th style={{ padding: 10, border: "1px solid #ddd" }}>Giá</th>
                <th style={{ padding: 10, border: "1px solid #ddd" }}>
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {details && details.length > 0 ? (
                details.map((item, idx) => {
                  // Ưu tiên lấy từ Product nếu có, nếu không lấy trực tiếp từ item
                  const product = item.Product || {};
                  const imageUrl =
                    item.ImageUrl ||
                    (product.Avatar
                      ? `${API_CONFIG.UPLOADS_URL}/uploads/${product.Avatar}`
                      : "");
                  const productName =
                    item.ProductName || product.ProductName || "";
                  const price =
                    item.Price !== undefined && item.Price !== null
                      ? item.Price
                      : product.Price || 0;
                  const quantity = item.Quantity || 0;
                  return (
                    <tr key={idx}>
                      <td
                        style={{
                          padding: 10,
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={productName}
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        ) : (
                          <span>Không có ảnh</span>
                        )}
                      </td>
                      <td style={{ padding: 10, border: "1px solid #ddd" }}>
                        {productName.split(" ").slice(0, 4).join(" ")}
                        {productName.split(" ").length > 6 ? "..." : ""}
                      </td>
                      {hasSize && (
                        <td style={{ padding: 10, border: "1px solid #ddd" }}>
                          {item.Size || "-"}
                        </td>
                      )}
                      <td style={{ padding: 10, border: "1px solid #ddd" }}>
                        {quantity}
                      </td>
                      <td style={{ padding: 10, border: "1px solid #ddd" }}>
                        {Number(price).toLocaleString()} VND
                      </td>
                      <td style={{ padding: 10, border: "1px solid #ddd" }}>
                        {(Number(price) * Number(quantity)).toLocaleString()}{" "}
                        VND
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={hasSize ? 6 : 5}
                    style={{ textAlign: "center", padding: 16 }}
                  >
                    Không có sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        style={{
          marginTop: 32,
          textAlign: "right",
          background: "#f6f8fa",
          padding: 16,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
        }}
      >
        <div>
          <b>Tạm tính:</b> {formatPrice(orderInfo?.SubPrice)}
        </div>
        <div>
          <b>Giảm giá:</b> {formatPrice(orderInfo?.Discount)}
        </div>
        <div style={{ fontSize: 20, color: "#2563eb", marginTop: 8 }}>
          <b>Tổng tiền:</b> {formatPrice(orderInfo?.TotalPrice)}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
