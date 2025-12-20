import { apiSlice } from "../../../api";

export const fleetTableApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFleets: builder.query({
      providesTags: ["Fleet"],
      query: () => ({
        url: "/vehicles/",
      }),
      transformResponse: (data) => {
        data.map((fleet) => {
          fleet.key = fleet.id;
        });
        return data;
      },
    }),
    changeFleetActive: builder.mutation({
      invalidatesTags: ["Fleet"],
      query: ({ id, activated }) => ({
        url: `vehicles/${id}/`,
        method: "PATCH",
        body: { activated },
      }),
      async onQueryStarted({ id, activated }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          fleetTableApi.util.updateQueryData(
            "getFleets",
            undefined,
            (draft) => {
              const fleet = draft.find((fleet) => fleet.id === id);
              if (fleet) {
                fleet.is_active = activated;
              }
            }
          )
        );
      },
    }),
  }),
});

export const { useGetFleetsQuery, useChangeFleetActiveMutation } =
  fleetTableApi;
