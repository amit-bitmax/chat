import React, { useState, useEffect, useMemo, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

import MessageItem from "./MessageItem";
import { useGetConversationQuery, useSendMessageMutation } from "../../../../../features/chat/chatApi";
// import chatSocket from "../../sockets/chatSocket";

export default function MessageList({ currentUserId }) {
  const [text, setText] = useState("");
  const [liveMessages, setLiveMessages] = useState([]);
  const [currentDate, setCurrentDate] = useState("");

  const containerRef = useRef(null);

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const agentId = decoded?.id;

  const otherUserId = "687608347057ea1dfefa7de0" || null;
  const roomId = otherUserId ? [currentUserId, otherUserId].sort().join("_") : null;

  const { data: messagesData, isLoading } = useGetConversationQuery(otherUserId, {
    skip: !otherUserId,
  });

  console.log("messagesData", messagesData);

  const [sendMessage] = useSendMessageMutation();

  // ✅ Send message
  // const handleSend = async () => {
  //   if (!text.trim() || !otherUserId) return;

  //   const newMessage = {
  //     from: currentUserId,
  //     to: otherUserId,
  //     message: text.trim(),
  //     createdAt: new Date().toISOString(),
  //   };

  //   setLiveMessages((prev) => [...prev, newMessage]);
  //   setText("");

  //   chatSocket.emit("sendMessage", { roomId, message: newMessage });

  //   try {
  //     await sendMessage({ to: otherUserId, message: newMessage.message }).unwrap();
  //   } catch (err) {
  //     toast.error(err?.data?.message || "Send failed");
  //   }
  // };

  // ✅ Socket listeners
  // useEffect(() => {
  //   if (!roomId) return;

  //   chatSocket.emit("joinRoom", roomId);

  //   const handleReceiveMessage = (msg) => {
  //     setLiveMessages((prev) => [...prev, msg]);
  //   };

  //   chatSocket.on("receiveMessage", handleReceiveMessage);
  //   return () => chatSocket.off("receiveMessage", handleReceiveMessage);
  // }, [roomId]);

  // ✅ Merge messages
  const combinedMessages = useMemo(() => {
    const history = messagesData?.data?.flatMap((item) => item.messages || []) || [];
    return [...history, ...liveMessages].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [messagesData, liveMessages]);

  // ✅ Detect current visible date
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const items = container.querySelectorAll("[data-date]");
      for (let item of items) {
        const rect = item.getBoundingClientRect();
        const containerTop = container.getBoundingClientRect().top;
        if (rect.top >= containerTop && rect.top <= containerTop + 50) {
          setCurrentDate(item.getAttribute("data-date"));
          break;
        }
      }
    };

    container.addEventListener("scroll", onScroll);
    onScroll(); // initialize on mount

    return () => container.removeEventListener("scroll", onScroll);
  }, [combinedMessages]);

  return (
    <Box sx={{ position: "relative", height: { xs: "250px", lg: "370px" } }}>
      {/* Fixed Current Date Header */}
      {currentDate && (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            textAlign: "center",
            backgroundColor: "transparent",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              backgroundColor: "#e0e0e0",
              padding: "1px 10px",
              borderRadius: "4px",
              fontSize: "9px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              display: "inline-block",
              mt: 1
            }}
          >
            {dayjs(currentDate).isSame(dayjs(), "day")
              ? "today"
              : dayjs(currentDate).isSame(dayjs().subtract(1, "day"), "day")
              ? "yesterday"
              : dayjs(currentDate).format("DD MMM YYYY")}
          </Typography>
        </Box>
      )}

      {/* Scrollable Messages */}
      <Box
        ref={containerRef}
        sx={{
          overflowY: "auto",
          p: 1,
          height: "100%",
          background: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : combinedMessages.length > 0 ? (
          combinedMessages.map((msg, index) => {
            const messageDate = dayjs(msg.createdAt).format("YYYY-MM-DD");
            return (
              <Box key={msg._id || `temp-${index}`} data-date={messageDate}>
                <MessageItem msg={msg} currentUserId={currentUserId} />
              </Box>
            );
          })
        ) : (
          <Typography>No messages found</Typography>
        )}
      </Box>
    </Box>
  );
}
