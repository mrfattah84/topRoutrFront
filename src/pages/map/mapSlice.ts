import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Point {
  id?: string;
  name: string;
  description: string | number;
  color: string;
  coords: [number, number];
  show?: boolean;
}

interface Route {
  id: string;
  coordinates: [number, number][];
  color: string;
  show?: boolean;
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
  driverFocus: Focus;
  actualRoutes: Route[];
  actualPoints: Point[];
}

const initialState: MapSlice = {
  points: [],
  routes: [],
  focus: {
    center: [51.3755, 35.7448], // Default center
    zoom: 10,
  },
  driverFocus: {},
  actualPoints: [],
  actualRoutes: [],
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setRoutes: (state, action: PayloadAction<Route[]>) => {
      state.routes = action.payload;
    },
    setPoints: (state, action: PayloadAction<Point[]>) => {
      state.points = action.payload;
    },
    addRoute: (state, action: PayloadAction<Route>) => {
      state.routes.push(action.payload);
    },
    addPoint: (state, action: PayloadAction<Point>) => {
      state.points.push(action.payload);
    },
    deleteRoute: (state, action: PayloadAction<string>) => {
      state.routes = state.routes.filter(
        (route) => route.id !== action.payload
      );
    },
    deletePoint: (state, action: PayloadAction<string>) => {
      state.points = state.points.filter(
        (point) => point.id !== action.payload
      );
    },
    clearMap: (state) => {
      state.routes = [];
      state.points = [];
    },
    setFocus: (state, action: PayloadAction<Focus>) => {
      state.focus = action.payload;
    },
    setDriverFocus: (state, action: PayloadAction<Focus>) => {
      state.driverFocus = action.payload;
    },
    setShowActualPoint: (
      state,
      action: PayloadAction<{ id: string; show: boolean }>
    ) => {
      const point = state.actualPoints.find((p) => p.id === action.payload.id);
      if (point) {
        point.show = action.payload.show;
      }
    },
    addActualRoute: (state, action: PayloadAction<Route>) => {
      state.actualRoutes.push(action.payload);
    },
    setShowActualRoute: (
      state,
      action: PayloadAction<{ id: string; show: boolean }>
    ) => {
      const route = state.actualRoutes.find((r) => r.id === action.payload.id);
      if (route) {
        route.show = action.payload.show;
      }
    },
    updateDriverLocation: (state, action: PayloadAction<Point>) => {
      const driverLocation = action.payload;
      if (!driverLocation.id) {
        console.warn("updateDriverLocation requires a point with an id.");
        return;
      }

      // Update or add the driver's point in actualPoints
      const pointIndex = state.actualPoints.findIndex(
        (p) => p.id === driverLocation.id
      );
      if (pointIndex !== -1) {
        state.actualPoints[pointIndex] = driverLocation;
      } else {
        state.actualPoints.push(driverLocation);
      }

      // Find the corresponding route and add the new coordinates
      const route = state.actualRoutes.find((r) => r.id === driverLocation.id);
      if (route) {
        route.coordinates.push(driverLocation.coords);
      }
    },
  },
  selectors: {
    selectPoints: (state) => state.points,
    selectRoutes: (state) => state.routes,
    selectFocus: (state) => state.focus,
    selectActualPoints: (state) => state.actualPoints,
    selectActualRoutes: (state) => state.actualRoutes,
  },
});

export const {
  setRoutes,
  setPoints,
  addRoute,
  addPoint,
  clearMap,
  setFocus,
  setDriverFocus,
  deletePoint,
  deleteRoute,
  addActualRoute,
  updateDriverLocation,
  setShowActualRoute,
  setShowActualPoint,
} = mapSlice.actions;

export const {
  selectPoints,
  selectRoutes,
  selectFocus,
  selectActualPoints,
  selectActualRoutes,
} = mapSlice.selectors;
export default mapSlice.reducer;
