// src/hooks/useWebRTC.js
import { useEffect, useRef, useState } from "react";
import { getSocket } from "./socket";


export default function useWebRTC(roomId) {
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    async function initCall() {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerRef.current = peer;

      // Add local tracks
      localStream.getTracks().forEach(track => peer.addTrack(track, localStream));

      // Remote stream
      peer.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // ICE candidates
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc:ice-candidate", { roomId, candidate: event.candidate });
        }
      };

      // Incoming signaling
      socket.on("webrtc:offer", async ({ sdp }) => {
        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("webrtc:answer", { roomId, sdp: answer });
      });

      socket.on("webrtc:answer", async ({ sdp }) => {
        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      });

      socket.on("webrtc:ice-candidate", async ({ candidate }) => {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ice candidate:", err);
        }
      });
    }

    initCall();
  }, [roomId, socket]);

  // Start call (caller side)
  const startCall = async () => {
    const peer = peerRef.current;
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("webrtc:offer", { roomId, sdp: offer });
  };

  return { localVideoRef, remoteVideoRef, remoteStream, startCall };
}
