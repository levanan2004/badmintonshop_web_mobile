import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { API_CONFIG } from "../config/api";
import Swal from "sweetalert2";
import "../Css/Style.css";

export default function BookingCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingSlots = location.state?.bookingSlots;
  const [userInfo, setUserInfo] = useState({
    Firstname: "",
    Lastname: "",
    Mobile: "",
    Email: "",
  });
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Bạn cần đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }
    fetch(`${API_CONFIG.SERVER_URL}/checkout/getcustomer`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => setUserInfo(data))
      .catch(() =>
        Swal.fire("Không thể lấy thông tin khách hàng. Vui lòng thử lại.")
      );
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    // Kiểm tra bắt buộc
    if (
      !userInfo.Firstname ||
      !userInfo.Lastname ||
      !userInfo.Mobile ||
      !userInfo.Email
    ) {
      Swal.fire(
        "Vui lòng nhập đầy đủ họ tên, số điện thoại và email!",
        "",
        "warning"
      );
      return;
    }
    try {
      const res = await fetch(API_CONFIG.ENDPOINTS.BOOKING, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookings: bookingSlots.map((slot) => ({
            courtId: slot.courtId,
            timeSlotId: slot.timeSlotId,
            bookingDate: slot.bookingDate,
          })),
          firstname: userInfo.Firstname,
          lastname: userInfo.Lastname,
          mobile: userInfo.Mobile,
          email: userInfo.Email,
        }),
      });
      // Này dùng Swal để tạo animation thông báo á fen
      const data = await res.json();
      if (res.ok) {
        setBookingResult(data);
        Swal.fire(
          "Thành công!",
          data.message || "Đặt sân thành công!",
          "success"
        );
      } else {
        Swal.fire("Thất bại!", data.message || "Đặt sân thất bại!", "error");
      }
    } catch (err) {
      Swal.fire(
        "Lỗi",
        "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
        "error"
      );
    }
  };

  // Gom nhóm các slot cùng ngày, cùng sân
  const groupedSlots = [];
  bookingSlots.forEach((slot) => {
    const key = `${slot.courtId}-${slot.bookingDate}`;
    let group = groupedSlots.find((g) => g.key === key);
    if (!group) {
      group = {
        key,
        courtId: slot.courtId,
        courtName: slot.courtName,
        bookingDate: slot.bookingDate,
        timeSlots: [],
      };
      groupedSlots.push(group);
    }
    group.timeSlots.push(slot);
  });

  // Sắp xếp các timeSlots trong mỗi group theo timeSlotId tăng dần (nếu cần)
  groupedSlots.forEach((group) => {
    group.timeSlots.sort((a, b) => a.timeSlotId - b.timeSlotId);
  });

  // Gom các booking thành nhóm theo sân và ngày
  function groupBookings(bookings) {
    const groups = [];
    bookings.forEach((b) => {
      const key = `${b.CourtId}-${b.BookingDate}`;
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = {
          key,
          CourtId: b.CourtId,
          BookingDate: b.BookingDate,
          TimeSlotIds: [],
        };
        groups.push(group);
      }
      group.TimeSlotIds.push(b.TimeSlotId);
    });
    // Sắp xếp khung giờ trong mỗi nhóm
    groups.forEach((g) => g.TimeSlotIds.sort((a, b) => a - b));
    return groups;
  }

  if (!bookingSlots || bookingSlots.length === 0) {
    return <div>Không có thông tin đặt sân!</div>;
  }

  return (
    <div className="checkout-wrapper">
      <div className="checkout-grid">
        {/* Thông tin khách hàng */}
        <div className="checkout-info">
          <div className="pd-breadcrumb">
            <Link to="/home" className="pd-breadcrumb-link">
              Đặt sân
            </Link>
            <span className="pd-breadcrumb-sep">-</span>
            <Link to="/bookingcheckout" className="pd-breadcrumb-link">
              Xác nhận
            </Link>
          </div>
          <div className="checkout-section-title">THÔNG TIN KHÁCH HÀNG</div>
          <div className="checkout-row">
            <div className="checkout-field">
              <label>First Name *</label>
              <input
                name="Firstname"
                value={userInfo.Firstname}
                onChange={handleInputChange}
                placeholder="Nhập tên"
              />
            </div>
            <div className="checkout-field">
              <label>Last Name *</label>
              <input
                name="Lastname"
                value={userInfo.Lastname}
                onChange={handleInputChange}
                placeholder="Nhập họ"
              />
            </div>
          </div>
          <div className="checkout-row">
            <div className="checkout-field">
              <label>Phone*</label>
              <input
                name="Mobile"
                value={userInfo.Mobile || ""}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div className="checkout-field">
              <label>Email Address *</label>
              <input
                name="Email"
                value={userInfo.Email}
                onChange={handleInputChange}
                placeholder="Nhập email"
              />
            </div>
          </div>
        </div>
        {/* Đơn đặt sân */}
        <div className="checkout-order">
          <div className="checkout-section-title">THÔNG TIN ĐẶT SÂN</div>
          <table className="booking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Sân</th>
                <th>Ngày</th>
                <th>Khung giờ</th>
                <th>Giá</th>
              </tr>
            </thead>
            <tbody>
              {groupedSlots.map((group, idx) => {
                // Lấy slot đầu và cuối để xác định thời gian bắt đầu/kết thúc
                const firstSlot = group.timeSlots[0];
                const lastSlot = group.timeSlots[group.timeSlots.length - 1];
                // Nếu có startTime/endTime thì dùng, không thì fallback về timeSlotLabel
                const timeLabel =
                  firstSlot.startTime && lastSlot.endTime
                    ? `${firstSlot.startTime.slice(
                        0,
                        5
                      )} - ${lastSlot.endTime.slice(0, 5)}`
                    : firstSlot.timeSlotLabel && lastSlot.timeSlotLabel
                    ? `${firstSlot.timeSlotLabel.split("-")[0]}-${
                        lastSlot.timeSlotLabel.split("-")[1]
                      }`
                    : group.timeSlots
                        .map((s) => s.timeSlotLabel || s.timeSlotId)
                        .join(", ");
                return (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{group.courtName || group.courtId}</td>
                    <td className="booking-date">{group.bookingDate}</td>
                    <td>{timeLabel}</td>
                    <td>
                      {(group.timeSlots.length * 70000).toLocaleString()} VNĐ
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>
                  <b>Tổng tiền</b>
                </td>
                <td>
                  <b>{(bookingSlots.length * 70000).toLocaleString()} VNĐ</b>
                </td>
              </tr>
            </tfoot>
          </table>
          {bookingResult && bookingResult.createdBookings && (
            <div style={{ marginTop: 16 }}>
              <b>Đặt thành công các khung giờ:</b>
              <ul>
                {groupBookings(bookingResult.createdBookings).map((g, idx) => {
                  // Lấy các slot thuộc group này
                  const slots = bookingResult.createdBookings.filter(
                    (b) =>
                      b.CourtId === g.CourtId && b.BookingDate === g.BookingDate
                  );

                  // Tổng số tiếng
                  const totalHours = slots.length;
                  return (
                    <li key={idx}>
                      Sân: {g.CourtId}, Ngày: {g.BookingDate}, Tổng giờ: (
                      {totalHours} tiếng)
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {!bookingResult && (
            <button className="checkout-btn" onClick={handleCheckout}>
              HOÀN TẤT ĐẶT SÂN
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
