import React, { useEffect, useState } from "react";
// import {
//   initSocket,
//   joinUserRoom,
//   onIncomingCall,
//   sendAnswer,
//   onIceCandidate,
// } from "../../sockets/callSocket";
// import {
//   initPeerConnection,
//   getMediaStream,
//   addTracks,
//   createAnswer,
//   setRemoteDescription,
//   addIceCandidate,
//   setIceCandidateCallback,
// } from "../../utils/webrtc";

// import { useUpdateCallStatusMutation } from "../../features/room/roomApi";
// import IncomingCallDialog from "./IncomingCallModal";
import VideoCallModal from "../../../components/common/VideoCallModal";
import { jwtDecode } from "jwt-decode";

const CustomerDashboard = () => {
   const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const customerId = decoded?.id;
//   const [incomingCall, setIncomingCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [roomId, setRoomId] = useState(null);
//   const localVideoRef = React.createRef();
// const remoteVideoRef = React.createRef();

//   const [updateCallStatus] = useUpdateCallStatusMutation();

//   useEffect(() => {
//     const socket = initSocket();
//     joinUserRoom(customerId);

//     onIncomingCall(async ({ roomId, offer, fromUserId }) => {
//       setIncomingCall({ roomId, offer, fromUserId });
//     });

//     onIceCandidate(async (candidate) => {
//       await addIceCandidate(candidate);
//     });

//     setIceCandidateCallback((candidate) => {
//       if (roomId) {
//         socket.emit("ice-candidate", { roomId, candidate });
//       }
//     });
//   }, [roomId]);

//   const handleAccept = async () => {
//     if (!incomingCall) return;

//     const { roomId, offer, fromUserId } = incomingCall;
//     const { peerConnection, remoteStream: rs } = initPeerConnection(localVideoRef, remoteVideoRef);
//     setRemoteStream(rs);

//     const stream = await getMediaStream();
//     setLocalStream(stream);
//     addTracks();

//     await setRemoteDescription(offer);
//     const answer = await createAnswer();

//     sendAnswer({ roomId, answer });
//     setRoomId(roomId);
//     setCallAccepted(true);
//     setIncomingCall(null);

//     // ✅ Update backend that call was accepted
//     try {
//       await updateCallStatus({ roomId, status: "accepted" }).unwrap();
//       console.log("✅ Call status updated to accepted");
//     } catch (err) {
//       console.error("❌ Failed to update call status:", err);
//     }
//   };

//   const handleReject = () => {
//     setIncomingCall(null);
//   };

//   const handleEndCall = async () => {
//     setCallAccepted(false);
//     setRoomId(null);

//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());
//     }

//     try {
//       if (roomId) {
//         await updateCallStatus({ roomId, status: "ended" }).unwrap();
//         console.log("📴 Call ended");
//       }
//     } catch (err) {
//       console.error("❌ Failed to update call status on end:", err);
//     }

//     setLocalStream(null);
//     setRemoteStream(null);
//   };

  return (
    <>
      {/* <IncomingCallDialog
        open={!!incomingCall}
        callerName="Agent"
        onAccept={handleAccept}
        onReject={handleReject}
      /> */}

      <VideoCallModal
        // open={callAccepted}
        // onEnd={handleEndCall}
        // localStream={localStream}
        // remoteStream={remoteStream}
        // callAccepted={true}
        // roomId={roomId}
      />
    </>
  );
};

export default CustomerDashboard;
