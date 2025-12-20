import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api";
import authReducer from "./pages/auth/authSlice";
import dialogReducer from "./pages/formDialog/dialogSlice";
import orderTableReducer from "./pages/table/order/orderTableSlice";
import fleetTableReducer from "./pages/table/fleet/fleetTableSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    dialog: dialogReducer,
    orderTable: orderTableReducer,
    fleetTable: fleetTableReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});
