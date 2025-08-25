// src/socket.js
import { io } from 'socket.io-client';

let socket;

export const connectSocket = ({ token, id }) => {
  if (!socket) {
    socket = io('http://localhost:5003', {
      query: {
        token,
        userId: id,
      },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
  }
  return socket;
};

export const getSocket = () => socket;
