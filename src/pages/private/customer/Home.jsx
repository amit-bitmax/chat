// Home.js
import React, { useState } from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import { Chat } from "@mui/icons-material";
import ChatBot from "./customerChat/ChatBot";
import { jwtDecode } from "jwt-decode";
import CustomerDashboard from "./CustomerDashboard";

const Home = () => {
  const [showChat, setShowChat] = useState(false);
 const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const customerUserId = decoded?.id;
  return (

    <>
    <CustomerDashboard/>
 
    <Box sx={{ height: "87.7vh", flexGrow: 1, position: "relative" }}>

      {/* ChatBot Window */}
      {showChat && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)", // center horizontally & vertically
            zIndex: 999,
          }}
        >
          <ChatBot />
        </Box>
      )}


      {/* Floating Chat Icon */}
      <SpeedDial
        ariaLabel="Chat"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        icon={<Chat />}
        onClick={() => setShowChat((prev) => !prev)}
      />
    </Box>
       </>
  );
};

export default Home;
