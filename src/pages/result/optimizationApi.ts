import { apiSlice } from "../../api";

export const optimizationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get default configuration
    getDefaultConfig: builder.query({
      query: () => ({
        url: "optimization/configs/default/",
      }),
    }),

    // Save configuration
    saveConfig: builder.mutation({
      query: (data) => ({
        url: "optimization/configs/",
        method: "POST",
        body: data,
      }),
    }),

    // Run optimization
    runOptimization: builder.mutation({
      query: (data) => ({
        url: "optimization/run/",
        method: "POST",
        body: data,
      }),
    }),

    // Get optimization status
    getOptimizationStatus: builder.query({
      query: (runId) => ({
        url: `optimization/runs/${runId}/`,
      }),
    }),

    // Fetch orders
    getOrdersForOptimization: builder.query({
      query: () => ({
        url: "orders/",
      }),
    }),

    // Fetch drivers
    getDriversForOptimization: builder.query({
      query: () => ({
        url: "drivers/",
      }),
    }),

    // Update address (for geocoding)
    updateAddress: builder.mutation({
      invalidatesTags: ["Address"],
      query: ({ uid, data }) => ({
        url: `address/${uid}/`,
        method: "PATCH",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetDefaultConfigQuery,
  useSaveConfigMutation,
  useRunOptimizationMutation,
  useGetOptimizationStatusQuery,
  useLazyGetOptimizationStatusQuery,
  useGetOrdersForOptimizationQuery,
  useGetDriversForOptimizationQuery,
  useUpdateAddressMutation,
} = optimizationApi;
