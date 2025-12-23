import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";

import { useLoginMutation } from "../services/authApi";
import { selectIsAuthenticated } from "../features/auth/authSlice";

import { ROUTES, APP_NAME } from "../utils/constants";
import "./styles/AuthPage.css";
import { Loader } from "../components/Shared";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || ROUTES.CHAT;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(formData).unwrap();
      toast.success("Login successful!");
      navigate(ROUTES.CHAT);
    } catch (error) {
      toast.error(error.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="branding-icon">
              <RiRobot2Line />
            </div>
            <h1>{APP_NAME}</h1>
            <p>Experience the power of AI conversation</p>
            <div className="branding-features">
              <div className="feature">
                <span>✨</span>
                <p>Powered by Perplexity</p>
              </div>
              <div className="feature">
                <span>💬</span>
                <p>Natural conversations</p>
              </div>
              <div className="feature">
                <span>🔒</span>
                <p>Secure & Private</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">
              Login to continue your conversations
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className={`form-group ${errors.email ? "error" : ""}`}>
                <label htmlFor="email">
                  <FiMail />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className={`form-group ${errors.password ? "error" : ""}`}>
                <label htmlFor="password">
                  <FiLock />
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <Loader size="small" />
                ) : (
                  <>
                    <FiLogIn />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{" "}
              <Link to={ROUTES.REGISTER}>Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
