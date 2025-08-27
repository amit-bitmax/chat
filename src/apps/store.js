import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../features/auth/authApi';
import { ticketApi } from '../features/ticket/ticketApi';
import { chatApi } from '../features/chat/chatApi';
import { roomApi } from '../features/room/roomApi';


export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [ticketApi.reducerPath]: ticketApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [roomApi.reducerPath]: roomApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware)
    .concat(ticketApi.middleware)
    .concat(chatApi.middleware)
    .concat(roomApi.middleware),
});
