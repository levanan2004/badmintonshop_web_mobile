import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_CONFIG } from "../../config/api";
const { formatDate } = require("../Common");

const OrderDetails = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/auth/login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }

  const { id } = useParams();

  const [orderDetails, setOrderDetails] = useState([]);
  const [order, setOrder] = useState(null);
  const [customerOrder, setCustomerOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const handleChangeStatusOrder = async (str, status) => {
    if (window.confirm(`Bạn có chắc chắn muốn ${str} đơn hàng không?`)) {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/orders/changestatus/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
          alert("Thay đổi trạng thái thành công!");
        } else {
          alert("Có lỗi xảy ra, vui lòng thử lại.");
        }
        console.log(response);
      } catch (err) {
        console.error(err);
        alert("Đã xảy ra lỗi khi thay đổi trạng thái đơn hàng.");
      }
    }
  };

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/orders/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        const orderdetail = await response.json();
        setOrder(orderdetail.Order);
        setOrderDetails(orderdetail.DetailOrder);
        setCustomerOrder(orderdetail.InformationCustomer);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id, token]);

  if (loading) return <div>Loading...</div>;

  if (!order || !orderDetails || !customerOrder) {
    return <div>Không tìm thấy đơn hàng</div>;
  }

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6" style={{ marginTop: "90px" }}>
              <h1>Chi tiết đơn hàng</h1>
              <h5>
                Đơn hàng #{order.OrderId}
                <span
                  className={`badge ${
                    order.OrderStatusId === 1
                      ? "bg-success"
                      : order.OrderStatusId === 3
                      ? "bg-warning"
                      : order.OrderStatusId === 5
                      ? "bg-primary"
                      : "bg-danger"
                  } rounded-3 fw-600`}
                >
                  {order.OrderStatusId === 1
                    ? "Thành công"
                    : order.OrderStatusId === 2
                    ? "Thất bại"
                    : order.OrderStatusId === 3
                    ? "Đang xử lí"
                    : order.OrderStatusId === 5
                    ? "Đang vận chuyển"
                    : "Đã hủy"}
                </span>
              </h5>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-8">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-post text-nowrap mb-0 align-middle">
                      <thead className="text-dark fs-4">
                        <tr>
                          <th>
                            <h6 className="fw-600 mb-0">Mã</h6>
                          </th>
                          <th>
                            <h6 className="fw-600 mb-0">Tên</h6>
                          </th>
                          <th>
                            <h6 className="fw-600 mb-0">Số lượng</h6>
                          </th>
                          <th>
                            <h6 className="fw-600 mb-0">Giá</h6>
                          </th>
                          <th>
                            <h6 className="fw-600 mb-0">Giảm giá</h6>
                          </th>
                          <th>
                            <h6 className="fw-600 mb-0">Tổng giá</h6>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails.map((detail) => (
                          <tr>
                            <td>#{detail.ProductId}</td>
                            <td>{detail.Product.ProductName}</td>
                            <td>{detail.Quantity}</td>
                            <td>{detail.Product.Price}</td>
                            <td>{detail.Product.Discount}</td>
                            <td>
                              {detail.Product.Price - detail.Product.Discount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-3">
                      <p>
                        Phí giao hàng: <b>Free</b>
                      </p>
                    </div>
                    <div className="mt-3">
                      <p>
                        Tổng tiền: <b>{order.TotalPrice}</b>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="">
                  <h5>Lệnh:</h5>
                  <div className="form-group">
                    <button
                      className="btn btn-secondary"
                      onClick={() => window.history.back()}
                    >
                      Quay về
                    </button>
                    {(() => {
                      if (order.OrderStatusId === 3) {
                        return (
                          <>
                            <button
                              className="btn btn-danger"
                              onClick={() =>
                                handleChangeStatusOrder("hủy đơn", 4)
                              }
                            >
                              Hủy đơn
                            </button>
                            <button
                              className="btn btn-primary"
                              onClick={() =>
                                handleChangeStatusOrder("xác nhận", 3)
                              }
                            >
                              Xác nhận đơn hàng
                            </button>
                          </>
                        );
                      } else if (order.OrderStatusId === 5) {
                        return (
                          <>
                            <button
                              className="btn btn-danger"
                              onClick={() =>
                                handleChangeStatusOrder("hủy đơn", 4)
                              }
                            >
                              Hủy đơn
                            </button>
                            <button
                              className="btn btn-success"
                              onClick={() =>
                                handleChangeStatusOrder("thành công", 5)
                              }
                            >
                              Thành công
                            </button>
                          </>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">
                  <b>Khách hàng</b>
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ border: "none" }}
                  value={`Mã: ${customerOrder.CustomerId}`}
                  disabled
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <b>Thông tin nhận hàng</b>
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ border: "none" }}
                  value={`Họ tên: ${customerOrder.Lastname} ${customerOrder.Firstname}`}
                  disabled
                />
                <input
                  type="text"
                  className="form-control"
                  style={{ border: "none" }}
                  value={`Email: ${customerOrder.Email}`}
                  disabled
                />
                <input
                  type="text"
                  className="form-control"
                  style={{ border: "none" }}
                  value={`Số điện thoại: ${customerOrder.Mobile}`}
                  disabled
                />
                <input
                  type="text"
                  className="form-control"
                  style={{ border: "none" }}
                  value={`Địa chỉ: ${customerOrder.Address}`}
                  disabled
                />
              </div>
              {orderDetails.StatusId === 2 || orderDetails.StatusId === 4 ? (
                <div className="mb-3">
                  <label className="form-label">
                    <b>Đơn hàng</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ border: "none" }}
                    disabled
                  />
                </div>
              ) : (
                <div className="mb-3">
                  <label className="form-label">
                    <b>Đơn hàng</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ border: "none" }}
                    value={`Ngày tạo: ${formatDate(order.CreateAt)} `}
                    disabled
                  />
                  <input
                    type="text"
                    className="form-control"
                    style={{ border: "none" }}
                    value={`Thanh toán: ${order.PaymentMethod}`}
                    disabled
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderDetails;
