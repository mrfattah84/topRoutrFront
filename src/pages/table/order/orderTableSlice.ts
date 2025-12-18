import { createSlice } from "@reduxjs/toolkit";

const orderTableSlice = createSlice({
  name: "orderTable",
  initialState: { selectedOrders: [] },
  reducers: {
    setSelectedRowKeys: (state, payload) => {
      state.selectedOrders = payload;
    },
  },
  selectors: { selectedRowKeys: (state) => state.selectedOrders },
});

export const { setSelectedRowKeys } = orderTableSlice.actions;
export const { selectedRowKeys } = orderTableSlice.selectors;

export default orderTableSlice.reducer;
