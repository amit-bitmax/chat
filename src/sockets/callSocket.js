// src/socket/callSocket.js
import { io } from "socket.io-client";

let socket;

export const initSocket = (token) => {
  socket = io("http://localhost:5003", {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  return socket;
};

// export const joinUserRoom = (userId) => {
//   if (socket) socket.emit("join-user", userId);
// };

// export const initiateCall = (data) => socket.emit("call:initiate", data);
// export const acceptCall = (data) => socket.emit("call:accept", data);
// export const endCall = (data) => socket.emit("call:end", data);
// export const sendOffer = (data) => socket.emit("offer", data);
// export const sendAnswer = (data) => socket.emit("answer", data);
// export const sendIceCandidate = (data) => socket.emit("ice-candidate", data);

// export const onIncomingCall = (cb) => socket.on("call:incoming", cb);
// export const onCallAccepted = (cb) => socket.on("call:accepted", cb);
// export const onCallEnded = (cb) => socket.on("call:ended", cb);
// export const onOffer = (cb) => socket.on("offer", cb);
// export const onAnswer = (cb) => socket.on("answer", cb);
// export const onIceCandidate = (cb) => socket.on("ice-candidate", cb);


// ---------------- Emitters ----------------
export const joinUserRoom = (userId) => {
  try {
    if (socket) socket.emit("join-user", userId);
  } catch (error) {
    console.error("❌ joinUserRoom error:", error);
  }
};

export const initiateCall = (data) => {
  try {
    socket?.emit("call:initiate", data);
    console.log("📞 call init", data );
  } catch (error) {
    console.error("❌ initiateCall error:", error);
  }
};

export const acceptCall = (data) => {
  try {
    socket?.emit("call:accept", data);
  } catch (error) {
    console.error("❌ acceptCall error:", error);
  }
};

export const endCall = (data) => {
  try {
    socket?.emit("call:end", data);
  } catch (error) {
    console.error("❌ endCall error:", error);
  }
};

export const sendOffer = (data) => {
  try {
    socket?.emit("offer", data);
  } catch (error) {
    console.error("❌ sendOffer error:", error);
  }
};

export const sendAnswer = (data) => {
  try {
    socket?.emit("answer", data);
  } catch (error) {
    console.error("❌ sendAnswer error:", error);
  }
};

export const sendIceCandidate = (data) => {
  try {
    socket?.emit("ice-candidate", data);
  } catch (error) {
    console.error("❌ sendIceCandidate error:", error);
  }
};

// ---------------- Listeners ----------------
export const onIncomingCall = (cb) => {
  try {
    socket?.on("call:incoming", cb);
  } catch (error) {
    console.error("❌ onIncomingCall error:", error);
  }
};

export const onCallAccepted = (cb) => {
  try {
    socket?.on("call:accepted", cb);
  } catch (error) {
    console.error("❌ onCallAccepted error:", error);
  }
};

export const onCallEnded = (cb) => {
  try {
    socket?.on("call:ended", cb);
  } catch (error) {
    console.error("❌ onCallEnded error:", error);
  }
};

export const onOffer = (cb) => {
  try {
    socket?.on("offer", cb);
  } catch (error) {
    console.error("❌ onOffer error:", error);
  }
};

export const onAnswer = (cb) => {
  try {
    socket?.on("answer", cb);
  } catch (error) {
    console.error("❌ onAnswer error:", error);
  }
};

export const onIceCandidate = (cb) => {
  try {
    socket?.on("ice-candidate", cb);
  } catch (error) {
    console.error("❌ onIceCandidate error:", error);
  }
};