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
      providesTags: ["Fleet"],
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

    getVehicleNames: builder.query({
      providesTags: ["Vehicle"],
      query: () => ({
        url: "vehicles/",
      }),
      transformResponse: (data) => {
        const newData = [];
        data.forEach((v) => {
          newData.push({
            [v.id]: {
              id: v.id || v.uuid,
              active: v.is_active !== undefined ? v.is_active : true,
              license: v.license_plate || "",
              label: v.label || "",
              features: v.has_custom_features ? "Yes" : "",
              weight: v.weight || "",
              volume:
                v.length && v.width && v.height
                  ? (v.length * v.width * v.height).toFixed(2)
                  : "",
              serial: v.serial_number || "",
              name: v.name || "",
              workHours: v.work_hours || "",
              email: v.email || "",
              break: v.break_duration || "",
              timeWindow: v.time_window || "",
            },
          });
        });
        return newData;
      },
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
  useGetVehicleNamesQuery,
} = optimizationApi;
