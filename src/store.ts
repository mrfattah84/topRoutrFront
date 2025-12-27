import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api";
import dialogReducer from "./pages/formDialog/dialogSlice";
import orderTableReducer from "./pages/table/order/orderTableSlice";
import fleetTableReducer from "./pages/table/fleet/fleetTableSlice";
import mapSliceReducer from "./pages/map/mapSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    dialog: dialogReducer,
    orderTable: orderTableReducer,
    fleetTable: fleetTableReducer,
    map: mapSliceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
