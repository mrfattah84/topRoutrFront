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
      transformResponse: (responseData: any[]) => {
        if (!Array.isArray(responseData)) {
          console.error(
            "getAddresses transformResponse expected an array but got:",
            responseData
          );
          return [];
        }
        return responseData.map((location) => ({
          value: location.uid,
          label: `${location.title} - ${location.description}`,
        }));
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
      transformResponse: (responseData: any[]) => {
        if (!Array.isArray(responseData)) {
          console.error(
            "getItems transformResponse expected an array but got:",
            responseData
          );
          return [];
        }
        return responseData.map((item) => ({
          value: item.id,
          label: item.item_title,
        }));
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
    getFleetsOptions: builder.query({
      providesTags: ["Fleet"],
      query: () => ({
        url: `drivers/`,
      }),
      transformResponse: (data) => {
        console.log(22);

        console.log("fleets raw data:", data);

        // Guard against data not being an array.
        if (!Array.isArray(data)) {
          console.error(
            "getFleets transformResponse expected an array but got:",
            data
          );
          return []; // Return empty array to avoid crashes.
        }

        const transformedData = data.map((driver) => ({
          // IMPORTANT: You may need to adjust these properties to match your API response.
          // Based on your other code, `driver.id` and `driver.name` are likely candidates.
          value: driver.id,
          label:
            driver.driver_user.first_name + " " + driver.driver_user.last_name,
        }));
        console.log("fleets transformed data:", transformedData);
        return transformedData;
      },
    }),
    getDefinedLatLons: builder.query({
      providesTags: ["Address"],
      query: () => ({
        url: `address/`,
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
  useGetFleetsOptionsQuery,
  useGetDefinedLatLonsQuery,
} = orderApi;
