import React, { createContext, useEffect, useMemo, useState } from "react";

import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import MainRoutes from "./routes/MainRoutes";
import { CssBaseline, ThemeProvider } from "@mui/material";
import AppTheme from "./theme/AppTheme";
// Context to toggle light/dark mode
export const ColorModeContext = createContext();

const App = () => {
  const [mode, setMode] = useState("light");



  // Memoized toggle function
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
      },
    }),
    []
  );
  const theme = useMemo(() => AppTheme(mode), [mode]);
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <ToastContainer position="top-right" autoClose={3000} />
        <MainRoutes />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;
