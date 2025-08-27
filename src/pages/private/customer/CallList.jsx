// src/components/Calls/CallList.jsx
import React, { useState } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    IconButton,
    CircularProgress,
    Stack,
    Button,
} from "@mui/material";
import { Videocam, CallEnd } from "@mui/icons-material";

import { toast } from "react-toastify";
// import { useCreateCallMutation, useGetCallHistoryQuery, useUpdateCallStatusMutation } from "../../features/room/roomApi";
const IMG_BASE_URL = "http://localhost:5003/uploads/profile";

export default function CallList({ currentUserId }) {
    // const { data, isLoading } = useGetCallHistoryQuery();
    // const [createCall] = useCreateCallMutation();
    // const [updateCallStatus] = useUpdateCallStatusMutation();
    const [loadingAction, setLoadingAction] = useState(false);

    // const calls = data?.data || [];

    // const handleStartCall = async (receiverId) => {
    //     setLoadingAction(true);
    //     try {
    //         await createCall({
    //             roomId: `room-${currentUserId}-${receiverId}`,
    //             callerId: currentUserId,
    //             receiverId,
    //         }).unwrap();
    //         toast.success("Call started successfully");
    //     } catch (err) {
    //         toast.error(err?.data?.message || "Failed to start call");
    //     }
    //     setLoadingAction(false);
    // };

    // const handleEndCall = async (roomId) => {
    //     setLoadingAction(true);
    //     try {
    //         await updateCallStatus({ roomId, status: "ended" }).unwrap();
    //         toast.info("Call ended");
    //     } catch (err) {
    //         toast.error(err?.data?.message || "Failed to end call");
    //     }
    //     setLoadingAction(false);
    // };

    return (
        <Box sx={{ 
                height:{xs:'350px',lg:'50vh'}, 
                flex: 1,
                overflowY: "auto",
                p: 1,
                background: "none",
                "&::-webkit-scrollbar": { display: "none" }
            }}>
            <Typography variant="body1" gutterBottom>
                Call Logs
            </Typography>

            {/* {isLoading ? (
                <CircularProgress />
            ) : calls.length > 0 ? (
                <List>
                    {calls?.map((call) => {
                        const caller = call?.participants.find((p) => p.role === "caller")?.userId;
                        const receiver = call?.participants.find((p) => p.role === "receiver")?.userId;

                        return (
                            <ListItem key={call._id} divider>
                                <ListItemAvatar>
                                    <Avatar src={caller?.profileImage ? `${IMG_BASE_URL}/${caller.profileImage}` : ""}>
                                        {caller?.name?.charAt(0) || "U"}
                                    </Avatar>
                                </ListItemAvatar>

                                <ListItemText
                                    primary={`Caller: ${caller?.name || "Unknown"}`}
                                    secondary={`Receiver: ${receiver?.name || "Unknown"}`}
                                />

                                <ListItemText
                                    primary={`Room: ${call.roomId}`}
                                    secondary={`Status: ${call.status} | Duration: ${call.duration || 0}s`}
                                />

                                <Stack direction="row" spacing={1}>
                                    {call.status !== "ended" && (
                                        <IconButton size="small"
                                            color="error"
                                            onClick={() => handleEndCall(call._id)}
                                            disabled={loadingAction}
                                        >
                                            <CallEnd />
                                        </IconButton>
                                    )}
                                </Stack>
                            </ListItem>
                        );
                    })}
                </List>


            ) : (
                <Typography>No calls found</Typography>
            )} */}

            <Box sx={{ mt: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<Videocam />}
                    onClick={() => handleStartCall("6883608eebb00d700d9ee072")} // ✅ Replace with actual receiver ID
                    disabled={loadingAction}
                >
                    Start New Call
                </Button>
            </Box>
        </Box>
    );
}
