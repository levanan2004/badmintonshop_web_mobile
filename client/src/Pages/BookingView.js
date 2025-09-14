import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../config/api";

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
// XÓA mảng tĩnh timeSlots
// const timeSlots = [...]

function getCurrentWeekDates(startDate = new Date()) {
  const monday = new Date(startDate);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function Booking() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]); // [{dayIdx, timeIdx}]
  const [weekStart, setWeekStart] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]); // [{date, timeSlot}]
  const [timeSlots, setTimeSlots] = useState([]); // <-- Thêm state động cho timeSlots
  const weekDates = getCurrentWeekDates(weekStart);
  const navigate = useNavigate(); // Thêm dòng này
  const [today, setToday] = useState(new Date());

  // Lấy danh sách chi nhánh khi load trang
  useEffect(() => {
    fetch(API_CONFIG.ENDPOINTS.BRANCHES)
      .then((res) => res.json())
      .then((data) => {
        setBranches(data);
        if (data.length > 0) setSelectedBranch(data[0].BranchId);
      })
      .catch(() => setBranches([]));
  }, []);

  // Lấy danh sách khung giờ khi load trang
  useEffect(() => {
    fetch(API_CONFIG.ENDPOINTS.TIMESLOTS)
      .then((res) => res.json())
      .then((data) => setTimeSlots(data))
      .catch(() => setTimeSlots([]));
  }, []);

  // Lấy danh sách sân khi chọn chi nhánh
  useEffect(() => {
    if (selectedBranch) {
      fetch(`${API_CONFIG.ENDPOINTS.COURTS}?branchId=${selectedBranch}`)
        .then((res) => res.json())
        .then((data) => {
          setCourts(data);
          // Nếu có sân, mặc định chọn sân đầu tiên
          if (data.length > 0) setSelectedCourt(data[0].CourtId);
          else setSelectedCourt(null);
        })
        .catch(() => {
          setCourts([]);
          setSelectedCourt(null);
        });
    } else {
      setCourts([]);
      setSelectedCourt(null);
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (!selectedCourt || !selectedBranch) {
      setBookedSlots([]);
      return;
    }
    const weekStartStr = weekDates[0].toISOString().slice(0, 10);
    const weekEndStr = weekDates[6].toISOString().slice(0, 10);
    fetch(
      `${API_CONFIG.ENDPOINTS.BOOKED_SLOTS}?branchId=${selectedBranch}&courtId=${selectedCourt}&weekStart=${weekStartStr}&weekEnd=${weekEndStr}`
    )
      .then((res) => res.json())
      .then((data) => setBookedSlots(data))
      .catch(() => setBookedSlots([]));
  }, [selectedBranch, selectedCourt, weekStart]);

  // Chọn/huỷ chọn khung giờ
  const toggleSlot = (dayIdx, timeIdx) => {
    const key = `${dayIdx}-${timeIdx}`;
    setSelectedSlots((slots) => {
      // Nếu đã chọn thì bỏ chọn (chỉ cho bỏ chọn ở đầu/cuối dải liên tiếp)
      if (slots.some((s) => s.key === key)) {
        // Sắp xếp lại theo timeIdx
        const sorted = [...slots].sort((a, b) => a.timeIdx - b.timeIdx);
        // Nếu là đầu hoặc cuối dải thì cho bỏ, còn lại thì không
        if (sorted[0].key === key || sorted[sorted.length - 1].key === key) {
          return slots.filter((s) => s.key !== key);
        } else {
          alert("Chỉ được bỏ chọn ở đầu hoặc cuối dải khung giờ!");
          return slots;
        }
      } else {
        // Nếu đã chọn 6 slot thì không cho chọn thêm
        if (slots.length >= 6) {
          alert("Bạn chỉ được đặt tối đa 6 khung giờ (6 tiếng) mỗi lần!");
          return slots;
        }
        // Nếu chưa chọn slot nào thì cho chọn
        if (slots.length === 0) return [{ key, dayIdx, timeIdx }];
        // Kiểm tra tất cả slot đã chọn cùng ngày
        if (!slots.every((s) => s.dayIdx === dayIdx)) {
          alert(
            "Bạn chỉ được chọn các khung giờ liên tiếp trong cùng một ngày!"
          );
          return slots;
        }
        // Sắp xếp lại theo timeIdx
        const sorted = [...slots].sort((a, b) => a.timeIdx - b.timeIdx);
        // Nếu chọn tiếp vào trước đầu hoặc sau cuối thì cho chọn, còn lại thì không
        if (
          timeIdx === sorted[0].timeIdx - 1 ||
          timeIdx === sorted[sorted.length - 1].timeIdx + 1
        ) {
          return [...slots, { key, dayIdx, timeIdx }];
        } else {
          alert("Chỉ được chọn các khung giờ liên tiếp!");
          return slots;
        }
      }
    });
  };
  const handleCourtSelect = (courtId) => setSelectedCourt(courtId);

  // Đổi tuần
  const changeWeek = (offset) => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + offset * 7);
    setWeekStart(newStart);
    setSelectedSlots([]); // reset chọn khi đổi tuần
  };

  // Update `today` so the "Hôm nay" badge moves correctly when date changes
  useEffect(() => {
    const tick = () => setToday(new Date());
    const id = setInterval(tick, 60 * 1000); // cập nhật mỗi phút
    return () => clearInterval(id);
  }, []);

  const handleBooking = () => {
    if (!selectedCourt || selectedSlots.length === 0) {
      alert("Vui lòng chọn sân và ít nhất một khung giờ!");
      return;
    }
    // Tạo mảng thông tin từng slot đã chọn
    const bookingSlots = selectedSlots.map(({ dayIdx, timeIdx }) => ({
      branchId: selectedBranch,
      courtId: selectedCourt,
      courtName: courts.find((c) => c.CourtId === selectedCourt)?.CourtName,
      bookingDate: weekDates[dayIdx].toISOString().slice(0, 10),
      timeSlotId: timeSlots[timeIdx]?.TimeSlotId,
      timeSlotLabel: timeSlots[timeIdx]
        ? `${parseInt(
            timeSlots[timeIdx].StartTime.split(":")[0],
            10
          )}-${parseInt(timeSlots[timeIdx].EndTime.split(":")[0], 10)}`
        : "",
    }));
    navigate("/bookingcheckout", { state: { bookingSlots } });
  };

  return (
    <div className="booking-container">
      <h2 className="booking-title">Đặt và chọn địa chỉ sân</h2>
      <div className="booking-branches">
        {branches.map((b) => (
          <button
            key={b.BranchId}
            type="button"
            className={
              selectedBranch === b.BranchId
                ? "branch-btn selected"
                : "branch-btn"
            }
            onClick={() => setSelectedBranch(b.BranchId)}
            style={{
              marginRight: 16,
              padding: "8px 18px",
              borderRadius: 6,
              border:
                selectedBranch === b.BranchId
                  ? "2px solid #007bff"
                  : "1px solid #2c5673",
              background: selectedBranch === b.BranchId ? "#eaf6fb" : "#f5faff",
              color: selectedBranch === b.BranchId ? "#007bff" : "#2c5673",
              fontWeight: selectedBranch === b.BranchId ? "bold" : "normal",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {b.BranchName}
          </button>
        ))}
      </div>
      <div className="booking-courts">
        {courts.map((court) => (
          <div
            key={court.CourtId}
            className={`booking-court${
              selectedCourt === court.CourtId ? " selected" : ""
            }`}
            onClick={() => handleCourtSelect(court.CourtId)}
          >
            <span className="court-number">{court.CourtName}</span>
          </div>
        ))}
      </div>
      <div className="booking-week">
        <button onClick={() => changeWeek(-1)}>Tuần trước</button>
        <span>
          Tuần: {weekDates[0].toLocaleDateString()} -{" "}
          {weekDates[6].toLocaleDateString()}
        </span>
        <button onClick={() => changeWeek(1)}>Tuần sau</button>
      </div>
      <table className="booking-table">
        <thead>
          <tr>
            {days.map((d, i) => {
              const cellDateStr = weekDates[i].toISOString().slice(0, 10);
              const todayStr = today.toISOString().slice(0, 10);
              const isToday = cellDateStr === todayStr;
              return (
                <th key={i} style={{ position: "relative", padding: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      justifyContent: "center",
                    }}
                  >
                    {isToday && (
                      <div
                        title="Hôm nay"
                        aria-label="Hôm nay"
                        style={{
                          background: "#e0f2fe",
                          padding: 6,
                          borderRadius: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        <span role="img" aria-hidden="false">
                          🎯
                        </span>
                      </div>
                    )}
                    <div style={{ fontWeight: 700, marginTop: 4 }}>{d}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>
                      {weekDates[i].toLocaleDateString()}
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {timeSlots
            .slice()
            .sort((a, b) => {
              const aHour = parseInt(a.StartTime.split(":")[0], 10);
              const bHour = parseInt(b.StartTime.split(":")[0], 10);
              return aHour - bHour;
            })
            .map((slot, timeIdx) => {
              const startHour = parseInt(slot.StartTime.split(":")[0], 10);
              const endHour = parseInt(slot.EndTime.split(":")[0], 10);
              return (
                <tr key={slot.TimeSlotId}>
                  {days.map((_, dayIdx) => {
                    const key = `${dayIdx}-${timeIdx}`;
                    const slotDate = weekDates[dayIdx]
                      .toISOString()
                      .slice(0, 10);
                    const isBooked = bookedSlots.some(
                      (b) =>
                        b.CourtId === selectedCourt &&
                        b.BookingDate === slotDate &&
                        b.TimeSlotId === slot.TimeSlotId
                    );
                    const selected = selectedSlots.some((s) => s.key === key);
                    return (
                      <td
                        key={key}
                        className={
                          isBooked ? "booked" : selected ? "selected" : ""
                        }
                        style={{
                          background: isBooked
                            ? "#ccc"
                            : selected
                            ? "linear-gradient(20deg, #5f9bd8 0%, #d9dde2 100%)"
                            : "#fff",
                          color: isBooked ? "#888" : undefined,
                          cursor: isBooked ? "not-allowed" : "pointer",
                        }}
                        onClick={() => {
                          if (!isBooked) toggleSlot(dayIdx, timeIdx);
                        }}
                      >
                        {`${startHour}-${endHour}`}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      </table>
      <div className="booking-confirm">
        <button onClick={handleBooking}>Xác nhận đặt sân</button>
      </div>
    </div>
  );
}

export default Booking;
