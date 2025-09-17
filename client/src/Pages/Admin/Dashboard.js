import React from "react";

const Dashboard = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/Login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src="/Images/AT.png"
        alt="Logo"
        style={{
          maxWidth: "780px",
          width: "100%",
          height: "auto",
        }}
      />
      <div
        style={{
          marginTop: "32px",
          fontSize: "3.2rem",
          fontWeight: "bold",
          letterSpacing: "4px",
          color: "#2563eb",
          textTransform: "uppercase",
          textAlign: "center",
          color: "black",
        }}
      >
        AT BADMINTON
      </div>
    </div>
  );
};
export default Dashboard;

