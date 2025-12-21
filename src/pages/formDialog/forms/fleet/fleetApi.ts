import { apiSlice } from "../../../../api";
import AddVehicle from "./AddVehicle";

export const fleetApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFleet: builder.query({
      providesTags: ["Fleet"],
      query: (id) => ({
        url: `drivers/${id}/`,
      }),
    }),
    createFleet: builder.mutation({
      invalidatesTags: ["Fleet"],
      query: (data) => ({
        url: "drivers/",
        method: "POST",
        body: data,
      }),
    }),
    updateFleet: builder.mutation({
      query: ({ id, data }) => ({
        url: `drivers/${id}/`,
        method: "PUT", // or 'PATCH'
        body: data,
      }),
      invalidatesTags: ["Fleet"],
    }),
    deleteFleet: builder.mutation({
      invalidatesTags: ["Fleet"],
      query: (id) => ({
        url: `drivers/${id}/`,
        method: "DELETE",
      }),
    }),
    getVehicles: builder.query({
      providesTags: ["Vehicle"],
      query: () => ({
        url: "vehicles/",
      }),
      transformResponse: (data) => {
        const newData = [];
        data.map((item) => {
          newData.push({
            value: item.id,
            label: item.name,
          });
        });
        console.log(newData);
        return newData;
      },
    }),
    addVehicle: builder.mutation({
      invalidatesTags: ["Vehicle"],
      query: (data) => ({
        url: "vehicles/",
        method: "POST",
        body: data,
      }),
    }),
    getVehicleTypes: builder.query({
      query: () => ({
        url: "vehicles/types/",
      }),
      transformResponse: (data) => {
        const newData = [];
        data.map((item) => {
          newData.push({
            value: item.id,
            label: item.name,
          });
        });
        console.log(newData);
        return newData;
      },
    }),
    getDriverUsers: builder.query({
      query: () => ({
        url: "auth/profiles/",
      }),
      transformResponse: (data) => {
        console.log("data", data);
        const filteredData = data.filter((user) => user.role == "driver");
        console.log("newdata", filteredData);
        const newData = [];
        filteredData.map((item) => {
          newData.push({
            value: item.user_id,
            label: `${item.first_name}, ${item.last_name}`,
          });
        });
        return newData;
      },
    }),
    createCosts: builder.mutation({
      query: (data) => ({
        url: "costs/",
        method: "POST",
        body: data,
      }),
    }),
    createWorkSchedule: builder.mutation({
      query: (data) => ({
        url: "work-schedules/",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetFleetQuery,
  useCreateFleetMutation,
  useUpdateFleetMutation,
  useDeleteFleetMutation,
  useGetVehiclesQuery,
  useAddVehicleMutation,
  useGetVehicleTypesQuery,
  useGetDriverUsersQuery,
  useCreateCostsMutation,
  useCreateWorkScheduleMutation,
} = fleetApi;
