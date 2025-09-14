import React, { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const RevenuePage = () => {
  const [monthlyOrders, setMonthlyOrders] = useState(0);
  const [yearlyOrders, setYearlyOrders] = useState(0);
  const [revenueMonthly, setRevenueMonthly] = useState(0);
  const [revenueYear, setRevenueYear] = useState(0);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.SERVER_URL}/privatesite/revenue`
      );
      const data = await response.json();
      setMonthlyOrders(data.CountOrdersMonthly || 0);
      setYearlyOrders(data.CountOrdersYear || 0);
      setRevenueMonthly(data.RevenueMonthly || 0);
      setRevenueYear(data.RevenueYear || 0);
    } catch (error) {
      setMonthlyOrders(0);
      setYearlyOrders(0);
      setRevenueMonthly(0);
      setRevenueYear(0);
      console.error("Error fetching revenue data:", error);
    }
  };

  // Chart data
  const barData = {
    labels: ["Tháng này", "Năm nay"],
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: [revenueMonthly, revenueYear],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const doughnutData = {
    labels: ["Đơn hàng tháng", "Đơn hàng năm"],
    datasets: [
      {
        label: "Số đơn hàng",
        data: [monthlyOrders, yearlyOrders],
        backgroundColor: ["#FFCE56", "#4BC0C0"],
      },
    ],
  };

  return (
    <div
      className="content-wrapper"
      style={{
        minHeight: "100vh",
        padding: "32px 0",
      }}
    >
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-4">
            <div className="col-12 text-center">
              <h2
                style={{ fontWeight: 700, color: "#2563eb", letterSpacing: 1 }}
              >
                THỐNG KÊ DOANH THU
              </h2>
              <p style={{ color: "#333", fontSize: 18 }}>
                Số liệu tổng hợp đơn hàng và doanh thu hệ thống
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          <div className="row mb-4 justify-content-center">
            <div className="col-md-5 mb-3">
              <div
                className="card shadow"
                style={{
                  background: "#e3f0fa",
                  borderRadius: 16,
                  textAlign: "center",
                  padding: "32px 16px",
                }}
              >
                <h4 style={{ color: "#2563eb", fontWeight: 600 }}>Tháng này</h4>
                <div
                  style={{ fontSize: 38, fontWeight: 700, color: "#2563eb" }}
                >
                  {(revenueMonthly ?? 0).toLocaleString()} đ
                </div>
                <div style={{ fontSize: 22, color: "#333", marginTop: 8 }}>
                  <span style={{ color: "#4BC0C0", fontWeight: 600 }}>
                    {monthlyOrders}
                  </span>{" "}
                  đơn hàng
                </div>
              </div>
            </div>
            <div className="col-md-5 mb-3">
              <div
                className="card shadow"
                style={{
                  background: "#f7e9f0",
                  borderRadius: 16,
                  textAlign: "center",
                  padding: "32px 16px",
                }}
              >
                <h4 style={{ color: "#e11d48", fontWeight: 600 }}>Năm nay</h4>
                <div
                  style={{ fontSize: 38, fontWeight: 700, color: "#e11d48" }}
                >
                  {(revenueYear ?? 0).toLocaleString()} đ
                </div>
                <div style={{ fontSize: 22, color: "#333", marginTop: 8 }}>
                  <span style={{ color: "#FFCE56", fontWeight: 600 }}>
                    {yearlyOrders}
                  </span>{" "}
                  đơn hàng
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-4 justify-content-center">
            <div className="col-md-6 mb-4">
              <div className="card shadow" style={{ borderRadius: 16 }}>
                <div className="card-body">
                  <h5 className="card-title fw-600 mb-4 text-center">
                    Biểu đồ doanh thu
                  </h5>
                  <Bar data={barData} />
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card shadow" style={{ borderRadius: 16 }}>
                <div className="card-body">
                  <h5 className="card-title fw-600 mb-4 text-center">
                    Biểu đồ đơn hàng
                  </h5>
                  <Doughnut data={doughnutData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RevenuePage;
