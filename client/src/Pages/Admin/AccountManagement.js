import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

import { API_CONFIG } from "../config/api";
const AccountManagement = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/accountmanagement`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setAccounts(data);
      } catch (error) {
        console.error("Error", error);
      }
    };

    fetchAccounts();
  }, []);

  // Hàm xóa tài khoản với hiệu ứng xác nhận và thông báo
  const handleDelete = async (accountId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa tài khoản này không?",
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
        `${API_CONFIG.SERVER_URL}/privatesite/accountmanagement/${accountId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setAccounts(accounts.filter((acc) => acc.AccountId !== accountId));
        Swal.fire(
          "Thành công!",
          data.message || "Xóa tài khoản thành công!",
          "success"
        );
      } else {
        Swal.fire(
          "Lỗi",
          data.message || "Đã xảy ra lỗi khi xóa tài khoản.",
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
              <h5 className="card-title fw-600 mb-4">Danh sách tài khoản</h5>
              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Id</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Username</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Email</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Nhóm tài khoản</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Mã khách hàng</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Lệnh</h6>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(accounts) &&
                      accounts.map((acc) => (
                        <tr key={acc.AccountId}>
                          <td className="border-bottom-0 text-center">
                            <h6 className="fw-600 mb-0">{acc.AccountId}</h6>
                          </td>
                          <td className="border-bottom-0 text-center">
                            <h6 className="fw-600 mb-1">{acc.Username}</h6>
                          </td>
                          <td className="border-bottom-0 text-center">
                            <p className="mb-0 fw-normal">{acc.Email}</p>
                          </td>
                          <td className="border-bottom-0 text-center">
                            <p className="mb-0 fw-normal">
                              {acc.IdGroup == 1
                                ? "Quản trị"
                                : acc.IdGroup == 3
                                ? "Nhân viên"
                                : "Người dùng"}
                            </p>
                          </td>
                          <td className="border-bottom-0 text-center">
                            <p className="mb-0 fw-normal">{acc.CustomerId}</p>
                          </td>
                          <td className="border-bottom-0">
                            <div className="d-flex gap-3 justify-content-center">
                              <Link
                                to={`/privatesite/accountmanagement/${acc.AccountId}`}
                                state={{ account: acc }}
                                className="btn btn-primary btn-sm"
                              >
                                Chi tiết
                              </Link>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(acc.AccountId)}
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

export default AccountManagement;
