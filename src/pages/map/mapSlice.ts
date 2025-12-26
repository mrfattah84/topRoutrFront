import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  points: [],
  routes: [], // Array of { id, coordinates, color }
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setRoutes: (state, action) => {
      // Replaces current routes
      state.routes = action.payload;
    },
    setPoints: (state, action) => {
      state.points = action.payload;
    },
    addPoint: (state, action) => {
      state.points.push(action.payload);
    },
    clearMap: (state) => {
      state.routes = [];
      state.points = [];
    },
  },
});

export const { setRoutes, setPoints, addPoint, clearMap } = mapSlice.actions;
export const selectPoints = (state) => state.map.points;
export const selectRoutes = (state) => state.map.routes;
export default mapSlice.reducer;
