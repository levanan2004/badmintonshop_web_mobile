import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { API_CONFIG } from "../../config/api";

const DetailAccount = ({ onPasswordChange }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }
  const { state } = useLocation();
  const account = state?.account;
  const { id } = useParams();
  const handleRoleAssignment = async () => {
    try {
      const result = await Swal.fire({
        title: "Chọn quyền cho người dùng",
        input: "select",
        inputOptions: {
          1: "Quản trị viên",
          2: "Người dùng",
          3: "Nhân viên",
        },
        inputPlaceholder: "Chọn quyền",
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/accountmanagement/changegroupaccount/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ GroupId: result.value }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          Swal.fire(
            "Thành công!",
            `Đã gán quyền: ${
              result.value === "1" ? "Quản trị viên" : "Người dùng"
            } cho tài khoản ${account.Username}`,
            "success"
          ).then(() => window.location.reload(true));
        } else {
          Swal.fire(
            "Thất bại!",
            data.message || "Không thể thay đổi quyền, hãy thử lại sau.",
            "error"
          );
        }
      }
    } catch (error) {
      Swal.fire("Lỗi", "Đã xảy ra lỗi: " + error.message, "error");
    }
  };

  if (!account) {
    return <div>Không có thông tin tài khoản.</div>;
  }

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6" style={{ marginTop: "90px" }}>
              <h1>Chi tiết tài khoản người dùng</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="">Dashboard</a>
                </li>
                <li className="breadcrumb-item active">Thông tin</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3">
              <div className="card card-primary card-outline">
                <div className="card-body box-profile">
                  <div className="text-center">
                    <img
                      className="profile-user-img img-fluid img-circle"
                      src="https://st3.depositphotos.com/15648834/17930/v/450/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"
                      alt="User profile picture"
                      style={{ borderRadius: "10%" }}
                    />
                  </div>
                  <h3 className="profile-username text-center">
                    {/* {accountInformation?.LastName} {accountInformation?.FirstName} */}
                  </h3>
                  <ul className="list-group list-group-unbordered mb-3">
                    <li className="list-group-item">
                      <b>Nhóm tài khoản: </b>{" "}
                      {account.IdGroup === 1 ? "quản trị" : "người dùng"}
                      {/* <a className="float-right text-decoration-none c-black">{groupName}</a> */}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-9">
              <div className="card">
                <div className="card-header p-2">
                  <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link active"
                        id="home-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#home"
                        type="button"
                        role="tab"
                        aria-controls="home"
                        aria-selected="true"
                      >
                        Thông tin
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="card-body">
                  <div className="tab-content" id="myTabContent">
                    <div
                      className="tab-pane fade show active"
                      id="home"
                      role="tabpanel"
                      aria-labelledby="home-tab"
                    >
                      <div className="form-group row mb-3">
                        <label className="col-sm-2 col-form-label">
                          Tên đăng nhập
                        </label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            value={account?.Username}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="form-group row mb-3">
                        <label className="col-sm-2 col-form-label">Email</label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            value={account?.Email}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="form-group row mb-3">
                        <label className="col-sm-2 col-form-label">
                          Số điện thoại
                        </label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            value={account?.Mobile}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="form-group row mb-3">
                        <label className="col-sm-2 col-form-label">Họ</label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            value={account?.Lastname}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="form-group row mb-3">
                        <label className="col-sm-2 col-form-label">Tên</label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            value={account?.Firstname}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="form-group row mb-3">
                        <label className="col-sm-2 col-form-label">
                          Địa chỉ
                        </label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            value={account?.Address}
                            disabled
                          />
                        </div>
                      </div>
                      <button
                        className="btn btn-warning"
                        onClick={handleRoleAssignment}
                      >
                        Phân quyền
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DetailAccount;
