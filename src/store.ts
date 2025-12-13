import { configureStore } from "@reduxjs/toolkit"
import { apiSlice } from "./api/baseApi"
import authReducer from './pages/auth/authSlice'
import dialogReducer from './pages/formDialog/dialogSlice'

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
        dialog: dialogReducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true
})