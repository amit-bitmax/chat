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
  Divider,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
  Drawer,
  Button,
  Badge
} from "@mui/material";
import {
  Menu as MenuIcon,
  NotificationsNone,
  Brightness4,
  Brightness7,
  CloseOutlined
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { format } from "date-fns-tz";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { ColorModeContext } from "../../App";

import StyledBadge from "../../components/common/StyledBadge";
import { io } from "socket.io-client";

import { menuData } from "../common/menuData";
import ProfileCard from "../../pages/private/customer/ProfileCard";
import { useGetProfileQuery } from "../../features/auth/authApi";

const socket = io("http://localhost:5003", { transports: ["websocket"] });

const IMG_BASE_URL = "http://localhost:5003/uploads/profile";
const drawerWidth = 200;

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: "#ebececf4",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  })
}));

const CustomerAppbar = ({ children}) => {
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const isMobileView = useMediaQuery("(max-width:965px)");
  const { data,error,isLoading } = useGetProfileQuery();
    const role = data?.data?.role; 
  const [scrolling, setScrolling] = useState(false);

  const handleProfileOpen = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  /** ✅ Profile Menu */
  const renderProfileMenu = useMemo(
    () => (
      <Menu
        sx={{ mt: 1.5 }}
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileClose}
      >
        <ProfileCard profile={data?.data} />
      </Menu>
    ),
    [profileAnchorEl, data]
  );

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          elevation={1}
          position="fixed"
          sx={{
            width: "100%",
            backdropFilter: scrolling ? "blur(10px)" : "blur(0px)",
            background: scrolling ?  "#fff" :"transparent",
            transition: "background 0.3s ease"
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
             <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                ChatBot
              </Typography>
            {/* ✅ Left: Logo + Navigation */}
            <Stack direction="row" alignItems="center" spacing={2}>
              {isMobileView && (
                <IconButton onClick={handleDrawerToggle}>
                  {mobileOpen ? <CloseOutlined /> : <MenuIcon />}
                </IconButton>
              )}
                <Stack spacing={2}  sx={{display: isMobileView ? "none" :    "flex", flexDirection: "row",justifyContent: "center", alignItems: "center"}}>
                    {menuData[role]?.map((section, idx) =>
                        section.items ? (
                            section.items.map((item) => (
                            <Button
                                key={item.route}
                                color="inherit"
                                component={Link}
                                to={item.route}
                                sx={{ mx: 1 }}
                            >
                                {item.name}
                            </Button>
                            ))
                        ) : (
                            <Button
                            key={section.route}
                            color="inherit"
                            component={Link}
                            to={section.route}
                            sx={{ mx: 1 }}
                            >
                            {section.name}
                            </Button>
                        )
                    )}
          </Stack>
            </Stack>

            {/* ✅ Right: Theme Toggle, Notifications, Profile */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton onClick={colorMode.toggleColorMode} color="primary">
                {theme.palette.mode === "dark" ? (
                  <Brightness7 />
                ) : (
                  <Brightness4 />
                )}
              </IconButton>

              {/* 🔔 Notification Icon */}
              <Tooltip title="Notifications">
                <IconButton color="inherit">
                  <Badge color="error" badgeContent={"5"}>
                    <NotificationsNone />
                  </Badge>
                </IconButton>
              </Tooltip>

              <IconButton onClick={handleProfileOpen}>
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  variant={data?.data?.is_active ? "dot" : "none"}
                >
                  <Avatar
                    alt={data?.data?.first_name}
                    src={`${IMG_BASE_URL}/${data?.data?.profileImage}`}
                    sx={{ height: 30, width: 30 }}
                  />
                </StyledBadge>
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* ✅ Mobile Drawer */}
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{ "& .MuiDrawer-paper": { width: drawerWidth, padding: 2 } }}
        >
          <Stack spacing={2}>
           {menuData[role]?.map((section, idx) =>
              section.items ? (
                section.items.map((item) => (
                  <Button
                    key={item.route}
                    color="inherit"
                    component={Link}
                    to={item.route}
                    sx={{ mx: 1 }}
                  >
                    {item.name}
                  </Button>
                ))
              ) : (
                <Button
                  key={section.route}
                  color="inherit"
                  component={Link}
                  to={section.route}
                  sx={{ mx: 1 }}
                >
                  {section.name}
                </Button>
              )
            )}

          </Stack>
        </Drawer>

        {/* ✅ Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 1,
            pt: 8,
            overflow: "hidden",
            backgroundImage:
              "linear-gradient(135deg, rgba(251,247,247,0.7), rgba(222,118,49,0.3), rgba(43,57,119,0.3), rgba(121,40,119,0.7))",
            backdropFilter: "blur(10px)",
            width: "100vw",
            height: "100vh"
          }}
        >
          {children}
        </Box>

        {renderProfileMenu}
      </Box>
    </>
  );
};

export default CustomerAppbar;
