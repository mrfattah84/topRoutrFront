import { createSlice } from "@reduxjs/toolkit";

const dialogSlice = createSlice({
  name: "dialog",
  initialState: {
    SidebarMenue: "",
    form: "",
    shouldSubmit: false,
    isSubmitting: false, // Controls loading state
    submitSuccess: false, // Tracks if submit succeeded
  },
  reducers: {
    setSidebarMenue: (state, action) => {
      state.SidebarMenue = action.payload;
    },
    setForm: (state, action) => {
      state.form = action.payload;
    },
    triggerSubmit: (state) => {
      state.shouldSubmit = true;
    },
    resetSubmit: (state) => {
      state.shouldSubmit = false;
    },
    setSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
    setSubmitSuccess: (state, action) => {
      state.submitSuccess = action.payload;
    },
    resetDialog: (state) => {
      state.form = "";
      state.shouldSubmit = false;
      state.isSubmitting = false;
      state.submitSuccess = false;
    },
  },
});

export const {
  setSidebarMenue,
  setForm,
  triggerSubmit,
  resetSubmit,
  setSubmitting,
  setSubmitSuccess,
  resetDialog,
} = dialogSlice.actions;

export default dialogSlice.reducer;

export const selectCurrentSidebarMenue = (state) => state.dialog.SidebarMenue;
export const selectCurrentForm = (state) => state.dialog.form;
export const selectShouldSubmit = (state) => state.dialog.shouldSubmit;
export const selectIsSubmitting = (state) => state.dialog.isSubmitting;
export const selectSubmitSuccess = (state) => state.dialog.submitSuccess;
