import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage.jsx";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import { ROUTES } from "./utils/constants";
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path={ROUTES.CHAT}
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />

          {/* Profile Route */}
          <Route
            path={ROUTES.PROFILE}
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          {/* Redirect */}
          <Route
            path={ROUTES.HOME}
            element={<Navigate to={ROUTES.CHAT} replace />}
          />
          <Route path="*" element={<Navigate to={ROUTES.CHAT} replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#16213e",
            color: "#fff",
            border: "1px solid #0f3460",
          },
          success: {
            iconTheme: {
              primary: "#4ecdc4",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#e94560",
              secondary: "#fff",
            },
          },
        }}
      />
    </>
  );
}

export default App;
