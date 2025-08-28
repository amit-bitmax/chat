import React, { useState, useEffect } from "react";
import {
  Paper,
  Grid,
  Stack,
  Avatar,
  Typography,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  TextField,
  IconButton,
} from "@mui/material";
import { Forum, Email, Call, Send } from "@mui/icons-material";
import { useGetConversationQuery, useSendMessageMutation } from "../../../../features/chat/chatApi";
import { toast } from "react-toastify";

import {
  initSocket,
  joinUserRoom,
  onIncomingCall,
  acceptCall,
  endCall,
} from "../../../../sockets/callSocket";

import VideoCallModal from "../../../../components/common/VideoCallModal";
import MessageList from "../customerChat/messages/MessageList";
import CallList from "../CallList";
import ChatWindow from "./ChatWindow";

export default function ChatBot({ currentUserId }) {
  const [value, setValue] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState(null);
  const [text, setText] = useState("");
  const [liveMessages, setLiveMessages] = useState([]);

  // NEW STATES for calls
  const [callAccepted, setCallAccepted] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const { data: messagesData, isLoading: loadingMessages } = useGetConversationQuery();
  const [sendMessage] = useSendMessageMutation();

  // ✅ Setup socket once
  useEffect(() => {
    const token = localStorage.getItem("Token");
    const socket = initSocket(token);

    if (currentUserId) {
      joinUserRoom(currentUserId);
    }

    // listen for incoming call
    onIncomingCall((data) => {
      console.log("📞 Incoming call:", data);
      setTargetUserId(data.from);
      setOpenModal(true);
      setCallAccepted(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  // send message
  const handleSend = async () => {
    if (!text.trim()) {
      toast.error("Please enter a message");
      return;
    }
    if (!targetUserId) {
      toast.error("No recipient selected");
      return;
    }

    const roomId = [currentUserId, targetUserId].sort().join("_");
    const newMessage = {
      from: currentUserId,
      to: targetUserId,
      message: text.trim(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI
    setLiveMessages((prev) => [...prev, newMessage]);
    setText("");

    try {
      await sendMessage({ to: targetUserId, message: text.trim() }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Send failed");
    }
  };

  const conversationId = "12345";

  return (
    <Grid container>
      <Grid xs={12}>
        <Paper
          elevation={1}
          sx={{
            mx: "auto",
            width: "350px",
            height: "70vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 1, backgroundColor: "#ddd" }}
          >
            <Stack direction="row" spacing={1}>
              <Avatar />
              <Box>
                <Typography variant="h6">ABCD</Typography>
                <Typography variant="body2" color="text.secondary">
                  typing...
                </Typography>
              </Box>
            </Stack>
          </Stack>

          {/* Content */}
          <Box sx={{ flex: 1, height: "100%" }}>
            {value === 0 && (
              <>
                <Stack
                  sx={{
                    height: "90%",
                    overflow: "scroll",
                    "&::-webkit-scrollbar": { display: "none" },
                  }}
                >
                  <MessageList
                    messages={[...(messagesData?.data || []), ...liveMessages]}
                    loading={loadingMessages}
                    currentUserId={currentUserId}
                  />
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{
                    px: 0.5,
                    background: "#fff",
                    borderTop: "1px solid #eee",
                  }}
                  spacing={1}
                >
                  <TextField
                    fullWidth
                    size="small"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message"
                  />
                  <IconButton onClick={handleSend} disabled={!text.trim()}>
                    <Send />
                  </IconButton>
                </Stack>
              </>
            )}

            {value === 1 && (
              <Box sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
                {!conversationId ? (
                  <div>Start Conversation</div>
                ) : (
                  <ChatWindow conversationId={conversationId} />
                )}
              </Box>
            )}

            {value === 2 && <CallList />}
          </Box>

          {/* Bottom Nav */}
          <BottomNavigation
            showLabels
            sx={{
              height: "40px",
              "& .MuiBottomNavigationAction-root": {
                flexDirection: "row",
                gap: 1,
                justifyContent: "center",
                padding: "10px",
              },
              "& .MuiBottomNavigationAction-label": {
                fontSize: "10px",
                marginRight: "10px",
              },
              bgcolor: " rgba(239, 120, 60, 0.3)",
            }}
            value={value}
            onChange={(e, nv) => setValue(nv)}
          >
            <BottomNavigationAction label="Chat" icon={<Forum />} />
            <BottomNavigationAction label="Email" icon={<Email />} />
            <BottomNavigationAction label="Calls" icon={<Call />} />
          </BottomNavigation>

          {/* Call Modal */}
          {openModal && (
            <VideoCallModal
              open={openModal}
              incoming={!callAccepted}
              callAccepted={callAccepted}
              localStream={localStream}
              remoteStream={remoteStream}
              onAccept={() => {
                acceptCall({ from: targetUserId, to: currentUserId });
                setCallAccepted(true);
              }}
              onReject={() => {
                endCall({ from: targetUserId, to: currentUserId, reason: "rejected" });
                setOpenModal(false);
              }}
              onEnd={() => {
                endCall({ from: targetUserId, to: currentUserId });
                setOpenModal(false);
                setCallAccepted(false);
              }}
            />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
