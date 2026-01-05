import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Point {
  id?: string;
  name: string;
  description: string | number;
  color: string;
  coords: [number, number];
}

interface Route {
  id: string;
  coordinates: [number, number][];
  color: string;
}

interface Focus {
  id?: string;
  center?: [number, number];
  zoom?: number;
}

interface MapSlice {
  points: Point[];
  routes: Route[];
  focus: Focus;
}

const initialState: MapSlice = {
  points: [],
  routes: [],
  focus: {
    center: [51.3755, 35.7448], // Default center
    zoom: 10,
  },
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setRoutes: (state, action: PayloadAction<Route[]>) => {
      // Replaces current routes
      state.routes = action.payload;
    },
    setPoints: (state, action: PayloadAction<Point[]>) => {
      state.points = action.payload;
    },
    addPoint: (state, action: PayloadAction<Point>) => {
      state.points.push(action.payload);
    },
    clearMap: (state) => {
      state.routes = [];
      state.points = [];
    },
    setFocus: (state, action: PayloadAction<Focus>) => {
      state.focus = action.payload;
    },
  },
  selectors: {
    selectPoints: (state) => state.points,
    selectRoutes: (state) => state.routes,
    selectFocus: (state) => state.focus,
  },
});

export const { setRoutes, setPoints, addPoint, clearMap, setFocus } =
  mapSlice.actions;
export const { selectPoints, selectRoutes, selectFocus } = mapSlice.selectors;
export default mapSlice.reducer;
