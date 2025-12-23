import { apiSlice } from "../../api";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login/",
        method: "POST",
        body: { ...credentials },
      }),
    }),
    signup: builder.mutation({
      invalidatesTags: ["User"],
      query: (data) => ({
        url: "/auth/signup/",
        method: "POST",
        body: { ...data },
      }),
    }),
    otp: builder.mutation({
      query: (data) => ({
        url: "/auth/request-otp-for-login/",
        method: "POST",
        body: { ...data },
      }),
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useOtpMutation } =
  authApiSlice;
