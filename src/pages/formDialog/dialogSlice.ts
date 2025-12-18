import { createSlice } from "@reduxjs/toolkit";

const dialogSlice = createSlice({
  name: "dialog",
  initialState: {
    SidebarMenue: "",
    form: "",
  },
  reducers: {
    setSidebarMenue: (state, action) => {
      state.SidebarMenue = action.payload;
    },
    setForm: (state, action) => {
      state.form = action.payload;
    },
  },
  selectors: {
    selectCurrentSidebarMenue: (state) => state.SidebarMenue,
    selectCurrentForm: (state) => state.form,
  },
});

export const { setSidebarMenue, setForm } = dialogSlice.actions;

export const { selectCurrentSidebarMenue, selectCurrentForm } =
  dialogSlice.selectors;
export default dialogSlice.reducer;
