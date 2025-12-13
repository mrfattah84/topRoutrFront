import { apiSlice } from "./baseApi";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: () => ({
        url: "/orders",
      }),
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "Order" as const, id })),
        {
          type: "Order",
          id: "LIST",
        },
      ],
    }),
  }),
});

export const { useGetOrdersQuery } = orderApiSlice;
