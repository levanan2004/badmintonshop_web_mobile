import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_CONFIG } from "../../config/api";
import Swal from "sweetalert2";

const ItemProduct = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }

  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState(""); // Thông báo thành công hoặc lỗi
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const navigate = useNavigate(); // To handle redirection

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS, {
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
        setProducts(data);
      } catch (error) {
        console.error("Error", error);
        setMessage("Đã xảy ra lỗi khi tải danh sách sản phẩm.");
      }
    };
    fetchProducts();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    // Khi nhấn tìm kiếm, lọc sản phẩm theo ProductId
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter((product) =>
    product.ProductId.toString().includes(searchTerm)
  );

  const handleDelete = async (ProductId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa sản phẩm này không?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Lỗi", "Bạn chưa đăng nhập hoặc token không hợp lệ.", "error");
      return;
    }

    try {
      const response = await fetch(
        `${API_CONFIG.SERVER_URL}/privatesite/products/${ProductId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setProducts(
          products.filter((product) => product.ProductId !== ProductId)
        );
        Swal.fire("Thành công!", "Xóa sản phẩm thành công!", "success");
      } else if (response.status === 403) {
        Swal.fire("Lỗi", "Bạn không có quyền xóa sản phẩm này.", "error");
      } else {
        Swal.fire("Lỗi", "Đã xảy ra lỗi khi xóa.", "error");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      Swal.fire("Lỗi", "Đã xảy ra lỗi khi xóa.", "error");
    }
  };

  return (
    <div className="container-fluid">
      {message && <div className="alert alert-info">{message}</div>}
      <div className="row">
        <div className="col-lg-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <div className="row">
                <div className="col-lg-6 col-md-6">
                  <h5 className="card-title fw-600 mb-4">Danh sách sản phẩm</h5>
                </div>
                <div className="col-lg-6 col-md-6">
                  <form id="findProductForm">
                    <div className="searchForm">
                      <input
                        className="form-control"
                        id="searchNameInput"
                        name="name"
                        placeholder="Nhập vào mã sản phẩm để tìm kiếm ..."
                        value={searchTerm}
                        onChange={handleSearch} // Cập nhật từ khóa tìm kiếm
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
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th className="text-center ">
                        <h6 className="fw-600 mb-0">Id</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Tên sản phẩm</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Giá</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Giảm giá</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Thương hiệu</h6>
                      </th>

                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Lệnh</h6>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(filteredProducts) &&
                      filteredProducts.map((product) => (
                        <tr key={product.ProductId}>
                          <td className="border-bottom-0 text-center">
                            <h6 className="fw-600 mb-0">{product.ProductId}</h6>
                          </td>
                          <td className="border-bottom-0 text-center">
                            <h6 className="fw-600 mb-1">
                              {product.ProductName}
                            </h6>
                          </td>
                          <td className="border-bottom-0 text-center">
                            <p className="mb-0 fw-normal">{product.Price}</p>
                          </td>
                          <td className="border-bottom-0 text-center">
                            <p className="mb-0 fw-normal">{product.Discount}</p>
                          </td>
                          <td className="border-bottom-0 text-center">
                            {product.Brand.BrandName}
                          </td>
                          <td className="border-bottom-0 text-center">
                            <div className="d-flex gap-3 justify-content-center">
                              <Link
                                to={`/privatesite/addproduct/${product.ProductId}`}
                                state={{ product: product }}
                                className="btn btn-warning btn-sm"
                              >
                                Sửa
                              </Link>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(product.ProductId)}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemProduct;
