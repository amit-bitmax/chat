import React, { useState } from "react";
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
  IconButton
} from "@mui/material";
import { Forum, Email, Call, Send } from "@mui/icons-material";
import { useGetConversationQuery, useSendMessageMutation } from "../../../../features/chat/chatApi";
// import { getSockets } from "../../sockets/messageSocket";
import { toast } from "react-toastify";
import VideoCallModal from "../../../../components/common/VideoCallModal";
import MessageList from "../customerChat/messages/MessageList";
import CallList from "../CallList";
import ChatWindow from "./ChatWindow";

export default function ChatBot({ currentUserId }) {
  const [value, setValue] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState("687608347057ea1dfefa7de0"); // For now, hardcoded for testing
  const [text, setText] = useState("");
  const [liveMessages, setLiveMessages] = useState([]);

  const { data: messagesData, isLoading: loadingMessages } = useGetConversationQuery();
  console.log("messagesData", messagesData);
  const [sendMessage] = useSendMessageMutation();

  // const handleTyping = (val) => {
  //   const { presenceSocket } = getSockets();
  //   if (presenceSocket && targetUserId) {
  //     presenceSocket.emit(val ? "start-typing" : "stop-typing", { toUserId: targetUserId });
  //   }
  // };

  const handleSend = async () => {
    if (!text.trim()) {
      toast.error("Please enter a message");
      return;
    }
    if (!targetUserId) {
      toast.error("No recipient selected");
      return;
    }

    const { chatSocket } = getSockets();
    const roomId = [currentUserId, targetUserId].sort().join("_");
    const newMessage = {
      from: currentUserId,
      to: targetUserId,
      message: text.trim(),
      createdAt: new Date().toISOString(),
    };

    // Emit to socket
    if (chatSocket) {
      chatSocket.emit("sendMessage", { roomId:"123", message: newMessage });
    }

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
      <Grid size={{xs:12}}>
        <Paper
          elevation={1}
          sx={{
            mx: "auto",
            width: "350px",
            height: "70vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
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
                <Stack sx={{ height: "90%", 
                overflow: "scroll",
                "&::-webkit-scrollbar": {
                    display: "none",
                        } 
                  }}>
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
                    // m: 1,
                    px: 0.5,
                    background: "#fff",
                    // borderRadius: "20px",
                    borderTop: "1px solid #eee"
                  }}
                  spacing={1}
                >
                  <TextField
                    fullWidth
                    size="small"
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      handleTyping(e.target.value);
                    }}
                    placeholder="Type your message"
                  />
                  <IconButton onClick={handleSend} disabled={!text.trim()} >
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
                padding: "10px"
              },
              "& .MuiBottomNavigationAction-label": {
                fontSize: "10px",
                marginRight: "10px"
              },
              bgcolor:" rgba(239, 120, 60, 0.3)"
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
              onClose={() => setOpenModal(false)}
              // roomId={`room-${currentUserId}-${targetUserId}`}
              // callerId={currentUserId}
              // receiverId={targetUserId}
            />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
