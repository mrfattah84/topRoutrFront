import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
console.log(localStorage.getItem("token"));
const baseQuery = fetchBaseQuery({
  baseUrl: "http://172.16.5.12:8008/api/",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    } else if (localStorage.getItem("token")) {
      headers.set("authorization", `Bearer ${localStorage.getItem("token")}`);
    }
    console.log({ ...headers });
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.originalStatus === 403) {
    console.log("sending refresh token");
    // send refresh token to get new access token
    const refreshResult = await baseQuery("/token/refresh", api, extraOptions);

    if (refreshResult?.data) {
      // store the new token
      localStorage.setItem("token", refreshResult.data.access_token);
      localStorage.setItem("user", JSON.stringify(refreshResult.data.user));
      // retry the original query with new access token
      result = await baseQuery(args, api, extraOptions);
    } else if (refreshResult?.error) {
      console.error(refreshResult.error);
      api.dispatch(logOut());
    } else {
      api.dispatch(logOut());
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
  tagTypes: ["Order", "Fleet", "Address", "OrderItem", "Vehicle", "User"],
});
