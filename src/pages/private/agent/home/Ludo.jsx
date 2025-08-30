import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import CasinoIcon from "@mui/icons-material/Casino";

export default function LudoBoard() {
  return (
    <Box
      sx={{
        width: 400,
        height: 400,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr",
        border: "3px solid #333",
        margin: "auto",
        mt: 5,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Red Home */}
      <Box sx={{ bgcolor: "red", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Home color="white" />
      </Box>

      {/* Path Center (dice square) */}
      <Box
        sx={{
          gridColumn: "2 / span 1",
          gridRow: "2 / span 1",
          bgcolor: "#1d1d1d",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 1 }}
        >
          <CasinoIcon sx={{ fontSize: 40, color: "white" }} />
        </motion.div>
      </Box>

      {/* Green Home */}
      <Box sx={{ bgcolor: "green", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Home color="white" />
      </Box>

      {/* Blue Home */}
      <Box sx={{ bgcolor: "blue", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Home color="white" />
      </Box>

      {/* Yellow Home */}
      <Box sx={{ bgcolor: "yellow", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Home color="black" />
      </Box>
    </Box>
  );
}

function Home({ color }) {
  return (
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: 2,
        bgcolor: "white",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 1,
        p: 1,
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.2 }}
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: color,
            margin: "auto",
          }}
        />
      ))}
    </Box>
  );
}
