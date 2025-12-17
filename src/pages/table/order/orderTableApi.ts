import { apiSlice } from "../../../api";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      providesTags: ["Order"],
      query: () => ({
        url: "/orders",
      }),
    }),
  }),
});

export const { useGetOrdersQuery } = orderApiSlice;
