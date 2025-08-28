import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Box,
  IconButton,
  Stack,
  Typography,
  Paper,
} from "@mui/material";
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  CallEnd,
  Fullscreen,
  FullscreenExit,
} from "@mui/icons-material";
// import { closeConnection } from "../utils/webrtc";
// import { useUpdateCallStatusMutation } from "../features/room/roomApi";
import { toast } from "react-toastify";
// import { socket } from "../socket/callSocket";

const   VideoCallModal = ({
  open,
  onEnd,
  localStream,
  remoteStream,
  callAccepted,
  roomId, 
}) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const containerRef = useRef();
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef(null);

  // const [updateCallStatus] = useUpdateCallStatusMutation(); // ✅ RTK mutation

 
  // useEffect(() => {
  //   if (localStream && localVideoRef.current) {
  //     localVideoRef.current.srcObject = localStream;
  //      localVideoRef.current.play?.().catch(() => {})
  //   }
  //   if (remoteStream && remoteVideoRef.current) {
  //     remoteVideoRef.current.srcObject = remoteStream;
  //      remoteVideoRef.current.play?.().catch(() => {});
  //   }
  // }, [localStream, remoteStream]);

// useEffect(() => {
//   if (localStream && localVideoRef.current) {
//     localVideoRef.current.srcObject = localStream;
//      localVideoRef.current.muted = true; // 👈 must mute to autoplay
//     localVideoRef.current.play().catch((err) => {
//       console.warn("Local video play blocked:", err);
//     });
//   }else {
//     console.log("No local stream or video ref");
//   }
//   if (remoteStream && remoteVideoRef.current) {
//     remoteVideoRef.current.srcObject = remoteStream;
//   }else {
//     console.log("No remote stream or video ref");
//   }
// }, [localStream, remoteStream]);

useEffect(() => {
  // if (localStream && localVideoRef.current && localVideoRef.current.srcObject !== localStream) {
  //   localVideoRef.current.srcObject = localStream;
  //   localVideoRef.current.muted = true;
  //   localVideoRef.current.play().catch(() => {});
  // }

   if (localStream && localVideoRef.current) {
    const videoEl = localVideoRef.current;

    if (videoEl.srcObject !== localStream) {
      videoEl.srcObject = localStream;
    }


     videoEl.muted = true;       // must mute for autoplay
    videoEl.playsInline = true; // needed for iOS
    videoEl.autoplay = true;

    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn("⚠️ Local video autoplay prevented:", err);
      });
    }
  }
}, [localStream]);

useEffect(() => {
  if (remoteStream && remoteVideoRef.current) {
    const videoEl = remoteVideoRef.current;
    if (videoEl.srcObject !== remoteStream) {
      videoEl.srcObject = remoteStream;
    }
    videoEl.playsInline = true; // needed for iOS
    videoEl.autoplay = true;

     const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn("⚠️ Remote video autoplay prevented:", err);
      });
    }
  }
}, [remoteStream]);

console.log("localStream", localStream);
console.log("remoteStream", remoteStream);

  useEffect(() => {
    if (open && callAccepted) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
      setElapsedTime(0);
    };
  }, [open, callAccepted]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };


  // const handleEnd = async () => {
  //   console.log("Call ended");
  //   clearInterval(timerRef.current);
  //   closeConnection();
  //   console.log("Call ended",roomId);
  //   try {
  //     if (roomId) {
  //       socket.emit("call:end", { roomId }); // notify server
  //       socket.disconnect();
  //       await updateCallStatus({ roomId: roomId , status: "ended" }); // ✅ API call
  //       toast.success("Call ended");
  //       console.log("✅ Call status updated to 'ended'", roomId);
  //     }
  //   } catch (err) {
  //     console.error("❌ Failed to update call status:", err);
  //   }

  //   onEnd(); // cleanup from parent
  // };

  const handleEnd = async () => {
  console.log("Call ended");
  clearInterval(timerRef.current);

  // ✅ stop all local tracks
  localStream?.getTracks().forEach(track => track.stop());

  // ✅ stop all remote tracks
  remoteStream?.getTracks().forEach(track => track.stop());

  // ✅ close peer connection if you keep one in ref
  // peerConnectionRef.current?.close();
  // peerConnectionRef.current = null;

  try {
    if (roomId) {
      socket.emit("call:end", { roomId }); // notify server
      socket.disconnect();
      await updateCallStatus({ roomId: roomId, status: "ended" }); 
      toast.success("Call ended");
    }
  } catch (err) {
    console.error("❌ Failed to update call status:", err);
  }

  onEnd?.(); // cleanup from parent
};


  const toggleMute = () => {
    localStream?.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    setMuted(!muted);
  };

  const toggleCamera = () => {
    localStream?.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    setCameraOff(!cameraOff);
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!open) return null;

  return (
    <Modal open={open} sx={{ background: "rgba(0,0,0,0.7)" }} onClose={handleEnd}>
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <Paper
          ref={containerRef}
          elevation={4}
          sx={{
            position: "relative",
            width: "50vw",
            maxWidth: 1000,
            height: "80vh",
            bgcolor: "#000",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Remote video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ flex: 1, objectFit: "cover", width: "100%" }}
          />
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              color: "#fff",
              background: "rgba(0,0,0,0.5)",
              px: 1,
              borderRadius: 1,
            }}
          >
            Receiver
          </Typography>

          {/* Local video */}
          <Box
            sx={{
              position: "absolute",
              bottom: 80,
              right: 16,
              borderRadius: 2,
              overflow: "hidden",
              border: "2px solid #fff",
              width: 180,
              height: 120,
              zIndex: 10,
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted       // 👈 very important
              style={{ width: "100%", height: "100%", objectFit: "cover", background: "black" }}
            />
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                bottom: 4,
                left: 4,
                color: "#fff",
                background: "rgba(0,0,0,0.5)",
                px: 1,
                borderRadius: 1,
              }}
            >
              You
            </Typography>
          </Box>

          {/* Call duration */}
          <Typography
            variant="body2"
            sx={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              color: "#fff",
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: "2px 8px",
              borderRadius: "6px",
            }}
          >
            {formatTime(elapsedTime)}
          </Typography>

          {/* Controls */}
          <Stack
            direction="row"
            justifyContent="center"
            spacing={2}
            sx={{ position: "absolute", bottom: 16, width: "100%", zIndex: 20 }}
          >
            <IconButton onClick={toggleMute} sx={{ color: "#fff" }}>
              {muted ? <MicOff /> : <Mic />}
            </IconButton>
            <IconButton onClick={toggleCamera} sx={{ color: "#fff" }}>
              {cameraOff ? <VideocamOff /> : <Videocam />}
            </IconButton>
            <IconButton onClick={handleEnd} sx={{ color: "red" }}>
              <CallEnd />
            </IconButton>
            <IconButton onClick={toggleFullscreen} sx={{ color: "#fff" }}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Stack>
        </Paper>
      </Box>
    </Modal>
  );
};

export default VideoCallModal;
