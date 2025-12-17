import { apiSlice } from "../../../api";

export const fleetTableApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFleets: builder.query({
      query: () => ({
        url: "/vehicle",
      }),
    }),
  }),
});

export const { useGetFleetsQuery } = fleetTableApiSlice;
