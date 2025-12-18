import { apiSlice } from "../../../api";

export const orderTableApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      providesTags: ["Order"],
      query: () => ({
        url: "orders/",
      }),
      transformResponse: (data) => {
        data.map((order) => {
          order.key = order.id;
        });
        return data;
      },
    }),
    createOrder: builder.mutation({
      invalidatesTags: ["Order"],
      query: (data) => ({
        url: "orders/",
        method: "POST",
        body: { ...data },
      }),
    }),
    changeActive: builder.mutation({
      invalidatesTags: ["Order"],
      query: ({ id, activated }) => ({
        url: `orders/${id}/`,
        method: "PATCH",
        body: { activated },
      }),
    }),
  }),
});

export const { useGetOrdersQuery, useChangeActiveMutation } = orderTableApi;
