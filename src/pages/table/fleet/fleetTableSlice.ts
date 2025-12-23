import { createSlice } from "@reduxjs/toolkit";

const fleetTableSlice = createSlice({
  name: "fleetTable",
  initialState: { selectedFleets: [], date: "" },
  reducers: {
    setSelectedRowKeys: (state, payload) => {
      state.selectedFleets = payload;
    },
    setDate: (state, payload) => {
      state.date = payload;
    },
  },
  selectors: {
    selectedFleetKeys: (state) => state.selectedFleets,
    selectDate: (state) => state.date,
  },
});

export const { setSelectedRowKeys, setDate } = fleetTableSlice.actions;
export const { selectedFleetKeys, selectDate } = fleetTableSlice.selectors;

export default fleetTableSlice.reducer;
