import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { API_CONFIG } from "../config/api";
const { checkAccount } = require("../Pages/Common");

const UserProfile = ({ onPasswordChange }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }
  const [accountInformation, setAccountInformation] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [tab, setTab] = useState("info");
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập!");
      window.location.href = "/login";
      return;
    }
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.PROFILE_USER, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401 || response.status === 403) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      const data = await response.json();
      const user = data.user || data;
      setAccountInformation({
        username: user.username || user.Username || "",
        email: user.email || user.Email || "",
        mobile: user.mobile || user.Mobile || "",
        lastname: user.lastname || user.Lastname || "",
        firstname: user.firstname || user.Firstname || "",
        address: user.address || user.Address || "",
        gender: user.gender || user.Gender || "",
        userId: user.userId || user.UserId || "",
      });
      if (!response.ok) {
        checkAccount(response);
        throw new Error("Không thể lấy thông tin người dùng");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

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
      const response = await fetch(API_CONFIG.ENDPOINTS.UPDATE_PROFILE_USER, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        const data = await response.json();
        if (
          data.token &&
          typeof data.token === "string" &&
          data.token.trim() !== ""
        ) {
          localStorage.setItem("token", data.token);
        }
        if (data.user) {
          setAccountInformation((prev) => ({
            ...prev,
            ...data.user,
          }));
        } else {
          setAccountInformation((prev) => ({
            ...prev,
            ...data,
          }));
        }
        Swal.fire("Thành công!", "Cập nhật thông tin thành công.", "success");
      } else {
        Swal.fire(
          "Thất bại!",
          "Có lỗi xảy ra khi cập nhật thông tin.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire("Lỗi", "Có lỗi xảy ra", "error");
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      Swal.fire(
        "Lỗi",
        "Mật khẩu mới và xác nhận mật khẩu không khớp.",
        "error"
      );
      return;
    }
    const data = {
      oldPassword: currentPassword,
      newPassword: newPassword,
    };
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD_USER, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        await response.json();
        Swal.fire(
          "Thành công!",
          "Mật khẩu đã được thay đổi thành công.",
          "success"
        );
      } else {
        const error = await response.json();
        Swal.fire(
          "Thất bại!",
          error.error || "Có lỗi xảy ra khi thay đổi mật khẩu.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error changing password:", error);
      Swal.fire("Lỗi", "Có lỗi xảy ra khi thay đổi mật khẩu", "error");
    }
  };

  const fetchOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert(
        "Bạn chưa đăng nhập! Vui lòng đăng nhập để xem thông tin đơn hàng."
      );
      return;
    }
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.ORDER_USER, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 403) {
          alert("Bạn không có quyền truy cập. Vui lòng đăng nhập lại.");
        } else if (response.status === 404) {
          alert("Không tìm thấy đơn hàng nào cho tài khoản này.");
        } else {
          alert("Đã xảy ra lỗi khi lấy thông tin đơn hàng.");
        }
        return;
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.BOOKING_HISTORY, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching booking history:", error);
    }
  };

  const handleCancelBooking = async (bookingIds) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const confirm = window.confirm("Bạn có chắc muốn hủy đặt sân này?");
      if (!confirm) return;
      const response = await fetch(API_CONFIG.ENDPOINTS.BOOKING_CANCEL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingIds }),
      });
      if (response.ok) {
        Swal.fire("Thành công!", "Đã hủy đặt sân.", "success");
        fetchBookings(); // Refresh lại danh sách
      } else {
        Swal.fire("Thất bại!", "Không thể hủy đặt sân.", "error");
      }
    } catch (error) {
      Swal.fire("Lỗi", "Có lỗi xảy ra khi hủy đặt sân.", "error");
    }
  };

  useEffect(() => {
    if (tab === "info") fetchUserData();
    if (tab === "orders") fetchOrder();
    if (tab === "bookings") fetchBookings();
  }, [tab]);

  // Hàm gom các booking cùng ngày, cùng sân, cùng trạng thái, cùng chi nhánh
  function groupBookings(bookings) {
    const groups = [];
    bookings.forEach((b) => {
      const key = `${b.BookingDate}-${b.CourtId}-${b.BranchId}-${b.Status}`;
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = {
          key,
          BookingDate: b.BookingDate,
          CourtId: b.CourtId,
          BranchId: b.BranchId,
          BranchName: b.BranchName, // Thêm BranchName vào group
          Status: b.Status,
          BookingIds: [],
          TimeSlotIds: [],
        };
        groups.push(group);
      }
      group.BookingIds.push(b.BookingId);
      group.TimeSlotIds.push(b.TimeSlotId);
    });
    groups.forEach((g) => g.TimeSlotIds.sort((a, b) => a - b));
    return groups;
  }

  // Nếu bạn có danh sách timeSlotList để map id sang giờ, ví dụ:
  const timeSlotList = [
    { id: 1, label: "7-8" },
    { id: 2, label: "8-9" },
    { id: 3, label: "9-10" },
    { id: 4, label: "10-11" },
    { id: 5, label: "11-12" },
    { id: 6, label: "12-13" },
    { id: 7, label: "13-14" },
    { id: 8, label: "14-15" },
    { id: 9, label: "15-16" },
    { id: 10, label: "16-17" },
    { id: 11, label: "17-18" },
    { id: 12, label: "18-19" },
    { id: 13, label: "19-20" },
    { id: 14, label: "20-21" },
    { id: 15, label: "21-22" },
    { id: 16, label: "22-23" },
    { id: 17, label: "22-23" },
    { id: 18, label: "22-23" },
    { id: 19, label: "22-23" },
    { id: 20, label: "22-23" },
  ];
  function getTimeLabel(minId, maxId) {
    const start =
      timeSlotList.find((t) => t.id === minId)?.label?.split("-")[0] || minId;
    const end =
      timeSlotList.find((t) => t.id === maxId)?.label?.split("-")[1] || maxId;
    return `${start}-${end}`;
  }

  return (
    <div className="user-profile-container">
      <h1 className="user-profile-title">Thông tin tài khoản cá nhân</h1>
      <div className="user-profile-flex">
        {/* Sidebar */}
        <div className="user-profile-sidebar">
          <div className="user-profile-avatar-card">
            <img
              src="/Images/user2.png"
              alt="avatar"
              className="user-profile-avatar"
            />
            <div className="user-profile-group">
              <b>Nhóm tài khoản:</b> Người dùng
            </div>
          </div>
        </div>
        {/* Main content */}
        <div className="user-profile-main">
          <div className="user-profile-card">
            {/* Tabs */}
            <div className="user-profile-tabs">
              <button
                className={
                  tab === "info" ? "profile-tab active" : "profile-tab"
                }
                onClick={() => setTab("info")}
              >
                Thông tin
              </button>
              <button
                className={
                  tab === "password" ? "profile-tab active" : "profile-tab"
                }
                onClick={() => setTab("password")}
              >
                Đổi mật khẩu
              </button>
              <button
                className={
                  tab === "orders" ? "profile-tab active" : "profile-tab"
                }
                onClick={() => setTab("orders")}
              >
                Lịch sử đơn hàng
              </button>
              <button
                className={
                  tab === "bookings" ? "profile-tab active" : "profile-tab"
                }
                onClick={() => setTab("bookings")}
              >
                Lịch sử đặt sân
              </button>
            </div>
            {/* Tab content */}
            <div className="user-profile-tab-content">
              {tab === "info" && !accountInformation && (
                <div className="user-profile-container">
                  Đang tải thông tin...
                </div>
              )}
              {tab === "info" && accountInformation && (
                <form className="user-profile-form">
                  {/* các input chỉnh sửa */}
                  <div className="profile-field">
                    <label>Tên đăng nhập</label>
                    <input
                      value={accountInformation?.username}
                      disabled
                      className="profile-input disabled"
                    />
                  </div>
                  <div className="profile-field">
                    <label>Email</label>
                    <input
                      value={accountInformation?.email}
                      disabled
                      className="profile-input disabled"
                    />
                  </div>
                  <div className="profile-field">
                    <label>Số điện thoại</label>
                    <input
                      value={accountInformation?.mobile}
                      onChange={(e) =>
                        setAccountInformation({
                          ...accountInformation,
                          mobile: e.target.value,
                        })
                      }
                      className="profile-input"
                    />
                  </div>
                  <div className="profile-field">
                    <label>Họ</label>
                    <input
                      value={accountInformation?.lastname}
                      onChange={(e) =>
                        setAccountInformation({
                          ...accountInformation,
                          lastname: e.target.value,
                        })
                      }
                      className="profile-input"
                    />
                  </div>
                  <div className="profile-field">
                    <label>Tên</label>
                    <input
                      value={accountInformation?.firstname}
                      onChange={(e) =>
                        setAccountInformation({
                          ...accountInformation,
                          firstname: e.target.value,
                        })
                      }
                      className="profile-input"
                    />
                  </div>
                  <div className="profile-field">
                    <label>Địa chỉ</label>
                    <input
                      value={accountInformation?.address}
                      onChange={(e) =>
                        setAccountInformation({
                          ...accountInformation,
                          address: e.target.value,
                        })
                      }
                      className="profile-input"
                    />
                  </div>
                  <div className="profile-field">
                    <label>Giới tính</label>
                    <select
                      value={accountInformation?.gender || ""}
                      onChange={(e) =>
                        setAccountInformation({
                          ...accountInformation,
                          gender: e.target.value,
                        })
                      }
                      className="profile-input"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    className="profile-save-btn"
                    onClick={handleProfileUpdate}
                  >
                    LƯU
                  </button>
                </form>
              )}
              {tab === "password" && (
                <form className="user-profile-form password-form">
                  <div className="profile-field">
                    <label>Mật khẩu cũ</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="profile-input"
                    />
                  </div>
                  <div className="profile-field">
                    <label>Mật khẩu mới</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="profile-input"
                    />
                  </div>
                  <div className="profile-field">
                    <label>Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="profile-input"
                    />
                  </div>
                  <button
                    type="button"
                    className="profile-save-btn"
                    onClick={handlePasswordChange}
                  >
                    LƯU
                  </button>
                </form>
              )}
              {tab === "orders" && (
                <div>
                  <table className="profile-orders-table">
                    <thead>
                      <tr>
                        <th>Mã đơn hàng</th>
                        <th>Ngày đặt</th>
                        <th>Giá tiền</th>
                        <th>Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: "center" }}>
                            Không có đơn hàng nào.
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.OrderId}>
                            <td>{order.OrderId}</td>
                            <td>
                              {order.CreateAt
                                ? new Date(order.CreateAt).toLocaleDateString()
                                : ""}
                            </td>
                            <td>{order.TotalPrice?.toLocaleString()} đ</td>
                            <td>
                              <Link to={`/order/${order.OrderId}`}>
                                <button className="profile-detail-btn">
                                  Chi tiết
                                </button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {tab === "bookings" && (
                <div>
                  <table className="profile-orders-table">
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Chi nhánh</th>
                        <th>Sân</th>
                        <th>Khung giờ</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center" }}>
                            Không có lịch sử đặt sân.
                          </td>
                        </tr>
                      ) : (
                        groupBookings(bookings).map((g, idx) => {
                          const min = Math.min(...g.TimeSlotIds);
                          const max = Math.max(...g.TimeSlotIds);
                          const timeLabel = getTimeLabel(min, max);
                          // Chỉ cho hủy nếu trạng thái chưa hủy
                          const canCancel = ![
                            "Đã hủy",
                            "User hủy sân",
                            "Thành công",
                          ].includes(g.Status);
                          return (
                            <tr key={idx}>
                              <td>{g.BookingDate}</td>
                              <td>{g.BranchName || g.BranchId}</td>
                              <td>{g.CourtId}</td>
                              <td>{timeLabel}</td>
                              <td>{g.Status}</td>
                              <td>
                                {canCancel && (
                                  <button
                                    className="profile-detail-btn"
                                    onClick={() =>
                                      handleCancelBooking(g.BookingIds)
                                    }
                                  >
                                    Hủy
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserProfile;
