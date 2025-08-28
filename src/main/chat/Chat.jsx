  import { useRef, useState, useMemo, useEffect } from "react";
  import {
    Box, Tabs, Tab, List, ListItem, ListItemText, Card,
    Grid, Avatar, OutlinedInput, InputAdornment, Typography,
    styled, Badge, Stack, IconButton, TextField, CircularProgress
  } from "@mui/material";
  import { Search, Send, Videocam, CallEnd, Call } from "@mui/icons-material";
  import { useGetConversationQuery, useSendMessageMutation } from "../../features/chat/chatApi";
  import { toast } from "react-toastify";
  import { jwtDecode } from "jwt-decode";
  import dayjs from "dayjs";
  import { initSocket, joinUserRoom, initiateCall } from "../../sockets/callSocket";
  import {
    useCreateCallMutation,
    useUpdateCallStatusMutation,
    useGetCallHistoryQuery
  } from "../../features/room/roomApi";
  import VideoCallModal from "../../components/common/VideoCallModal"

  import renderTime from "../../utils/renderTime";
  import ChatMessage from "./ChatMessage";
  import ChatSkeleton from "../../components/reusbale/SkeltonCard";
  import { useGetAllCustomerQuery } from "../../features/auth/authApi";
  import Profile from "../../pages/private/profile/Profile";
  import StyledBadge from "../../components/common/StyledBadge";

  const IMG_BASE_URL = "https://chatcrmapi.onrender.com/uploads/profile";


  const Chat = ({ currentUserId }) => {
    const [tab, setTab] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [text, setText] = useState("");
    const [isCallOpen, setIsCallOpen] = useState(false);
    const token = localStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const agentId = decoded?.id;
    const [currentDate, setCurrentDate] = useState("");
    const [isStartingCall, setIsStartingCall] = useState(false);
    const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);


    const containerRef = useRef(null);
    const pcRef = useRef(null);
    const socketRef = useRef(null);
    const { data: callsData, isLoading: loadingCalls } = useGetCallHistoryQuery();
    const calls = callsData?.data || [];

    const { data: customerData } = useGetAllCustomerQuery();
    const customers = customerData?.data || [];
    const [isReply, setIsReply] = useState(false);
    const [sendMessage] = useSendMessageMutation();
    const [createCall] = useCreateCallMutation();
    const [updateCallStatus] = useUpdateCallStatusMutation();

    const filteredCustomers = useMemo(() => {
      return customers?.filter(
        (user) =>
          (tab === 0 || user?.is_active) &&
          (user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user?.email?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }, [customers, tab, searchQuery]);

    const otherUserId = selectedUser?._id;
    const [liveMessages, setLiveMessages] = useState([]); // only live updates
    const { data: messagesData, isLoading: loadingMessages } = useGetConversationQuery(
      selectedUser?._id,
      { skip: !selectedUser }
    );
    const roomId = [currentUserId, otherUserId].sort().join("_");
    const handleSend = async () => {
      if (!text.trim() || !otherUserId) return;

      const roomId = [currentUserId, otherUserId].sort().join("_");
      const newMessage = {
        from: currentUserId,
        to: otherUserId,
        message: text.trim(),
        createdAt: new Date().toISOString(),
      };

      // Emit to room
      chatSocket.emit("sendMessage", { roomId, message: newMessage });

      // Optimistic UI update
      setLiveMessages((prev) => [...prev, newMessage]);
      setText("");

      try {
        await sendMessage({ to: otherUserId, message: newMessage.message }).unwrap();
      } catch (err) {
        toast.error(err?.data?.message || "Send failed");
      }
    };

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const socket = initSocket(token);

  //   if (agentId) {
  //     joinUserRoom(agentId); // agent joins their own room
  //   }

  //   return () => socket.disconnect();
  // }, [agentId]);

    // join room + listen for new messages
    // useEffect(() => {
    //   if (!otherUserId || !currentUserId) return;

    //   chatSocket.emit("joinRoom", roomId);

    //   // chatSocket.on("receiveMessage", (msg) => {
    //   //   setLiveMessages((prev) => [...prev, msg]);
    //   // });

    //   // return () => {
    //   //   chatSocket.off("receiveMessage");
    //   // };
    // }, [roomId, otherUserId, currentUserId]);

    // combine API history + live messages
    
    // 👇 Add this after the "joinUserRoom" effect
     // ✅ Setup socket once
  useEffect(() => {
    socketRef.current = initSocket(token);
    if (agentId) joinUserRoom(agentId);

    // Listen for answer + ice
    socketRef.current.on("answer", async ({ answer }) => {
      console.log("📥 Received answer from customer");
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socketRef.current.on("ice-candidate", async ({ candidate }) => {
      if (pcRef.current && candidate) {
        try {
          await pcRef.current.addIceCandidate(candidate);
        } catch (err) {
          console.error("❌ Error adding ice candidate", err);
        }
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [agentId, token]);

    
    const combinedMessages = useMemo(() => {
      const history = messagesData?.data?.flatMap(item => item.messages || []) || [];
      return [...history, ...liveMessages].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }, [messagesData, liveMessages]);

    // const startVideoCall = async () => {
    //   if (!selectedUser) return toast.error("Select a user first");
    //   try {
    //     const newRoomId = `room-${agentId}-${selectedUser._id}`;
    //     await createCall({
    //       roomId: "123",
    //       callerId: agentId,
    //       receiverId: selectedUser._id,
    //       offer
    //     }).unwrap();
    //     setIsCallOpen(true);
    //   } catch (err) {
    //     toast.error(err?.data?.message || "Failed to start call");
    //   }
    // };
    
  //   const startVideoCall = async (isVideo) => {
  //   if (!selectedUser) return toast.error("Select a user first");

  //   try {
  //     const newRoomId = `room-${agentId}-${selectedUser._id}`;

  //     // WebRTC peer connection
  //     const pc = new RTCPeerConnection();
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: isVideo,
  //       audio: true,
  //     });
  //     setLocalStream(stream);
  //     console.log("🎥 Local stream tracks:", stream.getTracks());

  //     stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  //     const offer = await pc.createOffer();
  //     await pc.setLocalDescription(offer);

  //     // Call API
  //     await createCall({
  //       roomId: newRoomId,
  //       callerId: agentId,
  //       receiverId: selectedUser._id,
  //       offer,
  //     }).unwrap();

  //     // Notify via socket
  //     initiateCall({
  //       roomId: newRoomId,
  //       from: agentId,
  //       to: selectedUser._id,
  //     });

  //     setIsCallOpen(true);
  //   } catch (err) {
  //     toast.error(err?.data?.message || "Failed to start call");
  //   }
  // };


  // const startVideoCall = async (isVideo) => {
  //   if (!selectedUser) return toast.error("Select a user first");

  //   try {
  //     const newRoomId = `room-${agentId}-${selectedUser._id}`;

  //     // PeerConnection
  //     const pc = new RTCPeerConnection();
  //     pcRef.current = pc;

  //     // 🔹 Remote Stream
  //     const rs = new MediaStream();
  //     setRemoteStream(rs);

  //     pc.ontrack = (event) => {
  //       console.log("📡 Got remote track:", event.streams);
  //       event.streams[0].getTracks().forEach((track) => {
  //         rs.addTrack(track);
  //       });
  //     };

  //     // 🔹 Local Stream
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: isVideo,
  //       audio: true,
  //     });
  //     setLocalStream(stream);

  //     stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  //     // 🔹 ICE Candidates
  //     pc.onicecandidate = (event) => {
  //       if (event.candidate) {
  //         console.log("📡 Sending ICE candidate to customer");
  //         initSocket().emit("ice-candidate", { roomId: newRoomId, candidate: event.candidate });
  //       }
  //     };

  //     // 🔹 Create offer
  //     const offer = await pc.createOffer();
  //     await pc.setLocalDescription(offer);

  //     // 🔹 Save call in DB
  //     await createCall({
  //       roomId: newRoomId,
  //       callerId: agentId,
  //       receiverId: selectedUser._id,
  //       offer,
  //     }).unwrap();

  //     // 🔹 Notify via socket
  //     initiateCall({
  //       roomId: newRoomId,
  //       from: agentId,
  //       to: selectedUser._id,
  //     });

  //     setIsCallOpen(true);
  //     setRemoteStream(rs); // 👈 ensure state updates
  //   } catch (err) {
  //     toast.error(err?.data?.message || "Failed to start call");
  //   }
  // };  

    // const endCall = async (id) => {
    //   try {
    //     await updateCallStatus({ roomId: id, status: "ended" }).unwrap();
    //     toast.info("Call ended");
    //   } catch (err) {
    //     toast.error(err?.data?.message || "Failed to end call");
    //   }
    // };

  
    // ✅ Start video call
  const startVideoCall = async (isVideo) => {
    if (!selectedUser) return toast.error("Select a user first");
    if (isStartingCall) return; // prevent rapid clicks
    setIsStartingCall(true);

    try {
      const newRoomId = `room-${agentId}-${selectedUser._id}`;

      // Clean old connections
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      // New PeerConnection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Remote stream
      const rs = new MediaStream();
      setRemoteStream(rs);

      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          rs.addTrack(track);
        });
        setRemoteStream(rs);
      };

      // Local stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });
      setLocalStream(stream);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("ice-candidate", { roomId: newRoomId, candidate: event.candidate });
        }
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Save call in DB
      await createCall({
        roomId: newRoomId,
        callerId: agentId,
        receiverId: selectedUser._id,
        offer,
      }).unwrap();

      // Notify receiver
      initiateCall({
        roomId: newRoomId,
        from: agentId,
        to: selectedUser._id,
      });

      setIsCallOpen(true);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to start call");
    } finally {
      setIsStartingCall(false);
    }
  };


  const endCall = async (id) => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((t) => t.stop());
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsCallOpen(false);

    try {
      await updateCallStatus({ roomId: id, status: "ended" }).unwrap();
      toast.info("Call ended");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to end call");
    }
  };


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
      onScroll();

      return () => container.removeEventListener("scroll", onScroll);
    }, [combinedMessages]);

    return (
      <>
        <Grid container spacing={1}>
          {/* Left Panel */}
          <Grid size={{ xs: 12, lg: 3 }}>
            <Card sx={{ p: 2 }}>
              <OutlinedInput
                startAdornment={
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                }
                fullWidth
                size="small"
                placeholder="Search..."
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Tabs
                value={tab}
                onChange={(e, val) => setTab(val)}
                sx={{ mb: 1, display: "flex", justifyContent: "space-between" }}
              >
                <Tab sx={{ mt: 1, minWidth: 75 }} label="Messages" />
                <Tab sx={{ mt: 1, minWidth: 75 }} label="Active" />
                <Tab sx={{ mt: 1, minWidth: 75 }} label="Calls" />
              </Tabs>
              <Box sx={{ height: { xs: '100vh', lg: "70vh" }, scrollbarWidth: 'none', "&::-webkit-scrollbar": { display: 'none' }, overflowY: "auto", }}>
                {tab === 2 ? (
                  loadingCalls ? (
                    <CircularProgress />
                  ) : calls.length > 0 ? (
                    <List>
                      {calls?.map((call) => (
                        <ListItem key={call._id} divider>
                          <Avatar>
                            {call.participants[0]?.userId?.name?.charAt(0)}
                          </Avatar>
                          <ListItemText
                            primary={`${call.roomId}`}
                            secondary={`Status: ${call.status} | Duration: ${call.duration || 0}s`}
                          />
                          {call.status !== "ended" && (
                            <IconButton size="small" color="error" onClick={() => endCall(call._id)}>
                              <CallEnd />
                            </IconButton>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>No calls found</Typography>
                  )
                ) : (
                  filteredCustomers.map((user) => (
                    <Box
                      key={user._id}
                      sx={{ p: 1, cursor: "pointer" }}
                      onClick={() => setSelectedUser(user)}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <StyledBadge overlap="circular" anchorOrigin={{ vertical: 'bottom', Horizontal: 'right' }}
                          variant={user?.is_active === true ? "dot" : "none"}>
                          <Avatar src={`${IMG_BASE_URL}/${user.profileImage}`} />
                        </StyledBadge>
                        <Typography>{user.name}</Typography>
                      </Stack>
                    </Box>
                  ))
                )}
              </Box>
            </Card>
          </Grid>

          {/* Right Panel */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ width: '100%' }}>
              {selectedUser && tab !== 2 ? (
                <Box>
                  {/* Header */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ p: 1, backgroundColor: "#fdf4f4ff" }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <StyledBadge overlap="circular" anchorOrigin={{ vertical: 'bottom', Horizontal: 'right' }}
                        variant={selectedUser?.is_active === true ? "dot" : "none"}>
                        <Avatar src={`${IMG_BASE_URL}/${selectedUser?.profileImage}`} />
                      </StyledBadge>
                      <Box>
                        <Typography variant="h6">{selectedUser.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Last seen: {renderTime(selectedUser.createdAt)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small" onClick={() => startVideoCall(false)}>
                        <Call />
                      </IconButton>
                      <IconButton size="small" onClick={() => startVideoCall(true)}>
                        <Videocam />
                      </IconButton>
                    </Box>
                  </Stack>
                  <Box sx={{ position: "relative", mb: 3, height: { xs: "250px", lg: "350px" } }}>
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
                            padding: "2px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            display: "inline-block",
                            mt: 1
                          }}
                        >
                          {dayjs(currentDate).isSame(dayjs(), "day")
                            ? "Today"
                            : dayjs(currentDate).isSame(dayjs().subtract(1, "day"), "day")
                              ? "Yesterday"
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
                      {loadingMessages ? (
                        <ChatSkeleton />
                      ) : combinedMessages.length > 0 ? (
                        combinedMessages.map((msg, index) => {
                          const messageDate = dayjs(msg.createdAt).format("YYYY-MM-DD");
                          return (
                            <Box key={msg._id || `temp-${index}`} data-date={messageDate}>
                              <ChatMessage key={msg._id} msg={msg} selectedUser={selectedUser} />
                            </Box>
                          );
                        })
                      ) : (
                        <Typography>No messages found</Typography>
                      )}
                    </Box>
                  </Box>
                  {/* Input */}
                  <Box
                    sx={{
                      border: "1px solid #ddd",
                      mb: 1,
                      borderRadius: 2,
                      mx: 1,
                      backgroundColor: "#f8fbfcd1",
                    }}
                  >
                    {isReply ? (
                      // ✅ Reply Box
                      <Stack
                        direction="column"
                        alignItems="flex-start"
                        sx={{
                          border: "1px solid #f9f5f5ff",
                          borderRadius: 2,
                          backgroundColor: "#ddd9d9d1",
                          m: 0.75,
                          p: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "bold", color: "secondary.main", fontSize: "12px" }}
                        >
                          {selectedUser?.name}
                        </Typography>
                        <Typography variant="body1">
                          <span>hey this dummy message</span>
                        </Typography>
                      </Stack>
                    ) : (
                      // ✅ Normal Message Box
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <TextField
                          sx={{ flex: 1 }}
                          fullWidth
                          size="small"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Type your message"
                        />
                        <IconButton onClick={handleSend}>
                          <Send />
                        </IconButton>
                      </Stack>
                    )}
                  </Box>

                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', my: 'auto' }}>
                  <Typography variant="h6">No message available select user</Typography>
                </Box>
              )}
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 3 }}>
            <Profile />
          </Grid>
        </Grid>

        {isCallOpen && selectedUser && (
          <VideoCallModal
            open={isCallOpen}
            onEnd={() => setIsCallOpen(false)} 
            callType="outgoing"
            currentUserId={currentUserId}
            otherUserId={otherUserId}
            callerName="John Doe"
            localStream={localStream}      // 👈 now provided
            remoteStream={remoteStream}
          />
        )}
      </>
    );
  };

  export default Chat;
