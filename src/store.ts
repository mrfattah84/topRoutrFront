import { configureStore } from "@reduxjs/toolkit"
import { apiSlice } from "./api/baseApi"
import authReducer from './pages/auth/authSlice'

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true
})