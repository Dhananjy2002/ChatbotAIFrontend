import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { api } from "../services/api";
import authReducer from "../features/auth/authSlice";
import chatReducer from "../features/chat/chatSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(api.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);

export default store;
