// src/CallAgent.jsx
import React, { useEffect, useRef, useState } from "react";
import { getSocket } from "../../hooks/socket";


export default function CallAgent({ receiverId }) {
  const socket = getSocket();
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const pcRef = useRef(null);
  const [roomId, setRoomId] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, ringing, connected

  useEffect(() => {
    if (!socket) return;
    socket.on("call:created", ({ roomId }) => {
      setRoomId(roomId);
      setStatus("ringing");
      console.log("call created", roomId);
    });

    socket.on("call:accepted", async () => {
      setStatus("accepted");
      await startAsCaller(); // create offer and send
    });

    socket.on("webrtc:answer", async ({ sdp }) => {
      if (pcRef.current && sdp) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    });

    socket.on("webrtc:ice-candidate", async ({ candidate }) => {
      if (pcRef.current && candidate) {
        try {
          await pcRef.current.addIceCandidate(candidate);
        } catch (e) {
          console.warn("addIceCandidate error", e);
        }
      }
    });

    socket.on("call:rejected", () => {
      setStatus("rejected");
      cleanup();
    });
    socket.on("call:ended", () => {
      setStatus("ended");
      cleanup();
    });

    return () => {
      socket.off("call:created");
      socket.off("call:accepted");
      socket.off("webrtc:answer");
      socket.off("webrtc:ice-candidate");
      socket.off("call:rejected");
      socket.off("call:ended");
    };
    // eslint-disable-next-line
  }, [socket]);

  async function startCall() {
    // emit via socket (recommended)
    socket.emit("call:start", { receiverId });
  }

  async function startAsCaller() {
    pcRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current.ontrack = (e) => {
      remoteRef.current.srcObject = e.streams[0];
    };
    pcRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc:ice-candidate", { roomId, candidate: e.candidate });
      }
    };

    // get local stream
    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    localRef.current.srcObject = localStream;
    localStream.getTracks().forEach(track => pcRef.current.addTrack(track, localStream));

    // create offer
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    socket.emit("webrtc:offer", { roomId, sdp: pcRef.current.localDescription });
    setStatus("connecting");
  }

  function cleanup() {
    if (pcRef.current) {
      pcRef.current.getSenders().forEach(s => {
        if (s.track) s.track.stop();
      });
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localRef.current?.srcObject) {
      localRef.current.srcObject.getTracks().forEach(t => t.stop());
      localRef.current.srcObject = null;
    }
    if (remoteRef.current) remoteRef.current.srcObject = null;
    setRoomId(null);
    setStatus("idle");
  }

  return (
    <div>
      <button onClick={startCall} disabled={status !== "idle"}>Call {receiverId}</button>
      <div>
        <video ref={localRef} autoPlay playsInline muted style={{ width: 200 }} />
        <video ref={remoteRef} autoPlay playsInline style={{ width: 300 }} />
      </div>
      <div>Status: {status}</div>
      <button onClick={() => { socket.emit("call:end", { roomId }); }} disabled={!roomId}>End</button>
    </div>
  );
}
