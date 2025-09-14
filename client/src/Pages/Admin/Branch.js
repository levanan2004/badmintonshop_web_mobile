import React, { useState, useEffect } from "react";
import Swal from "sweetalert2"; // Thêm dòng này

const Branch = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }
  const [branchName, setBranchName] = useState("");
  const [branches, setBranches] = useState([]);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
        }
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/branches`,
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
        // Nếu API trả về { branches: [...] }
        setBranches(Array.isArray(data) ? data : data.branches);
      } catch (error) {
        console.error("Error fetching branches:", error);
        setMessage("Đã xảy ra lỗi khi tải danh sách chi nhánh.");
      }
    };

    fetchBranches();
  }, []);

  const handleEdit = (branch) => {
    setEditingBranchId(branch.BranchId);
    setBranchName(branch.BranchName);
  };

  const handleDelete = async (branchId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chi nhánh này không?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_CONFIG.SERVER_URL}/privatesite/branches/${branchId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setBranches(branches.filter((branch) => branch.BranchId !== branchId));
        Swal.fire(
          "Thành công!",
          data.message || "Xóa chi nhánh thành công!",
          "success"
        );
      } else {
        Swal.fire(
          "Thất bại!",
          data.message || "Đã xảy ra lỗi khi xóa chi nhánh.",
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!branchName.trim()) {
      Swal.fire("Lỗi", "Tên chi nhánh không được để trống!", "error");
      return;
    }

    if (editingBranchId) {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/editbranch/${editingBranchId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ BranchName: branchName }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          setBranches(
            branches.map((branch) =>
              branch.BranchId === editingBranchId ? data.branch : branch
            )
          );
          setEditingBranchId(null);
          setBranchName("");
          Swal.fire(
            "Thành công!",
            data.message || "Cập nhật chi nhánh thành công!",
            "success"
          );
        } else {
          Swal.fire(
            "Thất bại!",
            data.message || "Đã xảy ra lỗi khi cập nhật chi nhánh.",
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
    } else {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/branches`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ BranchName: branchName }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          setBranches([...branches, data]);
          setBranchName("");
          Swal.fire(
            "Thành công!",
            data.message || "Thêm chi nhánh thành công!",
            "success"
          );
        } else {
          Swal.fire(
            "Thất bại!",
            data.message || "Đã xảy ra lỗi khi thêm chi nhánh.",
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
    }
  };

  const handleCancelEdit = () => {
    setEditingBranchId(null);
    setBranchName("");
    setMessage("");
  };

  return (
    <div className="container-fluid">
      {message && <div className="alert alert-info">{message}</div>}
      <div className="row">
        <div className="col-lg-6 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-600 mb-4">Danh sách chi nhánh</h5>
              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Id</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Tên chi nhánh</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Lệnh</h6>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((branch) => (
                      <tr key={branch.BranchId}>
                        <td className="border-bottom-0 text-center">
                          <h6 className="fw-600 mb-0">{branch.BranchId}</h6>
                        </td>
                        <td className="border-bottom-0 text-center">
                          <h6 className="fw-600 mb-1">{branch.BranchName}</h6>
                        </td>
                        <td className="border-bottom-0 text-center">
                          <div className="d-flex gap-3 justify-content-center">
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(branch.BranchId)}
                            >
                              Xóa
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleEdit(branch)}
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
                {editingBranchId ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh"}
              </h5>
              <form onSubmit={handleSubmit}>
                {editingBranchId && (
                  <p style={{ color: "#32a852" }}>
                    Đang sửa mã chi nhánh: {editingBranchId}
                  </p>
                )}
                <div className="mb-3">
                  <label htmlFor="branchName" className="form-label fw-600">
                    Tên chi nhánh
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="branchName"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Nhập tên chi nhánh"
                  />
                </div>
                <div className="d-flex justify-content-end">
                  {editingBranchId && (
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={handleCancelEdit}
                    >
                      Hủy
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editingBranchId ? "Cập nhật" : "Thêm"}
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
export default Branch;
