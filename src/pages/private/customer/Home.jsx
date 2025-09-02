import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Box,
  Typography,
  CircularProgress
} from "@mui/material";
import {
  CallEnd,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  Close
} from "@mui/icons-material";
import { getSocket } from "../../../hooks/socket";

export default function CustomerVideoCall({ customerId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const socket = getSocket();

  // Initialize PeerConnection
  const initializePeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
    }

    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };
    
    pcRef.current = new RTCPeerConnection(configuration);

    pcRef.current.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate && incomingCall?.roomId && socket) {
        socket.emit("webrtc:ice-candidate", { 
          roomId: incomingCall.roomId, 
          candidate: event.candidate 
        });
      }
    };

    pcRef.current.onconnectionstatechange = () => {
      console.log("Connection state:", pcRef.current.connectionState);
      if (pcRef.current.connectionState === "connected") {
        setIsCallActive(true);
      } else if (pcRef.current.connectionState === "disconnected" || 
                 pcRef.current.connectionState === "failed") {
        endCall();
      }
    };
  }, [incomingCall, socket]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleCallInit = (data) => {
      setIncomingCall({ roomId: data.roomId, senderId: data.from });
    };

    const handleWebRTCOffer = async (data) => {
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } catch (error) {
          console.error("Error setting remote description:", error);
        }
      }
    };

    const handleWebRTCAnswer = async (data) => {
      if (pcRef.current && pcRef.current.signalingState !== "stable") {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } catch (error) {
          console.error("Error setting answer:", error);
        }
      }
    };

    const handleWebRTCIceCandidate = async (data) => {
      if (data.candidate && pcRef.current) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    };

    const handleCallEnded = () => {
      endCall();
    };

    socket.on("call:incoming", handleCallInit);
    socket.on("webrtc:offer", handleWebRTCOffer);
    socket.on("webrtc:answer", handleWebRTCAnswer);
    socket.on("webrtc:ice-candidate", handleWebRTCIceCandidate);
    socket.on("call:ended", handleCallEnded);

    return () => {
      socket.off("call:incoming", handleCallInit);
      socket.off("webrtc:offer", handleWebRTCOffer);
      socket.off("webrtc:answer", handleWebRTCAnswer);
      socket.off("webrtc:ice-candidate", handleWebRTCIceCandidate);
      socket.off("call:ended", handleCallEnded);
    };
  }, [socket]);

  const acceptCall = async () => {
    if (!incomingCall) return;
    
    setIsLoading(true);
    try {
      initializePeerConnection();
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, stream);
      });

      // Create and send answer
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      // Notify backend
      socket.emit("call:accept", { roomId: incomingCall.roomId });
      socket.emit("webrtc:answer", { 
        roomId: incomingCall.roomId, 
        sdp: answer 
      });

      setIsCallActive(true);
    } catch (error) {
      console.error("Error accepting call:", error);
      endCall();
    } finally {
      setIsLoading(false);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socket.emit("call:reject", { roomId: incomingCall.roomId });
    }
    setIncomingCall(null);
  };

  const endCall = useCallback(() => {
    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Reset video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Notify backend
    if (incomingCall && socket) {
      socket.emit("call:end", { roomId: incomingCall.roomId });
    }

    // Reset state
    setIncomingCall(null);
    setIsCallActive(false);
    setMuted(false);
    setVideoOff(false);
  }, [incomingCall, socket]);

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

  return (
    <div>
      {/* Incoming Call Notification */}
      {incomingCall && !isCallActive && (
        <Dialog open={true} onClose={rejectCall}>
          <DialogTitle>📞 Incoming Call</DialogTitle>
          <DialogContent>
            <Typography>You have an incoming video call...</Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={rejectCall} 
              color="error" 
              variant="outlined"
            >
              Reject
            </Button>
            <Button 
              onClick={acceptCall} 
              color="primary" 
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : null}
            >
              {isLoading ? "Answering..." : "Accept"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Active Call Modal */}
      {isCallActive && (
        <Dialog 
          open={true} 
          onClose={endCall}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Video Call</Typography>
              <IconButton onClick={endCall}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
                <Box>
                  <Typography variant="body2" textAlign="center" gutterBottom>
                    You
                  </Typography>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    width="300"
                    height="225"
                    style={{ 
                      borderRadius: "8px", 
                      objectFit: "cover",
                      transform: "scaleX(-1)" // Mirror for self-view
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" textAlign="center" gutterBottom>
                    Agent
                  </Typography>
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    width="300"
                    height="225"
                    style={{ 
                      borderRadius: "8px", 
                      objectFit: "cover" 
                    }}
                  />
                </Box>
              </Box>

              {/* Call Controls */}
              <Box mt={2} display="flex" gap={1}>
                <IconButton
                  onClick={toggleMute}
                  color={muted ? "error" : "primary"}
                  size="large"
                >
                  {muted ? <MicOff /> : <Mic />}
                </IconButton>
                <IconButton
                  onClick={toggleVideo}
                  color={videoOff ? "error" : "primary"}
                  size="large"
                >
                  {videoOff ? <VideocamOff /> : <Videocam />}
                </IconButton>
                <IconButton
                  onClick={endCall}
                  color="error"
                  size="large"
                >
                  <CallEnd />
                </IconButton>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}