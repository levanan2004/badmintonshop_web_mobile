import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_CONFIG } from "../../config/api";

const Category = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }
  const [categoryName, setCategoryName] = useState("");
  const [categoryId, setCategoryId] = useState(""); // Thêm state nếu muốn nhập Id (không khuyến khích tự nhập Id nếu auto increment)
  const [categories, setCategories] = useState([]);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/categories`,
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
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setMessage("Đã xảy ra lỗi khi tải danh sách thể loại.");
      }
    };

    fetchCategories();
  }, [token]);

  const handleEdit = (category) => {
    setEditingCategoryId(category.CategoryId);
    setCategoryName(category.CategoryName);
  };

  const handleDelete = async (categoryId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa thể loại này không?",
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
        `${API_CONFIG.SERVER_URL}/privatesite/categories/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setCategories(
          categories.filter((cat) => cat.CategoryId !== categoryId)
        );
        Swal.fire("Thành công!", "Xóa thể loại thành công!", "success");
      } else {
        Swal.fire("Lỗi", "Đã xảy ra lỗi khi xóa thể loại.", "error");
      }
    } catch (error) {
      Swal.fire("Lỗi", "Đã xảy ra lỗi khi xóa thể loại.", "error");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!categoryName.trim()) {
      setMessage("Tên thể loại không được để trống!");
      return;
    }

    // Kiểm tra trùng tên (không phân biệt hoa thường)
    const nameLower = categoryName.trim().toLowerCase();
    const isDuplicate = categories.some(
      (cat) =>
        cat.CategoryName.trim().toLowerCase() === nameLower &&
        (!editingCategoryId || cat.CategoryId !== editingCategoryId)
    );
    if (isDuplicate) {
      setMessage("Tên thể loại đã tồn tại!");
      return;
    }

    if (editingCategoryId) {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/editcategory/${editingCategoryId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ CategoryName: categoryName }),
          }
        );
        if (response.ok) {
          const updatedCategory = await response.json();
          setCategories(
            categories.map((cat) =>
              cat.CategoryId === editingCategoryId
                ? updatedCategory.category
                : cat
            )
          );
          setEditingCategoryId(null);
          setCategoryName("");
          setMessage("Cập nhật thể loại thành công!");
        } else {
          setMessage("Đã xảy ra lỗi khi cập nhật thể loại.");
        }
      } catch (error) {
        console.error("Error updating category:", error);
        setMessage("Đã xảy ra lỗi khi cập nhật thể loại.");
      }
    } else {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/categories`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ CategoryName: categoryName }),
          }
        );

        if (response.ok) {
          const newCategory = await response.json();
          setCategories([...categories, newCategory]);
          setCategoryName("");
          setMessage("Thêm thể loại thành công!");
        } else {
          setMessage("Đã xảy ra lỗi khi thêm thể loại.");
        }
      } catch (error) {
        console.error("Error adding category:", error);
        setMessage("Đã xảy ra lỗi khi thêm thể loại.");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setCategoryName("");
    setMessage("");
  };

  return (
    <div className="container-fluid">
      {message && <div className="alert alert-info">{message}</div>}
      <div className="row">
        <div className="col-lg-6 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-600 mb-4">Danh sách thể loại</h5>
              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Id</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Tên thể loại</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Lệnh</h6>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.CategoryId}>
                        <td className="border-bottom-0 text-center">
                          <h6 className="fw-600 mb-0">{cat.CategoryId}</h6>
                        </td>
                        <td className="border-bottom-0 text-center">
                          <h6 className="fw-600 mb-1">{cat.CategoryName}</h6>
                        </td>
                        <td className="border-bottom-0 text-center">
                          <div className="d-flex gap-3 justify-content-center">
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(cat.CategoryId)}
                            >
                              Xóa
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleEdit(cat)}
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
                {editingCategoryId ? "Chỉnh sửa thể loại" : "Thêm thể loại"}
              </h5>
              <form onSubmit={handleSubmit}>
                {editingCategoryId && (
                  <p style={{ color: "#32a852" }}>
                    Đang sửa mã thể loại: {editingCategoryId}
                  </p>
                )}
                <div className="mb-3">
                  <label htmlFor="categoryName" className="form-label fw-600">
                    Tên thể loại
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="categoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Nhập tên thể loại"
                  />
                </div>
                {/* Nếu muốn nhập thêm CategoryId (không khuyến khích nếu tự tăng) */}
                {/* 
                <div className="mb-3">
                  <label htmlFor="categoryId" className="form-label fw-600">Mã thể loại</label>
                  <input
                    type="number"
                    className="form-control"
                    id="categoryId"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    placeholder="Nhập mã thể loại"
                  />
                </div>
                */}
                <div className="d-flex justify-content-end">
                  {editingCategoryId && (
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={handleCancelEdit}
                    >
                      Hủy
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editingCategoryId ? "Cập nhật" : "Thêm"}
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

export default Category;
