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
import { toast } from "react-toastify";
import { useUpdateCallStatusMutation } from "../../features/room/roomApi";

// ⏱️ custom hook for timer
const useCallTimer = (active) => {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (active) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [active]);

  const reset = () => setElapsed(0);

  return { elapsed, reset };
};


// 🎥 custom hook for binding streams
const useVideoStream = (ref, stream) => {
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [ref, stream]);
};


const VideoCallModal = ({
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { elapsed, reset } = useCallTimer(open && callAccepted);
  const [updateCallStatus] = useUpdateCallStatusMutation();

  // bind streams
  useVideoStream(localVideoRef, localStream);
  useVideoStream(remoteVideoRef, remoteStream);

  // handle fullscreen exit
  useEffect(() => {
    const exitHandler = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", exitHandler);
    return () => document.removeEventListener("fullscreenchange", exitHandler);
  }, []);

  const handleEnd = async () => {
    reset();
    localStream?.getTracks().forEach((t) => t.stop()); // stop local tracks

    try {
      if (roomId) {
        await updateCallStatus({ roomId, status: "ended" });
        toast.success("Call Ended");
      }
    } catch (err) {
      toast.error("Failed to update call status");
      console.error(err);
    }

    onEnd();
  };

  const toggleMute = () => {
    localStream?.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    setMuted((prev) => !prev);
    toast.info(muted ? "Mic On" : "Mic Muted");
  };

  const toggleCamera = () => {
    localStream?.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    setCameraOff((prev) => !prev);
    toast.info(cameraOff ? "Camera On" : "Camera Off");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleEnd} sx={{ background: "transparent" }}>
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <Paper
          ref={containerRef}
          elevation={0}
          sx={{
            position: "relative",
            width: { xs: "90%", md: "70%", lg: "30vw" },
            maxWidth: 1000,
            height: "85vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            bgcolor: "black",
          }}
        >
          {/* Remote video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ flex: 1, objectFit: "cover", width: "100%", height: "100%" }}
          />
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              color: "#fff",
              bgcolor: "rgba(0,0,0,0.5)",
              px: 1,
              borderRadius: 1,
            }}
          >
            Remote
          </Typography>

          {/* Local video */}
          <Box
            sx={{
              position: "absolute",
              top: 50,
              right: 20,
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid #fff",
              width: 120,
              height: 150,
              zIndex: 10,
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                bottom: 4,
                left: 4,
                color: "#fff",
                bgcolor: "rgba(0,0,0,0.5)",
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
              bgcolor: "rgba(0,0,0,0.5)",
              px: 1,
              borderRadius: 1,
            }}
          >
            {formatTime(elapsed)}
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
