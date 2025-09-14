import React, { useEffect, useState } from "react";
import { API_CONFIG } from "../../config/api";

const ProfileAdmin = ({ onPasswordChange }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }
  const [accountInformation, setAccountInformation] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn chưa đăng nhập!");
        return;
      }
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/profile`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Không thể lấy thông tin người dùng");
        }
        const data = await response.json();
        setAccountInformation(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);
  const handleProfileUpdate = async () => {
    const updatedData = {
      userId: accountInformation?.userId,
      lastname: accountInformation?.lastname,
      firstname: accountInformation?.firstname,
      gender: accountInformation?.gender,
      address: accountInformation?.address,
      mobile: accountInformation?.mobile,
    };
    try {
      const response = await fetch(
        `${API_CONFIG.SERVER_URL}/privatesite/updateprofile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setAccountInformation(data);
        localStorage.setItem("token", data.token); // Cập nhật lại phiên
        alert("Cập nhật thông tin thành công");
      } else {
        alert("Có lỗi xảy ra khi cập nhật thông tin");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Có lỗi xảy ra");
    }
  };
  const handlePasswordChange = async () => {
    const data = {
      oldPassword: currentPassword, // Mật khẩu cũ
      newPassword: newPassword, // Mật khẩu mới
    };

    try {
      const response = await fetch(
        `${API_CONFIG.SERVER_URL}/privatesite/profile/changepassword`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Token từ localStorage hoặc session
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert("Mật khẩu đã được thay đổi thành công");
        // Cập nhật lại token nếu cần
        localStorage.setItem("token", result.token);
      } else {
        const error = await response.json();
        alert(error.error); // Hiển thị lỗi nếu có
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Có lỗi xảy ra khi thay đổi mật khẩu");
    }
  };

  if (!accountInformation) {
    return <div>Đang tải thông tin người dùng...</div>;
  }
  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6" style={{ marginTop: "90px" }}>
              <h1>Thông tin tài khoản cá nhân</h1>
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
                      <b>Nhóm tài khoản: </b>quản trị
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
                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link"
                        id="profile-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#profile"
                        type="button"
                        role="tab"
                        aria-controls="profile"
                        aria-selected="false"
                      >
                        Đổi mật khẩu
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
                            value={accountInformation?.username}
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
                            value={accountInformation?.email}
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
                            value={accountInformation?.mobile}
                            onChange={(e) =>
                              setAccountInformation({
                                ...accountInformation,
                                mobile: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="form-group row mb-3">
                        <label className="col-sm-2 col-form-label">Họ</label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            value={accountInformation?.lastname}
                            onChange={(e) =>
                              setAccountInformation({
                                ...accountInformation,
                                lastname: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="form-group row mb-3">
                        <label className="col-sm-2 col-form-label">Tên</label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            value={accountInformation?.firstname}
                            onChange={(e) =>
                              setAccountInformation({
                                ...accountInformation,
                                firstname: e.target.value,
                              })
                            }
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
                            value={accountInformation?.address}
                            onChange={(e) =>
                              setAccountInformation({
                                ...accountInformation,
                                address: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="form-group row mb-3">
                        <label className="col-sm-2 col-form-label">
                          Giới tính
                        </label>
                        <div className="col-sm-10">
                          <select
                            className="form-control"
                            value={accountInformation?.gender || ""}
                            onChange={(e) =>
                              setAccountInformation({
                                ...accountInformation,
                                gender: e.target.value,
                              })
                            }
                          >
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-success"
                        onClick={handleProfileUpdate}
                      >
                        Lưu
                      </button>
                    </div>

                    <div
                      className="tab-pane fade"
                      id="profile"
                      role="tabpanel"
                      aria-labelledby="profile-tab"
                    >
                      <form id="form_changePW">
                        <div className="form-group row mb-3">
                          <label className="col-sm-2 col-form-label">
                            Mật khẩu cũ
                          </label>
                          <div className="col-sm-10">
                            <input
                              type="password"
                              className="form-control"
                              value={currentPassword}
                              onChange={(e) =>
                                setCurrentPassword(e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="form-group row mb-3">
                          <label className="col-sm-2 col-form-label">
                            Mật khẩu mới
                          </label>
                          <div className="col-sm-10">
                            <input
                              type="password"
                              className="form-control"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handlePasswordChange}
                          className="btn btn-warning"
                        >
                          Đổi mật khẩu
                        </button>
                      </form>
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

export default ProfileAdmin;
