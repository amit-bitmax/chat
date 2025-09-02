// UniversalAppbar.js
import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  AppBar as MuiAppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  Avatar,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
  Typography,
  Switch,
  CssBaseline,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { styled } from "@mui/material/styles";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import Sidebar from "../common/Sidebar";
import ProfileCard from "../common/ProfileCard";
import { ColorModeContext } from "../../App";
import { useGetProfileQuery, useToggleBreakMutation } from "../../features/auth/authApi";
import StyledBadge from "../common/StyledBadge";
import Notification from "../common/Notification";
import { toast } from "react-toastify";

const drawerWidth = 200;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  ...(open && {
    marginLeft: `-${drawerWidth}px`,
    width: `calc(100% - ${drawerWidth}px)`,
  }),
}));

const UniversalAppbar = ({ children }) => {
  const isLaptop = useMediaQuery("(min-width:1024px)");
  const [open, setOpen] = useState(isLaptop);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { data, refetch } = useGetProfileQuery();
  const [toggleBreak, { isLoading }] = useToggleBreakMutation();

  const agent = data?.data;
  const role = data?.data?.role;
  console.log("role", role);
  useEffect(() => {
    setOpen(isLaptop);
  }, [isLaptop]);

  const handleDrawerToggle = () => setOpen((prev) => !prev);
 const [localStatus, setLocalStatus] = useState(agent?.workStatus);

useEffect(() => {
  if (agent?.workStatus) setLocalStatus(agent.workStatus);
}, [agent]);

const handleToggle = async () => {
  try {
    // 👇 Pehle UI update kar do
    setLocalStatus(localStatus === "active" ? "break" : "active");

    const res = await toggleBreak().unwrap();
    toast.success(`Status changed to ${res?.data?.workStatus}`);

    refetch(); // ✅ Confirm from server
  } catch (error) {
    toast.error("Failed to update status");
  }
};



  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar elevation={0} position="fixed" open={open} sx={{ borderBottom: '1px solid #ffffff1a', background: "none" }}>
        <Toolbar>
          <IconButton
            size="small"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon sx={{ color: "#062111ff" }} />
          </IconButton>
          {/* <Typography variant="h6">{role} Panel</Typography> */}
          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" alignItems="center" spacing={1}>
            {/* ✅ Status with Toggle */}
            <Stack spacing={1} alignItems={"center"} direction={"row"}>
              <Typography variant="body2">Status:</Typography>
              <Typography
                variant="caption"
                color={agent?.workStatus === "active" ? "success" : "error"}
              >
                {agent?.workStatus === "active" ? "Active" : "On Break"}
              </Typography>

              <Switch
                size="small"
                checked={agent?.workStatus === "break"} // ✅ true when on break
                onChange={handleToggle}
               color={agent?.workStatus === "active" ? "success" : "error"}
                disabled={isLoading}
              />
            </Stack>

            <IconButton onClick={colorMode.toggleColorMode}>
              {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <Tooltip title="Notifications">
              <IconButton size="small" onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
                <NotificationsNoneIcon />
              </IconButton>
            </Tooltip>

            <IconButton size="small" onClick={(e) => setProfileAnchorEl(e.currentTarget)}>
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant={agent?.is_active === true ? "dot" : "none"}
              >
                <Avatar
                  alt={agent?.first_name}
                  src={`https://chatcrmapi.onrender.com/uploads/profile/${agent?.profileImage}`}
                  sx={{ height: "30px", width: "30px" }}
                />
              </StyledBadge>
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      {/* 👇 Sidebar with role */}
      <Sidebar open={open} handleDrawerClose={() => setOpen(false)} role={role} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1,
          pt: 8,
          backgroundColor: 'transparent',
          backgroundImage: "linear-gradient(135deg,rgba(247, 251, 248, 0.74),rgba(247, 251, 248, 0.74))",
          backdropFilter: "blur(10px)",
          height: '100vh',
          width: open ? `calc(1274px - ${drawerWidth}px)` : "94.2vw",
        }}
      >
        {children}
      </Box>

      {/* Profile Menu */}
      <Menu
        elevation={0}
        sx={{ mt: 1.5 }}
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={() => setProfileAnchorEl(null)}
      >
        <ProfileCard agent={{ ...data }} />
      </Menu>

      {/* Notifications Menu */}
      <Menu
        sx={{ mt: 2 }}
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={() => setNotifAnchorEl(null)}
      >
        <Notification />
      </Menu>
    </Box>
  );
};

export default UniversalAppbar;
