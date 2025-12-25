import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  points: [],
  routes: [],
};

export const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setPoints: (state, action) => {
      state.points = action.payload;
    },
    addPoint: (state, action) => {
      state.points.push(action.payload);
    },
    setRoutes: (state, action) => {
      state.routes = action.payload;
    },
  },
  selectors: {
    selectPoints: (state) => state.points,
    selectRoutes: (state) => state.routes,
  },
});

export const { setPoints, addPoint, setRoutes } = mapSlice.actions;
export const { selectPoints, selectRoutes } = mapSlice.selectors;
export default mapSlice.reducer;
