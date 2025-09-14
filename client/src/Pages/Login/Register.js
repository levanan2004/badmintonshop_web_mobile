import React, { useState } from "react";
import { API_CONFIG } from "../../config/api";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "/home";
  }

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstname: "",
    lastname: "",
    email: "",
  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Hàm xử lý đăng ký
  const registerUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Đăng ký thành công:", result);
        localStorage.setItem("token", result.token);
        navigate("/login");
      } else {
        console.log("Lỗi đăng ký:", result.message);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
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
          <div className="register-container">
            <h2>Đăng ký</h2>
            <form id="registerForm" onSubmit={registerUser}>
              <div className="input-group">
                <input
                  type="text"
                  id="regUsername"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="email"
                  id="regEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  id="regPassword"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                />
              </div>
              <div className="input-group">
                <div className="row">
                  <div className="col-md-6 ">
                    <input
                      type="text"
                      id="regLastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      placeholder="Last name"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      id="regFirstname"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      placeholder="First name"
                      required
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="login-btn">
                Đăng ký
              </button>
            </form>
            <div className="register-link">
              <p>
                Đã có tài khoản? Hãy nhấn vào <Link to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
