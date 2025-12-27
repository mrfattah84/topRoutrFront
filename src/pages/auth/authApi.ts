// src/store/api/authApi.ts
import { apiSlice } from "../../api";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface LoginRequest {
  email: string;
  password: string;
  phone?: string;
  otp?: string;
}

interface SignUpRequest {
  email: string;
  password: string;
  phone: string;
  role: string;
  first_name: string;
  last_name: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  role: string;
}

interface User {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
  image: string | null;
  national_code: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
}

interface OtpResponce {
  message: string;
  phone: string;
  email: string;
  sent_to: string;
}

// Helper function to transform errors consistently
const transformError = (response: FetchBaseQueryError): string => {
  // Check if response has a data object with a message
  if (
    response?.data &&
    typeof response.data === "object" &&
    "message" in response.data
  ) {
    return response.data.message as string;
  }

  // Handle specific status codes
  if (response.status === 401) {
    return "Unauthorized. Please check your credentials.";
  }
  if (response.status === 403) {
    return "Access forbidden. You don't have permission to perform this action.";
  }
  if (response.status === 404) {
    return "Resource not found.";
  }
  if (response.status === 429) {
    return "Too many requests. Please try again later.";
  }
  if (response.status === 500) {
    return "Server error. Please try again later.";
  }
  if (response.status === "FETCH_ERROR") {
    return "Network error. Please check your internet connection.";
  }
  if (response.status === "PARSING_ERROR") {
    return "Error processing server response.";
  }
  if (response.status === "TIMEOUT_ERROR") {
    return "Request timed out. Please try again.";
  }

  return "An unexpected error occurred. Please try again.";
};

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "auth/login/",
        method: "POST",
        body: credentials,
      }),
      transformErrorResponse: (response: FetchBaseQueryError): string => {
        if (response.status === 401) {
          return "Invalid email or password";
        }
        return transformError(response);
      },
      onQueryStarted: async (args, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem("accessToken", data.access_token);
          localStorage.setItem("refreshToken", data.refresh_token);
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),
    logout: builder.mutation<void, string>({
      query: (refresh) => ({
        url: "auth/logout/",
        method: "POST",
        body: { refresh },
      }),
      transformErrorResponse: transformError,
      onQueryStarted: async (args, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } finally {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      },
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => "auth/profile/",
      providesTags: ["User"],
      transformErrorResponse: (response: FetchBaseQueryError): string => {
        if (response.status === 401) {
          return "Please log in to view your profile.";
        }
        return transformError(response);
      },
    }),
    otp: builder.mutation<OtpResponce, LoginRequest>({
      query: (credintials) => ({
        url: "auth/request-otp-for-login/",
        method: "POST",
        body: credintials,
      }),
      transformErrorResponse: (response: FetchBaseQueryError): string => {
        if (response.status === 400) {
          return "Invalid email or password.";
        }
        if (response.status === 429) {
          return "Too many OTP requests. Please try again later.";
        }
        return transformError(response);
      },
    }),
    signup: builder.mutation<void, SignUpRequest>({
      query: (credintials) => ({
        url: "auth/signup/",
        method: "POST",
        body: credintials,
      }),
      transformErrorResponse: (response: FetchBaseQueryError): string => {
        if (response.status === 409) {
          return "An account with this email or phone already exists.";
        }
        if (response.status === 400) {
          return "Invalid signup information. Please check your details.";
        }
        return transformError(response);
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useOtpMutation,
  useSignupMutation,
} = authApi;
