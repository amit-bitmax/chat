import { Box, Stack, Avatar, Typography, IconButton } from "@mui/material";
// import ChatReply from "./ChatReply";
import renderTime from "../../../../../utils/renderTime";

export default function MessageItem({ msg }) {
  const currentUserId = "68aa9e4a4e61ea8cf8705a21";
  const isFrom = msg?.from === currentUserId;
  console.log("msg", isFrom);

  return (
    <Box mb={1} display="flex" justifyContent={isFrom ? "flex-end" : "flex-start"}>
      <Stack direction="row" sx={{ flexDirection: isFrom ? "row" : "row-reverse" }}>
        <Box
              sx={{
                mt: 0.2,
                backgroundColor: isFrom ? "#d9efc1ff" : "#cbe2ddff",
                p: 0.5,
                px: 2,
                borderRadius: 2,
                maxWidth: 300
              }}
            >
            <Stack direction={'row'} spacing={1} alignItems={'center'}>
              <Typography variant="body1">{msg?.message}</Typography>
              <Typography>{msg?.message?.replies?.message}</Typography>
              {/* <Box sx={{ height: '20px', width: '20px' }} size="small"><ChatReply />
              </Box> */}
            </Stack>
            <Typography variant="body2" sx={{ fontSize: "8px", ml: 1 }}>
              {renderTime(msg?.createdAt)}
            </Typography>
          </Box>
      </Stack>
    </Box>
  );
};
