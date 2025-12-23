import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../../services/authApi";

// Helper to get data from localStorage
const getStoredAuth = () => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return {
      token: token || null,
      user: user ? JSON.parse(user) : null,
      isAuthenticated: !!token,
    };
  } catch {
    return {
      token: null,
      user: null,
      isAuthenticated: false,
    };
  }
};

const initialState = getStoredAuth();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    // Handle successful login
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.data.user;
        state.token = payload.data.token;
        state.isAuthenticated = true;
        localStorage.setItem("token", payload.data.token);
        localStorage.setItem("user", JSON.stringify(payload.data.user));
      }
    );

    // Handle successful registration
    builder.addMatcher(
      authApi.endpoints.register.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.data.user;
        state.token = payload.data.token;
        state.isAuthenticated = true;
        localStorage.setItem("token", payload.data.token);
        localStorage.setItem("user", JSON.stringify(payload.data.user));
      }
    );

    // Handle successful profile update
    builder.addMatcher(
      authApi.endpoints.updateProfile.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.data.user;
        localStorage.setItem("user", JSON.stringify(payload.data.user));
      }
    );
  },
});

export const { logout, setCredentials, updateUser } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token;

export default authSlice.reducer;
