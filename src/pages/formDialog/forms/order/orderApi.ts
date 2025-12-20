import { apiSlice } from "../../../../api";

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrder: builder.query({
      providesTags: ["Order"],
      query: (id) => ({
        url: `orders/${id}/`,
      }),
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
        body: data,
      }),
    }),
    addAddress: builder.mutation({
      invalidatesTags: ["Address"],
      query: (data) => ({
        url: "address/",
        method: "POST",
        body: data,
      }),
    }),
    getItems: builder.query({
      providesTags: ["OrderItem"],
      query: () => ({
        url: `orderitems/`,
      }),
      transformResponse: (data) => {
        const newData = [];
        data.map((item) => {
          newData.push({
            value: item.id,
            label: item.item_title,
          });
        });
        console.log(newData);
        return newData;
      },
    }),
    addItem: builder.mutation({
      invalidatesTags: ["OrderItem"],
      query: (data) => ({
        url: "orderitems/",
        method: "POST",
        body: data,
      }),
    }),
    updateOrder: builder.mutation({
      query: ({ id, data }) => ({
        url: `/orders/${id}/`,
        method: "PUT", // or 'PATCH'
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),
    deleteOrder: builder.mutation({
      invalidatesTags: ["Order"],
      query: (id) => ({
        url: `orders/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetOrderQuery,
  useGetAddressesQuery,
  useCreateOrderMutation,
  useAddAddressMutation,
  useGetItemsQuery,
  useAddItemMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = orderApi;
