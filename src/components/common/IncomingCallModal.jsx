// import React from "react";
// import { Dialog, DialogTitle, DialogActions, Button } from "@mui/material";

// const IncomingCallDialog = ({ open, callerName, onAccept, onReject }) => {
//   return (
//     <Dialog open={open}>
//       <DialogTitle>{callerName} is calling...</DialogTitle>
//       <DialogActions>
//         <Button onClick={onReject} color="error">Reject</Button>
//         <Button onClick={onAccept} color="success">Accept</Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default IncomingCallDialog;

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Avatar,
  Stack
} from "@mui/material";

const IncomingCallModal = ({ open, callerName = "Unknown", onAccept, onReject }) => {
  console.log("IncomingCallModal rendered with props:", { open, callerName, onAccept, onReject });
  return (
    <Dialog open={open} onClose={onReject} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
        Incoming Call
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mb: 2,
            bgcolor: "primary.main",
            fontSize: "24px",
          }}
        >
          {callerName?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h6">{callerName}</Typography>
        <Typography variant="body2" color="text.secondary">
          is calling you...
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            onClick={onAccept}
          >
            Accept
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onReject}
          >
            Reject
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default IncomingCallModal;
