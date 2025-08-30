// src/socket.js
import { io } from "socket.io-client";

let socket = null;
const token = localStorage.getItem("token");
export const connectSocket = () => {
  if (!socket || !socket.connected) {
    socket = io("http://localhost:5003", {
      query: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
  }
  return socket;
};

export const getSocket = () => {
  return socket;
};
