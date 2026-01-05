import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const baseQuery = fetchBaseQuery({
  baseUrl: "http://172.16.5.12:8008/api/",
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    console.log({ ...headers });
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    console.log("sending refresh token");
    const refreshToken = localStorage.getItem("refresh");
    // send refresh token to get new access token
    const refreshResult = await baseQuery(
      {
        url: "/token/refresh/",
        method: "POST",
        body: { refresh: refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      // store the new token
      localStorage.setItem("token", refreshResult.data.access_token);
      localStorage.setItem("refresh", refreshResult.data.refresh_token);
      // retry the original query with new access token
      result = await baseQuery(args, api, extraOptions);
    } else if (refreshResult?.error) {
      console.error(refreshResult.error);
      localStorage.clear();
    } else {
      localStorage.clear();
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
  tagTypes: ["Order", "Fleet", "Address", "OrderItem", "Vehicle", "User"],
});
