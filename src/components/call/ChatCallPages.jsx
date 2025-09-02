import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Snackbar,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  CallEnd,
} from "@mui/icons-material";
import { useCreateCallMutation } from "../../features/room/roomApi";
import { connectSocket } from "../../hooks/socket";

export default function VideoCall() {
  const agentId = "687608347057ea1dfefa7de0";
  const customerId = "68aa9e4a4e61ea8cf8705a21";

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  const [inCall, setInCall] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [createCall] = useCreateCallMutation();

  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        const sock = connectSocket();
        socketRef.current = sock;

        // Initialize PeerConnection with proper configuration
        const configuration = {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        };
        pcRef.current = new RTCPeerConnection(configuration);

        // Set up event handlers
        pcRef.current.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        pcRef.current.onicecandidate = (event) => {
          if (event.candidate && socketRef.current && roomId) {
            socketRef.current.emit("webrtc:ice-candidate", {
              roomId,
              candidate: event.candidate,
            });
          }
        };

        pcRef.current.onconnectionstatechange = () => {
          console.log("Connection state:", pcRef.current.connectionState);
          if (pcRef.current.connectionState === "connected") {
            showSnackbar("Call connected!");
            setInCall(true);
            startTimer();
          } else if (pcRef.current.connectionState === "disconnected") {
            stopCall();
          }
        };

        // Socket event listeners
        sock.on("webrtc:offer", async (data) => {
          try {
            await pcRef.current.setRemoteDescription(
              new RTCSessionDescription(data.sdp)
            );
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);
            
            sock.emit("webrtc:answer", {
              roomId: data.roomId || roomId,
              sdp: answer,
            });
            
            showSnackbar("Incoming call accepted!");
            setInCall(true);
            startTimer();
          } catch (error) {
            console.error("Error handling offer:", error);
            showSnackbar("Error accepting call");
          }
        });

        sock.on("webrtc:answer", async (data) => {
          try {
            await pcRef.current.setRemoteDescription(
              new RTCSessionDescription(data.sdp)
            );
            showSnackbar("Call connected!");
            setInCall(true);
            startTimer();
          } catch (error) {
            console.error("Error handling answer:", error);
          }
        });

        sock.on("webrtc:ice-candidate", async (data) => {
          try {
            if (data.candidate) {
              await pcRef.current.addIceCandidate(
                new RTCIceCandidate(data.candidate)
              );
            }
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        });

        sock.on("call:incoming", (data) => {
          showSnackbar(`Incoming call from ${data.from}`);
          // You can add logic here to show an incoming call UI
        });

        sock.on("call:ended", () => {
          showSnackbar("Call ended by remote user");
          stopCall();
        });

        sock.on("call:error", (data) => {
          console.error("Call error:", data.message);
          showSnackbar(`Error: ${data.message}`);
          stopCall();
        });
      } catch (error) {
        console.error("Error initializing WebRTC:", error);
        showSnackbar("Failed to initialize call");
      }
    };

    initializeWebRTC();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      stopCall();
    };
  }, [roomId]);

  const startCall = async () => {
    try {
      setIsCalling(true);
      showSnackbar("Starting call...");

      // 1. Create room
      const res = await createCall({ receiverId: customerId }).unwrap();
      const backendRoomId = res?.room?.roomId;
      setRoomId(backendRoomId);

      // 2. Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      // Set local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, stream);
      });

      // 3. Create and send offer
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      // 4. Notify backend via socket
      if (socketRef.current) {
        socketRef.current.emit("call:init", {
          roomId: backendRoomId,
          receiverId: customerId,
        });
        
        socketRef.current.emit("webrtc:offer", {
          roomId: backendRoomId,
          sdp: offer,
        });
      }

      setIsCalling(false);
    } catch (err) {
      console.error("Start call error:", err);
      showSnackbar("Failed to start call");
      setIsCalling(false);
      
      // Clean up on error
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const stopCall = () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Reset video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Notify other participant
    if (socketRef.current && roomId) {
      socketRef.current.emit("call:end", { roomId });
    }

    // Reset state
    setCallTimer(0);
    setInCall(false);
    setRoomId(null);
    setScreenSharing(false);
    showSnackbar("Call ended");
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
        setMuted(!audioTracks[0].enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !videoTracks[0].enabled;
        setVideoOff(!videoTracks[0].enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!screenSharing) {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = stream.getVideoTracks()[0];
        
        // Replace the current video track with screen share
        const sender = pcRef.current
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }
        
        // Handle when the user stops screen sharing from the browser UI
        screenTrack.onended = async () => {
          const camStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          const camTrack = camStream.getVideoTracks()[0];
          await sender.replaceTrack(camTrack);
          setScreenSharing(false);
          showSnackbar("Screen sharing stopped");
          camStream.getTracks().forEach(track => track !== camTrack && track.stop());
        };
        
        setScreenSharing(true);
        showSnackbar("Screen sharing started");
      } else {
        // Stop screen sharing and revert to camera
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const camTrack = camStream.getVideoTracks()[0];
        
        const sender = pcRef.current
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        
        if (sender) {
          await sender.replaceTrack(camTrack);
        }
        
        setScreenSharing(false);
        showSnackbar("Screen sharing stopped");
        
        // Stop the unused camera stream (we only need the track)
        camStream.getTracks().forEach(track => track !== camTrack && track.stop());
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
      showSnackbar("Failed to toggle screen share");
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setCallTimer(0);
    timerRef.current = setInterval(() => {
      setCallTimer((prev) => prev + 1);
    }, 1000);
  };

  const showSnackbar = (msg) => {
    setSnackbarMsg(msg);
    setOpenSnackbar(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box textAlign="center" p={2}>
      {!inCall ? (
        <Button
          onClick={startCall}
          variant="contained"
          color="primary"
          disabled={isCalling}
          startIcon={isCalling ? <CircularProgress size={16} /> : null}
        >
          {isCalling ? "Starting call..." : "Start call"}
        </Button>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            WebRTC Video Call
          </Typography>
          <Box display="flex" justifyContent="space-around" mt={2} flexWrap="wrap">
            <Box>
              <Typography variant="body2" gutterBottom>
                You
              </Typography>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                width="300"
                height="225"
                style={{ borderRadius: "8px", objectFit: "cover" }}
              />
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>
                Remote
              </Typography>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                width="300"
                height="225"
                style={{ borderRadius: "8px", objectFit: "cover" }}
              />
            </Box>
          </Box>

          <Typography variant="body1" mt={2}>
            Call Duration: {formatTime(callTimer)}
          </Typography>

          <Box mt={2} display="flex" justifyContent="center" flexWrap="wrap">
            <Button
              onClick={toggleMute}
              variant="contained"
              color={muted ? "error" : "primary"}
              sx={{ m: 1 }}
            >
              {muted ? <MicOff /> : <Mic />}
            </Button>
            <Button
              onClick={toggleVideo}
              variant="contained"
              color={videoOff ? "error" : "primary"}
              sx={{ m: 1 }}
            >
              {videoOff ? <VideocamOff /> : <Videocam />}
            </Button>
            <Button
              onClick={toggleScreenShare}
              variant="contained"
              color={screenSharing ? "error" : "primary"}
              sx={{ m: 1 }}
            >
              {screenSharing ? <StopScreenShare /> : <ScreenShare />}
            </Button>
            <Button
              onClick={stopCall}
              variant="contained"
              color="error"
              sx={{ m: 1 }}
            >
              <CallEnd />
            </Button>
          </Box>
        </>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMsg}
      />
    </Box>
  );
}