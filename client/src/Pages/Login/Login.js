import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../../config/api";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import "./Login.css";
const Login = () => {
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "/home";
  }
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [setMessage] = useState("");
  const [error, setError] = useState("");
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const navigate = useNavigate(); // Hook dùng để chuyển hướng
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaValue) {
      setError("Vui lòng xác nhận bạn không phải là người máy.");
      return;
    }
    try {
      // req
      const response = await axios.post(
        API_CONFIG.ENDPOINTS.LOGIN,

        { username, password },
        { withCredentials: true }
      );
      const { data } = response;
      localStorage.setItem("token", data.token);
      setMessage("Đăng nhập thành công");
      const userRole = data.user.idgroup;
      if (data.message === "Đăng nhập thành công") {
        alert("Đăng nhập thành công!");
        if (userRole === 1) {
          window.location.href = "/privatesite/dashboard";
          // navigate("/privatesite/dashboard");
        } else if (userRole === 2) {
          navigate("/home");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };
  return (
    <div id="login_page">
      <div className="container">
        <div className="circle circle1" />
        <div className="circle circle2" />
        <div className="circle circle3" />
        <div className="circle circle4" />
        <div className="form-container">
          <div className="login-container">
            <h2>Đăng nhập</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Tên đăng nhập"
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mật khẩu"
                />
              </div>
              <div style={{ width: "100%", margin: "16px 0" }}>
                <ReCAPTCHA
                  sitekey="6LfKqK4rAAAAAPOFsWIDc8s6hDXZUDr0pzFbplZG"
                  onChange={(value) => setRecaptchaValue(value)}
                  style={{ width: "100%" }}
                />
              </div>
              {error && (
                <div style={{ color: "red", marginBottom: 8, fontWeight: 500 }}>
                  {error}
                </div>
              )}
              <button type="submit" className="login-btn">
                Đăng nhập
              </button>
            </form>
            <div className="register-link">
              <p>
                Bạn chưa có tài khoản? Hãy nhấn vào{" "}
                <a href="/register">Register</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
