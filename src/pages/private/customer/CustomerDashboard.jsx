import React, { useEffect, useState, useRef } from "react";
import {
  initSocket,
  joinUserRoom,
  onIncomingCall,
  sendAnswer,
  onIceCandidate,
} from "../../../sockets/callSocket";

import VideoCallModal from "../../../components/common/VideoCallModal";
import IncomingCallDialog from "../../../components/common/IncomingCallModal"; // make sure this exists
import { jwtDecode } from "jwt-decode";
import IncomingCallModal from "../../../components/common/IncomingCallModal";

const CustomerDashboard = () => {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const customerId = decoded?.id;

  const [incomingCall, setIncomingCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [roomId, setRoomId] = useState(null);

  const pcRef = useRef(null);
  const socketRef = useRef(null);


  useEffect(() => {
    socketRef.current = initSocket();
    // joinUserRoom(customerId);
    console.log("Socket initialized for customer:", joinUserRoom(customerId));

    // 📞 incoming call from agent
    onIncomingCall( ({ roomId, offer, fromUserId }) => {
      console.log("📥 Incoming call from agent:", fromUserId);
      setIncomingCall({ roomId, offer, fromUserId });
      console.log("📡incoming ",incomingCall, roomId, offer, fromUserId)
    });

    // 📡 ICE candidates from agent
    onIceCandidate(async (candidate) => {
      console.log("📡 Received ICE candidate from agent");
      if (pcRef.current) {
        await pcRef.current.addIceCandidate(candidate);
      }
    });
    // return () => {
    //   socket.disconnect();
    // };
  }, [customerId]);

  // ✅ Accept call
 const handleAccept = async () => {
  if (!incomingCall) return;
  const { roomId, offer } = incomingCall;

  const pc = new RTCPeerConnection();
  pcRef.current = pc;

  // Remote stream for customer side (shows agent video)
  const rs = new MediaStream();
  setRemoteStream(rs);

  pc.ontrack = (event) => {
    console.log("📡 Customer received remote track");
    event.streams[0].getTracks().forEach((track) => {
      rs.addTrack(track);
    });
    setRemoteStream(rs);
  };

  // ICE candidate handling
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socketRef.current.emit("ice-candidate", { roomId, candidate: event.candidate });
    }
  };

  // ✅ Get customer’s own camera/mic
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  setLocalStream(stream);

  // ✅ Add tracks so the Agent receives them
  stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  // ✅ Apply Agent's offer
  await pc.setRemoteDescription(new RTCSessionDescription(offer));

  // ✅ Create & send answer
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  sendAnswer({ roomId, answer });

  setRoomId(roomId);
  setCallAccepted(true);
  setIncomingCall(null);
};


  // ❌ Reject call
  const handleReject = () => {
    setIncomingCall(null);
  };

  // 📴 End call
  const handleEndCall = () => {
    setCallAccepted(false);
    setRoomId(null);

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
  };

  console.log("CustomerDashboard rendered with state:",incomingCall);

  return (
    <>
     <IncomingCallModal
  open={!!incomingCall}
  callerName="Agent"
  onAccept={handleAccept}
  onReject={handleReject}
/>

      <VideoCallModal
        open={callAccepted}
        onEnd={handleEndCall}
        localStream={localStream}
        remoteStream={remoteStream}
        callAccepted={true}
        roomId={roomId}
      />
    </>
  );
};

export default CustomerDashboard;
