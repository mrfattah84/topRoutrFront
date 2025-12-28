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
      async onQueryStarted({ id, activated }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          orderTableApi.util.updateQueryData(
            "getOrders",
            undefined,
            (draft) => {
              const order = draft.find((order: any) => order.id === id);
              if (order) {
                order.activated = activated;
              }
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const { useGetOrdersQuery, useChangeActiveMutation } = orderTableApi;
