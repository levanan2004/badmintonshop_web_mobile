import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_CONFIG } from "../../config/api";
import Swal from "sweetalert2";
const { formatDate } = require("../Common");

const Orders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/auth/login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }
  const [status, setStatus] = useState("0");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]); // State để lưu kết quả tìm kiếm

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(API_CONFIG.ENDPOINTS.ADMIN_ORDERS, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Lỗi: ${response.statusText}`);
        }
        const data = await response.json();
        setOrders(data);
        setFilteredOrders(data); // Cập nhật filteredOrders khi nhận được dữ liệu
      } catch (error) {
        console.error("Error", error);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const filtered = orders.filter(
      (order) => order.OrderId.toString().includes(search) // Tìm kiếm theo ID đơn hàng
    );
    setFilteredOrders(filtered); // Cập nhật kết quả tìm kiếm
  };

  const handleDelete = async (orderId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn xóa đơn hàng này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        API_CONFIG.ENDPOINTS.ADMIN_ORDER_DELETE(orderId),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setOrders(orders.filter((order) => order.OrderId !== orderId));
        setFilteredOrders(
          filteredOrders.filter((order) => order.OrderId !== orderId)
        );
        Swal.fire(
          "Thành công!",
          data.message || "Xóa đơn hàng thành công!",
          "success"
        );
      } else {
        Swal.fire(
          "Thất bại!",
          data.message || "Đã xảy ra lỗi khi xóa đơn hàng.",
          "error"
        );
      }
    } catch (error) {
      Swal.fire(
        "Lỗi",
        "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
        "error"
      );
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <div className="row">
                <div className="col-lg-6 col-md-6">
                  <h5 className="card-title fw-600 mb-4">Danh sách đơn hàng</h5>
                </div>
                <div className="col-lg-6 col-md-6">
                  <form id="findOrderForm" onSubmit={handleSearchSubmit}>
                    <div className="searchForm">
                      <input
                        className="form-control"
                        id="searchNameInput"
                        name="name"
                        placeholder="Nhập vào mã đơn hàng để tìm kiếm ..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <button
                        type="submit"
                        id="btnSubmit_search"
                        className="btn btn-default"
                      >
                        <i className="ti ti-search"></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-post text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Mã đơn hàng</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Khách hàng</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Thời gian</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Giá trị</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Trạng thái</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Lệnh</h6>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(filteredOrders) &&
                      filteredOrders.map((order) => (
                        <tr key={order.OrderId}>
                          <td className="border-bottom-0 text-center">
                            <h6 className="fw-600 mb-0">{order.OrderId}</h6>
                          </td>
                          <td className="border-bottom-0 text-center">
                            <h6 className="fw-600 mb-1">{order.CustomerId}</h6>
                          </td>
                          <td className="border-bottom-0 text-center">
                            <p className="mb-0 fw-normal">
                              {formatDate(order.CreateAt)}
                            </p>
                          </td>
                          <td className="border-bottom-0 text-center">
                            {order.TotalPrice}
                          </td>
                          <td className="border-bottom-0 text-center">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <span
                                className={`badge rounded-3 fw-600 ${
                                  order.OrderStatusId === 1
                                    ? "bg-success"
                                    : order.OrderStatusId === 3
                                    ? "bg-warning"
                                    : order.OrderStatusId === 5
                                    ? "bg-primary"
                                    : "bg-danger"
                                }`}
                              >
                                {order.OrderStatusId === 1
                                  ? "Thành công"
                                  : order.OrderStatusId === 3
                                  ? "Đang xử lí"
                                  : order.OrderStatusId === 4
                                  ? "Đã hủy"
                                  : order.OrderStatusId === 5
                                  ? "Đang vận chuyển"
                                  : "Thất bại"}
                              </span>
                            </div>
                          </td>
                          <td className="border-bottom-0 text-center">
                            <div className="d-flex gap-3 justify-content-center">
                              <Link
                                to={`/privatesite/orders/${order.OrderId}`}
                                className="btn btn-primary btn-sm"
                              >
                                Chi tiết
                              </Link>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(order.OrderId)}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-tools p-5 pt-0 pb-0 m-auto">
              <ul className="pagination pagination-sm" id="pagination"></ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Orders;
