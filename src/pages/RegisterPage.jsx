// src/pages/RegisterPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiLock,
  FiUserPlus,
  FiEye,
  FiEyeOff,
  FiCamera,
  FiX,
  FiImage,
} from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";

import { useRegisterMutation } from "../services/authApi";
import { selectIsAuthenticated } from "../features/auth/authSlice";

import { ROUTES, APP_NAME } from "../utils/constants";
import "./styles/AuthPage.css";
import { Loader } from "../components/Shared";

// Allowed file types and max size
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const RegisterPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  // Avatar state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Password visibility states
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  const [register, { isLoading }] = useRegisterMutation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.CHAT, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFile = (file) => {
    if (!file) return true;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(
        "Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed."
      );
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 5MB.");
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setAvatarFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  // Remove selected avatar
  const removeAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Create FormData for multipart/form-data submission
      const submitData = new FormData();
      submitData.append("name", formData.name.trim());
      submitData.append("email", formData.email.toLowerCase().trim());
      submitData.append("password", formData.password);

      // Append avatar if selected
      if (avatarFile) {
        submitData.append("avatar", avatarFile);
      }

      await register(submitData).unwrap();

      toast.success("Registration successful! Welcome aboard! 🎉");
      navigate(ROUTES.CHAT);
    } catch (error) {
      toast.error(
        error.data?.message || "Registration failed. Please try again."
      );
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
            <p>Join us and start chatting with AI</p>
            <div className="branding-features">
              <div className="feature">
                <span>🚀</span>
                <p>Free to get started</p>
              </div>
              <div className="feature">
                <span>💡</span>
                <p>Powered by Perplexity</p>
              </div>
              <div className="feature">
                <span>📱</span>
                <p>Access from anywhere</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <h2>Create Account</h2>
            <p className="auth-subtitle">Start your AI journey today</p>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Avatar Upload Section */}
              <div className="avatar-upload-section">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  style={{ display: "none" }}
                  disabled={isLoading}
                />

                <div
                  className={`avatar-upload-area ${
                    isDragging ? "dragging" : ""
                  } ${avatarPreview ? "has-preview" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={!avatarPreview ? triggerFileInput : undefined}
                >
                  {avatarPreview ? (
                    <div className="avatar-preview-wrapper">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="avatar-preview-image"
                      />
                      <div className="avatar-preview-overlay">
                        <button
                          type="button"
                          className="avatar-change-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerFileInput();
                          }}
                          disabled={isLoading}
                          title="Change photo"
                        >
                          <FiCamera />
                        </button>
                        <button
                          type="button"
                          className="avatar-remove-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAvatar();
                          }}
                          disabled={isLoading}
                          title="Remove photo"
                        >
                          <FiX />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="avatar-upload-placeholder">
                      <div className="avatar-upload-icon">
                        <FiCamera />
                      </div>
                      <span className="avatar-upload-text">Add Photo</span>
                      <span className="avatar-upload-hint">
                        Click or drag & drop
                      </span>
                    </div>
                  )}
                </div>

                {/* File info */}
                {avatarFile && (
                  <div className="avatar-file-info">
                    <FiImage />
                    <span className="file-name">{avatarFile.name}</span>
                    <span className="file-size">
                      ({formatFileSize(avatarFile.size)})
                    </span>
                  </div>
                )}

                <p className="avatar-upload-note">
                  Optional • Max 5MB • JPEG, PNG, GIF, WEBP
                </p>
              </div>

              {/* Name Field */}
              <div className={`form-group ${errors.name ? "error" : ""}`}>
                <label htmlFor="name">
                  <FiUser />
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  disabled={isLoading}
                  maxLength={50}
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              {/* Email Field */}
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

              {/* Password Field */}
              <div className={`form-group ${errors.password ? "error" : ""}`}>
                <label htmlFor="password">
                  <FiLock />
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.password ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("password")}
                    disabled={isLoading}
                    aria-label={
                      showPasswords.password ? "Hide password" : "Show password"
                    }
                  >
                    {showPasswords.password ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              {/* Confirm Password Field */}
              <div
                className={`form-group ${
                  errors.confirmPassword ? "error" : ""
                }`}
              >
                <label htmlFor="confirmPassword">
                  <FiLock />
                  Confirm Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    disabled={isLoading}
                    aria-label={
                      showPasswords.confirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPasswords.confirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <Loader size="small" />
                ) : (
                  <>
                    <FiUserPlus />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to={ROUTES.LOGIN}>Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
