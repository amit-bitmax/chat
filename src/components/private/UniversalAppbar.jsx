// UniversalAppbar.js
import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  AppBar as MuiAppBar,
  Box,
  Toolbar,
  CssBaseline,
  Typography,
  IconButton,
  Menu,
  Avatar,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { styled } from "@mui/material/styles";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import Sidebar from "../common/Sidebar";
import ProfileCard from "../common/ProfileCard";
import { ColorModeContext } from "../../App";
import { useGetProfileQuery } from "../../features/auth/authApi";
import StyledBadge from "../common/StyledBadge";
// import Notifications from "../common/Notifications";

const drawerWidth = 180;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  ...(open && {
    marginLeft: drawerWidth,
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
  const { data,error,isLoading } = useGetProfileQuery();
  const role = data?.data?.role; 
console.log("role",role);
  useEffect(() => {
    setOpen(isLaptop);
  }, [isLaptop]);

  const handleDrawerToggle = () => setOpen((prev) => !prev);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" elevation={0} open={open} sx={{ background: "#ebececf4" }}>
        <Toolbar>
          <IconButton
            size="small"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon sx={{ color: "#665b41ff" }} />
          </IconButton>
          <Typography variant="h6">{role} Panel</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" alignItems="center" spacing={1}>
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
                variant={data?.data?.is_active === true ? "dot" : "none"}
              >
                <Avatar
                  alt={data?.data?.first_name}
                  src={`http://localhost:5003/uploads/profile/${data?.data?.profileImage}`}
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
          p: 2,
          pt: 8,
          // backgroundImage: "linear-gradient(135deg, rgba(247, 251, 248, 0.74), rgba(222,118,49,0.3), rgba(43,57,119,0.3), rgba(121,40,119,0.7))",
          backdropFilter: "blur(10px)",
          height:'100vh',
          width: open ? `calc(99.2vw - ${drawerWidth}px)` : "94.2vw",
        }}
      >
        {children}
      </Box>

      {/* Profile Menu */}
      <Menu
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
        {/* <Notifications /> */}
      </Menu>
    </Box>
  );
};

export default UniversalAppbar;
