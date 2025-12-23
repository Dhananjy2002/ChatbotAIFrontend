import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiLogOut, FiSettings, FiChevronDown } from "react-icons/fi";
import {
  selectIsSidebarOpen,
  toggleSidebar,
} from "../../features/chat/chatSlice";
import useAuth from "../../hooks/useAuth";
import { APP_NAME, ROUTES } from "../../utils/constants";
import "./Layout.css";

const Layout = ({ children, sidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isSidebarOpen = useSelector(selectIsSidebarOpen);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleProfileClick = () => {
    navigate(ROUTES.PROFILE);
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if user has a valid avatar URL
  const hasAvatar =
    user?.avatar?.url &&
    user.avatar.url !== "default-avatar.png" &&
    user.avatar.url.startsWith("http");

  // Get user initials
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(
        0
      )}`.toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  };

  return (
    <div className="layout">
      {/* Header */}
      <header className="layout-header">
        <div className="header-left">
          <button
            className="menu-btn"
            onClick={handleToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FiMenu />
          </button>
          <h1 className="app-title">{APP_NAME}</h1>
          <span className="powered-by">Powered by Perplexity</span>
        </div>

        <div className="header-right">
          {/* User Dropdown */}
          <div className="user-dropdown" ref={dropdownRef}>
            <button
              className="user-dropdown-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="User menu"
            >
              <div className="user-avatar">
                {hasAvatar ? (
                  <img
                    src={user.avatar.url}
                    alt={user?.name || "User"}
                    className="avatar-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <span
                  className="avatar-fallback"
                  style={{ display: hasAvatar ? "none" : "flex" }}
                >
                  {getUserInitials()}
                </span>
              </div>
              <span className="user-name">{user?.name || "User"}</span>
              <FiChevronDown
                className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-user-avatar">
                    {hasAvatar ? (
                      <img
                        src={user.avatar.url}
                        alt={user?.name || "User"}
                        className="avatar-img"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span
                      className="avatar-fallback"
                      style={{ display: hasAvatar ? "none" : "flex" }}
                    >
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-user-name">
                      {user?.name || "User"}
                    </span>
                    <span className="dropdown-user-email">
                      {user?.email || ""}
                    </span>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={handleProfileClick}>
                  <FiSettings />
                  <span>Profile Settings</span>
                </button>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="layout-body">
        {/* Sidebar */}
        <aside
          className={`layout-sidebar ${isSidebarOpen ? "open" : "closed"}`}
        >
          {sidebar}
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={handleToggleSidebar} />
        )}

        {/* Main Content Area */}
        <main className="layout-main">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
