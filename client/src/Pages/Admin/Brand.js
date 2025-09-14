import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const Brand = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }
  const [brandName, setBrandName] = useState("");
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]); // Thêm state cho category
  const [categoryId, setCategoryId] = useState(""); // State cho category đang chọn
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [message, setMessage] = useState("");

  // Lấy danh sách category
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/categories`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, [token]);

  // Lấy danh sách brand
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/brands`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Lỗi: ${response.statusText}`);
        }

        const data = await response.json();
        setBrands(data);
      } catch (error) {
        setMessage("Đã xảy ra lỗi khi tải danh sách thương hiệu.");
      }
    };

    fetchBrands();
  }, [token]);

  const handleEdit = (brand) => {
    setEditingBrandId(brand.BrandId);
    setBrandName(brand.BrandName);
    setCategoryId(brand.CategoryId || ""); // Gán category khi sửa
  };

  const handleDelete = async (brandId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa thương hiệu này không?",
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
        `${API_CONFIG.SERVER_URL}/privatesite/brands/${brandId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setBrands(brands.filter((brand) => brand.BrandId !== brandId));
        Swal.fire("Thành công!", "Xóa thương hiệu thành công!", "success");
      } else {
        Swal.fire("Lỗi", "Đã xảy ra lỗi khi xóa thương hiệu.", "error");
      }
    } catch (error) {
      Swal.fire("Lỗi", "Đã xảy ra lỗi khi xóa thương hiệu.", "error");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!brandName.trim()) {
      setMessage("Tên thương hiệu không được để trống!");
      return;
    }
    if (!categoryId) {
      setMessage("Vui lòng chọn danh mục!");
      return;
    }

    if (editingBrandId) {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/editbrand/${editingBrandId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              BrandName: brandName,
              CategoryId: categoryId,
            }),
          }
        );
        if (response.ok) {
          const updatedBrand = await response.json();
          setBrands(
            brands.map((brand) =>
              brand.BrandId === editingBrandId ? updatedBrand.brand : brand
            )
          );
          setEditingBrandId(null);
          setBrandName("");
          setCategoryId("");
          setMessage("Cập nhật thương hiệu thành công!");
        } else {
          setMessage("Đã xảy ra lỗi khi cập nhật thương hiệu.");
        }
      } catch (error) {
        setMessage("Đã xảy ra lỗi khi cập nhật thương hiệu.");
      }
    } else {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/brands`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              BrandName: brandName,
              CategoryId: categoryId,
            }),
          }
        );

        if (response.ok) {
          const newBrand = await response.json();
          setBrands([...brands, newBrand]);
          setBrandName("");
          setCategoryId("");
          setMessage("Thêm thương hiệu thành công!");
        } else {
          setMessage("Đã xảy ra lỗi khi thêm thương hiệu.");
        }
      } catch (error) {
        setMessage("Đã xảy ra lỗi khi thêm thương hiệu.");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingBrandId(null);
    setBrandName("");
    setCategoryId("");
    setMessage("");
  };

  return (
    <div className="container-fluid">
      {message && <div className="alert alert-info">{message}</div>}
      <div className="row">
        <div className="col-lg-6 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-600 mb-4">Danh sách thương hiệu</h5>
              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Id</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Tên thương hiệu</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Danh mục</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Lệnh</h6>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map((brand) => (
                      <tr key={brand.BrandId}>
                        <td className="border-bottom-0 text-center">
                          <h6 className="fw-600 mb-0">{brand.BrandId}</h6>
                        </td>
                        <td className="border-bottom-0 text-center">
                          <h6 className="fw-600 mb-1">{brand.BrandName}</h6>
                        </td>
                        <td className="border-bottom-0 text-center">
                          <h6 className="fw-600 mb-1">
                            {categories.find(
                              (cat) => cat.CategoryId === brand.CategoryId
                            )?.CategoryName || ""}
                          </h6>
                        </td>
                        <td className="border-bottom-0 text-center">
                          <div className="d-flex gap-3 justify-content-center">
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(brand.BrandId)}
                            >
                              Xóa
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleEdit(brand)}
                            >
                              Sửa
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
        <div className="col-lg-6 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-600 mb-4">
                {editingBrandId ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"}
              </h5>
              <form onSubmit={handleSubmit}>
                {editingBrandId && (
                  <p style={{ color: "#32a852" }}>
                    Đang sửa mã thương hiệu: {editingBrandId}
                  </p>
                )}
                <div className="mb-3">
                  <label htmlFor="brandName" className="form-label fw-600">
                    Tên thương hiệu
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="brandName"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Nhập tên thương hiệu"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="categoryId" className="form-label fw-600">
                    Danh mục
                  </label>
                  <select
                    className="form-control"
                    id="categoryId"
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.CategoryId} value={cat.CategoryId}>
                        {cat.CategoryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex justify-content-end">
                  {editingBrandId && (
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={handleCancelEdit}
                    >
                      Hủy
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editingBrandId ? "Cập nhật" : "Thêm"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Brand;
