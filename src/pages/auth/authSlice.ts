import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null },
  reducers: {
    setCredentials: (state, action) => {
      const { user, access_token } = action.payload;
      state.user = user;
      state.token = access_token;
    },
    logOut: (state, action) => {
      state.user = null;
      state.token = null;
    },
  },
  selectors: {
    selectCurrentUser: (state) => state.user,
    selectCurrentToken: (state) => state.token,
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export const { selectCurrentUser, selectCurrentToken } = authSlice.selectors;

export default authSlice.reducer;
