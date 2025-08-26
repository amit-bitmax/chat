import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../features/auth/authApi';
import { chatApi } from '../features/chat/chatApi';


export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
     [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware)
      .concat(chatApi.middleware),
});
