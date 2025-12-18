import { apiSlice } from "../../../../api";

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrder: builder.query({
      providesTags: ["Order"],
      query: (id) => ({
        url: `orders/${id}`,
      }),
      transformResponse: (data) => {
        data.map((order) => {
          order.key = order.id;
        });
        return data;
      },
    }),
    getAddresses: builder.query({
      providesTags: ["Address"],
      query: () => ({
        url: `address/`,
      }),
      transformResponse: (data) => {
        const newData = [];
        data.map((location) => {
          newData.push({
            value: location.uid,
            label: location.title + " - " + location.description,
          });
        });
        return newData;
      },
    }),
    createOrder: builder.mutation({
      invalidatesTags: ["Order"],
      query: (data) => ({
        url: "orders/", // Ensure the URL has a trailing slash
        method: "POST",
        body: { ...data },
      }),
    }),
  }),
});

export const {
  useGetOrderQuery,
  useGetAddressesQuery,
  useCreateOrderMutation,
} = orderApi;
