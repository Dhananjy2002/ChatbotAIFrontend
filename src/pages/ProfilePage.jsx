import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiCheck,
  FiAlertCircle,
  FiCamera,
  FiShield,
  FiEdit3,
  FiUpload,
  FiTrash2,
  FiX,
  FiImage,
} from "react-icons/fi";
import {
  useGetMeQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useDeleteAvatarMutation,
  useChangePasswordMutation,
} from "../services/authApi";
import "./styles/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { data: userData, isLoading: isLoadingUser, refetch } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [updateAvatar, { isLoading: isUploadingAvatar }] =
    useUpdateAvatarMutation();
  const [deleteAvatar, { isLoading: isDeletingAvatar }] =
    useDeleteAvatarMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  // Active tab state
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState({ type: "", text: "" });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password visibility states
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Message states
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });

  // Get user data
  const user = userData?.data?.user;

  // Populate form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Get avatar URL
  const getAvatarUrl = () => {
    if (user?.avatar?.url && user.avatar.url !== "default-avatar.png") {
      return user.avatar.url;
    }
    return null;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setAvatarMessage({
        type: "error",
        text: "Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage({
        type: "error",
        text: "File too large. Maximum size is 5MB.",
      });
      return;
    }

    setSelectedFile(file);
    setAvatarMessage({ type: "", text: "" });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setShowAvatarModal(true);
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("avatar", selectedFile);

    try {
      await updateAvatar(formData).unwrap();
      setAvatarMessage({
        type: "success",
        text: "Avatar updated successfully!",
      });
      setShowAvatarModal(false);
      setSelectedFile(null);
      setAvatarPreview(null);
      refetch();
    } catch (error) {
      setAvatarMessage({
        type: "error",
        text: error?.data?.message || "Failed to upload avatar",
      });
    }
  };

  // Handle avatar delete
  const handleAvatarDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your avatar?")) return;

    try {
      await deleteAvatar().unwrap();
      setAvatarMessage({
        type: "success",
        text: "Avatar deleted successfully!",
      });
      refetch();
    } catch (error) {
      setAvatarMessage({
        type: "error",
        text: error?.data?.message || "Failed to delete avatar",
      });
    }
  };

  // Cancel avatar selection
  const cancelAvatarSelection = () => {
    setShowAvatarModal(false);
    setSelectedFile(null);
    setAvatarPreview(null);
    setAvatarMessage({ type: "", text: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    console.log("triggerFileInput called");
    console.log("fileInputRef.current:", fileInputRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log("File input clicked");
    } else {
      console.error("fileInputRef.current is null");
    }
  };

  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileMessage({ type: "", text: "" });
  };

  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordMessage({ type: "", text: "" });
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Validate profile form
  const validateProfileForm = () => {
    if (!profileForm.name.trim()) {
      setProfileMessage({ type: "error", text: "Name is required" });
      return false;
    }
    if (!profileForm.email.trim()) {
      setProfileMessage({ type: "error", text: "Email is required" });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileForm.email)) {
      setProfileMessage({ type: "error", text: "Please enter a valid email" });
      return false;
    }
    return true;
  };

  // Validate password form
  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
      setPasswordMessage({
        type: "error",
        text: "Current password is required",
      });
      return false;
    }
    if (!passwordForm.newPassword) {
      setPasswordMessage({ type: "error", text: "New password is required" });
      return false;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 6 characters",
      });
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match" });
      return false;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordMessage({
        type: "error",
        text: "New password must be different from current password",
      });
      return false;
    }
    return true;
  };

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    try {
      await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
      }).unwrap();
      setProfileMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
      refetch();
    } catch (error) {
      setProfileMessage({
        type: "error",
        text: error?.data?.message || "Failed to update profile",
      });
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();
      setPasswordMessage({
        type: "success",
        text: "Password changed successfully!",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: error?.data?.message || "Failed to change password",
      });
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { label: "Very Weak", color: "#ef4444" },
      { label: "Weak", color: "#f97316" },
      { label: "Fair", color: "#eab308" },
      { label: "Good", color: "#22c55e" },
      { label: "Strong", color: "#10b981" },
    ];

    return {
      strength: (strength / 5) * 100,
      ...(levels[Math.min(strength - 1, 4)] || { label: "", color: "" }),
    };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);
  const avatarUrl = getAvatarUrl();

  if (isLoadingUser) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        style={{ display: "none" }}
        id="avatar-upload-input"
      />

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="avatar-modal-overlay" onClick={cancelAvatarSelection}>
          <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="avatar-modal-header">
              <h3>Update Profile Picture</h3>
              <button
                className="modal-close-btn"
                onClick={cancelAvatarSelection}
              >
                <FiX />
              </button>
            </div>

            <div className="avatar-modal-content">
              <div className="avatar-preview-container">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="avatar-preview-image"
                  />
                ) : (
                  <div className="avatar-preview-placeholder">
                    <FiImage />
                  </div>
                )}
              </div>

              {avatarMessage.text && (
                <div className={`message ${avatarMessage.type}`}>
                  {avatarMessage.type === "success" ? (
                    <FiCheck />
                  ) : (
                    <FiAlertCircle />
                  )}
                  <span>{avatarMessage.text}</span>
                </div>
              )}

              <div className="avatar-modal-info">
                <p>
                  <strong>File:</strong> {selectedFile?.name}
                </p>
                <p>
                  <strong>Size:</strong>{" "}
                  {(selectedFile?.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            <div className="avatar-modal-actions">
              <button
                className="btn-secondary"
                onClick={cancelAvatarSelection}
                disabled={isUploadingAvatar}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAvatarUpload}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <>
                    <span className="btn-spinner"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <FiArrowLeft />
        <span>Back</span>
      </button>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-large">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name}
                  className="avatar-image"
                />
              ) : (
                <span className="avatar-initial">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>

            {/* Avatar Action Buttons */}
            <div className="avatar-actions">
              <button
                className="avatar-action-btn upload-btn"
                title="Upload new avatar"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                type="button"
              >
                <FiCamera />
              </button>
              {avatarUrl && (
                <button
                  className="avatar-action-btn delete-btn"
                  title="Delete avatar"
                  onClick={handleAvatarDelete}
                  disabled={isDeletingAvatar}
                >
                  {isDeletingAvatar ? (
                    <span className="btn-spinner-small"></span>
                  ) : (
                    <FiTrash2 />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Avatar message outside the wrapper */}
          {avatarMessage.text && !showAvatarModal && (
            <div className={`avatar-message ${avatarMessage.type}`}>
              {avatarMessage.type === "success" ? (
                <FiCheck />
              ) : (
                <FiAlertCircle />
              )}
              <span>{avatarMessage.text}</span>
            </div>
          )}

          <div className="profile-header-info">
            <h1>{user?.name || "User"}</h1>
            <p>{user?.email || ""}</p>
            <span className="member-since">
              Member since{" "}
              {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  year: "numeric",
                }
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <FiEdit3 />
          <span>Edit Profile</span>
        </button>
        <button
          className={`profile-tab ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <FiShield />
          <span>Security</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="profile-section">
            <div className="section-header">
              <h2>
                <FiUser />
                Personal Information
              </h2>
              <p>Update your personal details here</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="profile-form">
              {profileMessage.text && (
                <div className={`message ${profileMessage.type}`}>
                  {profileMessage.type === "success" ? (
                    <FiCheck />
                  ) : (
                    <FiAlertCircle />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name">
                  <FiUser />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <FiMail />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <>
                    <span className="btn-spinner"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiCheck />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="profile-section">
            <div className="section-header">
              <h2>
                <FiLock />
                Change Password
              </h2>
              <p>Ensure your account stays secure by using a strong password</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="profile-form">
              {passwordMessage.text && (
                <div className={`message ${passwordMessage.type}`}>
                  {passwordMessage.type === "success" ? (
                    <FiCheck />
                  ) : (
                    <FiAlertCircle />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="currentPassword">
                  <FiLock />
                  Current Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">
                  <FiLock />
                  New Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {passwordForm.newPassword && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${passwordStrength.strength}%`,
                          backgroundColor: passwordStrength.color,
                        }}
                      />
                    </div>
                    <span style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <FiLock />
                  Confirm New Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {passwordForm.confirmPassword && passwordForm.newPassword && (
                  <div
                    className={`password-match ${
                      passwordForm.newPassword === passwordForm.confirmPassword
                        ? "match"
                        : "no-match"
                    }`}
                  >
                    {passwordForm.newPassword ===
                    passwordForm.confirmPassword ? (
                      <>
                        <FiCheck /> Passwords match
                      </>
                    ) : (
                      <>
                        <FiAlertCircle /> Passwords do not match
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="password-requirements">
                <h4>Password Requirements:</h4>
                <ul>
                  <li
                    className={
                      passwordForm.newPassword.length >= 6 ? "met" : ""
                    }
                  >
                    At least 6 characters
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(passwordForm.newPassword) ? "met" : ""
                    }
                  >
                    One uppercase letter
                  </li>
                  <li
                    className={
                      /[0-9]/.test(passwordForm.newPassword) ? "met" : ""
                    }
                  >
                    One number
                  </li>
                  <li
                    className={
                      /[^A-Za-z0-9]/.test(passwordForm.newPassword) ? "met" : ""
                    }
                  >
                    One special character
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <span className="btn-spinner"></span>
                    Changing Password...
                  </>
                ) : (
                  <>
                    <FiShield />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
