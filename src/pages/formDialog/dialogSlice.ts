import { createSlice } from "@reduxjs/toolkit";

const dialogSlice = createSlice({
  name: "dialog",
  initialState: { SidebarMenue: "", form: "" },
  reducers: {
    setSidebarMenue: (state, action) => {
      state.SidebarMenue = action.payload;
    },
    setForm: (state, action) => {
      state.form = action.payload;
    },
  },
});

export const { setSidebarMenue, setForm } = dialogSlice.actions;

export default dialogSlice.reducer;

export const selectCurrentSidebarMenue = (state) => state.dialog.sidebarMenue;
export const selectCurrentForm = (state) => state.dialog.form;
