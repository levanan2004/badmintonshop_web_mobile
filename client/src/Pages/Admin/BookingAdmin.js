import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const statusBadge = (status) => {
  if (status === "Thành công") return "bg-success";
  if (status === "Đang chờ duyệt") return "bg-warning";
  if (status === "Đã hủy") return "bg-danger";
  return "bg-secondary";
};

const BookingAdmin = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredBookings, setFilteredBookings] = useState([]);
  const token = localStorage.getItem("token");

  // Lấy danh sách booking
  useEffect(() => {
    fetch(`${API_CONFIG.SERVER_URL}/privatesite/all-bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        let arr = Array.isArray(data)
          ? data
          : Array.isArray(data.bookings)
          ? data.bookings
          : [];
        setBookings(arr);
        setFilteredBookings(arr);
      })
      .catch(() => {
        setBookings([]);
        setFilteredBookings([]);
      });
  }, [token]);

  // Tìm kiếm theo BookingId
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const filtered = bookings.filter((b) =>
      b.BookingId.toString().includes(search)
    );
    setFilteredBookings(filtered);
  };

  // Duyệt sân
  const handleApprove = async (bookingId) => {
    const res = await fetch(
      `${API_CONFIG.SERVER_URL}/privatesite/approve-booking/${bookingId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    if (res.ok) {
      setBookings((bookings) =>
        bookings.map((b) =>
          b.BookingId === bookingId ? { ...b, Status: "Thành công" } : b
        )
      );
      setFilteredBookings((filteredBookings) =>
        filteredBookings.map((b) =>
          b.BookingId === bookingId ? { ...b, Status: "Thành công" } : b
        )
      );
      Swal.fire("Thành công!", data.message || "Đã duyệt sân!", "success");
    } else {
      Swal.fire("Lỗi", data.message || "Không thể duyệt sân!", "error");
    }
  };

  // Hủy sân
  const handleCancel = async (bookingId) => {
    const res = await fetch(
      `${API_CONFIG.SERVER_URL}/privatesite/cancel-booking/${bookingId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    if (res.ok) {
      setBookings((bookings) =>
        bookings.map((b) =>
          b.BookingId === bookingId ? { ...b, Status: "Đã hủy" } : b
        )
      );
      setFilteredBookings((filteredBookings) =>
        filteredBookings.map((b) =>
          b.BookingId === bookingId ? { ...b, Status: "Đã hủy" } : b
        )
      );
      Swal.fire("Đã hủy!", data.message || "Đã hủy sân!", "success");
    } else {
      Swal.fire("Lỗi", data.message || "Không thể hủy sân!", "error");
    }
  };

  // Thêm hàm xử lý xóa booking
  const handleDelete = async (bookingId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn xóa đặt sân này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    const res = await fetch(
      `${API_CONFIG.SERVER_URL}/privatesite/delete-booking/${bookingId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    if (res.ok) {
      setBookings((bookings) =>
        bookings.filter((b) => b.BookingId !== bookingId)
      );
      setFilteredBookings((filteredBookings) =>
        filteredBookings.filter((b) => b.BookingId !== bookingId)
      );
      Swal.fire(
        "Đã xóa!",
        data.message || "Xóa đặt sân thành công!",
        "success"
      );
    } else {
      Swal.fire("Lỗi", data.message || "Không thể xóa đặt sân!", "error");
    }
  };

  // Sắp xếp theo ngày mới nhất và BookingId giảm dần
  const sortedBookings = Array.isArray(filteredBookings)
    ? filteredBookings.slice().sort((a, b) => {
        if (a.BookingDate !== b.BookingDate) {
          return b.BookingDate.localeCompare(a.BookingDate);
        }
        return b.BookingId - a.BookingId;
      })
    : [];

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <div className="row">
                <div className="col-lg-6 col-md-6">
                  <h5 className="card-title fw-600 mb-4">Danh sách đặt sân</h5>
                </div>
                <div className="col-lg-6 col-md-6">
                  <form id="findBookingForm" onSubmit={handleSearchSubmit}>
                    <div className="searchForm">
                      <input
                        className="form-control"
                        placeholder="Nhập mã đặt sân để tìm kiếm ..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <button type="submit" className="btn btn-default">
                        <i className="ti ti-search"></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-post text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Mã đặt sân</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Khách hàng</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Số điện thoại</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Sân</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Khung giờ</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Ngày</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Trạng thái</h6>
                      </th>
                      <th className="text-center">
                        <h6 className="fw-600 mb-0">Lệnh</h6>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBookings.map((b) => (
                      <tr key={b.BookingId}>
                        <td className="border-bottom-0 text-center">
                          <h6 className="fw-600 mb-0">{b.BookingId}</h6>
                        </td>
                        <td className="border-bottom-0 text-center">
                          <h6 className="fw-600 mb-1">
                            {b.CustomerName || b.CustomerId}
                          </h6>
                        </td>
                        <td className="border-bottom-0 text-center">
                          <h6 className="fw-600 mb-1">{b.Mobile}</h6>
                        </td>
                        <td className="border-bottom-0 text-center">
                          <h6 className="fw-600 mb-1">
                            {b.CourtName || b.CourtId}
                          </h6>
                          <div className="text-muted" style={{ fontSize: 13 }}>
                            {b.BranchName && <span>({b.BranchName})</span>}
                          </div>
                        </td>
                        <td className="border-bottom-0 text-center">
                          <h6 className="fw-600 mb-1">
                            {b.StartTime && b.EndTime
                              ? `${b.StartTime.slice(0, 5)} - ${b.EndTime.slice(
                                  0,
                                  5
                                )}`
                              : b.TimeSlotId}
                          </h6>
                        </td>
                        <td className="border-bottom-0 text-center">
                          <h6 className="fw-600 mb-1">{b.BookingDate}</h6>
                        </td>
                        <td className="border-bottom-0 text-center">
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <span
                              className={`badge rounded-3 fw-600 ${statusBadge(
                                b.Status
                              )}`}
                            >
                              {b.Status}
                            </span>
                          </div>
                        </td>
                        <td className="border-bottom-0 text-center">
                          <div className="d-flex gap-3 justify-content-center">
                            {b.Status === "Đang chờ duyệt" && (
                              <>
                                <button
                                  className="btn btn-success btn-sm rounded-pill px-3"
                                  onClick={() => handleApprove(b.BookingId)}
                                >
                                  Duyệt
                                </button>
                                <button
                                  className="btn btn-danger btn-sm rounded-pill px-3"
                                  onClick={() => handleCancel(b.BookingId)}
                                >
                                  Hủy
                                </button>
                              </>
                            )}
                            <button
                              className="btn btn-outline-danger btn-sm rounded-pill px-3"
                              onClick={() => handleDelete(b.BookingId)}
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
            <div className="card-tools p-5 pt-0 pb-0 m-auto">
              <ul className="pagination pagination-sm" id="pagination"></ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingAdmin;
