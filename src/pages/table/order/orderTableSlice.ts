import { createSlice } from "@reduxjs/toolkit";

const orderTableSlice = createSlice({
  name: "orderTable",
  initialState: { selectedOrders: [], date: {} },
  reducers: {
    setSelectedRowKeys: (state, payload) => {
      state.selectedOrders = payload;
    },
    setDate: (state, payload) => {
      state.date = payload;
    },
  },
  selectors: {
    selectedOrderKeys: (state) => state.selectedOrders,
    selectDate: (state) => state.date,
  },
});

export const { setSelectedRowKeys, setDate } = orderTableSlice.actions;
export const { selectedOrderKeys, selectDate } = orderTableSlice.selectors;

export default orderTableSlice.reducer;
