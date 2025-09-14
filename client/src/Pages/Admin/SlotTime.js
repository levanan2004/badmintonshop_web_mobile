import React, { useState, useEffect } from "react";
import Swal from "sweetalert2"; // Thêm dòng này ở đầu file

const SlotTime = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }
  const [slots, setSlots] = useState([]);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [message, setMessage] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
        }
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/slot-times`,
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
        setSlots(Array.isArray(data) ? data : data.slots);
      } catch (error) {
        console.error("Error fetching slot times:", error);
        setMessage("Đã xảy ra lỗi khi tải danh sách khung giờ.");
      }
    };

    fetchSlots();
  }, []);

  const handleEdit = (slot) => {
    setEditingSlotId(slot.TimeSlotId);
    setStartTime(slot.StartTime ? slot.StartTime.slice(0, 5) : "");
    setEndTime(slot.EndTime ? slot.EndTime.slice(0, 5) : "");
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khung giờ này không?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_CONFIG.SERVER_URL}/privatesite/slot-times/${slotId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setSlots(slots.filter((slot) => slot.TimeSlotId !== slotId));
        Swal.fire("Thành công!", "Xóa khung giờ thành công!", "success");
      } else {
        Swal.fire("Thất bại!", "Đã xảy ra lỗi khi xóa khung giờ.", "error");
      }
    } catch (error) {
      console.error("Error deleting slot time:", error);
      Swal.fire("Lỗi", "Đã xảy ra lỗi khi xóa khung giờ.", "error");
    }
  };

  // Hàm chuyển HH:mm thành HH:mm:ss
  const toFullTime = (t) => (t.length === 5 ? t + ":00" : t);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!startTime || !endTime) {
      Swal.fire(
        "Lỗi",
        "Vui lòng nhập đầy đủ giờ bắt đầu và giờ kết thúc!",
        "error"
      );
      return;
    }

    const isDuplicate = slots.some(
      (slot) =>
        slot.StartTime.slice(0, 5) === startTime &&
        slot.EndTime.slice(0, 5) === endTime &&
        (editingSlotId ? slot.TimeSlotId !== editingSlotId : true)
    );
    if (isDuplicate) {
      Swal.fire("Lỗi", "Khung giờ này đã tồn tại!", "error");
      return;
    }

    const payload = {
      StartTime: toFullTime(startTime),
      EndTime: toFullTime(endTime),
    };

    console.log("Payload gửi lên:", payload);

    if (editingSlotId) {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/edit-slot-times/${editingSlotId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
        const text = await response.text();
        console.log("Kết quả trả về:", text);
        if (response.ok) {
          const updatedSlot = JSON.parse(text);
          setSlots(
            slots.map((slot) =>
              slot.TimeSlotId === editingSlotId
                ? updatedSlot.slot || updatedSlot
                : slot
            )
          );
          setEditingSlotId(null);
          setStartTime("");
          setEndTime("");
          Swal.fire("Thành công!", "Cập nhật khung giờ thành công!", "success");
        } else {
          Swal.fire(
            "Thất bại!",
            "Đã xảy ra lỗi khi cập nhật khung giờ.",
            "error"
          );
        }
      } catch (error) {
        console.error("Error updating slot time:", error);
        Swal.fire("Lỗi", "Đã xảy ra lỗi khi cập nhật khung giờ.", "error");
      }
    } else {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/slot-times`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        const text = await response.text();
        console.log("Kết quả trả về:", text);

        if (response.ok) {
          const newSlot = JSON.parse(text);
          setSlots([...slots, newSlot.slot || newSlot]);
          setStartTime("");
          setEndTime("");
          Swal.fire("Thành công!", "Thêm khung giờ thành công!", "success");
        } else {
          Swal.fire("Thất bại!", "Đã xảy ra lỗi khi thêm khung giờ.", "error");
        }
      } catch (error) {
        console.error("Error adding slot time:", error);
        Swal.fire("Lỗi", "Đã xảy ra lỗi khi thêm khung giờ.", "error");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingSlotId(null);
    setStartTime("");
    setEndTime("");
    setMessage("");
  };

  // Hàm tạo mảng giờ tròn 1 tiếng từ 6h đến 22h
  const generateHourOptions = () => {
    const times = [];
    for (let h = 6; h <= 22; h++) {
      const hour = h.toString().padStart(2, "0");
      times.push(`${hour}:00`);
    }
    return times;
  };
  const hourOptions = generateHourOptions();

  return (
    <div className="container-fluid">
      {message && <div className="alert alert-info">{message}</div>}
      <div className="row">
        <div className="col-lg-6 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-600 mb-4">Danh sách khung giờ</h5>
              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Id</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Khung giờ</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Lệnh</h6>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots
                      .slice() // tạo bản sao để không ảnh hưởng state gốc
                      .sort((a, b) => a.StartTime.localeCompare(b.StartTime))
                      .map((slot, idx) => (
                        <tr key={slot.TimeSlotId}>
                          <td className="border-bottom-0 text-center">
                            <h6 className="fw-600 mb-0">{idx + 1}</h6>{" "}
                            {/* Số thứ tự */}
                          </td>
                          <td className="border-bottom-0 text-center">
                            <h6 className="fw-600 mb-1">
                              {slot.StartTime && slot.EndTime
                                ? `${slot.StartTime.slice(
                                    0,
                                    5
                                  )} - ${slot.EndTime.slice(0, 5)}`
                                : ""}
                            </h6>
                          </td>
                          <td className="border-bottom-0 text-center">
                            <div className="d-flex gap-3 justify-content-center">
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(slot.TimeSlotId)}
                              >
                                Xóa
                              </button>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleEdit(slot)}
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
                {editingSlotId ? "Chỉnh sửa khung giờ" : "Thêm khung giờ"}
              </h5>
              <div className="slot-time-form-box">
                <form onSubmit={handleSubmit}>
                  {editingSlotId && (
                    <p style={{ color: "#32a852", marginBottom: 8 }}>
                      Đang sửa mã khung giờ: {editingSlotId}
                    </p>
                  )}
                  <div className="row align-items-end mb-3">
                    <div className="col-6">
                      <label
                        className="form-label fw-600 mb-1"
                        style={{ fontSize: 15 }}
                      >
                        Giờ bắt đầu
                      </label>
                      <select
                        className="form-control"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      >
                        <option value="">Chọn giờ bắt đầu</option>
                        {hourOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label
                        className="form-label fw-600 mb-1"
                        style={{ fontSize: 15 }}
                      >
                        Giờ kết thúc
                      </label>
                      <select
                        className="form-control"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={!startTime}
                      >
                        <option value="">Chọn giờ kết thúc</option>
                        {startTime && (
                          <option
                            value={
                              (parseInt(startTime.slice(0, 2), 10) + 1)
                                .toString()
                                .padStart(2, "0") + ":00"
                            }
                          >
                            {(parseInt(startTime.slice(0, 2), 10) + 1)
                              .toString()
                              .padStart(2, "0") + ":00"}
                          </option>
                        )}
                      </select>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    {editingSlotId && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancelEdit}
                      >
                        Hủy
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary">
                      {editingSlotId ? "Cập nhật" : "Thêm"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SlotTime;
