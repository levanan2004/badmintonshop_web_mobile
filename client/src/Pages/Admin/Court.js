import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_CONFIG } from "../../config/api";

const Court = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }
  const [courtName, setCourtName] = useState("");
  const [branchId, setBranchId] = useState("");
  const [courts, setCourts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [editingCourtId, setEditingCourtId] = useState(null);

  useEffect(() => {
    // Lấy danh sách sân
    const fetchCourts = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/courts`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setCourts(Array.isArray(data) ? data : data.courts);
      } catch (error) {
        Swal.fire("Lỗi", "Không thể tải danh sách sân.", "error");
      }
    };
    // Lấy danh sách chi nhánh
    const fetchBranches = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/branches`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setBranches(Array.isArray(data) ? data : data.branches);
      } catch (error) {
        Swal.fire("Lỗi", "Không thể tải danh sách chi nhánh.", "error");
      }
    };
    fetchCourts();
    fetchBranches();
  }, [token]);

  const handleEdit = (court) => {
    setEditingCourtId(court.CourtId);
    setCourtName(court.CourtName);
    setBranchId(court.BranchId);
  };

  const handleDelete = async (courtId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sân này không?")) return;
    try {
      const response = await fetch(
        `${API_CONFIG.SERVER_URL}/privatesite/courts/${courtId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setCourts(courts.filter((court) => court.CourtId !== courtId));
        Swal.fire(
          "Thành công!",
          data.message || "Xóa sân thành công!",
          "success"
        );
      } else {
        Swal.fire(
          "Thất bại!",
          data.message || "Đã xảy ra lỗi khi xóa sân.",
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
    // Chỉ cho nhập số
    const numberOnly = courtName.replace(/\D/g, "");
    if (!numberOnly || !branchId) {
      Swal.fire("Lỗi", "Vui lòng nhập số sân và chọn chi nhánh!", "error");
      return;
    }
    const finalCourtName = `Sân ${numberOnly}`;

    if (editingCourtId) {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/edit-courts/${editingCourtId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              CourtName: finalCourtName,
              BranchId: branchId,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          setCourts(
            courts.map((court) =>
              court.CourtId === editingCourtId ? data.court : court
            )
          );
          setEditingCourtId(null);
          setCourtName("");
          setBranchId("");
          Swal.fire(
            "Thành công!",
            data.message || "Cập nhật sân thành công!",
            "success"
          );
        } else {
          Swal.fire(
            "Thất bại!",
            data.message || "Đã xảy ra lỗi khi cập nhật sân.",
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
          `${API_CONFIG.SERVER_URL}/privatesite/courts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              CourtName: finalCourtName,
              BranchId: branchId,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          setCourts([...courts, data]);
          setCourtName("");
          setBranchId("");
          Swal.fire(
            "Thành công!",
            data.message || "Thêm sân thành công!",
            "success"
          );
        } else {
          Swal.fire(
            "Thất bại!",
            data.message || "Đã xảy ra lỗi khi thêm sân.",
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
    setEditingCourtId(null);
    setCourtName("");
    setBranchId("");
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-6 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-600 mb-4">Danh sách sân</h5>
              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Chi nhánh</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Tên sân</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Lệnh</h6>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courts
                      .slice()
                      .sort((a, b) => {
                        // Sắp xếp theo BranchId, sau đó theo số sân tăng dần
                        if (String(a.BranchId) !== String(b.BranchId)) {
                          return String(a.BranchId).localeCompare(
                            String(b.BranchId)
                          );
                        }
                        const numA = parseInt(
                          a.CourtName.replace(/\D/g, ""),
                          10
                        );
                        const numB = parseInt(
                          b.CourtName.replace(/\D/g, ""),
                          10
                        );
                        return numA - numB;
                      })
                      .map((court) => (
                        <tr key={court.CourtId}>
                          <td className="border-bottom-0 text-center">
                            <h6 className="fw-600 mb-1">
                              {branches.find(
                                (b) =>
                                  String(b.BranchId) === String(court.BranchId)
                              )?.BranchName || court.BranchId}
                            </h6>
                          </td>

                          <td className="border-bottom-0 text-center">
                            <h6 className="fw-600 mb-1">{court.CourtName}</h6>
                          </td>
                          <td className="border-bottom-0 text-center">
                            <div className="d-flex gap-3 justify-content-center">
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(court.CourtId)}
                              >
                                Xóa
                              </button>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleEdit(court)}
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
                {editingCourtId ? "Chỉnh sửa sân" : "Thêm sân"}
              </h5>
              <form onSubmit={handleSubmit}>
                {editingCourtId && (
                  <p style={{ color: "#32a852" }}>
                    Đang sửa mã sân: {editingCourtId}
                  </p>
                )}
                <div className="mb-3">
                  <label htmlFor="courtName" className="form-label fw-600">
                    Tên sân
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="courtName"
                    value={courtName}
                    onChange={(e) =>
                      setCourtName(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Nhập số sân (ví dụ: 1, 2, 3)"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="branchId" className="form-label fw-600">
                    Chi nhánh
                  </label>
                  <select
                    className="form-control"
                    id="branchId"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                  >
                    <option value="">Chọn chi nhánh</option>
                    {branches.map((branch) => (
                      <option key={branch.BranchId} value={branch.BranchId}>
                        {branch.BranchName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex justify-content-end">
                  {editingCourtId && (
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={handleCancelEdit}
                    >
                      Hủy
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editingCourtId ? "Cập nhật" : "Thêm"}
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

export default Court;
