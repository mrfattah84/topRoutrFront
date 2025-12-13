import { createSlice } from "@reduxjs/toolkit";
import { table } from "console";

const tableSlice = createSlice({
  name: "table",
  initialState: {tableData: [], tableColumns: []},
  reducers: {
    setTableData: (state, action) => {
      state.tableData = action.payload;
    },
    setTableColumns: (state, action) => {
      state.tableColumns = action.payload;
    },
  },
});

export const { setTableData, setTableColumns } = tableSlice.actions;

export default tableSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;