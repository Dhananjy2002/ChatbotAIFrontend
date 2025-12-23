// src/services/authApi.js
import { api } from "./api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Register new user (with optional avatar)
    register: builder.mutation({
      query: (formData) => ({
        url: "/auth/register",
        method: "POST",
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary for FormData
        formData: true,
      }),
      invalidatesTags: ["User"],
    }),

    // Login user
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    // Get current user profile
    getMe: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    // Update user profile
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/auth/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Update avatar
    updateAvatar: builder.mutation({
      query: (formData) => ({
        url: "/auth/avatar",
        method: "PUT",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["User"],
    }),

    // Delete avatar
    deleteAvatar: builder.mutation({
      query: () => ({
        url: "/auth/avatar",
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // Change password
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/auth/password",
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useDeleteAvatarMutation,
  useChangePasswordMutation,
} = authApi;
