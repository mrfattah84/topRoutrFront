import { createSlice } from "@reduxjs/toolkit";

const orderTableSlice = createSlice({
  name: "orderTable",
  initialState: { selectedOrders: [], date: {} },
  reducers: {
    setSelectedRowKeys: (state, action) => {
      state.selectedOrders = action.payload;
    },
    setDate: (state, action) => {
      state.date = action.payload;
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
